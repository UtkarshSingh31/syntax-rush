from __future__ import annotations
import sys
import ast
import hashlib
import time
import difflib
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass, field, asdict
from functools import lru_cache

from src.logger import logging
from src.exception import CustomException
from src.components.normalization import Normalizer


@dataclass
class PlagiarismMatch:
    """Details of a single plagiarism match."""
    pattern_name: str
    similarity: float  # 0.0 to 1.0
    match_type: str  # "exact", "high_similarity", "medium_similarity", "structural"
    normalization_level: str  # "light", "medium", "aggressive"
    sources: List[str]  # ["StackOverflow", "GitHub", etc.]
    confidence: float  # 0.0 to 1.0


@dataclass
class PlagiarismResult:
    """
    Plagiarism detection result with full explainability.
    """
    # Overall verdict
    is_plagiarized: bool
    confidence: float  # 0.0 to 1.0
    risk_level: str  # "CLEAN", "LOW", "MEDIUM", "HIGH"
    
    # Matches found
    matches: List[PlagiarismMatch]
    best_match: Optional[PlagiarismMatch]
    
    # Similarity scores by level
    max_similarity_light: float
    max_similarity_medium: float
    max_similarity_aggressive: float
    structural_similarity: float
    
    # Metadata
    code_length: int
    normalized_hash: str
    processing_time_ms: int
    
    # Reasoning
    reasoning: str
    recommendations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        result = asdict(self)
        # Convert matches to list of dicts
        result['matches'] = [asdict(m) for m in self.matches]
        result['best_match'] = asdict(self.best_match) if self.best_match else None
        return result


@dataclass
class ComparisonResult:
    """Result of comparing two code submissions."""
    similarity: float
    is_similar: bool
    similarity_by_level: Dict[str, float]
    structural_similarity: float
    reasoning: str


@dataclass
class PlagiarismDetectorConfig:
    """Configuration for plagiarism detection."""
    
    # Similarity thresholds
    exact_match_threshold: float = 1.0
    high_similarity_threshold: float = 0.95  # >= 0.95 = HIGH risk
    medium_similarity_threshold: float = 0.85  # 0.85-0.94 = MEDIUM
    low_similarity_threshold: float = 0.60  # 0.60-0.84 = LOW (acceptable common patterns)
    
    # Structural similarity threshold
    structural_threshold: float = 0.90
    
    # Length screening (avoid comparing vastly different sizes)
    length_ratio_min: float = 0.5  # Min ratio of shorter/longer code
    length_ratio_max: float = 2.0  # Max ratio
    
    # Processing limits
    max_code_length: int = 50000
    max_patterns_to_check: int = 100
    
    # Performance
    enable_early_termination: bool = True  # Stop at first exact match
    enable_caching: bool = True
    cache_size: int = 500
    
    @classmethod
    def from_env(cls) -> PlagiarismDetectorConfig:
        """Load from environment."""
        import os
        return cls(
            high_similarity_threshold=float(os.getenv("PLAG_HIGH_THRESHOLD", 0.95)),
            medium_similarity_threshold=float(os.getenv("PLAG_MEDIUM_THRESHOLD", 0.85)),
        )


@dataclass
class AlgorithmPattern:
    """Canonical algorithm pattern for matching."""
    name: str
    category: str  # "sorting", "searching", "dynamic_programming", etc.
    code: str
    sources: List[str]  # ["StackOverflow", "LeetCode", etc.]
    hash_light: str = ""
    hash_medium: str = ""
    hash_aggressive: str = ""
    
    def compute_hashes(self, normalizer: Normalizer):
        """Precompute normalized hashes."""
        self.hash_light = self._hash_code(
            normalizer.normalize(self.code, "light")
        )
        self.hash_medium = self._hash_code(
            normalizer.normalize(self.code, "medium")
        )
        self.hash_aggressive = self._hash_code(
            normalizer.normalize(self.code, "aggressive")
        )
    
    @staticmethod
    def _hash_code(code: str) -> str:
        """Generate SHA-256 hash of code."""
        return hashlib.sha256(code.encode('utf-8')).hexdigest()


# Default pattern database (minimal examples)
# to be created databse own!!
DEFAULT_PATTERNS = [
    AlgorithmPattern(
        name="Bubble Sort",
        category="sorting",
        code="""
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
""",
        sources=["StackOverflow", "GeeksforGeeks"]
    ),
    AlgorithmPattern(
        name="Binary Search",
        category="searching",
        code="""
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
""",
        sources=["LeetCode", "GeeksforGeeks"]
    ),
    AlgorithmPattern(
        name="Fibonacci Recursive",
        category="recursion",
        code="""
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
""",
        sources=["StackOverflow", "GitHub"]
    ),
    AlgorithmPattern(
        name="Fibonacci DP",
        category="dynamic_programming",
        code="""
def fibonacci(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
""",
        sources=["LeetCode", "HackerRank"]
    ),
]

class PlagiarismDetector:
    
    def __init__(
        self,
        config: Optional[PlagiarismDetectorConfig] = None,
        normalizer: Optional[Normalizer] = None,
        patterns: Optional[List[AlgorithmPattern]] = None
    ):
        self.config = config or PlagiarismDetectorConfig.from_env()
        self.normalizer = normalizer or Normalizer()
        
        # Load and preprocess patterns
        self.patterns = patterns or DEFAULT_PATTERNS
        self._preprocess_patterns()
        
        # Metrics
        self.total_detections = 0
        self.total_processing_time_ms = 0
        
        logging.info(
            "Plagiarism Detector initialized",
            extra={
                "num_patterns": len(self.patterns),
                "high_threshold": self.config.high_similarity_threshold,
            }
        )
    
    def _preprocess_patterns(self):
        """Precompute normalized hashes for all patterns."""
        logging.info("Preprocessing pattern database...")
        for pattern in self.patterns:
            pattern.compute_hashes(self.normalizer)
        logging.info(f"Preprocessed {len(self.patterns)} patterns")
    
    
    @staticmethod
    def _hash_code(code: str) -> str:
        """Generate SHA-256 hash."""
        return hashlib.sha256(code.encode('utf-8')).hexdigest()
    
    
    def _should_compare(self, code1: str, code2: str) -> bool:

        len1, len2 = len(code1), len(code2)
        if len1 == 0 or len2 == 0:
            return False
        
        ratio = min(len1, len2) / max(len1, len2)
        return self.config.length_ratio_min <= ratio <= self.config.length_ratio_max
    
    def _check_exact_match(self, code: str) -> Optional[PlagiarismMatch]:

        normalized = {
            "light": self.normalizer.normalize(code, "light"),
            "medium": self.normalizer.normalize(code, "medium"),
            "aggressive": self.normalizer.normalize(code, "aggressive"),
        }
        
        # Compute hashes
        hashes = {
            level: self._hash_code(norm_code)
            for level, norm_code in normalized.items()
        }
        
        # Check against patterns
        for pattern in self.patterns:
            # Check aggressive first (most strict)
            if hashes["aggressive"] == pattern.hash_aggressive:
                return PlagiarismMatch(
                    pattern_name=pattern.name,
                    similarity=1.0,
                    match_type="exact",
                    normalization_level="aggressive",
                    sources=pattern.sources,
                    confidence=1.0
                )
            
            # Check medium
            if hashes["medium"] == pattern.hash_medium:
                return PlagiarismMatch(
                    pattern_name=pattern.name,
                    similarity=1.0,
                    match_type="exact",
                    normalization_level="medium",
                    sources=pattern.sources,
                    confidence=1.0
                )
            
            # Check light
            if hashes["light"] == pattern.hash_light:
                return PlagiarismMatch(
                    pattern_name=pattern.name,
                    similarity=1.0,
                    match_type="exact",
                    normalization_level="light",
                    sources=pattern.sources,
                    confidence=0.95  # Slightly lower confidence for light match
                )
        
        return None

    
    def _calculate_similarity(self, code1: str, code2: str) -> float:
        return difflib.SequenceMatcher(None, code1, code2).ratio()
    
    def _check_similarity(
        self,
        code: str,
        max_patterns: Optional[int] = None
    ) -> Tuple[List[PlagiarismMatch], Dict[str, float]]:

        matches = []
        max_similarities = {
            "light": 0.0,
            "medium": 0.0,
            "aggressive": 0.0,
        }
        
        # Normalize submission at all levels
        normalized_submission = {
            "light": self.normalizer.normalize(code, "light"),
            "medium": self.normalizer.normalize(code, "medium"),
            "aggressive": self.normalizer.normalize(code, "aggressive"),
        }
        
        # Limit patterns if requested
        patterns_to_check = self.patterns[:max_patterns] if max_patterns else self.patterns
        
        for pattern in patterns_to_check:
            # Normalize pattern at all levels (cached in pattern object)
            pattern_normalized = {
                "light": self.normalizer.normalize(pattern.code, "light"),
                "medium": self.normalizer.normalize(pattern.code, "medium"),
                "aggressive": self.normalizer.normalize(pattern.code, "aggressive"),
            }
            
            # Calculate similarity at each level
            similarities = {}
            for level in ["light", "medium", "aggressive"]:
                # Length screening
                if not self._should_compare(
                    normalized_submission[level],
                    pattern_normalized[level]
                ):
                    similarities[level] = 0.0
                    continue
                
                sim = self._calculate_similarity(
                    normalized_submission[level],
                    pattern_normalized[level]
                )
                similarities[level] = sim
                max_similarities[level] = max(max_similarities[level], sim)
            
            # Take max similarity across all levels for this pattern
            max_sim = max(similarities.values())
            
            # Create match if above threshold
            if max_sim >= self.config.low_similarity_threshold:
                # Determine which level had highest similarity
                best_level = max(similarities, key=similarities.get)
                
                # Determine match type
                if max_sim >= self.config.high_similarity_threshold:
                    match_type = "high_similarity"
                    confidence = 0.9
                elif max_sim >= self.config.medium_similarity_threshold:
                    match_type = "medium_similarity"
                    confidence = 0.75
                else:
                    match_type = "low_similarity"
                    confidence = 0.6
                
                matches.append(PlagiarismMatch(
                    pattern_name=pattern.name,
                    similarity=round(max_sim, 3),
                    match_type=match_type,
                    normalization_level=best_level,
                    sources=pattern.sources,
                    confidence=confidence
                ))
        
        # Sort matches by similarity (highest first)
        matches.sort(key=lambda m: m.similarity, reverse=True)
        
        return matches, max_similarities
    
    
    def _calculate_structural_similarity(self, code1: str, code2: str) -> float:

        try:
            tree1 = ast.dump(ast.parse(code1))
            tree2 = ast.dump(ast.parse(code2))
            return difflib.SequenceMatcher(None, tree1, tree2).ratio()
        except SyntaxError:
            return 0.0
        except Exception as e:
            logging.warning(f"Structural similarity failed: {e}")
            return 0.0
    
    
    def detect(self, code: str) -> PlagiarismResult:

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
            
            # Step 1: Check for exact match (fastest)
            exact_match = self._check_exact_match(code)
            
            if exact_match and self.config.enable_early_termination:
                # Early termination on exact match
                processing_time_ms = int((time.time() - start_time) * 1000)
                self.total_detections += 1
                self.total_processing_time_ms += processing_time_ms
                
                # Generate hash
                normalized_hash = self._hash_code(
                    self.normalizer.normalize(code, "aggressive")
                )
                
                return PlagiarismResult(
                    is_plagiarized=True,
                    confidence=exact_match.confidence,
                    risk_level="HIGH",
                    matches=[exact_match],
                    best_match=exact_match,
                    max_similarity_light=1.0,
                    max_similarity_medium=1.0,
                    max_similarity_aggressive=1.0,
                    structural_similarity=1.0,
                    code_length=original_length,
                    normalized_hash=normalized_hash,
                    processing_time_ms=processing_time_ms,
                    reasoning=f"Exact match found: {exact_match.pattern_name}",
                    recommendations=["BLOCK_AND_REPORT: Exact copy of known algorithm"]
                )
            
            # Step 2: Fuzzy similarity check
            similarity_matches, max_similarities = self._check_similarity(
                code,
                max_patterns=self.config.max_patterns_to_check
            )
            
            # Combine exact match with similarity matches if exists
            all_matches = [exact_match] if exact_match else []
            all_matches.extend(similarity_matches)
            
            # Get best match
            best_match = all_matches[0] if all_matches else None
            
            # Calculate overall similarity
            overall_similarity = max(
                max_similarities["light"],
                max_similarities["medium"],
                max_similarities["aggressive"]
            )
            
            # Step 3: Structural similarity (for best match only)
            structural_similarity = 0.0
            if best_match:
                pattern_code = next(
                    (p.code for p in self.patterns if p.name == best_match.pattern_name),
                    None
                )
                if pattern_code:
                    structural_similarity = self._calculate_structural_similarity(code, pattern_code)
            
            # Determine verdict and risk level
            if overall_similarity >= self.config.high_similarity_threshold:
                is_plagiarized = True
                risk_level = "HIGH"
                confidence = 0.9
            elif overall_similarity >= self.config.medium_similarity_threshold:
                is_plagiarized = True
                risk_level = "MEDIUM"
                confidence = 0.75
            elif overall_similarity >= self.config.low_similarity_threshold:
                is_plagiarized = False  # Acceptable common pattern
                risk_level = "LOW"
                confidence = 0.6
            else:
                is_plagiarized = False
                risk_level = "CLEAN"
                confidence = 1.0 - overall_similarity
            
            # Generate reasoning
            if best_match:
                reasoning = (
                    f"Best match: {best_match.pattern_name} "
                    f"(similarity: {best_match.similarity:.2f}, "
                    f"level: {best_match.normalization_level})"
                )
            else:
                reasoning = "No significant matches found"
            
            # Recommendations
            recommendations = []
            if is_plagiarized:
                if risk_level == "HIGH":
                    recommendations.append("INVESTIGATE: High similarity to known algorithm")
                elif risk_level == "MEDIUM":
                    recommendations.append("FLAG_FOR_REVIEW: Moderate similarity detected")
            else:
                if risk_level == "LOW":
                    recommendations.append("ACCEPTABLE: Common algorithm pattern (not plagiarism)")
                else:
                    recommendations.append("ACCEPT: Original code")
            
            # Processing time
            processing_time_ms = int((time.time() - start_time) * 1000)
            self.total_detections += 1
            self.total_processing_time_ms += processing_time_ms
            
            # Generate hash
            normalized_hash = self._hash_code(
                self.normalizer.normalize(code, "aggressive")
            )
            
            # Build result
            result = PlagiarismResult(
                is_plagiarized=is_plagiarized,
                confidence=round(confidence, 3),
                risk_level=risk_level,
                matches=all_matches[:5],  # Top 5 matches only
                best_match=best_match,
                max_similarity_light=round(max_similarities["light"], 3),
                max_similarity_medium=round(max_similarities["medium"], 3),
                max_similarity_aggressive=round(max_similarities["aggressive"], 3),
                structural_similarity=round(structural_similarity, 3),
                code_length=original_length,
                normalized_hash=normalized_hash,
                processing_time_ms=processing_time_ms,
                reasoning=reasoning,
                recommendations=recommendations
            )
            
            # Log
            logging.info(
                "Plagiarism detection complete",
                extra={
                    "is_plagiarized": is_plagiarized,
                    "risk_level": risk_level,
                    "best_match": best_match.pattern_name if best_match else None,
                    "max_similarity": overall_similarity,
                    "processing_time_ms": processing_time_ms,
                }
            )
            
            return result
        
        except ValueError as e:
            logging.error(f"Validation error in plagiarism detection: {e}")
            raise CustomException(f"PLAGIARISM_DETECTION_VALIDATION_ERROR: {str(e)}", sys)
        
        except Exception as e:
            logging.error(f"Plagiarism detection failed: {e}")
            raise CustomException(f"PLAGIARISM_DETECTION_ERROR: {str(e)}", sys)
    
    def compare_submissions(self, code1: str, code2: str) -> ComparisonResult:
        
        try:
            # Normalize both at all levels
            norm1 = {
                "light": self.normalizer.normalize(code1, "light"),
                "medium": self.normalizer.normalize(code1, "medium"),
                "aggressive": self.normalizer.normalize(code1, "aggressive"),
            }
            norm2 = {
                "light": self.normalizer.normalize(code2, "light"),
                "medium": self.normalizer.normalize(code2, "medium"),
                "aggressive": self.normalizer.normalize(code2, "aggressive"),
            }
            
            # Calculate similarity at each level
            similarity_by_level = {}
            for level in ["light", "medium", "aggressive"]:
                similarity_by_level[level] = self._calculate_similarity(
                    norm1[level],
                    norm2[level]
                )
            
            # Structural similarity
            structural_sim = self._calculate_structural_similarity(code1, code2)
            
            # Overall similarity (max across levels)
            overall_sim = max(similarity_by_level.values())
            
            # Verdict
            is_similar = overall_sim >= self.config.medium_similarity_threshold
            
            # Reasoning
            if overall_sim >= self.config.high_similarity_threshold:
                reasoning = f"Very high similarity ({overall_sim:.2f}) - likely copied"
            elif overall_sim >= self.config.medium_similarity_threshold:
                reasoning = f"High similarity ({overall_sim:.2f}) - possible plagiarism"
            elif overall_sim >= self.config.low_similarity_threshold:
                reasoning = f"Moderate similarity ({overall_sim:.2f}) - common patterns"
            else:
                reasoning = f"Low similarity ({overall_sim:.2f}) - likely independent"
            
            return ComparisonResult(
                similarity=round(overall_sim, 3),
                is_similar=is_similar,
                similarity_by_level={k: round(v, 3) for k, v in similarity_by_level.items()},
                structural_similarity=round(structural_sim, 3),
                reasoning=reasoning
            )
        
        except Exception as e:
            logging.error(f"Submission comparison failed: {e}")
            raise CustomException(f"COMPARISON_ERROR: {str(e)}", sys)
    
    
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
            "num_patterns": len(self.patterns),
        }
    
    def reset_metrics(self):
        """Reset metrics counters."""
        self.total_detections = 0
        self.total_processing_time_ms = 0


if __name__ == "__main__":
    try:
        # Initialize detector
        detector = PlagiarismDetector()
        
        # Test 1: Exact copy of bubble sort
        copied_code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""
        
        # Test 2: Modified fibonacci
        modified_code = """
def fib(num):
    # Calculate fibonacci
    if num <= 1:
        return num
    else:
        return fib(num - 1) + fib(num - 2)
"""
        
        # Test 3: Original code
        original_code = """
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
"""
        
        print("=== TEST 1: EXACT COPY ===")
        result1 = detector.detect(copied_code)
        print(f"Plagiarized: {result1.is_plagiarized}")
        print(f"Risk Level: {result1.risk_level}")
        print(f"Best Match: {result1.best_match.pattern_name if result1.best_match else None}")
        print(f"Reasoning: {result1.reasoning}")
        print(f"Recommendations: {result1.recommendations}")
        
        print("\n=== TEST 2: MODIFIED ALGORITHM ===")
        result2 = detector.detect(modified_code)
        print(f"Plagiarized: {result2.is_plagiarized}")
        print(f"Risk Level: {result2.risk_level}")
        print(f"Max Similarity: {result2.max_similarity_aggressive}")
        print(f"Reasoning: {result2.reasoning}")
        
        print("\n=== TEST 3: ORIGINAL CODE ===")
        result3 = detector.detect(original_code)
        print(f"Plagiarized: {result3.is_plagiarized}")
        print(f"Risk Level: {result3.risk_level}")
        print(f"Reasoning: {result3.reasoning}")
        
        print("\n=== COMPARISON: TEST 1 vs TEST 2 ===")
        comparison = detector.compare_submissions(copied_code, modified_code)
        print(f"Similar: {comparison.is_similar}")
        print(f"Overall Similarity: {comparison.similarity}")
        print(f"By Level: {comparison.similarity_by_level}")
        print(f"Reasoning: {comparison.reasoning}")
        
        print("\n=== METRICS ===")
        print(detector.get_metrics())
    
    except CustomException as e:
        logging.error(f"Example execution failed: {e}")
        raise
