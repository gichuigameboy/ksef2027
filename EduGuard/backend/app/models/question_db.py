from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class QuestionDifficulty(str, Enum):
    BASIC = "basic"
    MEDIUM = "medium"
    HARD = "hard"
    APPLICATION = "application"

class QuestionFormat(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    NUMERICAL = "numerical"
    APPLICATION = "application"

class QuestionOptionDB(BaseModel):
    id: str
    text: str
    is_correct: bool
    misconception_tag: Optional[str] = None
    distractor_explanation: Optional[str] = None

class QuestionOptionClient(BaseModel):
    id: str
    text: str

class QuestionRecord(BaseModel):
    """
    Authoritative server-side question representation.
    Never transmitted raw to the student prior to submission.
    """
    id: str
    subject_id: str
    topic_id: str
    subtopic_id: Optional[str] = None
    difficulty: QuestionDifficulty
    question_type: QuestionFormat = QuestionFormat.MULTIPLE_CHOICE
    learning_objective: str
    question_text: str
    options: List[QuestionOptionDB] = []
    correct_answer: str
    accepted_answers: List[str] = []
    numerical_tolerance: Optional[float] = None
    explanation: str
    hint: Optional[str] = None
    misconception_tags: List[str] = []
    prerequisite_ids: List[str] = []
    is_transfer: bool = False
    source: str = "seed"
    status: str = "active"
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def to_client_view(self) -> "QuestionClientView":
        """Strips secret answers and explanations for secure client consumption."""
        client_options = [
            QuestionOptionClient(id=o.id, text=o.text)
            for o in self.options
        ]
        return QuestionClientView(
            id=self.id,
            subject_id=self.subject_id,
            topic_id=self.topic_id,
            difficulty=self.difficulty.value,
            question_type=self.question_type.value,
            question_text=self.question_text,
            options=client_options,
            hint=self.hint,
            is_transfer=self.is_transfer
        )

class QuestionClientView(BaseModel):
    """Safe, sanitized representation delivered to the student client."""
    id: str
    subject_id: str
    topic_id: str
    difficulty: str
    question_type: str
    question_text: str
    options: List[QuestionOptionClient] = []
    hint: Optional[str] = None
    is_transfer: bool = False

class AttemptRecord(BaseModel):
    attempt_id: str
    student_id: str
    question_id: str
    subject_id: str
    topic_id: str
    subtopic_id: Optional[str] = None
    session_id: Optional[str] = None
    answer: str
    is_correct: bool
    difficulty: str
    question_type: str
    is_transfer: bool = False
    response_time_ms: int = 15000
    misconception_tags: List[str] = []
    error_category: Optional[str] = None
    created_at: datetime = datetime.utcnow()

class DiagnosticSession(BaseModel):
    diagnostic_id: str
    student_id: str
    subject_id: str
    selected_topic_id: str
    question_ids: List[str]
    completed_question_ids: List[str] = []
    submitted_answers: List[Dict[str, Any]] = []
    score: float = 0.0
    status: str = "in_progress" # in_progress | completed | analyzed
    started_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
