import sys
import re
import ast
import time
from typing import Optional, Literal

from src.logger import logging
from src.exception import CustomException

NormalizationLevel = Literal["light", "medium", "aggressive"]

class Normalizer:
    
    def __init__(
        self,max_code_size: Optional[int] = None,custom_builtins: Optional[set] = None,enable_cache: bool = True):

        self.max_code_size = max_code_size
        self.enable_cache = enable_cache
        
        # Default built-ins
        self.builtins = {
            'print', 'len', 'range', 'str', 'int', 'float', 'bool',
            'list', 'dict', 'set', 'tuple', 'sum', 'max', 'min',
            'input', 'open', 'enumerate', 'zip', 'map', 'filter',
            'sorted', 'reversed', 'any', 'all', 'abs', 'round',
            'True', 'False', 'None'
        }
        
        if custom_builtins:
            self.builtins.update(custom_builtins)
        
        self.total_normalizations = 0
        self.total_latency_ms = 0
    
    
    @staticmethod
    def _remove_comments_and_docstrings(code: str) -> str:
        """Remove comments and docstrings from Python code."""
        try:
            code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
            
            code = re.sub(r'"""[\s\S]*?"""', '', code)
            code = re.sub(r"'''[\s\S]*?'''", '', code)
            
            return code
        except Exception as e:
            logging.warning(f"Failed to remove comments/docstrings: {e}")
            return code
    
    @staticmethod
    def _normalize_whitespace(code: str) -> str:
        """Normalize whitespace and line endings."""
        try:
            # Normalize line endings
            code = code.replace('\r\n', '\n').replace('\r', '\n')
            lines = [line.rstrip() for line in code.split('\n')]
            
            # Collapse multiple blank lines
            normalized_lines = []
            prev_blank = False
            for line in lines:
                if line.strip():
                    normalized_lines.append(line)
                    prev_blank = False
                elif not prev_blank:
                    normalized_lines.append('')
                    prev_blank = True
            
            return '\n'.join(normalized_lines).strip()
        except Exception as e:
            logging.warning(f"Failed to normalize whitespace: {e}")
            return code

    
    def normalize_light(self, code: str) -> str:
        try:
            code = self._remove_comments_and_docstrings(code)
            code = self._normalize_whitespace(code)
            return code
        except Exception as e:
            logging.error(f"Light normalization failed: {e}")
            raise CustomException(f"LIGHT_NORMALIZATION_ERROR: {str(e)}", sys)
    
    def normalize_medium(self, code: str) -> str:

        # Start with light normalization
        code = self.normalize_light(code)
        
        try:
            tree = ast.parse(code)
            
            # AST transformer using instance builtins
            class IdentifierRenamer(ast.NodeTransformer):
                def __init__(self, builtins: set):
                    self.builtins = builtins
                    self.var_map = {}
                    self.var_counter = 0
                    self.func_counter = 0
                    self.class_counter = 0
                
                def _get_new_name(self, old_name: str, prefix: str) -> str:
                    if old_name in self.builtins:
                        return old_name
                    
                    if old_name not in self.var_map:
                        if prefix == 'v':
                            self.var_map[old_name] = f'v{self.var_counter}'
                            self.var_counter += 1
                        elif prefix == 'f':
                            self.var_map[old_name] = f'f{self.func_counter}'
                            self.func_counter += 1
                        elif prefix == 'C':
                            self.var_map[old_name] = f'C{self.class_counter}'
                            self.class_counter += 1
                    
                    return self.var_map[old_name]
                
                def visit_Name(self, node):
                    if isinstance(node.ctx, (ast.Store, ast.Load)):
                        node.id = self._get_new_name(node.id, 'v')
                    return node
                
                def visit_FunctionDef(self, node):
                    node.name = self._get_new_name(node.name, 'f')
                    self.generic_visit(node)
                    return node
                
                def visit_ClassDef(self, node):
                    node.name = self._get_new_name(node.name, 'C')
                    self.generic_visit(node)
                    return node
                
                def visit_arg(self, node):
                    node.arg = self._get_new_name(node.arg, 'v')
                    return node
            
            renamer = IdentifierRenamer(self.builtins)
            tree = renamer.visit(tree)
            code = ast.unparse(tree)
            
            return code
        
        except SyntaxError as e:
            logging.warning(f"Syntax error during medium normalization: {e}")
            return code  # Return light normalization
        
        except Exception as e:
            logging.warning(f"Medium normalization failed: {e}")
            return code
    
    def normalize_aggressive(self, code: str) -> str:

        code = self.normalize_medium(code)
        
        try:
            code = re.sub(r'\s+', '', code)
            code = code.lower()
            return code
        except Exception as e:
            logging.error(f"Aggressive normalization failed: {e}")
            raise CustomException(f"AGGRESSIVE_NORMALIZATION_ERROR: {str(e)}", sys)
    
    
    def normalize(self, code: str, level: NormalizationLevel = "light") -> str:
        start_time = time.time()
        original_size = len(code)
        
        try:
            # Validate input
            if not code or not isinstance(code, str):
                raise ValueError("Code must be a non-empty string")
            
            if not code.strip():
                logging.warning("Empty code provided")
                return ""
            
            # Check size limit
            if self.max_code_size and len(code) > self.max_code_size:
                logging.warning(
                    f"Code exceeds max size ({len(code)} > {self.max_code_size}). Truncating."
                )
                code = code[:self.max_code_size]
            
            # Route to normalization level
            if level == "light":
                normalized = self.normalize_light(code)
            elif level == "medium":
                normalized = self.normalize_medium(code)
            elif level == "aggressive":
                normalized = self.normalize_aggressive(code)
            else:
                raise ValueError(
                    f"Invalid level: {level}. Must be 'light', 'medium', or 'aggressive'"
                )
            
            # Track metrics
            latency_ms = int((time.time() - start_time) * 1000)
            self.total_normalizations += 1
            self.total_latency_ms += latency_ms
            
            normalized_size = len(normalized)
            reduction_pct = (
                round((1 - normalized_size / original_size) * 100, 2)
                if original_size > 0 else 0
            )
            
            # Log
            logging.info(
                f"Normalized successfully",
                extra={
                    "level": level,
                    "original_size": original_size,
                    "normalized_size": normalized_size,
                    "reduction_pct": reduction_pct,
                    "latency_ms": latency_ms
                }
            )
            
            return normalized
        
        except ValueError as e:
            logging.error(f"Validation error: {e}")
            raise CustomException(f"NORMALIZATION_VALIDATION_ERROR: {str(e)}", sys)
        
        except Exception as e:
            logging.error(f"Normalization error: {e}")
            raise CustomException(f"NORMALIZATION_ERROR: {str(e)}", sys)
    
    
    def normalize_batch(
        self,
        codes: list[str],
        level: NormalizationLevel = "light"
    ) -> list[str]:
        normalized = []
        for idx, code in enumerate(codes):
            try:
                norm_code = self.normalize(code, level)
                normalized.append(norm_code)
            except Exception as e:
                logging.warning(f"Failed at index {idx}: {e}")
                normalized.append(code)
        
        return normalized
    
    def get_metrics(self) -> dict:
        """Get normalization metrics."""
        avg_latency = (
            round(self.total_latency_ms / self.total_normalizations, 2)
            if self.total_normalizations > 0 else 0
        )
        
        return {
            "total_normalizations": self.total_normalizations,
            "total_latency_ms": self.total_latency_ms,
            "avg_latency_ms": avg_latency
        }
    
    def reset_metrics(self):
        """Reset metrics counters."""
        self.total_normalizations = 0
        self.total_latency_ms = 0


if __name__ == "__main__":
    # Option 1: Use class directly
    normalizer = Normalizer(max_code_size=50000)
    
    test_code = """
def fibonacci(n):
    # Calculate fibonacci
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"""
    
    print("=== LIGHT ===")
    print(normalizer.normalize(test_code, "light"))
    
    print("\n=== MEDIUM ===")
    print(normalizer.normalize(test_code, "medium"))
    
    print("\n=== AGGRESSIVE ===")
    print(normalizer.normalize(test_code, "aggressive"))
    
    print("\n=== METRICS ===")
    print(normalizer.get_metrics())
