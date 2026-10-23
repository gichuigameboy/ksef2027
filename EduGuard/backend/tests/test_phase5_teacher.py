"""
Teacher Analytics & Classroom Intelligence Tests — Phase 5
Verifies:
- Class heatmap endpoint returns structured matrix for all students & topics
- Misconception clustering groups student errors with prevalence percentages
- At-risk student identification highlights struggling learners with deterministic evidence
- Topic difficulty distribution detects learning cliffs across cognitive tiers
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test-demo-token"}

def test_teacher_class_heatmap_endpoint():
    response = client.get("/api/v1/teacher/class-heatmap/mathematics", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["subject_id"] == "mathematics"
    assert len(data["topic_ids"]) > 0
    assert len(data["student_ids"]) > 0
    assert len(data["cells"]) > 0
    # Verify cell structure
    first_cell = data["cells"][0]
    assert "student_id" in first_cell
    assert "topic_id" in first_cell
    assert "mastery_score" in first_cell
    assert 0.0 <= first_cell["mastery_score"] <= 1.0
    assert "mastery_category" in first_cell

def test_teacher_misconceptions_endpoint():
    response = client.get("/api/v1/teacher/misconceptions/mathematics", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["subject_id"] == "mathematics"
    assert "clusters" in data
    assert len(data["clusters"]) > 0
    cluster = data["clusters"][0]
    assert "error_tag" in cluster
    assert "affected_student_count" in cluster
    assert "prevalence_percent" in cluster
    assert "recommended_intervention" in cluster

def test_teacher_at_risk_students_endpoint():
    response = client.get("/api/v1/teacher/at-risk-students/mathematics", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "total_class_size" in data
    assert "at_risk_count" in data
    assert "students" in data
    if data["students"]:
        student = data["students"][0]
        assert "risk_level" in student
        assert "risk_reasons" in student
        assert "weakest_topic_id" in student
        assert "recommended_action" in student

def test_teacher_topic_difficulty_endpoint():
    response = client.get("/api/v1/teacher/topic-difficulty/mathematics", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["subject_id"] == "mathematics"
    assert "profiles" in data
    assert len(data["profiles"]) > 0
    profile = data["profiles"][0]
    assert "basic_accuracy" in profile
    assert "medium_accuracy" in profile
    assert "hard_accuracy" in profile
    assert "application_accuracy" in profile
    assert "difficulty_cliff_detected" in profile
