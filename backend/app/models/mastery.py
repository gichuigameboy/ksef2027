from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.learning_intelligence import MasteryTrend, RetentionStatus

class MasteryCategory(str, Enum):
    CRITICAL = "critical"     # 0-39%
    WEAK = "weak"             # 40-59%
    DEVELOPING = "developing" # 60-74%
    STRONG = "strong"         # 75-89%
    MASTERED = "mastered"     # 90-100%

class DifficultyLevel(str, Enum):
    BASIC = "basic"
    MEDIUM = "medium"
    HARD = "hard"
    APPLICATION = "application"

class TopicMastery(BaseModel):
    topic_id: str
    subject_id: str
    topic_name: str
    mastery_score: float = Field(..., ge=0.0, le=100.0)
    category: MasteryCategory
    basic_accuracy: float = 0.0
    medium_accuracy: float = 0.0
    hard_accuracy: float = 0.0
    application_accuracy: float = 0.0
    recent_accuracy: float = 0.0
    practice_accuracy: float = 0.0
    transfer_accuracy: float = 0.0
    confidence: float = 0.0 # Sample size & consistency confidence [0.0, 1.0]
    trend: MasteryTrend = MasteryTrend.INSUFFICIENT_DATA
    attempts_count: int = 0
    last_attempt_at: Optional[datetime] = None
    updated_at: datetime = datetime.utcnow()

class RetentionState(BaseModel):
    topic_id: str
    initial_mastery: float
    current_estimated_retention: float = Field(..., ge=0.0, le=1.0)
    half_life_days: float = 14.0
    retrieval_streak: int = 0
    successful_retrievals: int = 0
    failed_retrievals: int = 0
    last_successful_retrieval_at: Optional[datetime] = None
    last_failed_retrieval_at: Optional[datetime] = None
    last_retrieval_at: datetime
    next_retrieval_due: datetime
    is_review_due: bool = False
    status: RetentionStatus = RetentionStatus.INSUFFICIENT_DATA
    review_urgency: float = 0.0 # [0.0, 1.0] urgency score
