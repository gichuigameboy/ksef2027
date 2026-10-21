import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_me_unauthorized():
    """Unauthenticated request must return 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_auth_me_valid_token():
    """Valid token returns verified student profile."""
    headers = {"Authorization": "Bearer test_token_student_1"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == "student_1"
    assert data["role"] == "student"

def test_onboarding_flow():
    headers = {"Authorization": "Bearer test_token_new_student_99"}
    payload = {
        "display_name": "Test User",
        "selected_subjects": ["mathematics", "biology"],
        "learning_level": "Grade 10"
    }
    response = client.post("/api/v1/auth/onboarding", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["display_name"] == "Test User"
    assert "mathematics" in response.json()["enrolled_subjects"]
