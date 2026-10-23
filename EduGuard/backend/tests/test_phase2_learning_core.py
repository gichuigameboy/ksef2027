import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test_token_student_phase2"}

def test_full_diagnostic_learning_core_flow():
    # 1. Start Diagnostic for Quadratic Equations
    diag_req = {
        "subject_id": "mathematics",
        "topic_id": "quadratic_equations"
    }
    res = client.post("/api/v1/learning/diagnostics", json=diag_req, headers=AUTH_HEADERS)
    assert res.status_code == 200
    diag_data = res.json()
    diag_id = diag_data["diagnostic_id"]
    assert diag_data["total_questions"] >= 6
    assert diag_data["status"] == "in_progress"

    # 2. Verify Client View Security: correct_answer & explanations must NOT be present
    first_q = diag_data["current_question"]
    assert first_q is not None
    assert "correct_answer" not in first_q
    assert "explanation" not in first_q
    assert len(first_q["options"]) >= 2
    for opt in first_q["options"]:
        assert "is_correct" not in opt
        assert "misconception_tag" not in opt

    # 3. Submit Correct Answer to First Question
    q_id = first_q["id"]
    submit_req = {
        "question_id": q_id,
        "selected_option_id": "opt_a1" if q_id == "q_alg_1" else "opt_f1_1",
        "session_id": diag_id,
        "response_time_ms": 12000
    }
    res_sub = client.post("/api/v1/learning/attempts", json=submit_req, headers=AUTH_HEADERS)
    assert res_sub.status_code == 200
    feedback = res_sub.json()
    assert feedback["is_correct"] is True
    assert feedback["updated_topic_mastery"] > 0.0
    first_attempt_id = feedback["attempt_id"]

    # 4. Idempotency Check: Duplicate answer submission must not create duplicate attempt
    res_dup = client.post("/api/v1/learning/attempts", json=submit_req, headers=AUTH_HEADERS)
    assert res_dup.status_code == 200
    assert res_dup.json()["attempt_id"] == first_attempt_id

    # 5. Resume Diagnostic Assessment: fetch state and get next question
    res_state = client.get(f"/api/v1/learning/diagnostics/{diag_id}", headers=AUTH_HEADERS)
    assert res_state.status_code == 200
    state_data = res_state.json()
    assert state_data["completed_count"] == 1
    next_q = state_data["current_question"]
    assert next_q is not None
    assert next_q["id"] != q_id

    # 6. Submit Incorrect Distractor to Next Question
    # Find an option that is not correct (in client view, any second/last option)
    submit_req_2 = {
        "question_id": next_q["id"],
        "selected_option_id": next_q["options"][-1]["id"],
        "session_id": diag_id,
        "response_time_ms": 18000
    }
    res_sub_2 = client.post("/api/v1/learning/attempts", json=submit_req_2, headers=AUTH_HEADERS)
    assert res_sub_2.status_code == 200
    fb_2 = res_sub_2.json()
    assert "is_correct" in fb_2
    assert "explanation" in fb_2

    # 7. Complete Diagnostic Session
    res_complete = client.post(f"/api/v1/learning/diagnostics/{diag_id}/complete", headers=AUTH_HEADERS)
    assert res_complete.status_code == 200
    profile = res_complete.json()
    assert "overall_starting_point" in profile
    assert "recommended_first_session" in profile
    assert "prerequisite_gaps" in profile

    # 8. Verify Student Learning History is Persisted
    res_hist = client.get("/api/v1/learning/history", headers=AUTH_HEADERS)
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 2
    assert history[0]["student_id"] == "student_phase2"

    # 9. Verify "Why Am I Struggling?" uses Real Data
    res_struggle = client.get("/api/v1/diagnosis/why-struggling/quadratic_equations", headers=AUTH_HEADERS)
    assert res_struggle.status_code == 200
    struggle_data = res_struggle.json()
    assert "recommended_action" in struggle_data
    assert struggle_data["topic_id"] == "quadratic_equations"

    # 10. Verify Adaptive Mission from Real Persisted Data
    res_mission = client.get("/api/v1/learning/mission/today", headers=AUTH_HEADERS)
    assert res_mission.status_code == 200
    mission = res_mission.json()
    assert len(mission["items"]) > 0
    assert mission["estimated_duration_minutes"] >= 10
