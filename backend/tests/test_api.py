import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test_token_student_1"}

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_today_mission():
    response = client.get("/api/v1/learning/mission/today", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert "estimated_duration_minutes" in data

def test_get_mastery_overview():
    response = client.get("/api/v1/learning/overview", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_submit_attempt_endpoint():
    payload = {
        "question_id": "q_fact_1",
        "selected_option_id": "opt_f1_1", # Correct: (x+2)(x+3)
        "response_time_ms": 14000
    }
    response = client.post("/api/v1/learning/attempts", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 200
    res = response.json()
    assert res["is_correct"] is True
    assert res["updated_topic_mastery"] is not None

def test_submit_attempt_incorrect_misconception():
    payload = {
        "question_id": "q_fact_1",
        "selected_option_id": "opt_f1_2", # Incorrect distractor: (x+1)(x+6)
        "response_time_ms": 25000,
        "idempotency_key": "distinct_attempt_key_test"
    }
    # Use distinct user so it doesn't hit same-session dedup
    headers = {"Authorization": "Bearer test_token_student_misconception"}
    response = client.post("/api/v1/learning/attempts", json=payload, headers=headers)
    assert response.status_code == 200
    res = response.json()
    assert res["is_correct"] is False
    assert res["diagnosed_misconception"] is not None

def test_why_am_i_struggling_endpoint():
    response = client.get("/api/v1/diagnosis/why-struggling/quadratic_equations", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["topic_id"] == "quadratic_equations"
    assert "recommended_action" in data
