from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field

from src.ml_core.code_detector import DetectionResult
from src.ml_core.plagiarism_detector import PlagiarismResult
from src.ml_core.decision_engine import DecisionResult

class AIBreakdown(BaseModel):
    """Minimal AI detection breakdown."""
    is_ai_generated: bool
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: str
    perplexity: float
    reasoning: str


class PlagiarismBreakdown(BaseModel):
    """Minimal plagiarism detection breakdown."""
    is_plagiarized: bool
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: str
    best_match: Optional[str] = None
    best_match_similarity: float = Field(default=0.0, ge=0.0, le=1.0)
    reasoning: str


class Review(BaseModel):
    """Lean review output with essentials only."""
    verdict: str  # "ACCEPT", "MONITOR", "FLAG_FOR_REVIEW", "INVESTIGATE", "BLOCK_AND_REPORT"
    summary: str
    ai_breakdown: AIBreakdown
    plagiarism_breakdown: PlagiarismBreakdown
    confidence: float = Field(ge=0.0, le=1.0)
    risk_factors: List[str]
    next_steps: List[str]

class ReviewFormatter:
    """Minimal review formatter with essential info only."""
    
    def format_review(
        self,
        ai_result: DetectionResult,
        plag_result: PlagiarismResult,
        decision: DecisionResult,
    ) -> Review:
        # Summary
        summary = self._build_summary(decision.action)
        
        # AI breakdown (minimal)
        ai_breakdown = AIBreakdown(
            is_ai_generated=ai_result.is_ai_generated,
            confidence=ai_result.confidence,
            risk_level=ai_result.risk_level,
            perplexity=ai_result.perplexity,
            reasoning=ai_result.reasoning,
        )
        
        # Plagiarism breakdown (minimal)
        plag_breakdown = PlagiarismBreakdown(
            is_plagiarized=plag_result.is_plagiarized,
            confidence=plag_result.confidence,
            risk_level=plag_result.risk_level,
            best_match=plag_result.best_match.pattern_name if plag_result.best_match else None,
            best_match_similarity=plag_result.best_match.similarity if plag_result.best_match else 0.0,
            reasoning=plag_result.reasoning,
        )
        
        # Risk factors (simplified)
        risk_factors = self._extract_risk_factors(ai_result, plag_result)
        
        # Next steps
        next_steps = self._build_next_steps(decision.action)
        
        return Review(
            verdict=decision.action,
            summary=summary,
            ai_breakdown=ai_breakdown,
            plagiarism_breakdown=plag_breakdown,
            confidence=decision.combined_confidence,
            risk_factors=risk_factors,
            next_steps=next_steps,
        )
    
    def _build_summary(self, action: str) -> str:
        """One-line summary based on action."""
        summaries = {
            "BLOCK_AND_REPORT": "Submission blocked: High-risk AI generation or plagiarism",
            "INVESTIGATE": "Flagged for investigation: Strong risk signals detected",
            "FLAG_FOR_REVIEW": "Flagged for manual review: Moderate risk signals",
            "MONITOR": "Accepted with monitoring: Low risk detected",
            "ACCEPT": "Accepted: No significant issues detected",
        }
        return summaries.get(action, "Unknown verdict")
    
    def _extract_risk_factors(
        self,
        ai_result: DetectionResult,
        plag_result: PlagiarismResult,
    ) -> List[str]:
        """Extract key risk factors only."""
        factors = []
        
        # AI risks
        if ai_result.perplexity < 15.0:
            factors.append(f"Low perplexity ({ai_result.perplexity:.1f})")
        
        if ai_result.weighted_score > 0.6:
            factors.append(f"High AI score ({ai_result.weighted_score:.2f})")
        
        # Plagiarism risks
        if plag_result.best_match and plag_result.best_match.similarity >= 0.85:
            factors.append(f"High similarity to {plag_result.best_match.pattern_name} ({plag_result.best_match.similarity:.0%})")
        
        if plag_result.best_match and plag_result.best_match.match_type == "exact":
            factors.append(f"Exact match: {plag_result.best_match.pattern_name}")
        
        return factors if factors else ["No significant risks"]
    
    def _build_next_steps(self, action: str) -> List[str]:
        """Build minimal next steps."""
        steps_map = {
            "BLOCK_AND_REPORT": [
                "Submission blocked",
                "Review team notified",
            ],
            "INVESTIGATE": [
                "Manual review required",
                "User may be contacted",
            ],
            "FLAG_FOR_REVIEW": [
                "Pending manual review",
                "User can continue other tasks",
            ],
            "MONITOR": [
                "Accepted with monitoring",
                "No immediate action needed",
            ],
            "ACCEPT": [
                "Submission accepted",
                "Proceed with evaluation",
            ],
        }
        return steps_map.get(action, ["Unknown action"])
    
    def to_markdown(self, review: Review, submission_id: str, user_id: str) -> str:
        """Generate minimal Markdown report."""
        md = []
        
        md.append(f"# Review: {submission_id}")
        md.append(f"**User:** {user_id} | **Verdict:** {review.verdict} | **Confidence:** {review.confidence:.0%}\n")
        
        md.append(f"## {review.summary}\n")
        
        md.append(f"### AI Detection")
        md.append(f"- **Risk:** {review.ai_breakdown.risk_level}")
        md.append(f"- **Perplexity:** {review.ai_breakdown.perplexity:.1f}")
        md.append(f"- {review.ai_breakdown.reasoning}\n")
        
        md.append(f"### Plagiarism Detection")
        md.append(f"- **Risk:** {review.plagiarism_breakdown.risk_level}")
        if review.plagiarism_breakdown.best_match:
            md.append(f"- **Match:** {review.plagiarism_breakdown.best_match} ({review.plagiarism_breakdown.best_match_similarity:.0%})")
        md.append(f"- {review.plagiarism_breakdown.reasoning}\n")
        
        md.append(f"### Risk Factors")
        for factor in review.risk_factors:
            md.append(f"- {factor}")
        
        md.append(f"\n### Next Steps")
        for i, step in enumerate(review.next_steps, 1):
            md.append(f"{i}. {step}")
        
        return "\n".join(md)

if __name__ == "__main__":
    from src.ml_core.code_detector import DetectionResult
    from src.ml_core.plagiarism_detector import PlagiarismResult, PlagiarismMatch
    from src.ml_core.decision_engine import DecisionResult
    
    ai_mock = DetectionResult(
        is_ai_generated=True,
        confidence=0.75,
        risk_level="HIGH",
        perplexity_score=0.9,
        ast_score=0.6,
        style_score=0.5,
        weighted_score=0.75,
        perplexity=8.5,
        ast_features={},
        style_features={},
        conflict_detected=False,
        code_length=150,
        normalized_length=140,
        processing_time_ms=250,
        reasoning="Low perplexity indicates AI patterns",
        recommendations=[],
    )
    
    plag_match = PlagiarismMatch(
        pattern_name="Bubble Sort",
        similarity=0.96,
        match_type="high_similarity",
        normalization_level="medium",
        sources=["StackOverflow"],
        confidence=0.9,
    )
    
    plag_mock = PlagiarismResult(
        is_plagiarized=True,
        confidence=0.9,
        risk_level="HIGH",
        matches=[plag_match],
        best_match=plag_match,
        max_similarity_light=0.85,
        max_similarity_medium=0.96,
        max_similarity_aggressive=0.92,
        structural_similarity=0.88,
        code_length=150,
        normalized_hash="abc123",
        processing_time_ms=180,
        reasoning="High similarity to known pattern",
        recommendations=[],
    )
    
    decision_mock = DecisionResult(
        action="INVESTIGATE",
        rationale="High risk from both detectors",
        combined_confidence=0.825,
        details={},
    )
    
    formatter = ReviewFormatter()
    review = formatter.format_review(ai_mock, plag_mock, decision_mock)
    
    print("=== JSON ===")
    import json
    print(json.dumps(review.model_dump(), indent=2))
    
    print("\n=== Markdown ===")
    print(formatter.to_markdown(review, "sub_12345", "user_789"))
