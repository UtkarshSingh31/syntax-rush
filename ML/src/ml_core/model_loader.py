from __future__ import annotations
import sys
import os
import time
from typing import Tuple,Optional
from dataclasses import dataclass

import torch  # type: ignore
from transformers import (  # type: ignore
    AutoConfig, AutoTokenizer, AutoModelForCausalLM,
    PreTrainedModel, PreTrainedTokenizerBase,
)

# Import the already-configured logging and exception
from src.logger import logging   
from src.exception import CustomException



@dataclass
class ModelLoaderConfig:

    models_root: str = os.getenv("MODELS_ROOT", r"E:\project\ML\models")
    device_preference: Optional[str] = os.getenv("MODEL_DEVICE", None)
    torch_dtype: str = "auto"
    low_cpu_mem_usage: bool = True
    use_fast_tokenizer: bool = True
    validate_on_load: bool = True
    max_validation_tokens: int = 50
    
    @classmethod
    def from_env(cls) -> ModelLoaderConfig:
        """Load config from environment variables."""
        return cls(
            models_root=os.getenv("MODELS_ROOT", r"E:\project\ML\models"),
            device_preference=os.getenv("MODEL_DEVICE", None),
            torch_dtype=os.getenv("TORCH_DTYPE", "auto"),
        )


# device selection 
def _select_device(preference: Optional[str] = None) -> torch.device:

    try:

        if preference == "cuda":
            if not torch.cuda.is_available():
                raise CustomException("CUDA requested but not available")
            device=torch.device("cuda")
            logging.info(
                f"Cuda device intilization:{torch.cuda.get_device_name(0)}",
                extra={
                    "device": "cuda",
                    "device_name": torch.cuda.get_device_name(0),
                    "cuda_version": torch.version.cuda,
                }
            )
            return device
        
        elif preference == "cpu":
            logging.info("Using CPU {forced}.")
            return torch.device("cpu")
        else :
            if torch.cuda.is_available():
                device=torch.device("cuda")
                logging.info(
                    f"Auto-selected CUDA: {torch.cuda.get_device_name(0)}",
                    extra={
                        "device": "cuda",
                        "device_name": torch.cuda.get_device_name(0)
                    }
                )
            else:
                device = torch.device("cpu")
                logging.info("Auto-selected CPU (CUDA not available")
            return device

    except Exception as e:
        raise CustomException(e,sys)


def _validate_model_directory(model_dir:str)-> str:

    try:
        model_dir=os.path.abspath(model_dir)

        if not os.path.isdir(model_dir):
            raise FileNotFoundError(F"Model directory not found: {model_dir}")

        required_files=["config.json"]
        optional_files=["pytorch_model.bin","model.safetensors"]

        for req_file in required_files:
            file_path=os.path.join(model_dir,req_file)
            if not os.path.isfile(file_path):
                raise FileNotFoundError(f"Missing requireed files: {req_file}")

        has_weights=any(
            os.path.isfile(os.path.join(model_dir,f)) for f in optional_files
        )

        if not has_weights:
            raise FileNotFoundError(
                f"No model weights found in {model_dir}. "
                f"Expected one of: {optional_files}"
            )
        
        logging.info(f"Model directory validated: {model_dir}")
        return model_dir
    
    except Exception as e:
        logging.error(f"Unexpected validation error: {e}")
        raise CustomException(f"Model Dir error: {e}",sys)
            

def _load_config_(model_dir:str)->AutoConfig:

    try:
        logging.info("Loading model config:")
        config=AutoConfig.from_pretrained(
            model_dir,
            local_files_only=True
        )

        model_type=getattr(config,"model_type","unknown")
        vocab_size=getattr(config,"vocab_size","unknown")

        logging.info(
            f"Config loaded successfully",
            extra={
                "model_type": model_type,
                "vocab_size": vocab_size,
            }
        )

        return config
    
    except Exception as e:
        logging.error(f"Failed to load Auto Config: {e}")
        raise CustomException(e,sys)

def _load_tokenizer(model_dir:str,use_fast:bool=True)->PreTrainedTokenizerBase:
    try:
        logging.info("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            model_dir,
            local_files_only=True,
            use_fast=use_fast
        )
       
        test_encode=tokenizer.encode("test", add_special_tokens=False)
        if not test_encode:
            raise RuntimeError("Tokenizer encode test failed")
        
        vocab_size = len(tokenizer)
        logging.info(
            f"Tokenizer loaded successfully",
            extra={
                "vocab_size": vocab_size,
                "fast_tokenizer": use_fast,
            }
        )
        
        return tokenizer
    
    except Exception as e:
        logging.error(f"Failed to load tokenizer: {e}")
        raise CustomException(f"TOKENIZER_LOAD_ERROR: {str(e)}", sys)

def _load_model(
    model_dir: str,
    device: torch.device,
    torch_dtype: str = "auto",
    low_cpu_mem_usage: bool = True
) -> PreTrainedModel:
    
    try:
        logging.info("Loading model weights...")
        start_time = time.time()
        
        model = AutoModelForCausalLM.from_pretrained(
            model_dir,
            local_files_only=True,
            torch_dtype=torch_dtype,
            low_cpu_mem_usage=low_cpu_mem_usage
        )
        
        # Move to device and set to eval mode
        model.to(device)
        model.eval()
        
        load_time = time.time() - start_time
        
        # Get model info
        num_params = sum(p.numel() for p in model.parameters())
        num_params_m = num_params / 1_000_000
        
        logging.info(
            f"Model loaded successfully",
            extra={
                "device": str(device),
                "num_parameters": num_params,
                "num_parameters_millions": round(num_params_m, 2),
                "load_time_seconds": round(load_time, 2),
                "torch_dtype": torch_dtype,
            }
        )
        
        return model
    
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
        raise CustomException(f"MODEL_LOAD_ERROR: {str(e)}", sys)


def _validate_model(
    model: PreTrainedModel,
    tokenizer: PreTrainedTokenizerBase,
    device: torch.device,
    max_tokens: int = 50
) -> bool:
    
    try:
        logging.info("Running model validation...")
        
        test_input = "def hello():"
        
        with torch.inference_mode():
            # Encode
            inputs = tokenizer(
                test_input,
                return_tensors="pt",
                add_special_tokens=True
            ).to(device)
            
            # Forward pass
            start_time = time.time()
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id
            )
            inference_time = time.time() - start_time
            
            # Decode
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            if not generated_text:
                raise RuntimeError("Model generated empty output")
            
            logging.info(
                f"Model validation passed",
                extra={
                    "input_length": len(test_input),
                    "output_length": len(generated_text),
                    "inference_time_ms": int(inference_time * 1000),
                    "generated_sample": generated_text[:100]  # First 100 chars
                }
            )
            
            return True
    
    except Exception as e:
        logging.error(f"Model validation failed: {e}")
        raise CustomException(f"MODEL_VALIDATION_ERROR: {str(e)}", sys)

def load_model_and_tokenizer(
    config: Optional[ModelLoaderConfig] = None
) -> Tuple[PreTrainedModel, PreTrainedTokenizerBase, torch.device]:
    
    if config is None:
        config = ModelLoaderConfig.from_env()
    
    start_time = time.time()
    
    try:
        logging.info(
            "Starting model loading pipeline",
            extra={
                "models_root": config.models_root,
                "device_preference": config.device_preference,
                "torch_dtype": config.torch_dtype,
            }
        )
        
        # 1. Validate directory
        model_dir = _validate_model_directory(config.models_root)
        
        # 2. Select device
        device = _select_device(config.device_preference)
        
        # 3. Load config
        model_config = _load_config_(model_dir)
        
        # 4. Load tokenizer
        tokenizer = _load_tokenizer(model_dir, config.use_fast_tokenizer)
        
        # 5. Load model
        model = _load_model(
            model_dir,
            device,
            config.torch_dtype,
            config.low_cpu_mem_usage
        )
        
        # 6. Optional validation
        if config.validate_on_load:
            _validate_model(model, tokenizer, device, config.max_validation_tokens)
        
        total_time = time.time() - start_time
        
        logging.info(
            f"Model loading pipeline completed successfully",
            extra={
                "total_time_seconds": round(total_time, 2),
                "device": str(device),
            }
        )
        
        return model, tokenizer, device
    
    except CustomException:
        # Re-raise CustomException as-is
        raise
    
    except Exception as e:
        logging.error(f"Unexpected error in loading pipeline: {e}")
        raise CustomException(f"MODEL_LOADING_PIPELINE_ERROR: {str(e)}", sys)
    
_cached_model: Optional[PreTrainedModel] = None
_cached_tokenizer: Optional[PreTrainedTokenizerBase] = None
_cached_device: Optional[torch.device] = None

def get_model_singleton(
    config: Optional[ModelLoaderConfig] = None,
    force_reload: bool = False
) -> Tuple[PreTrainedModel, PreTrainedTokenizerBase, torch.device]:
    global _cached_model, _cached_tokenizer, _cached_device
    
    if force_reload or _cached_model is None:
        logging.info("Loading model (singleton pattern)...")
        _cached_model, _cached_tokenizer, _cached_device = load_model_and_tokenizer(config)
    else:
        logging.info("Using cached model (singleton)")
    
    return _cached_model, _cached_tokenizer, _cached_device

def clear_model_cache():
    
    global _cached_model, _cached_tokenizer, _cached_device
    
    if _cached_model is not None:
        del _cached_model
        del _cached_tokenizer
        _cached_model = None
        _cached_tokenizer = None
        _cached_device = None
        
        # Force garbage collection
        import gc
        gc.collect()
        
        # Clear CUDA cache if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logging.info("Model cache cleared")


if __name__ == "__main__":
    try:

        model, tokenizer, device = load_model_and_tokenizer()

        test_code = "def add(a, b):"
        print(f"\nInput: {test_code}")
        
        with torch.inference_mode():
            inputs = tokenizer(test_code, return_tensors="pt").to(device)
            outputs = model.generate(
                **inputs,
                max_new_tokens=24,
                pad_token_id=tokenizer.eos_token_id
            )
            generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"Generated: {generated}")
            
    except CustomException as e:
        # Ensure the error also lands in the same log file
        logging.error(f"Example failed: {e}")
        raise CustomException(e,sys)