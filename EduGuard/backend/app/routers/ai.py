from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List, Dict, Any

from app.dependencies.auth import get_current_user
from app.models.user import UserProfile
from app.ai.schemas import (
    TutorRequest, TutorResponse, TutorMode,
    HintRequest, HintResponse,
    QuestionGenerationRequest, QuestionGenerationResponse,
    MistakeAnalysisRequest, MistakeAnalysisResponse,
    InsightResponse, StudyPlanResponse,
    NotesAnalysisRequest, NotesAnalysisResponse,
    AIUsageStats, AIUsageLog
)
from app.ai.services.tutor_service import tutor_service
from app.ai.services.question_generation_service import question_generation_service
from app.ai.services.mistake_analysis_service import mistake_analysis_service
from app.ai.services.insight_service import insight_service
from app.ai.services.notes_service import notes_service
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.usage_service import ai_usage_service
from app.ai.client import gemini_client

router = APIRouter(prefix="/ai", tags=["Gemini AI Intelligence"])

# 1. AI Tutor Endpoints

@router.post("/tutor", response_model=TutorResponse)
async def ask_ai_tutor(
    req: TutorRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Context-aware AI Tutor:
    Consumes student's deterministic mastery and error state, returning
    supportive, personalized pedagogical guidance.
    """
    return tutor_service.get_tutor_response(current_user.id, req)

@router.post("/explain", response_model=TutorResponse)
async def explain_concept(
    topic_id: str = Query(..., description="Topic identifier"),
    current_user: UserProfile = Depends(get_current_user)
):
    """Convenience route for EXPLAIN tutor mode."""
    req = TutorRequest(topic_id=topic_id, mode=TutorMode.EXPLAIN)
    return tutor_service.get_tutor_response(current_user.id, req)

@router.post("/example", response_model=TutorResponse)
async def show_example(
    topic_id: str = Query(..., description="Topic identifier"),
    current_user: UserProfile = Depends(get_current_user)
):
    """Convenience route for EXAMPLE tutor mode."""
    req = TutorRequest(topic_id=topic_id, mode=TutorMode.EXAMPLE)
    return tutor_service.get_tutor_response(current_user.id, req)

@router.post("/check-understanding", response_model=TutorResponse)
async def check_understanding(
    topic_id: str = Query(..., description="Topic identifier"),
    current_user: UserProfile = Depends(get_current_user)
):
    """Convenience route for CHECK_UNDERSTANDING tutor mode."""
    req = TutorRequest(topic_id=topic_id, mode=TutorMode.CHECK_UNDERSTANDING)
    return tutor_service.get_tutor_response(current_user.id, req)

# 2. Progressive Hint System

@router.post("/hint", response_model=HintResponse)
async def request_progressive_hint(
    req: HintRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Progressive Hint Scaffold:
    - Level 1: Conceptual pointer
    - Level 2: Next operation suggestion
    - Level 3: Strong setup guidance
    - Level 4: Full worked solution
    """
    return tutor_service.get_progressive_hint(current_user.id, req)

# 3. Mistake Analysis & Interpretation

@router.post("/analyze-mistake", response_model=MistakeAnalysisResponse)
async def analyze_mistake(
    req: MistakeAnalysisRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Evaluates incorrect answers or student misunderstandings.
    Low confidence diagnoses are marked tentative and do not override
    deterministic misconception models.
    """
    return mistake_analysis_service.analyze_student_mistake(current_user.id, req)

# 4. Question Generation

@router.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_targeted_questions(
    req: QuestionGenerationRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Generates targeted practice questions governed by deterministic constraints.
    Validates output, checks duplicates, and attaches them as SESSION_GENERATED.
    """
    return question_generation_service.generate_targeted_questions(current_user.id, req)

# 5. Natural Language Insights & Study Plan

@router.get("/insights", response_model=InsightResponse)
async def get_learning_insights(
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Translates student's deterministic learning state into clear,
    actionable, non-hallucinated natural language observations and strategies.
    """
    return insight_service.generate_learning_insights(current_user.id)

@router.get("/study-plan", response_model=StudyPlanResponse)
async def get_study_plan(
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Turns deterministic Next Best Action queue into a clear, prioritized study roadmap.
    """
    return insight_service.generate_study_plan(current_user.id)

# 6. Study Notes Analyzer

@router.post("/analyze-notes", response_model=NotesAnalysisResponse)
async def analyze_study_notes(
    req: NotesAnalysisRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Extracts key concepts, flashcards, practice questions, and prerequisite
    dependencies from student-provided educational notes.
    """
    return notes_service.analyze_notes(current_user.id, req)

# 7. Usage Telemetry & Health

@router.get("/usage", response_model=AIUsageStats)
async def get_ai_usage(
    session_id: Optional[str] = Query(None),
    current_user: UserProfile = Depends(get_current_user)
):
    """Returns AI quota and consumption telemetry for current student."""
    return ai_rate_limiter.get_stats(current_user.id, session_id)

@router.get("/logs", response_model=List[AIUsageLog])
async def get_ai_logs(
    current_user: UserProfile = Depends(get_current_user)
):
    """Returns privacy-safe AI request logs for the current student."""
    return ai_usage_service.get_student_logs(current_user.id)
