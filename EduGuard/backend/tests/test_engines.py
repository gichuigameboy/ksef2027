import pytest
from datetime import datetime, timedelta
from app.engines.mastery_engine import MasteryEngine
from app.models.mastery import MasteryCategory, TopicMastery
from app.engines.retention_engine import RetentionEngine
from app.engines.knowledge_graph import KnowledgeGraphEngine
from app.engines.weakness_engine import WeaknessEngine
from app.engines.adaptive_engine import AdaptiveEngine

def test_mastery_engine_calculation():
    # Test blended mastery calculation
    score = MasteryEngine.calculate_mastery(
        basic_acc=90.0,
        medium_acc=70.0,
        hard_acc=50.0,
        app_acc=40.0,
        recent_acc=80.0,
        total_attempts=10
    )
    # Ensure score is within valid bounds and reflects difficulty weighting
    assert 50.0 <= score <= 80.0
    category = MasteryEngine.get_category(score)
    assert category in [MasteryCategory.DEVELOPING, MasteryCategory.STRONG]

def test_mastery_engine_categories():
    assert MasteryEngine.get_category(35.0) == MasteryCategory.CRITICAL
    assert MasteryEngine.get_category(52.0) == MasteryCategory.WEAK
    assert MasteryEngine.get_category(68.0) == MasteryCategory.DEVELOPING
    assert MasteryEngine.get_category(82.0) == MasteryCategory.STRONG
    assert MasteryEngine.get_category(95.0) == MasteryCategory.MASTERED

def test_retention_decay_curve():
    # Immediate retention after retrieval should be 1.0
    now = datetime.utcnow()
    immediate_r = RetentionEngine.calculate_estimated_retention(
        last_retrieval_at=now,
        half_life_days=14.0,
        as_of=now
    )
    assert immediate_r == 1.0

    # Retention after 1 half-life (14 days) should be 0.5
    after_14_days = now + timedelta(days=14)
    decayed_r = RetentionEngine.calculate_estimated_retention(
        last_retrieval_at=now,
        half_life_days=14.0,
        as_of=after_14_days
    )
    assert pytest.approx(decayed_r, 0.05) == 0.5

def test_knowledge_graph_prerequisite_traversal():
    kg = KnowledgeGraphEngine()
    
    # Check direct prerequisites for quadratics
    prereqs = kg.get_prerequisites("quadratic_equations")
    assert "factorisation" in prereqs

    # Check all ancestors
    ancestors = kg.get_all_ancestors("quadratic_equations")
    assert "algebraic_manipulation" in ancestors
    assert "factorisation" in ancestors

def test_weakness_engine_prerequisite_gap_detection():
    kg = KnowledgeGraphEngine()
    weakness_eng = WeaknessEngine(kg)

    # Student struggles on quadratics (50%), factorisation is weak (40%)
    mastery_map = {
        "quadratic_equations": 50.0,
        "factorisation": 40.0,
        "algebraic_manipulation": 75.0
    }

    diagnosis = weakness_eng.diagnose_topic_struggle(
        topic_id="quadratic_equations",
        topic_mastery=50.0,
        difficulty_accuracies={"basic": 70.0, "medium": 45.0, "hard": 30.0, "application": 25.0},
        misconception_frequencies={"zero_product_sign_reversal": 3},
        student_mastery_map=mastery_map
    )

    assert diagnosis["primary_cause"] == "prerequisite_gap"
    assert len(diagnosis["prerequisite_gaps"]) > 0
    assert diagnosis["prerequisite_gaps"][0]["topic_id"] == "factorisation"

def test_adaptive_engine_mission_generation():
    kg = KnowledgeGraphEngine()
    adaptive_eng = AdaptiveEngine(kg)

    masteries = [
        TopicMastery(
            topic_id="quadratic_equations",
            subject_id="mathematics",
            topic_name="Quadratic Equations",
            mastery_score=51.0,
            category=MasteryCategory.WEAK,
            basic_accuracy=70.0,
            medium_accuracy=40.0,
            hard_accuracy=30.0,
            application_accuracy=20.0,
            recent_accuracy=50.0,
            attempts_count=8
        )
    ]
    retentions = []

    mission = adaptive_eng.generate_daily_mission("test_user", masteries, retentions)
    assert mission.title == "Today's Learning Mission"
    assert len(mission.items) > 0
    assert mission.estimated_duration_minutes >= 10
