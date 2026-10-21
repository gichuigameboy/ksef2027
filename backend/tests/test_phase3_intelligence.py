import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.engines.mastery_engine import MasteryEngine
from app.engines.retention_engine import RetentionEngine
from app.engines.knowledge_graph import KnowledgeGraphEngine
from app.engines.weakness_engine import WeaknessEngine
from app.engines.adaptive_engine import AdaptiveEngine
from app.models.mastery import MasteryCategory, TopicMastery, RetentionState
from app.models.learning_intelligence import (
    MasteryTrend,
    RetentionStatus,
    ErrorCategory,
    NextActionType
)
from app.models.question_db import QuestionRecord, QuestionDifficulty, QuestionFormat, QuestionOptionDB, AttemptRecord
from app.services.attempt_repository import attempt_repository
from app.services.question_repository import question_repository

client = TestClient(app)

# Helper to get authenticated headers
def get_auth_headers(uid="student_phase3_test"):
    return {
        "Authorization": f"Bearer test_token_{uid}",
        "Content-Type": "application/json"
    }

# 1. Advanced Mastery Engine Tests
def test_mastery_confidence_scoring():
    # Sparse attempts -> low confidence
    conf_sparse = MasteryEngine.calculate_confidence(total_attempts=2, difficulty_breadth=1, has_transfer_data=False)
    assert 0.1 <= conf_sparse <= 0.4

    # High volume spanning multiple difficulty tiers + transfer -> high confidence
    conf_robust = MasteryEngine.calculate_confidence(total_attempts=10, difficulty_breadth=4, has_transfer_data=True)
    assert conf_robust >= 0.85

def test_mastery_trend_detection():
    # Rapid improvement
    history_rising = [45.0, 52.0, 60.0, 68.0]
    trend_rising = MasteryEngine.detect_trend(history_rising)
    assert trend_rising == MasteryTrend.RAPIDLY_IMPROVING

    # Declining
    history_declining = [80.0, 76.0, 71.0, 65.0]
    trend_declining = MasteryEngine.detect_trend(history_declining)
    assert trend_declining == MasteryTrend.DECLINING

    # Stable
    history_stable = [70.0, 71.0, 70.5, 71.0]
    trend_stable = MasteryEngine.detect_trend(history_stable)
    assert trend_stable == MasteryTrend.STABLE

    # Insufficient data
    assert MasteryEngine.detect_trend([50.0, 55.0]) == MasteryTrend.INSUFFICIENT_DATA

def test_mastery_gating_prevents_false_mastery():
    # Student scores 95% overall but hard accuracy is only 40% and application is 30%
    # Mastery gates must cap the score below 90 (STRONG category)
    gated_score = MasteryEngine.apply_mastery_gates(
        raw_score=94.0,
        hard_acc=40.0,
        app_acc=30.0,
        transfer_acc=25.0
    )
    assert gated_score == 89.0
    assert MasteryEngine.get_category(gated_score) == MasteryCategory.STRONG

    # With verified hard competence, score is not capped
    ungated_score = MasteryEngine.apply_mastery_gates(
        raw_score=94.0,
        hard_acc=85.0,
        app_acc=80.0,
        transfer_acc=80.0
    )
    assert ungated_score == 94.0
    assert MasteryEngine.get_category(ungated_score) == MasteryCategory.MASTERED

# 2. Retention Engine 2.0 Tests
def test_retention_states_and_urgency():
    now = datetime.utcnow()

    # Fresh state: recent retrieval with high recall
    fresh_status = RetentionEngine.determine_retention_status(
        current_retention=0.95,
        half_life_days=10.0,
        retrieval_streak=1,
        last_retrieval_at=now - timedelta(hours=6),
        successful_retrievals=1,
        failed_retrievals=0
    )
    assert fresh_status == RetentionStatus.FRESH

    # Due state: retention fallen below 70% threshold
    due_status = RetentionEngine.determine_retention_status(
        current_retention=0.62,
        half_life_days=7.0,
        retrieval_streak=1,
        last_retrieval_at=now - timedelta(days=6),
        successful_retrievals=1,
        failed_retrievals=0
    )
    assert due_status == RetentionStatus.DUE

    # Forgotten state: multiple failures and low retention
    forgotten_status = RetentionEngine.determine_retention_status(
        current_retention=0.42,
        half_life_days=3.0,
        retrieval_streak=0,
        last_retrieval_at=now - timedelta(days=4),
        successful_retrievals=1,
        failed_retrievals=2
    )
    assert forgotten_status == RetentionStatus.FORGOTTEN

    # Review urgency should be higher for high-mastery concepts that are decaying
    urgency_high_val = RetentionEngine.calculate_review_urgency(retention=0.55, mastery_score=88.0, half_life_days=10.0)
    urgency_low_val = RetentionEngine.calculate_review_urgency(retention=0.90, mastery_score=88.0, half_life_days=10.0)
    assert urgency_high_val > urgency_low_val

# 3. Knowledge Graph 2.0 Root Cause Analysis
def test_knowledge_graph_distance_and_root_cause():
    kg = KnowledgeGraphEngine()
    assert kg.is_acyclic()

    # Synthetic student: Factorisation = 35%, Algebraic Manipulation = 75%
    mastery_map = {
        "quadratic_equations": 48.0,
        "factorisation": 35.0,
        "algebraic_manipulation": 75.0
    }

    gaps = kg.find_prerequisite_gaps("quadratic_equations", mastery_map)
    assert len(gaps) > 0
    # Top gap should be direct parent factorisation
    top_gap = gaps[0]
    assert top_gap["topic_id"] == "factorisation"
    assert top_gap["is_direct_prerequisite"] is True
    assert "Likely prerequisite gap" in top_gap["attribution_note"]

# 4. Weakness Engine 2.0: Misconception Clustering and Difficulty Cliff
def test_weakness_misconception_clustering():
    kg = KnowledgeGraphEngine()
    weakness_eng = WeaknessEngine(kg)

    # 4 incorrect attempts with sign errors
    attempts = [
        AttemptRecord(
            attempt_id=f"att_test_{i}",
            student_id="s1",
            question_id=f"q_{i}",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            answer="wrong",
            is_correct=False,
            difficulty="medium",
            question_type="multiple_choice",
            misconception_tags=["zero_product_sign_reversal"]
        ) for i in range(4)
    ]

    clusters = weakness_eng.cluster_misconceptions(attempts, min_cluster_size=2)
    assert len(clusters) == 1
    assert clusters[0].tag == "zero_product_sign_reversal"
    assert clusters[0].frequency == 4
    assert clusters[0].percentage == 100.0
    assert clusters[0].errorCategory == ErrorCategory.SIGN_ERROR

def test_weakness_difficulty_cliff():
    kg = KnowledgeGraphEngine()
    weakness_eng = WeaknessEngine(kg)

    profile = weakness_eng.evaluate_difficulty_cliff({
        "basic": 92.0,
        "medium": 75.0,
        "hard": 42.0,
        "application": 33.0
    })
    assert profile.difficultyCliff is True
    assert profile.cliffDescription is not None
    assert "Difficulty Cliff detected" in profile.cliffDescription

# 5. Adaptive Engine 2.0: Ranked Next Best Action & Intra-session Adaptation
def test_adaptive_next_best_action_ranking():
    kg = KnowledgeGraphEngine()
    adaptive_eng = AdaptiveEngine(kg)

    masteries = [
        TopicMastery(
            topic_id="quadratic_equations",
            subject_id="mathematics",
            topic_name="Quadratic Equations",
            mastery_score=50.0,
            category=MasteryCategory.WEAK,
            basic_accuracy=85.0,
            medium_accuracy=50.0,
            hard_accuracy=30.0,
            application_accuracy=25.0,
            recent_accuracy=50.0,
            attempts_count=6
        ),
        TopicMastery(
            topic_id="factorisation",
            subject_id="mathematics",
            topic_name="Factorisation",
            mastery_score=40.0,
            category=MasteryCategory.WEAK,
            basic_accuracy=50.0,
            medium_accuracy=40.0,
            hard_accuracy=20.0,
            application_accuracy=20.0,
            recent_accuracy=40.0,
            attempts_count=5
        )
    ]

    # Retention decay on factorisation
    retentions = [
        RetentionState(
            topic_id="factorisation",
            initial_mastery=40.0,
            current_estimated_retention=0.62,
            half_life_days=6.0,
            last_retrieval_at=datetime.utcnow() - timedelta(days=6),
            next_retrieval_due=datetime.utcnow(),
            status=RetentionStatus.DUE
        )
    ]

    ranked_actions = adaptive_eng.rank_next_best_actions(masteries, retentions)
    assert len(ranked_actions) >= 1
    # Prerequisite recovery for factorisation should have highest priority score
    assert ranked_actions[0].priority >= 0.80
    assert ranked_actions[0].actionType in [NextActionType.PREREQUISITE_RECOVERY, NextActionType.RETRIEVAL]
    assert ranked_actions[0].reasonCodes is not None

def test_intra_session_difficulty_adaptation():
    kg = KnowledgeGraphEngine()
    adaptive_eng = AdaptiveEngine(kg)

    # 2 consecutive correct -> step up from medium to hard
    next_diff_up = adaptive_eng.adapt_session_difficulty(
        consecutive_correct=2,
        consecutive_incorrect=0,
        current_difficulty="medium"
    )
    assert next_diff_up == "hard"

    # 2 consecutive incorrect -> step down from hard to medium
    next_diff_down = adaptive_eng.adapt_session_difficulty(
        consecutive_correct=0,
        consecutive_incorrect=2,
        current_difficulty="hard"
    )
    assert next_diff_down == "medium"

# 6. End-to-End Intelligence Pipeline and API Endpoints
def test_phase3_api_endpoints_full_pipeline():
    headers = get_auth_headers(uid="student_pipeline_integration")

    # Step A: Run Diagnostic to create initial attempts & mastery
    diag_res = client.post("/api/v1/learning/diagnostics", json={
        "subject_id": "mathematics",
        "topic_id": "quadratic_equations"
    }, headers=headers)
    assert diag_res.status_code == 200
    diag_data = diag_res.json()
    session_id = diag_data["diagnostic_id"]

    # Step B: Submit answers including a transfer question
    # Answer 1: q_quad_1 (correct)
    client.post("/api/v1/learning/attempts", json={
        "question_id": "q_quad_1",
        "selected_option_id": "opt_q1_1",
        "session_id": session_id,
        "response_time_ms": 12000
    }, headers=headers)

    # Answer 2: q_quad_2 with distractor (sign error misconception)
    client.post("/api/v1/learning/attempts", json={
        "question_id": "q_quad_2",
        "selected_option_id": "opt_q2_2",
        "session_id": session_id,
        "response_time_ms": 16000
    }, headers=headers)

    # Answer 3: q_quad_transfer_1 (Transfer challenge)
    client.post("/api/v1/learning/attempts", json={
        "question_id": "q_quad_transfer_1",
        "selected_option_id": "opt_qt_1",
        "session_id": session_id,
        "response_time_ms": 18000
    }, headers=headers)

    # Complete diagnostic
    client.post(f"/api/v1/learning/diagnostics/{session_id}/complete", headers=headers)

    # Step C: Verify /learning/state
    state_res = client.get("/api/v1/learning/state", headers=headers)
    assert state_res.status_code == 200
    state_data = state_res.json()
    assert state_data["studentId"] == "student_pipeline_integration"
    assert "mathematics" in state_data["subjects"]
    assert "recentLearningVelocity" in state_data
    assert "learningEfficiency" in state_data
    assert len(state_data["recommendedActions"]) > 0

    # Step D: Verify /learning/insights
    insights_res = client.get("/api/v1/learning/insights", headers=headers)
    assert insights_res.status_code == 200
    insights = insights_res.json()
    assert len(insights) > 0
    assert any(i["type"] in ["improving", "watch_this", "review_soon", "foundation_first"] for i in insights)

    # Step E: Verify /learning/recommendations and /learning/next-action
    recs_res = client.get("/api/v1/learning/recommendations", headers=headers)
    assert recs_res.status_code == 200
    assert len(recs_res.json()) > 0

    next_act_res = client.get("/api/v1/learning/next-action", headers=headers)
    assert next_act_res.status_code == 200
    next_action = next_act_res.json()
    assert "actionType" in next_action
    assert "priority" in next_action
    assert next_action["priority"] > 0.0

    # Step F: Verify /learning/timeline
    timeline_res = client.get("/api/v1/learning/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 1
    # Check that transfer or diagnostic event was logged
    event_types = [e["eventType"] for e in timeline]
    assert ("diagnostic" in event_types or "transfer_challenge" in event_types)

    # Step G: Verify /learning/retention
    ret_res = client.get("/api/v1/learning/retention", headers=headers)
    assert ret_res.status_code == 200
    ret_data = ret_res.json()
    assert "stable" in ret_data
    assert "due" in ret_data

    # Step H: Verify /learning/topics/{topic_id}/analysis and knowledge-map
    analysis_res = client.get("/api/v1/learning/topics/quadratic_equations/analysis", headers=headers)
    assert analysis_res.status_code == 200
    an_data = analysis_res.json()
    assert an_data["topic_id"] == "quadratic_equations"
    assert "diagnosis" in an_data

    map_res = client.get("/api/v1/learning/topics/quadratic_equations/knowledge-map", headers=headers)
    assert map_res.status_code == 200
    map_data = map_res.json()
    assert map_data["topic_id"] == "quadratic_equations"
    assert "prerequisites" in map_data
    assert "recommendation" in map_data

    # Step I: Verify Phase 4 AI Context export without LLM calls
    ai_res = client.get("/api/v1/learning/ai-context/quadratic_equations", headers=headers)
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert ai_data["student_id"] == "student_pipeline_integration"
    assert ai_data["current_topic"] == "quadratic_equations"
    assert "mastery" in ai_data
    assert "confidence" in ai_data
    assert "recommended_action" in ai_data
    assert "reason_codes" in ai_data

def test_section39_realistic_student_scenario():
    """
    Implements Section 39 of the Phase 3 specification:
    Realistic deterministic test scenario:
    Factorisation: Basic 90%, Medium 48%, Hard 31%
    Quadratics: Basic 83%, Medium 61%, Hard 39%, Application 28%
    Expected:
    - Factorisation identified as likely weakness (mastery < 60%)
    - Quadratics identified as developing
    - Application performance identified as weak (difficulty cliff)
    - Prerequisite recovery prioritized in Adaptive ranking
    """
    kg = KnowledgeGraphEngine()
    weakness_eng = WeaknessEngine(kg)
    adaptive_eng = AdaptiveEngine(kg)

    # 1. Calculate factorisation mastery
    fact_score = MasteryEngine.calculate_mastery(
        basic_acc=90.0,
        medium_acc=48.0,
        hard_acc=31.0,
        app_acc=20.0,
        recent_acc=50.0,
        total_attempts=8
    )
    fact_cat = MasteryEngine.get_category(fact_score)
    # Expected: Factorisation identified as a likely weakness (< 60%)
    assert fact_cat in [MasteryCategory.WEAK, MasteryCategory.CRITICAL]

    # 2. Calculate quadratics mastery
    quad_score = MasteryEngine.calculate_mastery(
        basic_acc=83.0,
        medium_acc=61.0,
        hard_acc=39.0,
        app_acc=28.0,
        recent_acc=65.0,
        total_attempts=10
    )
    quad_cat = MasteryEngine.get_category(quad_score)
    # Expected: Quadratics identified as developing or weak
    assert quad_cat in [MasteryCategory.DEVELOPING, MasteryCategory.WEAK]

    # 3. Evaluate Weakness Engine diagnosis on Quadratics
    mastery_map = {
        "factorisation": fact_score,
        "quadratic_equations": quad_score,
        "algebraic_manipulation": 80.0
    }
    diag = weakness_eng.diagnose_topic_struggle(
        topic_id="quadratic_equations",
        topic_mastery=quad_score,
        difficulty_accuracies={"basic": 83.0, "medium": 61.0, "hard": 39.0, "application": 28.0},
        misconception_frequencies={},
        student_mastery_map=mastery_map
    )
    # Prerequisite gap identified because factorisation is weak (< 60%)
    assert diag["primary_cause"] == "prerequisite_gap"
    assert len(diag["prerequisite_gaps"]) > 0
    assert diag["prerequisite_gaps"][0]["topic_id"] == "factorisation"
    assert diag["difficulty_cliff"] is True

    # 4. Adaptive Engine rankings
    m_fact = TopicMastery(
        topic_id="factorisation",
        subject_id="mathematics",
        topic_name="Factorisation",
        mastery_score=fact_score,
        category=fact_cat,
        basic_accuracy=90.0,
        medium_accuracy=48.0,
        hard_accuracy=31.0,
        application_accuracy=20.0,
        recent_accuracy=50.0,
        attempts_count=8
    )
    m_quad = TopicMastery(
        topic_id="quadratic_equations",
        subject_id="mathematics",
        topic_name="Quadratic Equations",
        mastery_score=quad_score,
        category=quad_cat,
        basic_accuracy=83.0,
        medium_accuracy=61.0,
        hard_accuracy=39.0,
        application_accuracy=28.0,
        recent_accuracy=65.0,
        attempts_count=10
    )

    m_alg = TopicMastery(
        topic_id="algebraic_manipulation",
        subject_id="mathematics",
        topic_name="Algebraic Manipulation",
        mastery_score=80.0,
        category=MasteryCategory.STRONG,
        basic_accuracy=90.0,
        medium_accuracy=85.0,
        hard_accuracy=70.0,
        application_accuracy=75.0,
        recent_accuracy=85.0,
        attempts_count=12
    )

    m_frac = TopicMastery(
        topic_id="fractions",
        subject_id="mathematics",
        topic_name="Fractions & Decimals",
        mastery_score=88.0,
        category=MasteryCategory.STRONG,
        basic_accuracy=95.0,
        medium_accuracy=90.0,
        hard_accuracy=80.0,
        application_accuracy=85.0,
        recent_accuracy=90.0,
        attempts_count=15
    )

    actions = adaptive_eng.rank_next_best_actions([m_frac, m_alg, m_fact, m_quad], [])
    assert len(actions) > 0
    # Prerequisite recovery must be prioritized
    top_action = actions[0]
    assert top_action.actionType == NextActionType.PREREQUISITE_RECOVERY
    assert top_action.topicId == "factorisation"
    assert "LOW_PREREQUISITE_MASTERY" in top_action.reasonCodes

