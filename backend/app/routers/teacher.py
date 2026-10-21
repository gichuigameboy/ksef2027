"""
Teacher Analytics Router — Phase 5
Provides class-wide learning intelligence for teachers:
- Class mastery heatmap across all students × topics
- Misconception clusters per topic
- At-risk student identification
- Topic difficulty distributions
"""
import logging
from typing import List, Dict, Optional
from collections import defaultdict
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import UserProfile, UserRole
from app.dependencies.auth import get_current_user, _IN_MEMORY_USERS
from app.services.attempt_repository import attempt_repository
from app.curriculum.registry import curriculum_registry

router = APIRouter(prefix="/api/v1/teacher", tags=["Teacher Analytics"])
logger = logging.getLogger(__name__)


# ── Response Models ─────────────────────────────────────────────────────────

class StudentTopicCell(BaseModel):
    student_id: str
    student_name: str
    topic_id: str
    topic_name: str
    mastery_score: float
    mastery_category: str
    retention_status: str
    trend: str
    attempts_count: int
    recent_accuracy: float


class ClassHeatmapResponse(BaseModel):
    subject_id: str
    subject_name: str
    topic_ids: List[str]
    topic_names: List[str]
    student_ids: List[str]
    student_names: List[str]
    cells: List[StudentTopicCell]
    class_averages: Dict[str, float]
    summary: str


class MisconceptionClusterSummary(BaseModel):
    topic_id: str
    topic_name: str
    error_tag: str
    affected_student_count: int
    total_students: int
    prevalence_percent: float
    example_students: List[str]
    recommended_intervention: str


class AtRiskStudentSummary(BaseModel):
    student_id: str
    student_name: str
    risk_level: str
    risk_reasons: List[str]
    weakest_topic_id: str
    weakest_topic_name: str
    average_mastery: float
    topics_forgotten: int
    topics_at_risk: int
    recommended_action: str


class ClassMisconceptionsResponse(BaseModel):
    subject_id: str
    total_students_analyzed: int
    clusters: List[MisconceptionClusterSummary]
    most_prevalent_error: str
    teacher_note: str


class AtRiskStudentsResponse(BaseModel):
    total_class_size: int
    at_risk_count: int
    critical_count: int
    students: List[AtRiskStudentSummary]
    class_average_mastery: float
    teacher_summary: str


class TopicDifficultyProfile(BaseModel):
    topic_id: str
    topic_name: str
    class_average_mastery: float
    basic_accuracy: float
    medium_accuracy: float
    hard_accuracy: float
    application_accuracy: float
    difficulty_cliff_detected: bool
    student_count: int


class ClassTopicDifficultyResponse(BaseModel):
    subject_id: str
    profiles: List[TopicDifficultyProfile]
    hardest_topic_id: str
    hardest_topic_name: str
    easiest_topic_id: str
    easiest_topic_name: str


# ── Demo Data Seeding ────────────────────────────────────────────────────────

DEMO_STUDENTS = {
    "student_1":     "Claudia Waithaka",
    "student_alice": "Alice Mwangi",
    "student_bob":   "Bob Ochieng",
    "student_carol": "Carol Auma",
    "student_dave":  "David Kariuki",
    "student_eve":   "Eve Njeri",
    "student_frank": "Frank Mutua",
    "student_grace": "Grace Wanjiku",
}

# Per-student base skill level for deterministic demo data
DEMO_SKILL = {
    "student_1":     0.80,
    "student_alice": 0.75,
    "student_bob":   0.45,  # struggling
    "student_carol": 0.90,
    "student_dave":  0.35,  # at-risk / critical
    "student_eve":   0.70,
    "student_frank": 0.55,
    "student_grace": 0.85,
}


def _ensure_demo_users():
    """Register demo students in the in-memory user store if not present."""
    for uid, name in DEMO_STUDENTS.items():
        if uid not in _IN_MEMORY_USERS:
            _IN_MEMORY_USERS[uid] = UserProfile(
                id=uid,
                email=f"{uid}@eduguard.edu",
                display_name=name,
                role=UserRole.STUDENT,
            )


def _seed_demo_attempts():
    """
    Injects synthetic attempt data for the demo cohort so teacher views have
    rich heatmap data without a live database. Idempotent — skips students
    that already have attempts recorded.
    """
    import random
    from app.services.question_repository import question_repository

    _ensure_demo_users()
    all_questions = list(question_repository._questions.values())
    if not all_questions:
        return

    rng = random.Random(42)  # fixed seed → reproducible results

    for sid, skill in DEMO_SKILL.items():
        if sid in attempt_repository._attempts:
            continue
        questions = rng.sample(all_questions, min(len(all_questions), 14))
        for q in questions:
            is_correct = rng.random() < skill
            opt = q.correct_answer if is_correct else (
                next((o.id for o in q.options if o.id != q.correct_answer), q.correct_answer)
            )
            attempt_repository.record_attempt(
                student_id=sid,
                question=q,
                selected_option_id=opt,
                response_time_ms=rng.randint(7000, 40000),
            )


def _resolve_subject(subject_id: str):
    """Returns (subject_id, subject, topics), falling back to mathematics."""
    subject = curriculum_registry.get_subject(subject_id)
    if not subject:
        subject_id = "mathematics"
        subject = curriculum_registry.get_subject("mathematics")
    topics = curriculum_registry.get_topics_for_subject(subject_id) or []
    return subject_id, subject, topics


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/class-heatmap/{subject_id}", response_model=ClassHeatmapResponse)
async def get_class_mastery_heatmap(
    subject_id: str,
    _: UserProfile = Depends(get_current_user),
):
    """Class mastery heatmap: every student × every topic in the subject."""
    _seed_demo_attempts()
    subject_id, subject, topics = _resolve_subject(subject_id)
    student_ids = list(DEMO_STUDENTS.keys())

    cells: List[StudentTopicCell] = []
    topic_mastery_totals: Dict[str, List[float]] = {t.id: [] for t in topics}

    for sid in student_ids:
        name = DEMO_STUDENTS.get(sid, sid)
        for topic in topics:
            mastery = attempt_repository.get_topic_mastery(sid, topic.id)
            mastery_score = mastery.mastery_score if mastery else 0.0
            mastery_category = mastery.category.value if mastery else "not_started"
            trend = mastery.trend.value if (mastery and hasattr(mastery, 'trend')) else "insufficient_data"

            ret = attempt_repository._retentions.get((sid, topic.id))
            retention_status = ret.status.value if (ret and hasattr(ret, 'status')) else "insufficient_data"

            attempts = [a for a in attempt_repository._attempts.get(sid, []) if a.topic_id == topic.id]
            last_6 = attempts[-6:]
            recent_accuracy = (sum(1 for a in last_6 if a.is_correct) / len(last_6) * 100) if last_6 else 0.0

            cells.append(StudentTopicCell(
                student_id=sid,
                student_name=name,
                topic_id=topic.id,
                topic_name=topic.name,
                mastery_score=round(mastery_score, 1),
                mastery_category=mastery_category,
                retention_status=retention_status,
                trend=trend,
                attempts_count=len(attempts),
                recent_accuracy=round(recent_accuracy, 1),
            ))
            topic_mastery_totals[topic.id].append(mastery_score)

    class_averages = {
        tid: round(sum(v) / max(len(v), 1), 1)
        for tid, v in topic_mastery_totals.items()
    }
    avg_overall = round(sum(class_averages.values()) / max(len(class_averages), 1), 1)

    return ClassHeatmapResponse(
        subject_id=subject_id,
        subject_name=subject.name if subject else subject_id.title(),
        topic_ids=[t.id for t in topics],
        topic_names=[t.name for t in topics],
        student_ids=student_ids,
        student_names=list(DEMO_STUDENTS.values()),
        cells=cells,
        class_averages=class_averages,
        summary=(
            f"Class of {len(student_ids)} students across {len(topics)} topics. "
            f"Class average mastery: {avg_overall}%."
        ),
    )


@router.get("/misconceptions/{subject_id}", response_model=ClassMisconceptionsResponse)
async def get_class_misconceptions(
    subject_id: str,
    _: UserProfile = Depends(get_current_user),
):
    """Aggregates misconception error patterns across the class."""
    _seed_demo_attempts()
    subject_id, subject, topics = _resolve_subject(subject_id)
    student_ids = list(DEMO_STUDENTS.keys())

    # topic_id -> error_tag -> set of student_ids
    error_map: Dict[str, Dict[str, set]] = defaultdict(lambda: defaultdict(set))

    for sid in student_ids:
        for attempt in attempt_repository._attempts.get(sid, []):
            if not attempt.is_correct and attempt.error_category:
                error_map[attempt.topic_id][attempt.error_category].add(sid)

    clusters: List[MisconceptionClusterSummary] = []
    topic_name_map = {t.id: t.name for t in topics}

    for topic_id, tag_map in error_map.items():
        topic_name = topic_name_map.get(topic_id, topic_id.replace("_", " ").title())
        for tag, affected in tag_map.items():
            if not affected:
                continue
            prevalence = round(len(affected) / len(student_ids) * 100, 1)
            clusters.append(MisconceptionClusterSummary(
                topic_id=topic_id,
                topic_name=topic_name,
                error_tag=tag,
                affected_student_count=len(affected),
                total_students=len(student_ids),
                prevalence_percent=prevalence,
                example_students=[DEMO_STUDENTS.get(sid, sid) for sid in list(affected)[:3]],
                recommended_intervention=(
                    f"Address '{tag.replace('_', ' ')}' in {topic_name} with worked examples. "
                    f"{len(affected)} students ({prevalence}%) show this error pattern."
                ),
            ))

    clusters.sort(key=lambda c: c.affected_student_count, reverse=True)
    most_prevalent = clusters[0].error_tag.replace("_", " ").title() if clusters else "None detected"

    return ClassMisconceptionsResponse(
        subject_id=subject_id,
        total_students_analyzed=len(student_ids),
        clusters=clusters,
        most_prevalent_error=most_prevalent,
        teacher_note=(
            "Misconception clusters are derived from live student attempt data. "
            "Address the highest-prevalence errors in your next lesson for maximum class-wide impact."
        ),
    )


@router.get("/at-risk-students/{subject_id}", response_model=AtRiskStudentsResponse)
async def get_at_risk_students(
    subject_id: str,
    _: UserProfile = Depends(get_current_user),
):
    """Identifies students who need immediate teacher intervention."""
    _seed_demo_attempts()
    subject_id, subject, topics = _resolve_subject(subject_id)
    student_ids = list(DEMO_STUDENTS.keys())

    at_risk: List[AtRiskStudentSummary] = []
    all_avg_masteries: List[float] = []

    for sid in student_ids:
        masteries = [attempt_repository.get_topic_mastery(sid, t.id) for t in topics]
        masteries = [m for m in masteries if m is not None]
        scores = [m.mastery_score for m in masteries]
        avg_mastery = sum(scores) / max(len(scores), 1) if scores else 0.0
        all_avg_masteries.append(avg_mastery)

        forgotten = sum(
            1 for t in topics
            for r in [attempt_repository._retentions.get((sid, t.id))]
            if r and hasattr(r, 'status') and r.status.value in ("forgotten", "due")
        )
        at_risk_count = sum(
            1 for t in topics
            for r in [attempt_repository._retentions.get((sid, t.id))]
            if r and hasattr(r, 'status') and r.status.value == "at_risk"
        )

        weakest = min(masteries, key=lambda m: m.mastery_score) if masteries else None
        weakest_topic = next(
            (t for t in topics if weakest and t.id == weakest.topic_id),
            topics[0] if topics else None
        )

        risk_reasons = []
        if avg_mastery < 35:
            risk_reasons.append(f"Critically low average mastery ({avg_mastery:.0f}%)")
        elif avg_mastery < 55:
            risk_reasons.append(f"Average mastery below class standard ({avg_mastery:.0f}%)")
        if forgotten >= 2:
            risk_reasons.append(f"{forgotten} topics at forgotten/overdue status")
        if at_risk_count >= 2:
            risk_reasons.append(f"{at_risk_count} topics at retention risk")
        if weakest and weakest.mastery_score < 25:
            risk_reasons.append(f"Critical gap in {weakest_topic.name if weakest_topic else 'core topic'}")

        if not risk_reasons:
            continue

        risk_level = (
            "critical" if avg_mastery < 40 or forgotten >= 3
            else "high" if avg_mastery < 55 or forgotten >= 2
            else "moderate"
        )

        at_risk.append(AtRiskStudentSummary(
            student_id=sid,
            student_name=DEMO_STUDENTS.get(sid, sid),
            risk_level=risk_level,
            risk_reasons=risk_reasons,
            weakest_topic_id=weakest_topic.id if weakest_topic else "",
            weakest_topic_name=weakest_topic.name if weakest_topic else "Unknown",
            average_mastery=round(avg_mastery, 1),
            topics_forgotten=forgotten,
            topics_at_risk=at_risk_count,
            recommended_action=(
                f"Schedule targeted support for {weakest_topic.name if weakest_topic else 'core topics'}. "
                "Use worked examples and verify prerequisite mastery before progression."
            ),
        ))

    at_risk.sort(key=lambda s: (
        {"critical": 0, "high": 1, "moderate": 2}.get(s.risk_level, 3),
        s.average_mastery,
    ))

    class_avg = round(sum(all_avg_masteries) / max(len(all_avg_masteries), 1), 1)
    critical_count = sum(1 for s in at_risk if s.risk_level == "critical")

    return AtRiskStudentsResponse(
        total_class_size=len(student_ids),
        at_risk_count=len(at_risk),
        critical_count=critical_count,
        students=at_risk,
        class_average_mastery=class_avg,
        teacher_summary=(
            f"{len(at_risk)} of {len(student_ids)} students need support. "
            f"{critical_count} require immediate intervention. "
            f"Class average mastery: {class_avg}%."
        ),
    )


@router.get("/topic-difficulty/{subject_id}", response_model=ClassTopicDifficultyResponse)
async def get_topic_difficulty_profiles(
    subject_id: str,
    _: UserProfile = Depends(get_current_user),
):
    """Topic-level difficulty profiles showing where the class struggles most."""
    _seed_demo_attempts()
    subject_id, subject, topics = _resolve_subject(subject_id)
    student_ids = list(DEMO_STUDENTS.keys())

    profiles: List[TopicDifficultyProfile] = []

    for topic in topics:
        by_diff: Dict[str, List[bool]] = {
            "basic": [], "medium": [], "hard": [], "application": []
        }
        mastery_scores = []

        for sid in student_ids:
            m = attempt_repository.get_topic_mastery(sid, topic.id)
            mastery_scores.append(m.mastery_score if m else 0.0)
            for a in attempt_repository._attempts.get(sid, []):
                if a.topic_id == topic.id and a.difficulty in by_diff:
                    by_diff[a.difficulty].append(a.is_correct)

        def acc(lst: List[bool]) -> float:
            return round(sum(lst) / max(len(lst), 1) * 100, 1) if lst else 0.0

        b_acc = acc(by_diff["basic"])
        m_acc = acc(by_diff["medium"])
        h_acc = acc(by_diff["hard"])
        a_acc = acc(by_diff["application"])
        class_avg = round(sum(mastery_scores) / max(len(mastery_scores), 1), 1)
        cliff = b_acc >= 60 and (h_acc < 40 or a_acc < 40)

        profiles.append(TopicDifficultyProfile(
            topic_id=topic.id,
            topic_name=topic.name,
            class_average_mastery=class_avg,
            basic_accuracy=b_acc,
            medium_accuracy=m_acc,
            hard_accuracy=h_acc,
            application_accuracy=a_acc,
            difficulty_cliff_detected=cliff,
            student_count=len(student_ids),
        ))

    if not profiles:
        return ClassTopicDifficultyResponse(
            subject_id=subject_id,
            profiles=[],
            hardest_topic_id="",
            hardest_topic_name="N/A",
            easiest_topic_id="",
            easiest_topic_name="N/A",
        )

    hardest = min(profiles, key=lambda p: p.class_average_mastery)
    easiest = max(profiles, key=lambda p: p.class_average_mastery)

    return ClassTopicDifficultyResponse(
        subject_id=subject_id,
        profiles=profiles,
        hardest_topic_id=hardest.topic_id,
        hardest_topic_name=hardest.topic_name,
        easiest_topic_id=easiest.topic_id,
        easiest_topic_name=easiest.topic_name,
    )
