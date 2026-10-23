from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class MasteryTrend(str, Enum):
    RAPIDLY_IMPROVING = "rapidly_improving"
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    VOLATILE = "volatile"
    INSUFFICIENT_DATA = "insufficient_data"

class RetentionStatus(str, Enum):
    FRESH = "fresh"
    STABLE = "stable"
    AT_RISK = "at_risk"
    DUE = "due"
    FORGOTTEN = "forgotten"
    INSUFFICIENT_DATA = "insufficient_data"

class ErrorCategory(str, Enum):
    ARITHMETIC_ERROR = "arithmetic_error"
    SIGN_ERROR = "sign_error"
    FORMULA_SELECTION = "formula_selection"
    CONCEPT_MISUNDERSTANDING = "concept_misunderstanding"
    PREREQUISITE_GAP = "prerequisite_gap"
    MISREAD_QUESTION = "misread_question"
    UNIT_ERROR = "unit_error"
    ALGEBRAIC_MANIPULATION = "algebraic_manipulation"
    CALCULATION_ERROR = "calculation_error"
    REASONING_GAP = "reasoning_gap"
    GUESSING = "guessing"
    UNKNOWN = "unknown"

class NextActionType(str, Enum):
    PREREQUISITE_RECOVERY = "PREREQUISITE_RECOVERY"
    RETRIEVAL = "RETRIEVAL"
    WEAKNESS_PRACTICE = "WEAKNESS_PRACTICE"
    DIFFICULTY_PROGRESSION = "DIFFICULTY_PROGRESSION"
    APPLICATION = "APPLICATION"
    TRANSFER = "TRANSFER"
    NEW_CONCEPT = "NEW_CONCEPT"
    REVIEW = "REVIEW"

class NextBestAction(BaseModel):
    actionType: NextActionType
    topicId: str
    topicName: str
    priority: float = Field(..., ge=0.0, le=1.0)
    estimatedMinutes: int
    reason: str
    reasonCodes: List[str] = []
    recommendedQuestionCount: int
    targetDifficulty: str = "medium"

class MisconceptionCluster(BaseModel):
    tag: str
    errorCategory: ErrorCategory
    frequency: int
    totalAttempts: int
    percentage: float
    sampleQuestions: List[str] = []
    recommendedRemediation: str

class DifficultyProfile(BaseModel):
    basicAccuracy: float = 0.0
    mediumAccuracy: float = 0.0
    hardAccuracy: float = 0.0
    applicationAccuracy: float = 0.0
    difficultyCliff: bool = False
    cliffDescription: Optional[str] = None

class TopicLearningState(BaseModel):
    topicId: str
    subjectId: str
    topicName: str
    mastery: float = Field(..., ge=0.0, le=100.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    retention: float = Field(..., ge=0.0, le=1.0)
    retentionStatus: RetentionStatus
    recentAccuracy: float = 0.0
    historicalAccuracy: float = 0.0
    difficultyProfile: DifficultyProfile
    applicationPerformance: float = 0.0
    transferPerformance: float = 0.0
    misconceptionProfile: List[MisconceptionCluster] = []
    prerequisiteStatus: Dict[str, Any] = {}
    learningTrend: MasteryTrend = MasteryTrend.INSUFFICIENT_DATA
    lastPracticed: Optional[datetime] = None
    nextRecommendedReview: Optional[datetime] = None

class LearningVelocity(BaseModel):
    masteryGainLast7Days: float = 0.0
    conceptsImprovedCount: int = 0
    retrievalSuccessRate: float = 0.0
    difficultyProgressionScore: float = 0.0
    errorReductionRate: float = 0.0
    velocityCategory: str = "Developing Pace"

class LearningEfficiency(BaseModel):
    learningMinutes: int = 0
    masteryPointsPerHour: float = 0.0
    retrievalEfficiency: float = 0.0
    efficiencyCategory: str = "Steady"
    estimatedEfficiencyScore: float = 0.0

class LearningTimelineEvent(BaseModel):
    eventId: str
    timestamp: datetime
    eventType: str # "diagnostic", "prerequisite_recovery", "retrieval", "application_challenge", "transfer"
    topicId: str
    topicName: str
    masteryBefore: float
    masteryAfter: float
    score: float
    description: str

class StudentLearningState(BaseModel):
    studentId: str
    subjects: Dict[str, Any] = {}
    currentWeaknesses: List[str] = []
    currentStrengths: List[str] = []
    retentionRisks: List[Dict[str, Any]] = []
    prerequisiteGaps: List[Dict[str, Any]] = []
    recentLearningVelocity: LearningVelocity
    learningEfficiency: LearningEfficiency
    recommendedActions: List[NextBestAction] = []
    generatedAt: datetime = datetime.utcnow()

class AIContextPayload(BaseModel):
    student_id: str
    current_topic: str
    mastery: float
    confidence: float
    retention: float
    retention_status: str
    learning_trend: str
    difficulty_profile: Dict[str, float]
    common_errors: List[str]
    prerequisite_gaps: List[str]
    recommended_action: str
    reason_codes: List[str]
    context_notes: str
    generated_at: datetime = datetime.utcnow()
