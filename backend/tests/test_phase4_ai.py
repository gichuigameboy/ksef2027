import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import (
    TutorMode, MistakeConfidence, QuestionGenerationStatus,
    GeneratedQuestionItem, GeneratedOption
)
from app.ai.services.context_builder import context_builder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.cache_service import ai_cache
from app.ai.services.question_generation_service import question_generation_service
from app.services.attempt_repository import attempt_repository

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer token_student_1"}

@pytest.fixture(autouse=True)
def reset_ai_state():
    ai_rate_limiter.reset_for_tests()
    ai_cache.clear()
    gemini_client.set_mock_handler(None)
    yield
    gemini_client.set_mock_handler(None)

# 1. AI Context Isolation Tests
def test_ai_context_builder_isolation():
    context = context_builder.build_topic_context("student_1", "quadratic_equations")
    
    assert "topic_id" in context
    assert "mastery" in context
    assert "prerequisite_gaps" in context
    assert "common_errors" in context
    assert "recommended_action" in context
    
    # Must NOT leak sensitive or unnecessary auth / school / password data
    assert "password" not in context
    assert "token" not in context
    assert "firebase_secret" not in context
    assert "school_id" not in context
    assert "email" not in context
    assert "student_id" not in context # Strictly stripped

# 2. Model Routing Matrix Tests
def test_model_routing():
    assert ai_config.get_model_for_task("hint") == ai_config.GEMINI_FAST_MODEL
    assert ai_config.get_model_for_task("simple_explanation") == ai_config.GEMINI_FAST_MODEL
    assert ai_config.get_model_for_task("question_generation") == ai_config.GEMINI_FAST_MODEL
    assert ai_config.get_model_for_task("insights") == ai_config.GEMINI_FAST_MODEL
    assert ai_config.get_model_for_task("study_plan") == ai_config.GEMINI_FAST_MODEL
    
    assert ai_config.get_model_for_task("mistake_analysis") == ai_config.GEMINI_REASONING_MODEL
    assert ai_config.get_model_for_task("multistep_tutoring") == ai_config.GEMINI_REASONING_MODEL
    assert ai_config.get_model_for_task("notes_analysis") == ai_config.GEMINI_REASONING_MODEL

# 3. AI Tutor Modes & Mock Generation
def test_ai_tutor_explain_mode():
    mock_response = {
        "explanation": "Quadratic equations are second-order polynomial equations in the form ax^2 + bx + c = 0.",
        "key_concept": "Zero-product property and factoring.",
        "steps": ["Move all terms to one side", "Factor the trinomial", "Set each factor to zero"],
        "example": "x^2 + 5x + 6 = (x + 2)(x + 3) = 0",
        "check_question": "What are the roots of (x - 1)(x + 4) = 0?",
        "encouragement": "Great focus! Practice makes intuition."
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_response))

    res = client.post(
        "/api/v1/ai/tutor",
        headers=AUTH_HEADERS,
        json={"topic_id": "quadratic_equations", "mode": "explain", "user_message": "Can you explain this?"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["explanation"] == mock_response["explanation"]
    assert data["key_concept"] == mock_response["key_concept"]
    assert len(data["steps"]) == 3
    assert data["mode"] == "explain"
    assert data["is_fallback"] is False

# 4. Progressive Hint System (Hint 1, 2, 3, Final Help)
def test_progressive_hint_sequence():
    # Hint Level 1
    gemini_client.set_mock_handler(lambda p, m: json.dumps({
        "hint_level": 1,
        "hint_text": "Look for factors of the constant term that sum to the linear coefficient.",
        "guidance": "Think about pairs of factors.",
        "is_final_solution": False
    }))
    h1 = client.post(
        "/api/v1/ai/hint",
        headers=AUTH_HEADERS,
        json={"topic_id": "quadratic_equations", "question_id": "q_quad_1", "hint_level": 1}
    )
    assert h1.status_code == 200
    d1 = h1.json()
    assert d1["hint_level"] == 1
    assert d1["is_final_solution"] is False

    # Hint Level 4 (Final Help)
    gemini_client.set_mock_handler(lambda p, m: json.dumps({
        "hint_level": 4,
        "hint_text": "Factor as (x + 2)(x + 3) = 0, giving x = -2 or x = -3.",
        "guidance": "Complete solution revealed.",
        "is_final_solution": True
    }))
    h4 = client.post(
        "/api/v1/ai/hint",
        headers=AUTH_HEADERS,
        json={"topic_id": "quadratic_equations", "question_id": "q_quad_1", "hint_level": 4}
    )
    assert h4.status_code == 200
    d4 = h4.json()
    assert d4["hint_level"] == 4
    assert d4["is_final_solution"] is True

# 5. Question Generation & Validation Pipeline
def test_targeted_question_generation_and_validation():
    mock_questions = {
        "questions": [
            {
                "questionText": "What are the solutions to x^2 - 9 = 0?",
                "difficulty": "medium",
                "questionType": "multiple_choice",
                "options": [
                    {"id": "opt_a", "text": "x = 3 and x = -3", "is_correct": True},
                    {"id": "opt_b", "text": "x = 9 and x = -9", "is_correct": False, "distractor_explanation": "Squared root skipped"},
                    {"id": "opt_c", "text": "x = 3 only", "is_correct": False, "distractor_explanation": "Negative root omitted"},
                    {"id": "opt_d", "text": "x = 0", "is_correct": False}
                ],
                "correctAnswer": "opt_a",
                "explanation": "Apply the difference of squares: (x - 3)(x + 3) = 0, therefore x = 3 or x = -3.",
                "hint": "Recall the difference of two squares identity.",
                "misconceptionTags": ["sign_error"],
                "learningObjective": "Solve quadratics using difference of squares"
            }
        ]
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_questions))

    res = client.post(
        "/api/v1/ai/generate-questions",
        headers=AUTH_HEADERS,
        json={
            "subject_id": "mathematics",
            "topic_id": "quadratic_equations",
            "count": 1,
            "target_difficulty": "medium",
            "target_misconception": "sign_error"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 1
    assert data["questions"][0]["questionText"] == "What are the solutions to x^2 - 9 = 0?"
    assert data["status"] in (QuestionGenerationStatus.SESSION_GENERATED.value, QuestionGenerationStatus.AI_GENERATED_PENDING.value)

def test_question_validation_pipeline_rejects_malformed():
    # Malformed: 2 correct options
    bad_item = GeneratedQuestionItem(
        questionText="Solve 2x = 4",
        difficulty="basic",
        questionType="multiple_choice",
        options=[
            GeneratedOption(id="opt_1", text="x = 2", is_correct=True),
            GeneratedOption(id="opt_2", text="x = 4/2", is_correct=True)
        ],
        correctAnswer="opt_1",
        explanation="2x = 4"
    )
    is_valid, reason = question_generation_service.validate_generated_question(bad_item, "algebra")
    assert not is_valid
    assert "Expected exactly 1 correct option" in reason

def test_duplicate_similarity_detection():
    # q_quad_1 question text in seed curriculum: "Solve for x: x² - 9 = 0"
    duplicate_text = "Solve for x: x² - 9 = 0"
    is_dup = question_generation_service.is_duplicate(duplicate_text, "quadratic_equations")
    assert is_dup is True

    novel_text = "Calculate the maximum height of a projectile given by h(t) = -5t^2 + 20t + 50."
    is_dup_novel = question_generation_service.is_duplicate(novel_text, "quadratic_equations")
    assert is_dup_novel is False

# 6. Mistake Interpretation & Confidence Handling
def test_mistake_interpretation_high_confidence():
    mock_diag = {
        "likely_error": "The student inverted the sign when factoring the middle term.",
        "explanation": "When multiplying two negative numbers (-2 and -3), the product is +6 and the sum is -5.",
        "teaching_focus": "Sign rules for quadratic factorization.",
        "confidence": "high",
        "concept_to_remember": "Positive product with negative sum requires two negative factors.",
        "mini_example": "x^2 - 3x + 2 = (x - 1)(x - 2)",
        "quick_check": "What is the sum of -4 and -2?"
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_diag))

    res = client.post(
        "/api/v1/ai/analyze-mistake",
        headers=AUTH_HEADERS,
        json={
            "question_id": "q_quad_1",
            "student_answer": "x = 3 only",
            "topic_id": "quadratic_equations"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["confidence"] == "high"
    assert data["is_tentative"] is False
    assert "sign rules" in data["teaching_focus"].lower()

def test_mistake_interpretation_low_confidence_marked_tentative():
    mock_diag = {
        "likely_error": "The response looks like an accidental typo or random guess.",
        "explanation": "There is no clear procedural pattern matching standard algebraic errors.",
        "teaching_focus": "Careful re-reading of the prompt.",
        "confidence": "low",
        "concept_to_remember": "Take time to verify inputs before submission.",
        "mini_example": None,
        "quick_check": None
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_diag))

    res = client.post(
        "/api/v1/ai/analyze-mistake",
        headers=AUTH_HEADERS,
        json={
            "question_id": "q_quad_1",
            "student_answer": "999",
            "topic_id": "quadratic_equations"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["confidence"] == "low"
    assert data["is_tentative"] is True # Tentative flag asserted

# 7. Natural Language Insights & Study Plan
def test_natural_language_insights():
    mock_insight = {
        "what_noticed": "Your mastery in Quadratic Equations is progressing steadily, with strong recall on basic problems.",
        "focus_next": "Application problems with word descriptions remain the primary bottleneck.",
        "suggested_strategy": "Practice translating one word problem into equation form before each study session."
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_insight))

    res = client.get("/api/v1/ai/insights", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert "grounded_metrics" in data
    assert data["what_noticed"] == mock_insight["what_noticed"]

def test_study_plan_generation():
    mock_plan = {
        "overview": "Today's focused 25-minute roadmap targets factorisation prerequisite recovery first.",
        "total_minutes": 25,
        "steps": [
            {
                "step_number": 1,
                "topic_id": "factorisation",
                "topic_name": "Factorisation",
                "action_type": "PREREQUISITE_RECOVERY",
                "allocated_minutes": 10,
                "pedagogical_reason": "Factorisation is the foundational dependency for solving quadratics."
            },
            {
                "step_number": 2,
                "topic_id": "quadratic_equations",
                "topic_name": "Quadratic Equations",
                "action_type": "RETRIEVAL",
                "allocated_minutes": 15,
                "pedagogical_reason": "Active retrieval to reinforce memory retention."
            }
        ],
        "encouragement": "Targeting prerequisite gaps accelerates deep understanding."
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_plan))

    res = client.get("/api/v1/ai/study-plan", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data["steps"]) == 2
    assert data["steps"][0]["action_type"] == "PREREQUISITE_RECOVERY"

# 8. Study Notes Analyzer
def test_notes_analyzer():
    notes_text = (
        "Mitosis is the process of cell division resulting in two genetically identical daughter cells. "
        "The phases are Prophase, Metaphase, Anaphase, and Telophase (PMAT). "
        "During Metaphase, chromosomes align at the equatorial plate. "
        "In Anaphase, sister chromatids separate to opposite poles."
    )
    mock_notes_res = {
        "summary": "Mitosis overview covering the four sequential stages (PMAT) ensuring identical chromosome distribution.",
        "key_concepts": [
            {"name": "PMAT", "definition": "Prophase, Metaphase, Anaphase, Telophase", "importance": "Sequential order of mitosis stages."}
        ],
        "definitions": {
            "Metaphase": "Chromosomes line up along the equator.",
            "Anaphase": "Sister chromatids pull apart."
        },
        "practice_questions": [],
        "flashcards": [
            {"front": "What happens during Metaphase?", "back": "Chromosomes line up along the cell equator."}
        ],
        "suggested_prerequisites": ["Cell Structure", "DNA Replication"]
    }
    gemini_client.set_mock_handler(lambda p, m: json.dumps(mock_notes_res))

    res = client.post(
        "/api/v1/ai/analyze-notes",
        headers=AUTH_HEADERS,
        json={"notes_text": notes_text, "subject_id": "biology", "topic_id": "cell_biology"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_ai_generated"] is True
    assert "disclaimer" in data
    assert len(data["flashcards"]) == 1
    assert data["definitions"]["Metaphase"] == "Chromosomes line up along the equator."

# 9. Rate Limiting Safeguards
def test_rate_limiting_enforcement():
    # Temporarily set tiny limit
    orig_limit = ai_config.MAX_AI_REQUESTS_PER_SESSION
    ai_config.MAX_AI_REQUESTS_PER_SESSION = 2
    try:
        session_id = "test_sess_limit_1"
        gemini_client.set_mock_handler(lambda p, m: json.dumps({
            "explanation": "Normal mock explanation",
            "key_concept": "Key",
            "steps": [],
            "example": None,
            "check_question": None,
            "encouragement": "Good"
        }))

        # Call 1: OK
        res1 = client.post(
            "/api/v1/ai/tutor",
            headers=AUTH_HEADERS,
            json={"topic_id": "quadratic_equations", "mode": "explain", "session_id": session_id}
        )
        assert res1.status_code == 200
        assert res1.json()["is_fallback"] is False

        # Call 2: OK
        res2 = client.post(
            "/api/v1/ai/tutor",
            headers=AUTH_HEADERS,
            json={"topic_id": "quadratic_equations", "mode": "explain", "session_id": session_id}
        )
        assert res2.status_code == 200

        # Call 3: Exceeds session limit -> Graceful Fallback returned
        res3 = client.post(
            "/api/v1/ai/tutor",
            headers=AUTH_HEADERS,
            json={"topic_id": "quadratic_equations", "mode": "explain", "session_id": session_id}
        )
        assert res3.status_code == 200
        assert res3.json()["is_fallback"] is True
        assert "Session AI limit" in res3.json()["explanation"]
    finally:
        ai_config.MAX_AI_REQUESTS_PER_SESSION = orig_limit

# 10. Fallback When Gemini is Unavailable
def test_graceful_fallback_on_gemini_failure():
    # Force mock handler to simulate API downtime or exception
    gemini_client.set_mock_handler(lambda p, m: (_ for _ in ()).throw(RuntimeError("Gemini API service timeout")))

    res = client.post(
        "/api/v1/ai/tutor",
        headers=AUTH_HEADERS,
        json={"topic_id": "quadratic_equations", "mode": "explain"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_fallback"] is True
    assert data["model_used"] == "deterministic_fallback"
    assert "quadratic equations" in data["explanation"].lower()

# 11. Security & Authentication Checks
def test_ai_endpoints_require_auth():
    unauth_res = client.post(
        "/api/v1/ai/tutor",
        json={"topic_id": "quadratic_equations", "mode": "explain"}
    )
    assert unauth_res.status_code == 401

def test_ai_usage_endpoint():
    res = client.get("/api/v1/ai/usage", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == "student_1"
    assert "requests_today" in data
    assert "max_requests_per_day" in data
