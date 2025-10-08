from __future__ import annotations
import sys
import os
from typing import Tuple
import torch  # type: ignore
from transformers import (  # type: ignore
    AutoConfig, AutoTokenizer, AutoModelForCausalLM,
    PreTrainedModel, PreTrainedTokenizerBase,
)
# Import the already-configured logging and exception
from src.logger import logging   
from src.exception import CustomException

DEFAULT_MODELS_ROOT = os.getenv("MODELS_ROOT", r"E:\project\ML\models")
DEFAULT_DEVICE_PREF = os.getenv("MODEL_DEVICE", None)  # "cuda" | "cpu" | None

def _resolve_dir(models_root: str = DEFAULT_MODELS_ROOT) -> str:
    try:
        model_dir = os.path.abspath(models_root)
        if not os.path.isdir(model_dir):
            raise FileNotFoundError(f"Model directory not found: {model_dir}")
        if not os.path.isfile(os.path.join(model_dir, "config.json")):
            raise FileNotFoundError(f"Missing config.json in {model_dir}")
        return model_dir
    except Exception as e:
        raise CustomException(e,sys)

def _select_device(pref: str | None = DEFAULT_DEVICE_PREF) -> torch.device:
    try:
        if pref == "cuda":
            if not torch.cuda.is_available():
                raise CustomException("CUDA requested but not available")
            return torch.device("cuda")
        if pref == "cpu":
            return torch.device("cpu")
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    except Exception as e:
        raise CustomException(e,sys)

def load_model_and_tokenizer(
    models_root: str = DEFAULT_MODELS_ROOT,
    device_preference: str | None = DEFAULT_DEVICE_PREF,
) -> Tuple[PreTrainedModel, PreTrainedTokenizerBase, torch.device]:
    try:
        model_dir = _resolve_dir(models_root)
        logging.info("Loading artifacts from %s", model_dir)

        device = _select_device(device_preference)
        logging.info("Device: %s", device)

        try:
            cfg = AutoConfig.from_pretrained(model_dir, local_files_only=True)
            logging.debug("Config model_type=%s", getattr(cfg, "model_type", "unknown"))
        except Exception as e:
            raise CustomException(e,sys)

        try:
            tok = AutoTokenizer.from_pretrained(model_dir, local_files_only=True, use_fast=True)
            _ = tok.encode("ok", add_special_tokens=False)
        except Exception as e:
            raise CustomException(e,sys)

        try:
            mdl = AutoModelForCausalLM.from_pretrained(
                model_dir, local_files_only=True, torch_dtype="auto", low_cpu_mem_usage=True
            )
            mdl.to(device).eval()
        except Exception as e:
            raise CustomException(e,sys)

        logging.info("Model and tokenizer ready")
        return mdl, tok, device

    except Exception as e:
        raise CustomException(e,sys)

if __name__ == "__main__":
    try:
        model, tokenizer, device = load_model_and_tokenizer()
        with torch.inference_mode():
            inputs = tokenizer("def add(a, b):", return_tensors="pt").to(device)
            out = model.generate(**inputs, max_new_tokens=24)
            print(tokenizer.decode(out[0], skip_special_tokens=True))
    except CustomException as e:
        # Ensure the error also lands in the same log file
        raise CustomException(e,sys)
