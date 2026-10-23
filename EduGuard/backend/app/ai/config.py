import os
from typing import Dict
from app.core.config import settings

class AIConfig:
    AI_PROVIDER: str = settings.AI_PROVIDER
    GEMINI_FAST_MODEL: str = settings.GEMINI_FAST_MODEL
    GEMINI_REASONING_MODEL: str = settings.GEMINI_REASONING_MODEL
    GEMINI_API_KEY: str = settings.GEMINI_API_KEY or ""

    MAX_AI_REQUESTS_PER_SESSION: int = settings.MAX_AI_REQUESTS_PER_SESSION
    MAX_AI_REQUESTS_PER_DAY: int = settings.MAX_AI_REQUESTS_PER_DAY
    AI_CACHE_ENABLED: bool = settings.AI_CACHE_ENABLED

    # Model Routing Matrix
    # Fast model: hints, simple explanations, high volume generation, short insights
    # Reasoning model: deep mistake interpretation, multi-step tutoring, complex concepts
    MODEL_ROUTING: Dict[str, str] = {
        "hint": GEMINI_FAST_MODEL,
        "simple_explanation": GEMINI_FAST_MODEL,
        "example": GEMINI_FAST_MODEL,
        "check_understanding": GEMINI_FAST_MODEL,
        "question_generation": GEMINI_FAST_MODEL,
        "insights": GEMINI_FAST_MODEL,
        "study_plan": GEMINI_FAST_MODEL,
        "mistake_analysis": GEMINI_REASONING_MODEL,
        "multistep_tutoring": GEMINI_REASONING_MODEL,
        "deep_explanation": GEMINI_REASONING_MODEL,
        "notes_analysis": GEMINI_REASONING_MODEL,
    }

    @classmethod
    def get_model_for_task(cls, task: str) -> str:
        return cls.MODEL_ROUTING.get(task, cls.GEMINI_FAST_MODEL)

ai_config = AIConfig()
