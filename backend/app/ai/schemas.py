from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class TutorMode(str, Enum):
    EXPLAIN = "explain"
    HINT = "hint"
    STEP_BY_STEP = "step_by_step"
    SIMPLIFY = "simplify"
    EXAMPLE = "example"
    CHECK_UNDERSTANDING = "check_understanding"
    MISTAKE_HELP = "mistake_help"
    CHALLENGE = "challenge"

class MistakeConfidence(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class QuestionGenerationStatus(str, Enum):
    SESSION_GENERATED = "session_generated"
    AI_GENERATED_PENDING = "ai_generated_pending"
    REJECTED = "rejected"

# 1. Tutor Schemas
class TutorRequest(BaseModel):
    topic_id: str
    mode: TutorMode = TutorMode.EXPLAIN
    user_message: Optional[str] = None
    current_question_id: Optional[str] = None
    session_id: Optional[str] = None

class TutorResponse(BaseModel):
    explanation: str
    key_concept: str
    steps: List[str] = []
    example: Optional[str] = None
    check_question: Optional[str] = None
    encouragement: str
    mode: str = "explain"
    model_used: str = "gemini-2.5-flash"
    is_fallback: bool = False

# 2. Progressive Hint Schemas
class HintRequest(BaseModel):
    topic_id: str
    question_id: str
    hint_level: int = Field(default=1, ge=1, le=4)
    session_id: Optional[str] = None

class HintResponse(BaseModel):
    hint_level: int
    hint_text: str
    guidance: str
    is_final_solution: bool = False
    model_used: str = "gemini-2.5-flash"
    is_fallback: bool = False

# 3. Question Generation Schemas
class GeneratedOption(BaseModel):
    id: str
    text: str
    is_correct: bool
    distractor_explanation: Optional[str] = None
    misconception_tag: Optional[str] = None

class GeneratedQuestionItem(BaseModel):
    questionText: str
    difficulty: str = "medium"
    questionType: str = "multiple_choice"
    options: List[GeneratedOption]
    correctAnswer: str
    explanation: str
    hint: Optional[str] = None
    misconceptionTags: List[str] = []
    learningObjective: Optional[str] = None

class QuestionGenerationRequest(BaseModel):
    subject_id: str
    topic_id: str
    count: int = Field(default=3, ge=1, le=10)
    target_difficulty: str = "medium"
    target_misconception: Optional[str] = None
    session_id: Optional[str] = None

class QuestionGenerationResponse(BaseModel):
    questions: List[GeneratedQuestionItem] = []
    status: QuestionGenerationStatus = QuestionGenerationStatus.SESSION_GENERATED
    generation_context: Dict[str, Any] = {}
    model_used: str = "gemini-2.5-flash"
    count: int = 0

# 4. Mistake Analysis Schemas
class MistakeAnalysisRequest(BaseModel):
    question_id: str
    student_answer: str
    topic_id: Optional[str] = None
    session_id: Optional[str] = None

class MistakeAnalysisResponse(BaseModel):
    likely_error: str
    explanation: str
    teaching_focus: str
    confidence: MistakeConfidence = MistakeConfidence.MEDIUM
    is_tentative: bool = False
    concept_to_remember: str
    mini_example: Optional[str] = None
    quick_check: Optional[str] = None
    model_used: str = "gemini-2.5-pro"
    is_fallback: bool = False

# 5. Natural Language Insights Schemas
class InsightResponse(BaseModel):
    what_noticed: str
    focus_next: str
    suggested_strategy: str
    grounded_metrics: Dict[str, Any] = {}
    model_used: str = "gemini-2.5-flash"
    is_fallback: bool = False

# 6. Study Plan Assistant Schemas
class StudyPlanStep(BaseModel):
    step_number: int
    topic_id: str
    topic_name: str
    action_type: str
    allocated_minutes: int
    pedagogical_reason: str

class StudyPlanResponse(BaseModel):
    overview: str
    total_minutes: int
    steps: List[StudyPlanStep]
    encouragement: str
    model_used: str = "gemini-2.5-flash"
    is_fallback: bool = False

# 7. Notes Analyzer Schemas
class NotesAnalysisRequest(BaseModel):
    notes_text: str = Field(..., min_length=10, max_length=15000)
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None

class FlashcardItem(BaseModel):
    front: str
    back: str

class NotesConceptItem(BaseModel):
    name: str
    definition: str
    importance: str

class NotesAnalysisResponse(BaseModel):
    summary: str
    key_concepts: List[NotesConceptItem] = []
    definitions: Dict[str, str] = {}
    practice_questions: List[GeneratedQuestionItem] = []
    flashcards: List[FlashcardItem] = []
    suggested_prerequisites: List[str] = []
    is_ai_generated: bool = True
    disclaimer: str = "AI-generated study material. Cross-reference with authoritative curriculum."
    model_used: str = "gemini-2.5-pro"
    is_fallback: bool = False

# 8. Usage and Rate Limiting
class AIUsageLog(BaseModel):
    request_id: str
    student_id: str
    request_type: str
    model: str
    latency_ms: int
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AIUsageStats(BaseModel):
    student_id: str
    requests_today: int
    max_requests_per_day: int
    requests_remaining: int
    session_requests: int
    max_requests_per_session: int
