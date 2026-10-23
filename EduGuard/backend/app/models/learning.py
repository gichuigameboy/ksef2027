from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    WORKED_STEP = "worked_step"
    TRANSFER = "transfer"

class QuestionOption(BaseModel):
    id: str
    text: str
    is_correct: bool
    misconception_id: Optional[str] = None
    distractor_explanation: Optional[str] = None

class Question(BaseModel):
    id: str
    topic_id: str
    topic_name: str
    difficulty: str
    question_type: QuestionType = QuestionType.MULTIPLE_CHOICE
    prompt: str
    options: List[QuestionOption]
    correct_explanation: str
    hints: List[str] = []
    prerequisite_id: Optional[str] = None

class AttemptSubmission(BaseModel):
    user_id: str
    question_id: str
    topic_id: str
    session_id: Optional[str] = None
    selected_option_id: str
    time_spent_seconds: int = 15

class AttemptResult(BaseModel):
    is_correct: bool
    correct_option_id: str
    explanation: str
    diagnosed_misconception: Optional[str] = None
    hints_available: List[str] = []
    recommended_next_step: Optional[str] = None
    updated_topic_mastery: Optional[float] = None

class MissionItem(BaseModel):
    topic_id: str
    topic_name: str
    question_count: int
    focus_reason: str
    difficulty: str

class LearningMission(BaseModel):
    id: str
    date: str
    estimated_duration_minutes: int
    title: str
    summary: str
    items: List[MissionItem]
    status: str = "ready" # ready | in_progress | completed
