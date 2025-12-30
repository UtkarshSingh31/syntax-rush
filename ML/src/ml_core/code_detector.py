from __future__ import annotations
import sys
import ast
import re
import time
import math
import os
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field, asdict

import torch 
import numpy as np
from transformers import PreTrainedModel, PreTrainedTokenizerBase

from src.logger import logging
from src.exception import CustomException
from src.components.normalization import Normalizer
from src.ml_core.model_loader import load_model_and_tokenizer, ModelLoaderConfig


@dataclass
class DetectionResult:
    """
    AI-generated code detection result with full explainability.
    """
    # Overall verdict
    is_ai_generated: bool
    confidence: float  # 0.0 to 1.0
    risk_level: str 
    
    # Score breakdown
    perplexity_score: float
    ast_score: float
    style_score: float
    weighted_score: float  # Final combined score
    
    perplexity: float
    ast_features: Dict[str, Any]
    style_features: Dict[str, Any]
    
    conflict_detected: bool  # Perplexity vs structure mismatch
    code_length: int
    normalized_length: int
    processing_time_ms: int
    
    reasoning: str
    recommendations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return asdict(self)

@dataclass
class AIDetectorConfig:
    """Configuration for AI code detection."""
    
    # Perplexity thresholds
    perplexity_ai_threshold: float = 10.0  # Below this = likely AI
    perplexity_human_threshold: float = 60.0  # Above this = likely human
    
    # AST thresholds
    ast_depth_variance_threshold: float = 2.0  # Low variance = AI-like
    ast_complexity_threshold: float = 3.0  # Low complexity = AI-like
    
    # Style thresholds
    comment_ratio_threshold: float = 0.05  # Low comments = potentially AI
    naming_length_threshold: float = 8.0  # Short names = potentially human
    
    # Weighted scoring (must sum to 1.0)
    weight_perplexity: float = 0.6  # Primary signal
    weight_ast: float = 0.25  # Secondary signal
    weight_style: float = 0.15  # Tertiary signal
    
    # Final verdict thresholds
    high_confidence_threshold: float = 0.65  # >= 0.65 = HIGH risk
    medium_confidence_threshold: float = 0.45  # 0.45-0.64 = MEDIUM
    low_confidence_threshold: float = 0.30  # 0.30-0.44 = LOW
    # < 0.30 = CLEAN
    
    # Conflict detection
    conflict_perplexity_threshold: float = 15.0  # Very low
    conflict_ast_threshold: float = 0.4  # But human-like AST
    
    # Processing limits
    max_code_length: int = 50000
    max_tokens_for_perplexity: int = 1024
    
    # Performance
    enable_caching: bool = True
    cache_size: int = 500
    
    def __post_init__(self):
        """Validate config after initialization."""
        self.validate()
    
    @classmethod
    def from_env(cls) -> AIDetectorConfig:
        """Load from environment (placeholder for now)."""
        return cls(
            perplexity_ai_threshold=float(os.getenv("PERPLEXITY_AI_THRESHOLD", 10.0)),
            high_confidence_threshold=float(os.getenv("HIGH_CONFIDENCE_THRESHOLD", 0.65)),
        )
    
    def validate(self):
        """Validate config consistency."""
        # Check weights sum to 1.0
        total_weight = self.weight_perplexity + self.weight_ast + self.weight_style
        if not math.isclose(total_weight, 1.0, rel_tol=1e-5):
            raise ValueError(f"Weights must sum to 1.0, got {total_weight}")
        
        # Check threshold ordering
        if not (0 <= self.low_confidence_threshold < self.medium_confidence_threshold < self.high_confidence_threshold <= 1.0):
            raise ValueError("Thresholds must be ordered: 0 <= low < medium < high <= 1.0")


class AICodeDetector:
    
    def __init__(
        self,
        config: Optional[AIDetectorConfig] = None,
        model: Optional[PreTrainedModel] = None,
        tokenizer: Optional[PreTrainedTokenizerBase] = None,
        device: Optional[torch.device] = None,
        normalizer: Optional[Normalizer] = None
    ):
        # Config
        self.config = config or AIDetectorConfig.from_env()
        
        if model is None or tokenizer is None or device is None:
            logging.info("Loading model for AI detection...")
            model, tokenizer, device = load_model_and_tokenizer()
        
        self.model = model
        self.tokenizer = tokenizer
        self.device = device
        
        # Set pad token if not set
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Normalizer
        self.normalizer = normalizer or Normalizer()
        
        # Metrics
        self.total_detections = 0
        self.total_processing_time_ms = 0
        
        logging.info(
            "AI Code Detector initialized",
            extra={
                "device": str(device),
                "perplexity_threshold": self.config.perplexity_ai_threshold,
                "high_confidence_threshold": self.config.high_confidence_threshold,
            }
        )
    
    def _calculate_perplexity(self, code: str) -> Tuple[float, float]:

        try:
            # Handle empty code
            if not code or not code.strip():
                logging.warning("Empty code provided for perplexity calculation")
                return 50.0, 0.5  # Neutral
            
            inputs = self.tokenizer(
                code,
                return_tensors="pt",
                truncation=True,
                max_length=self.config.max_tokens_for_perplexity,
                padding=False,
                add_special_tokens=True
            ).to(self.device)
            
            # Check token count
            if inputs["input_ids"].shape[1] == 0:
                logging.warning("Tokenization produced empty sequence")
                return 50.0, 0.5
            
            # Forward pass with proper labels
            with torch.no_grad():
                outputs = self.model(**inputs, labels=inputs["input_ids"])
                loss = outputs.loss
            
            # Perplexity = exp(loss)
            perplexity = torch.exp(loss).item()
            
            # Clamp extreme values
            perplexity = max(1.0, min(perplexity, 500.0))
            
            # Normalize to 0-1 score (lower perplexity = higher score)
            if perplexity < self.config.perplexity_ai_threshold:
                normalized_score = 1.0  # Very AI-like
            elif perplexity > self.config.perplexity_human_threshold:
                normalized_score = 0.0  # Very human-like
            else:
                # Linear interpolation between thresholds
                range_size = self.config.perplexity_human_threshold - self.config.perplexity_ai_threshold
                normalized_score = 1.0 - (perplexity - self.config.perplexity_ai_threshold) / range_size
            
            normalized_score = max(0.0, min(1.0, normalized_score))
            
            return perplexity, normalized_score
        
        except Exception as e:
            logging.warning(f"Perplexity calculation failed: {e}")
            # Return neutral values on failure
            return 50.0, 0.5
   
    def _extract_ast_features(self, code: str) -> Tuple[Dict[str, Any], float]:

        try:
            # Handle empty code
            if not code or not code.strip():
                return {"error": "empty_code"}, 0.5
            
            tree = ast.parse(code)
            
            # Calculate node depths
            depths = []
            
            def get_depth(node, depth=0):
                depths.append(depth)
                for child in ast.iter_child_nodes(node):
                    get_depth(child, depth + 1)
            
            get_depth(tree)
            
            # Metrics with safe defaults
            max_depth = max(depths) if depths else 0
            avg_depth = float(np.mean(depths)) if depths else 0.0
            depth_variance = float(np.var(depths)) if len(depths) > 1 else 0.0
            
            # Cyclomatic complexity (simplified: count decision nodes)
            complexity = sum(
                1 for node in ast.walk(tree)
                if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler))
            )
            
            # Node diversity (unique node types)
            node_types = set(type(node).__name__ for node in ast.walk(tree))
            node_diversity = len(node_types)
            
            # Error handling presence
            has_error_handling = any(
                isinstance(node, (ast.Try, ast.ExceptHandler))
                for node in ast.walk(tree)
            )
            
            # Function and class counts
            num_functions = sum(1 for node in ast.walk(tree) if isinstance(node, ast.FunctionDef))
            num_classes = sum(1 for node in ast.walk(tree) if isinstance(node, ast.ClassDef))
            
            features = {
                "max_depth": max_depth,
                "avg_depth": round(avg_depth, 2),
                "depth_variance": round(depth_variance, 2),
                "complexity": complexity,
                "node_diversity": node_diversity,
                "has_error_handling": has_error_handling,
                "num_functions": num_functions,
                "num_classes": num_classes,
            }
            
            # Scoring: low variance + low complexity = AI-like
            ast_score = 0.0
            
            # Low depth variance suggests uniform structure (AI-like)
            if depth_variance < self.config.ast_depth_variance_threshold:
                ast_score += 0.35
            
            # Low complexity suggests simple structure (AI-like)
            if complexity < self.config.ast_complexity_threshold:
                ast_score += 0.25
            
            # High node diversity suggests varied structure (human-like)
            if node_diversity < 10:
                ast_score += 0.20
            
            # Lack of error handling (AI sometimes skips this)
            if not has_error_handling and num_functions > 0:
                ast_score += 0.10
            
            # Simple structure (single function, no classes)
            if num_functions <= 1 and num_classes == 0:
                ast_score += 0.10
            
            ast_score = max(0.0, min(1.0, ast_score))
            
            return features, ast_score
        
        except SyntaxError as e:
            logging.warning(f"AST parsing failed (syntax error): {e}")
            return {"error": "syntax_error"}, 0.5  # Neutral on parse failure
        
        except Exception as e:
            logging.warning(f"AST feature extraction failed: {e}")
            return {"error": str(e)}, 0.5
    
    def _analyze_style_patterns(self, code: str) -> Tuple[Dict[str, Any], float]:

        try:
            # Handle empty code
            if not code or not code.strip():
                return {"error": "empty_code"}, 0.5
            
            lines = code.split('\n')
            non_empty_lines = [line for line in lines if line.strip()]
            
            if not non_empty_lines:
                return {"error": "no_content"}, 0.5
            
            # Comment ratio
            comment_lines = sum(1 for line in lines if line.strip().startswith('#'))
            comment_ratio = comment_lines / len(non_empty_lines)
            
            # Variable naming patterns
            var_names = re.findall(r'\b[a-z_][a-z0-9_]*\b', code)
            var_names = [v for v in var_names if not v.startswith('__') and v not in ['if', 'for', 'while', 'def', 'class', 'return', 'import']]
            avg_var_length = float(np.mean([len(v) for v in var_names])) if var_names else 0.0
            
            # Indentation consistency
            indents = [len(line) - len(line.lstrip()) for line in non_empty_lines if line.strip() and not line.strip().startswith('#')]
            indent_variance = float(np.var(indents)) if len(indents) > 1 else 0.0
            
            # Docstring presence
            has_docstrings = '"""' in code or "'''" in code
            
            # Line length consistency
            line_lengths = [len(line) for line in non_empty_lines]
            avg_line_length = float(np.mean(line_lengths)) if line_lengths else 0.0
            
            features = {
                "comment_ratio": round(comment_ratio, 3),
                "avg_var_length": round(avg_var_length, 2),
                "indent_variance": round(indent_variance, 2),
                "has_docstrings": has_docstrings,
                "avg_line_length": round(avg_line_length, 1),
                "num_lines": len(non_empty_lines),
            }
            
            # Scoring: low comments + consistent formatting = AI-like
            style_score = 0.0
            
            # Low comment ratio (AI often lacks comments)
            if comment_ratio < self.config.comment_ratio_threshold:
                style_score += 0.30
            
            # Variable naming (longer descriptive names = potentially AI)
            if avg_var_length > self.config.naming_length_threshold:
                style_score += 0.20
            else:
                style_score -= 0.10  # Short names reduce AI likelihood
            
            # Perfect indentation (AI is very consistent)
            if indent_variance < 0.5:
                style_score += 0.25
            
            # Has docstrings (AI often includes these)
            if has_docstrings:
                style_score += 0.15
            
            # Very consistent line lengths
            if line_lengths and float(np.std(line_lengths)) < 10.0:
                style_score += 0.10
            
            style_score = max(0.0, min(1.0, style_score))
            
            return features, style_score
        
        except Exception as e:
            logging.warning(f"Style analysis failed: {e}")
            return {"error": str(e)}, 0.5
  
    def detect(self, code: str) -> DetectionResult:

        start_time = time.time()
        original_length = len(code)
        
        try:
            # Validate input
            if not code or not isinstance(code, str):
                raise ValueError("Code must be a non-empty string")
            
            if not code.strip():
                raise ValueError("Code cannot be empty or whitespace-only")
            
            if len(code) > self.config.max_code_length:
                logging.warning(f"Code truncated from {len(code)} to {self.config.max_code_length}")
                code = code[:self.config.max_code_length]
            
            # Normalize code (light)
            normalized_code = self.normalizer.normalize(code, "light")
            normalized_length = len(normalized_code)
            
            # Calculate all signals
            perplexity, perplexity_score = self._calculate_perplexity(normalized_code)
            ast_features, ast_score = self._extract_ast_features(code)
            style_features, style_score = self._analyze_style_patterns(code)
            
            # Weighted combined score
            weighted_score = (
                self.config.weight_perplexity * perplexity_score +
                self.config.weight_ast * ast_score +
                self.config.weight_style * style_score
            )
            
            # Determine risk level and verdict
            if weighted_score >= self.config.high_confidence_threshold:
                risk_level = "HIGH"
                is_ai_generated = True
            elif weighted_score >= self.config.medium_confidence_threshold:
                risk_level = "MEDIUM"
                is_ai_generated = True
            elif weighted_score >= self.config.low_confidence_threshold:
                risk_level = "LOW"
                is_ai_generated = False
            else:
                risk_level = "CLEAN"
                is_ai_generated = False
            
            # Conflict detection
            conflict_detected = (
                perplexity < self.config.conflict_perplexity_threshold and
                ast_score < self.config.conflict_ast_threshold
            )
            
            # Generate reasoning
            reasoning_parts = []
            if perplexity < self.config.perplexity_ai_threshold:
                reasoning_parts.append(f"Very low perplexity ({perplexity:.1f}) indicates AI-like patterns")
            elif perplexity < self.config.perplexity_human_threshold:
                reasoning_parts.append(f"Moderate perplexity ({perplexity:.1f}) suggests some AI characteristics")
            
            if ast_score > 0.5:
                reasoning_parts.append("Structural uniformity suggests AI generation")
            if style_score > 0.5:
                reasoning_parts.append("Style patterns consistent with AI-generated code")
            if conflict_detected:
                reasoning_parts.append("⚠️ Conflict: Low perplexity but human-like structure - manual review recommended")
            
            reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Likely human-written code"
            
            # Recommendations
            recommendations = []
            if is_ai_generated:
                if risk_level == "HIGH":
                    recommendations.append("FLAG_FOR_REVIEW: High confidence AI detection")
                elif risk_level == "MEDIUM":
                    recommendations.append("MONITOR: Moderate AI signals detected")
                else:
                    recommendations.append("LOW_PRIORITY: Weak AI signals, likely acceptable")
            
            if conflict_detected:
                recommendations.append("MANUAL_REVIEW: Conflicting signals require human judgment")
            
            if not recommendations:
                recommendations.append("ACCEPT: No significant AI indicators detected")
            
            # Processing time
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # Update metrics
            self.total_detections += 1
            self.total_processing_time_ms += processing_time_ms
            
            result = DetectionResult(
                is_ai_generated=is_ai_generated,
                confidence=weighted_score,
                risk_level=risk_level,
                perplexity_score=round(perplexity_score, 3),
                ast_score=round(ast_score, 3),
                style_score=round(style_score, 3),
                weighted_score=round(weighted_score, 3),
                perplexity=round(perplexity, 2),
                ast_features=ast_features,
                style_features=style_features,
                conflict_detected=conflict_detected,
                code_length=original_length,
                normalized_length=normalized_length,
                processing_time_ms=processing_time_ms,
                reasoning=reasoning,
                recommendations=recommendations
            )
            
            # Log result
            logging.info(
                "AI detection complete",
                extra={
                    "is_ai": is_ai_generated,
                    "confidence": round(weighted_score, 3),
                    "risk_level": risk_level,
                    "perplexity": round(perplexity, 2),
                    "processing_time_ms": processing_time_ms,
                }
            )
            
            return result
        
        except ValueError as e:
            logging.error(f"Validation error in AI detection: {e}")
            raise CustomException(f"AI_DETECTION_VALIDATION_ERROR: {str(e)}", sys)
        
        except Exception as e:
            logging.error(f"AI detection failed: {e}")
            raise CustomException(f"AI_DETECTION_ERROR: {str(e)}", sys)
   
    def detect_batch(self, codes: List[str]) -> List[Optional[DetectionResult]]:

        results = []
        for idx, code in enumerate(codes):
            try:
                result = self.detect(code)
                results.append(result)
            except Exception as e:
                logging.warning(f"Batch detection failed at index {idx}: {e}")
                results.append(None)
        
        return results
  
    def get_metrics(self) -> Dict[str, Any]:
        """Get detector performance metrics."""
        avg_time = (
            round(self.total_processing_time_ms / self.total_detections, 2)
            if self.total_detections > 0 else 0.0
        )
        
        return {
            "total_detections": self.total_detections,
            "total_processing_time_ms": self.total_processing_time_ms,
            "avg_processing_time_ms": avg_time,
        }
    
    def reset_metrics(self):
        """Reset metrics counters."""
        self.total_detections = 0
        self.total_processing_time_ms = 0


if __name__ == "__main__":
    try:
        print("=" * 60)
        print("Starting AI Code Detector Test")
        print("=" * 60)
        
        # Step 1: Initialize detector
        print("\n[1/4] Initializing detector...")
        detector = AICodeDetector()
        print("✓ Detector initialized successfully")
        
        # Test code 1: AI-like (clean, simple)
        ai_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(result)
"""
        
        # Test code 2: Human-like (messy, comments)
        human_code = """
def fib(n):
    # quick fib calc
    a,b=0,1
    for _ in range(n):
        a,b=b,a+b # swap
    return a

x=fib(10)
print(x) # output
"""
        
        print("\n[2/4] Testing AI-like code...")
        result1 = detector.detect(ai_code)
        print("✓ Detection complete")
        
        print("\n=== AI-LIKE CODE RESULTS ===")
        print(f"AI Generated: {result1.is_ai_generated}")
        print(f"Confidence: {result1.confidence:.3f}")
        print(f"Risk Level: {result1.risk_level}")
        print(f"Perplexity: {result1.perplexity:.2f}")
        print(f"Reasoning: {result1.reasoning}")
        print(f"Recommendations: {result1.recommendations}")
        
        print("\n[3/4] Testing human-like code...")
        result2 = detector.detect(human_code)
        print("✓ Detection complete")
        
        print("\n=== HUMAN-LIKE CODE RESULTS ===")
        print(f"AI Generated: {result2.is_ai_generated}")
        print(f"Confidence: {result2.confidence:.3f}")
        print(f"Risk Level: {result2.risk_level}")
        print(f"Perplexity: {result2.perplexity:.2f}")
        print(f"Reasoning: {result2.reasoning}")
        print(f"Recommendations: {result2.recommendations}")
        
        print("\n[4/4] Getting metrics...")
        metrics = detector.get_metrics()
        print("✓ Metrics retrieved")
        
        print("\n=== METRICS ===")
        print(f"Total Detections: {metrics['total_detections']}")
        print(f"Avg Processing Time: {metrics['avg_processing_time_ms']} ms")
        
        print("\n" + "=" * 60)
        print("All tests completed successfully!")
        print("=" * 60)
    
    except CustomException as e:
        print(f"\n❌ CustomException occurred: {e}")
        import traceback
        traceback.print_exc()
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
