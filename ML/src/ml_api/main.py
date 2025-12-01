from __future__ import annotations
import sys
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.logger import logging
from src.exception import CustomException
from src.components.data_ingestion import DataIngestion
from src.components.normalization import Normalizer
from src.ml_core.model_loader import get_model_singleton
from src.ml_core.code_detector import AICodeDetector
from src.ml_core.plagiarism_detector import PlagiarismDetector
from src.ml_core.decision_engine import DecisionEngine, DecisionConfig

class AnalyzeRequest(BaseModel):
    code: str = Field(..., description="Raw source code to analyze")
    user_id: str = Field(default="unknown")
    submission_id: Optional[str] = Field(default=None)
    mode: str = Field(default="practice", description="practice | coursework | contest")
    language: str = Field(default="python")


class AnalyzeResponse(BaseModel):
    submission_id: str
    user_id: str
    mode: str

    ai_detection: Dict[str, Any]
    plagiarism_detection: Dict[str, Any]
    decision: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    device: str
    model_loaded: bool

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logging.info("Starting up Code Analysis Engine (lifespan)...")

        # Initialize shared dependencies once
        data_ingestor = DataIngestion()
        normalizer = Normalizer()

        model, tokenizer, device = get_model_singleton()

        ai_detector = AICodeDetector(
            model=model,
            tokenizer=tokenizer,
            device=device,
            normalizer=normalizer,
        )

        plag_detector = PlagiarismDetector(
            normalizer=normalizer,
        )

        decision_engine = DecisionEngine(DecisionConfig(mode="practice"))

        # Attach to app.state for access in routes
        app.state.data_ingestor = data_ingestor
        app.state.normalizer = normalizer
        app.state.ai_detector = ai_detector
        app.state.plag_detector = plag_detector
        app.state.decision_engine = decision_engine
        app.state.device = device

        logging.info("Startup complete: detectors and decision engine initialized.")

        yield 

    except Exception as e:
        logging.error(f"Lifespan startup failed: {e}")
        raise

    finally:
        logging.info("Shutting down Code Analysis Engine")
        # If you had resources to close (DB, clients), do it here.


app = FastAPI(
    title="Code Analysis Engine",
    version="1.0.0",
    description="AI-generated code and plagiarism detection service with policy-aware decisions.",
    lifespan=lifespan,
)

@app.get("/health", response_model=HealthResponse)
def health_check():
    try:
        device = getattr(app.state, "device", None)
        model_loaded = device is not None
        device_str = str(device) if model_loaded else "uninitialized"

        return HealthResponse(
            status="ok" if model_loaded else "initializing",
            device=device_str,
            model_loaded=model_loaded,
        )
    except Exception as e:
        logging.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_code(request: AnalyzeRequest):
    try:
        ai_detector: AICodeDetector = app.state.ai_detector
        plag_detector: PlagiarismDetector = app.state.plag_detector
        decision_engine: DecisionEngine = app.state.decision_engine

        raw_code = request.code
        if not raw_code or not raw_code.strip():
            raise HTTPException(status_code=400, detail="Code cannot be empty")

        # AI detection
        ai_result = ai_detector.detect(raw_code)
        ai_payload = ai_result.to_dict()

        # Plagiarism detection
        plag_result = plag_detector.detect(raw_code)
        plag_payload = plag_result.to_dict()

        # Decision: update mode per request
        decision_engine.config = DecisionConfig(mode=request.mode)
        decision = decision_engine.decide(ai_result, plag_result)
        decision_payload = {
            "action": decision.action,
            "rationale": decision.rationale,
            "combined_confidence": decision.combined_confidence,
            "details": decision.details,
        }

        submission_id = request.submission_id or f"auto_{id(request)}"

        return AnalyzeResponse(
            submission_id=submission_id,
            user_id=request.user_id,
            mode=request.mode,
            ai_detection=ai_payload,
            plagiarism_detection=plag_payload,
            decision=decision_payload,
        )

    except CustomException as e:
        logging.error(f"CustomException in /analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected error in /analyze: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/analyze-batch", response_model=List[AnalyzeResponse])
def analyze_batch(requests: List[AnalyzeRequest]):
    responses: List[AnalyzeResponse] = []
    for req in requests:
        resp = analyze_code(req)
        responses.append(resp)
    return responses

if __name__ == "__main__":
    try:
        uvicorn.run(
            "src.ml_api.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
        )
    except Exception as e:
        logging.error(f"Failed to start server: {e}")
        raise CustomException(e)
