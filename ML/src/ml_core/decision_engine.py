from __future__ import annotations
import sys
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

from src.logger import logging
from src.exception import CustomException
from src.ml_core.code_detector import DetectionResult
from src.ml_core.plagiarism_detector import PlagiarismResult


@dataclass
class DecisionConfig:
    """
    Configuration for decision thresholds and policy modes.
    """
    # Risk thresholds
    ai_high_threshold: float = 0.65
    ai_medium_threshold: float = 0.45
    plag_high_threshold: float = 0.65
    plag_medium_threshold: float = 0.45

    # Policy modes: "practice", "coursework", "contest"
    mode: str = "practice"  # default mode

    # Mapping policy modes to actions (can be extended/configured)
    policy_actions: Dict[str, Dict[str, str]] = field(default_factory=lambda: {
        "practice": {
            "accept": "ACCEPT",
            "flag": "FLAG_FOR_REVIEW",
            "monitor": "MONITOR",
            "block": "BLOCK_AND_REPORT"
        },
        "coursework": {
            "accept": "ACCEPT",
            "flag": "FLAG_FOR_REVIEW",
            "monitor": "INVESTIGATE",
            "block": "BLOCK_AND_REPORT"
        },
        "contest": {
            "accept": "ACCEPT",
            "flag": "INVESTIGATE",
            "monitor": "INVESTIGATE",
            "block": "BLOCK_AND_REPORT"
        }
    })

    def validate(self):
        if self.mode not in self.policy_actions:
            raise ValueError(f"Invalid mode: {self.mode}")


@dataclass
class DecisionResult:

    action: str
    rationale: str
    combined_confidence: float
    details: Dict[str, Any] = field(default_factory=dict)


class DecisionEngine:

    def __init__(self, config: Optional[DecisionConfig] = None):
        self.config = config or DecisionConfig()
        self.config.validate()
        logging.info(f"DecisionEngine initialized with mode: {self.config.mode}")

    def decide(
        self,
        ai_result: Optional[DetectionResult],
        plag_result: Optional[PlagiarismResult],
    ) -> DecisionResult:

        # Extract scores or defaults
        ai_conf = ai_result.confidence if ai_result else 0.0
        plag_conf = plag_result.confidence if plag_result else 0.0

        # Determine risk levels for AI
        if ai_conf >= self.config.ai_high_threshold:
            ai_risk = "HIGH"
        elif ai_conf >= self.config.ai_medium_threshold:
            ai_risk = "MEDIUM"
        elif ai_conf > 0:
            ai_risk = "LOW"
        else:
            ai_risk = "NONE"

        # Determine risk levels for Plagiarism
        if plag_conf >= self.config.plag_high_threshold:
            plag_risk = "HIGH"
        elif plag_conf >= self.config.plag_medium_threshold:
            plag_risk = "MEDIUM"
        elif plag_conf > 0:
            plag_risk = "LOW"
        else:
            plag_risk = "NONE"

        logging.debug(f"AI risk: {ai_risk} (conf={ai_conf}), Plag risk: {plag_risk} (conf={plag_conf})")

        # Combine signals for decision
        # Priority: if any HIGH risk → block
        # else MEDIUM → investigate or flag
        # else LOW → monitor or accept
        # else accept

        if ai_risk == "HIGH" or plag_risk == "HIGH":
            action = self.config.policy_actions[self.config.mode]["block"]
            rationale = "High risk detected by AI or Plagiarism detector"
        elif ai_risk == "MEDIUM" or plag_risk == "MEDIUM":
            action = self.config.policy_actions[self.config.mode]["flag"]
            rationale = "Medium risk detected by AI or Plagiarism detector"
        elif ai_risk == "LOW" or plag_risk == "LOW":
            action = self.config.policy_actions[self.config.mode]["monitor"]
            rationale = "Low risk detected—monitoring suggested"
        else:
            action = self.config.policy_actions[self.config.mode]["accept"]
            rationale = "No significant risk detected—accept submission"

        # Build combined confidence as max of two signals weighted average
        combined_confidence = 0.5 * ai_conf + 0.5 * plag_conf

        # Compose detailed context for transparency
        details = {
            "ai_confidence": ai_conf,
            "ai_risk": ai_risk,
            "plag_confidence": plag_conf,
            "plag_risk": plag_risk,
            "ai_verdict": getattr(ai_result, 'risk_level', None) if ai_result else None,
            "plag_verdict": getattr(plag_result, 'risk_level', None) if plag_result else None,
        }

        # Provide hints if conflict detected
        if ai_risk != "NONE" and plag_risk != "NONE" and ai_risk != plag_risk:
            rationale += " | Conflict between AI and Plagiarism signals; manual review recommended."
            if action != self.config.policy_actions[self.config.mode]["block"]:
                action = self.config.policy_actions[self.config.mode]["flag"]

        return DecisionResult(
            action=action,
            rationale=rationale,
            combined_confidence=combined_confidence,
            details=details,
        )


if __name__ == "__main__":
    import random

    # Mock Detection Results for demo
    ai_mock = DetectionResult(
        is_ai_generated=True,
        confidence=0.7,
        risk_level="HIGH",
        perplexity_score=0.9,
        ast_score=0.5,
        style_score=0.4,
        weighted_score=0.65,
        perplexity=12.5,
        ast_features={},
        style_features={},
        conflict_detected=False,
        code_length=100,
        normalized_length=90,
        processing_time_ms=200,
        reasoning="Low perplexity, uniform structure",
        recommendations=["FLAG_FOR_REVIEW"]
    )

    plag_mock = PlagiarismResult(
        is_plagiarized=True,
        confidence=0.5,
        risk_level="MEDIUM",
        matches=[],
        best_match=None,
        max_similarity_light=0.45,
        max_similarity_medium=0.5,
        max_similarity_aggressive=0.4,
        structural_similarity=0.35,
        code_length=100,
        normalized_hash="abcdef123456",
        processing_time_ms=150,
        reasoning="Moderate similarity to known patterns",
        recommendations=["INVESTIGATE"]
    )

    engine = DecisionEngine(DecisionConfig(mode="coursework"))
    decision = engine.decide(ai_mock, plag_mock)

    print(f"Action: {decision.action}")
    print(f"Rationale: {decision.rationale}")
    print(f"Combined Confidence: {decision.combined_confidence}")
    print(f"Details: {decision.details}")
