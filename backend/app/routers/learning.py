from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.dependencies.auth import get_current_user
from app.models.user import UserProfile
from app.models.learning import LearningMission, MissionItem
from app.models.mastery import TopicMastery, MasteryCategory
from app.models.question_db import QuestionClientView, AttemptRecord
from app.services.question_repository import question_repository
from app.services.attempt_repository import attempt_repository
from app.curriculum.registry import curriculum_registry

router = APIRouter(prefix="/learning", tags=["Learning Core"])

# Request & Response Schemas
class CreateDiagnosticRequest(BaseModel):
    subject_id: str
    topic_id: str

class SubmitAttemptRequest(BaseModel):
    question_id: str
    selected_option_id: str
    session_id: Optional[str] = None
    response_time_ms: int = 15000
    idempotency_key: Optional[str] = None

class AttemptFeedbackResponse(BaseModel):
    attempt_id: str
    is_correct: bool
    correct_option_id: str
    explanation: str
    diagnosed_misconception: Optional[str] = None
    hints_available: List[str] = []
    recommended_next_step: Optional[str] = None
    updated_topic_mastery: float

class DiagnosticStatusResponse(BaseModel):
    diagnostic_id: str
    subject_id: str
    selected_topic_id: str
    topic_name: str
    status: str
    total_questions: int
    completed_count: int
    current_question: Optional[QuestionClientView] = None

# 1. Diagnostic Assessment Lifecycle

@router.post("/diagnostics", response_model=DiagnosticStatusResponse)
async def start_diagnostic(
    req: CreateDiagnosticRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Initializes a diagnostic assessment for a selected topic:
    - Builds a targeted question sequence spanning prerequisites + topic difficulty tiers.
    - Persists diagnostic session state for resume capability.
    - Delivers sanitized QuestionClientView without secret answers.
    """
    questions = question_repository.build_diagnostic_sequence(req.topic_id)
    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No diagnostic questions available for topic '{req.topic_id}'."
        )

    q_ids = [q.id for q in questions]
    session = attempt_repository.create_diagnostic_session(
        student_id=current_user.id,
        subject_id=req.subject_id,
        topic_id=req.topic_id,
        question_ids=q_ids
    )

    first_q = questions[0].to_client_view()
    curric_t = curriculum_registry.get_topic(req.topic_id)
    topic_name = curric_t.name if curric_t else req.topic_id.replace("_", " ").title()

    return DiagnosticStatusResponse(
        diagnostic_id=session.diagnostic_id,
        subject_id=req.subject_id,
        selected_topic_id=req.topic_id,
        topic_name=topic_name,
        status=session.status,
        total_questions=len(q_ids),
        completed_count=0,
        current_question=first_q
    )

@router.get("/diagnostics/{diagnostic_id}", response_model=DiagnosticStatusResponse)
async def get_diagnostic_state(
    diagnostic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Resumes or inspects a diagnostic assessment.
    Returns the next uncompleted question so students never lose progress if the app is closed.
    """
    session = attempt_repository.get_diagnostic_session(diagnostic_id)
    if not session or session.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diagnostic session not found.")

    # Find next uncompleted question
    next_q = None
    for q_id in session.question_ids:
        if q_id not in session.completed_question_ids:
            q_rec = question_repository.get_question(q_id)
            if q_rec:
                next_q = q_rec.to_client_view()
                break

    curric_t = curriculum_registry.get_topic(session.selected_topic_id)
    topic_name = curric_t.name if curric_t else session.selected_topic_id.replace("_", " ").title()

    return DiagnosticStatusResponse(
        diagnostic_id=session.diagnostic_id,
        subject_id=session.subject_id,
        selected_topic_id=session.selected_topic_id,
        topic_name=topic_name,
        status=session.status,
        total_questions=len(session.question_ids),
        completed_count=len(session.completed_question_ids),
        current_question=next_q
    )

@router.post("/diagnostics/{diagnostic_id}/complete")
async def complete_diagnostic(
    diagnostic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Concludes the diagnostic assessment and compiles the authoritative Learning Profile.
    """
    session = attempt_repository.get_diagnostic_session(diagnostic_id)
    if not session or session.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diagnostic session not found.")

    profile = attempt_repository.complete_diagnostic_session(diagnostic_id)
    return profile

# 2. Answer Submission & Idempotent Attempts

@router.post("/attempts", response_model=AttemptFeedbackResponse)
async def submit_attempt(
    req: SubmitAttemptRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Authoritatively evaluates and records a student's answer submission:
    - Never trusts client-supplied correctness or student IDs.
    - Prevents duplicate attempt records via idempotency tracking.
    - Recalculates topic mastery with sample-size confidence dampening.
    - Detects misconceptions mapped to distractors.
    """
    question = question_repository.get_question(req.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    attempt, updated_mastery, misconception, explanation = attempt_repository.record_attempt(
        student_id=current_user.id,
        question=question,
        selected_option_id=req.selected_option_id,
        session_id=req.session_id,
        response_time_ms=req.response_time_ms,
        idempotency_key=req.idempotency_key
    )

    recommended = "Advancing difficulty progression." if attempt.is_correct else (
        f"Review concept: {misconception}" if misconception else "Review prerequisite foundational concepts."
    )

    return AttemptFeedbackResponse(
        attempt_id=attempt.attempt_id,
        is_correct=attempt.is_correct,
        correct_option_id=question.correct_answer,
        explanation=explanation,
        diagnosed_misconception=misconception,
        hints_available=[question.hint] if question.hint else [],
        recommended_next_step=recommended,
        updated_topic_mastery=updated_mastery.mastery_score
    )

# 3. Learning Profile & Adaptive Missions

@router.get("/overview", response_model=List[TopicMastery])
async def get_mastery_overview(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns real mastery records for the authenticated student.
    If new student, provides foundational baseline.
    """
    masteries = attempt_repository.get_all_student_masteries(current_user.id)
    if not masteries:
        # Provide baseline initialized topics for new student
        return [
            TopicMastery(
                topic_id="factorisation",
                subject_id="mathematics",
                topic_name="Factorisation",
                mastery_score=0.0,
                category=MasteryCategory.CRITICAL,
                basic_accuracy=0.0,
                medium_accuracy=0.0,
                hard_accuracy=0.0,
                application_accuracy=0.0,
                recent_accuracy=0.0,
                attempts_count=0
            ),
            TopicMastery(
                topic_id="quadratic_equations",
                subject_id="mathematics",
                topic_name="Quadratic Equations",
                mastery_score=0.0,
                category=MasteryCategory.CRITICAL,
                basic_accuracy=0.0,
                medium_accuracy=0.0,
                hard_accuracy=0.0,
                application_accuracy=0.0,
                recent_accuracy=0.0,
                attempts_count=0
            )
        ]
    return masteries

@router.get("/mission/today", response_model=LearningMission)
async def get_today_mission(current_user: UserProfile = Depends(get_current_user)):
    """
    Generates a personalized daily learning mission based on the student's real
    mastery records, prerequisite gaps, and retention decay states.
    """
    masteries = attempt_repository.get_all_student_masteries(current_user.id)
    retentions = [
        r for (s_id, _), r in attempt_repository._retentions.items()
        if s_id == current_user.id
    ]

    mission = attempt_repository.adaptive_engine.generate_daily_mission(
        user_id=current_user.id,
        masteries=masteries,
        retentions=retentions
    )
    return mission

@router.get("/history", response_model=List[AttemptRecord])
async def get_learning_history(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns the student's chronological attempt and session history.
    """
    attempts = attempt_repository.get_student_attempts(current_user.id)
    return sorted(attempts, key=lambda a: a.created_at, reverse=True)

# 4. Phase 3 Advanced Learning Intelligence Endpoints

@router.get("/state")
async def get_unified_learning_state(current_user: UserProfile = Depends(get_current_user)):
    """
    Assembles the complete unified Student Learning State from authoritative persisted data.
    """
    state = attempt_repository.get_student_learning_state(current_user.id)
    return state.model_dump() if hasattr(state, "model_dump") else state.dict()

@router.get("/insights")
async def get_learning_insights(current_user: UserProfile = Depends(get_current_user)):
    """
    Synthesizes evidence-based learning insights strictly from authenticated student data:
    - Improving trends
    - Difficulty cliffs ('Watch this')
    - Retention decay ('Review soon')
    - Prerequisite gaps ('Foundation first')
    """
    masteries = attempt_repository.get_all_student_masteries(current_user.id)
    attempts = attempt_repository.get_student_attempts(current_user.id)
    retentions = [r for (s_id, _), r in attempt_repository._retentions.items() if s_id == current_user.id]
    mastery_map = {m.topic_id: m.mastery_score for m in masteries}
    
    insights = []

    # 1. 'You're improving'
    for m in masteries:
        if m.trend in ["improving", "rapidly_improving"] or m.recent_accuracy >= 70.0:
            insights.append({
                "id": f"ins_imp_{m.topic_id}",
                "type": "improving",
                "title": "You're Improving",
                "message": f"Your {m.topic_name} mastery is {m.mastery_score}% with an improving trajectory over recent sessions.",
                "topic_id": m.topic_id,
                "evidence": f"Recent accuracy is {m.recent_accuracy}% with confidence {m.confidence}."
            })

    # 2. 'Watch this' (Difficulty cliff)
    for m in masteries:
        if m.basic_accuracy >= 70.0 and (m.hard_accuracy < 50.0 or m.application_accuracy < 50.0):
            insights.append({
                "id": f"ins_cliff_{m.topic_id}",
                "type": "watch_this",
                "title": "Watch This: Application Gap",
                "message": f"In {m.topic_name}, foundational accuracy is {int(m.basic_accuracy)}%, but application performance drops to {int(m.application_accuracy)}%.",
                "topic_id": m.topic_id,
                "evidence": f"Basic = {m.basic_accuracy}%, Application = {m.application_accuracy}%."
            })

    # 3. 'Review soon' (Retention decay)
    for r in retentions:
        est_r = attempt_repository.adaptive_engine.kg.topic_names.get(r.topic_id, r.topic_id)
        current_est = attempt_repository.adaptive_engine.kg.graph
        from app.engines.retention_engine import RetentionEngine
        decay = RetentionEngine.calculate_estimated_retention(r.last_retrieval_at, r.half_life_days)
        if decay < 0.70 or r.status.value in ["at_risk", "due", "forgotten"]:
            t_name = attempt_repository.kg.topic_names.get(r.topic_id, r.topic_id.replace("_", " ").title())
            insights.append({
                "id": f"ins_ret_{r.topic_id}",
                "type": "review_soon",
                "title": "Review Soon",
                "message": f"{t_name} retention is estimated to be declining ({int(decay * 100)}%). A quick retrieval session will reinforce it.",
                "topic_id": r.topic_id,
                "evidence": f"Estimated recall probability: {int(decay * 100)}%, Half-life: {r.half_life_days} days."
            })

    # 4. 'Foundation first' (Prerequisite gaps)
    for m in masteries:
        if m.mastery_score < 65.0:
            gaps = attempt_repository.kg.find_prerequisite_gaps(m.topic_id, mastery_map)
            for gap in gaps:
                insights.append({
                    "id": f"ins_gap_{gap['topic_id']}_{m.topic_id}",
                    "type": "foundation_first",
                    "title": "Foundation First",
                    "message": f"{gap['topic_name']} appears to be a prerequisite gap affecting your {m.topic_name} performance.",
                    "topic_id": gap["topic_id"],
                    "evidence": f"Prerequisite {gap['topic_name']} mastery is {gap['mastery_score']}%."
                })

    if not insights:
        insights.append({
            "id": "ins_baseline",
            "type": "improving",
            "title": "Diagnostic Ready",
            "message": "Complete diagnostic assessments to unlock tailored learning insights.",
            "topic_id": "algebraic_manipulation",
            "evidence": "Awaiting initial attempt evidence."
        })

    return insights

@router.get("/recommendations")
async def get_recommendations(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns ranked Next-Best-Action recommendations with deterministic priority scores and reason codes.
    """
    masteries = attempt_repository.get_all_student_masteries(current_user.id)
    retentions = [r for (s_id, _), r in attempt_repository._retentions.items() if s_id == current_user.id]
    attempts = attempt_repository.get_student_attempts(current_user.id)
    actions = attempt_repository.adaptive_engine.rank_next_best_actions(masteries, retentions, attempts)
    return [a.model_dump() if hasattr(a, "model_dump") else a.dict() for a in actions]

@router.get("/next-action")
async def get_next_best_action(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns the single top-priority Next Best Action for the student.
    """
    masteries = attempt_repository.get_all_student_masteries(current_user.id)
    retentions = [r for (s_id, _), r in attempt_repository._retentions.items() if s_id == current_user.id]
    attempts = attempt_repository.get_student_attempts(current_user.id)
    actions = attempt_repository.adaptive_engine.rank_next_best_actions(masteries, retentions, attempts)
    top_action = actions[0] if actions else None
    if not top_action:
        raise HTTPException(status_code=404, detail="No action available.")
    return top_action.model_dump() if hasattr(top_action, "model_dump") else top_action.dict()

@router.get("/timeline")
async def get_timeline(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns chronological record of meaningful learning milestones (diagnostics, mastery shifts, transfer tasks).
    """
    events = attempt_repository.get_learning_timeline(current_user.id)
    return [e.model_dump() if hasattr(e, "model_dump") else e.dict() for e in events]

@router.get("/retention")
async def get_retention_overview(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns retention status categorization across all student concepts:
    - Fresh, Stable, At Risk, Due, Forgotten.
    """
    retentions = [r for (s_id, _), r in attempt_repository._retentions.items() if s_id == current_user.id]
    categorized = {
        "fresh": [],
        "stable": [],
        "at_risk": [],
        "due": [],
        "forgotten": [],
        "insufficient_data": []
    }
    for r in retentions:
        t_name = attempt_repository.kg.topic_names.get(r.topic_id, r.topic_id.replace("_", " ").title())
        item = {
            "topic_id": r.topic_id,
            "topic_name": t_name,
            "current_retention": r.current_estimated_retention,
            "half_life_days": r.half_life_days,
            "retrieval_streak": r.retrieval_streak,
            "last_retrieval_at": r.last_retrieval_at.isoformat(),
            "next_retrieval_due": r.next_retrieval_due.isoformat(),
            "review_urgency": r.review_urgency,
            "status": r.status.value
        }
        categorized.get(r.status.value, categorized["stable"]).append(item)
    return categorized

@router.get("/topics/{topic_id}/analysis")
async def get_topic_analysis(
    topic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Detailed granular analysis for a single topic:
    Mastery, confidence, trend, difficulty profile, transfer performance, misconception clusters, prerequisite status.
    """
    mastery = attempt_repository.get_topic_mastery(current_user.id, topic_id)
    all_masteries = attempt_repository.get_all_student_masteries(current_user.id)
    mastery_map = {m.topic_id: m.mastery_score for m in all_masteries}
    attempts = [a for a in attempt_repository.get_student_attempts(current_user.id) if a.topic_id == topic_id]

    diff_accuracies = {
        "basic": mastery.basic_accuracy if mastery else 0.0,
        "medium": mastery.medium_accuracy if mastery else 0.0,
        "hard": mastery.hard_accuracy if mastery else 0.0,
        "application": mastery.application_accuracy if mastery else 0.0
    }
    diagnosis = attempt_repository.weakness_engine.diagnose_topic_struggle(
        topic_id=topic_id,
        topic_mastery=mastery.mastery_score if mastery else 0.0,
        difficulty_accuracies=diff_accuracies,
        misconception_frequencies={},
        student_mastery_map=mastery_map,
        recent_attempts=attempts
    )

    t_name = attempt_repository.kg.topic_names.get(topic_id, topic_id.replace("_", " ").title())
    ret_state = attempt_repository._retentions.get((current_user.id, topic_id))

    return {
        "topic_id": topic_id,
        "topic_name": t_name,
        "mastery_score": mastery.mastery_score if mastery else 0.0,
        "category": mastery.category.value if mastery else "critical",
        "confidence": mastery.confidence if mastery else 0.0,
        "trend": mastery.trend.value if mastery else "insufficient_data",
        "practice_accuracy": mastery.practice_accuracy if mastery else 0.0,
        "transfer_accuracy": mastery.transfer_accuracy if mastery else 0.0,
        "retention": ret_state.current_estimated_retention if ret_state else 0.5,
        "retention_status": ret_state.status.value if ret_state else "insufficient_data",
        "diagnosis": diagnosis
    }

@router.get("/topics/{topic_id}/knowledge-map")
async def get_knowledge_map_node(
    topic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Returns enriched knowledge graph node metadata for interactive knowledge map display.
    """
    mastery = attempt_repository.get_topic_mastery(current_user.id, topic_id)
    all_masteries = attempt_repository.get_all_student_masteries(current_user.id)
    mastery_map = {m.topic_id: m.mastery_score for m in all_masteries}
    ret_state = attempt_repository._retentions.get((current_user.id, topic_id))

    m_score = mastery.mastery_score if mastery else 0.0
    conf = mastery.confidence if mastery else 0.0
    trend = mastery.trend.value if mastery else "insufficient_data"
    ret = ret_state.current_estimated_retention if ret_state else 0.5

    data = attempt_repository.kg.get_node_visualization_data(
        topic_id=topic_id,
        mastery_score=m_score,
        confidence=conf,
        retention=ret,
        trend=trend,
        student_mastery_map=mastery_map
    )
    return data

@router.get("/session/{session_id}/next-question", response_model=Optional[QuestionClientView])
async def get_adaptive_next_question(
    session_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Delivers dynamic intra-session adaptive next question based on in-session accuracy streaks.
    """
    session = attempt_repository.get_diagnostic_session(session_id)
    if not session or session.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found.")

    next_q = attempt_repository.get_next_adaptive_question(session_id)
    return next_q

@router.get("/ai-context/{topic_id}")
async def get_phase4_ai_context(
    topic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Phase 4 AI Integration Interface.
    Delivers structured deterministic context for future Gemini tutor prompts without making any AI calls.
    """
    payload = attempt_repository.get_ai_context(current_user.id, topic_id)
    return payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()

