import math
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.models.mastery import RetentionState
from app.models.learning_intelligence import RetentionStatus

class RetentionEngine:
    """
    Retention & Forgetting Engine 2.0.
    Tracks memory decay using an adaptive half-life forgetting curve:
    R(t) = 2^(-t / S)
    Where S is memory stability in days.

    Features:
    - 6 Retention States (fresh, stable, at_risk, due, forgotten, insufficient_data)
    - Review Urgency Index factoring mastery value and forgetting risk
    - Adaptive Spaced Retrieval Scheduler
    - Retrieval streak and multi-attempt tracking
    """

    DEFAULT_BASE_STABILITY_DAYS = 7.0
    MIN_REVIEW_THRESHOLD = 0.70   # Below 70% expected recall, review is flagged
    HIGH_STABILITY_THRESHOLD = 14.0

    @classmethod
    def calculate_estimated_retention(
        cls,
        last_retrieval_at: datetime,
        half_life_days: float,
        as_of: Optional[datetime] = None
    ) -> float:
        """
        Calculates expected recall probability R(t) in [0.0, 1.0].
        R(t) = 2^(-t / half_life)
        """
        now = as_of or datetime.utcnow()
        elapsed_days = max(0.0, (now - last_retrieval_at).total_seconds() / 86400.0)
        
        retention = math.pow(2.0, -elapsed_days / max(1.0, half_life_days))
        return round(max(0.05, min(1.0, retention)), 3)

    @classmethod
    def determine_retention_status(
        cls,
        current_retention: float,
        half_life_days: float,
        retrieval_streak: int,
        last_retrieval_at: datetime,
        successful_retrievals: int,
        failed_retrievals: int,
        as_of: Optional[datetime] = None
    ) -> RetentionStatus:
        """
        Classifies current memory health into one of 6 formal states.
        """
        now = as_of or datetime.utcnow()
        elapsed_days = max(0.0, (now - last_retrieval_at).total_seconds() / 86400.0)
        total_retrievals = successful_retrievals + failed_retrievals

        if total_retrievals == 0:
            return RetentionStatus.INSUFFICIENT_DATA

        # If last attempt was a failure and retention is low
        if current_retention < 0.50 or (failed_retrievals > 0 and retrieval_streak == 0 and elapsed_days > 2.0):
            return RetentionStatus.FORGOTTEN

        # Fresh: recently learned and successfully retrieved
        if elapsed_days <= 2.0 and current_retention >= 0.85:
            return RetentionStatus.FRESH

        # Stable: established memory half-life with high retention
        if half_life_days >= cls.HIGH_STABILITY_THRESHOLD and current_retention >= 0.75:
            return RetentionStatus.STABLE

        # Due: below threshold or past due date
        if current_retention < cls.MIN_REVIEW_THRESHOLD:
            return RetentionStatus.DUE

        # At Risk: borderline decay approaching review threshold
        if cls.MIN_REVIEW_THRESHOLD <= current_retention < 0.75:
            return RetentionStatus.AT_RISK

        return RetentionStatus.STABLE

    @classmethod
    def calculate_review_urgency(
        cls,
        retention: float,
        mastery_score: float,
        half_life_days: float
    ) -> float:
        """
        Calculates review urgency score [0.0, 1.0].
        Topics with high investment (high mastery) that are slipping represent
        the highest ROI for learning efficiency.
        """
        decay_gap = max(0.0, 1.0 - retention)
        mastery_weight = max(0.2, min(1.0, mastery_score / 100.0))
        urgency = decay_gap * mastery_weight * 1.5
        return round(min(1.0, max(0.0, urgency)), 2)

    @classmethod
    def update_after_retrieval(
        cls,
        current_state: Optional[RetentionState],
        topic_id: str,
        retrieval_success: bool,
        mastery_score: float
    ) -> RetentionState:
        """
        Calculates new memory stability, status, and urgency after a retrieval attempt.
        - Successful retrieval expands stability: S_new = S_old * (1.7 + 0.15 * streak)
        - Failed retrieval contracts stability: S_new = max(2.0, S_old * 0.45)
        """
        now = datetime.utcnow()
        if current_state is None:
            streak = 1 if retrieval_success else 0
            success_count = 1 if retrieval_success else 0
            failed_count = 0 if retrieval_success else 1
            stability = cls.DEFAULT_BASE_STABILITY_DAYS if retrieval_success else 3.0
            last_success = now if retrieval_success else None
            last_failed = None if retrieval_success else now
        else:
            success_count = current_state.successful_retrievals + (1 if retrieval_success else 0)
            failed_count = current_state.failed_retrievals + (0 if retrieval_success else 1)
            last_success = now if retrieval_success else current_state.last_successful_retrieval_at
            last_failed = current_state.last_failed_retrieval_at if retrieval_success else now

            if retrieval_success:
                streak = current_state.retrieval_streak + 1
                expansion = min(3.0, 1.7 + (0.15 * streak))
                stability = round(current_state.half_life_days * expansion, 1)
            else:
                streak = 0
                stability = round(max(2.0, current_state.half_life_days * 0.45), 1)

        # Calculate days until retention drops to threshold (0.70)
        # log2(0.70) ≈ -0.5146 => days ≈ 0.5146 * stability
        days_until_due = round(max(1.0, stability * 0.5146), 1)
        next_due = now + timedelta(days=days_until_due)
        
        current_retention = 1.0 if retrieval_success else 0.55

        status = cls.determine_retention_status(
            current_retention=current_retention,
            half_life_days=stability,
            retrieval_streak=streak,
            last_retrieval_at=now,
            successful_retrievals=success_count,
            failed_retrievals=failed_count
        )

        urgency = cls.calculate_review_urgency(current_retention, mastery_score, stability)

        return RetentionState(
            topic_id=topic_id,
            initial_mastery=mastery_score,
            current_estimated_retention=current_retention,
            half_life_days=stability,
            retrieval_streak=streak,
            successful_retrievals=success_count,
            failed_retrievals=failed_count,
            last_successful_retrieval_at=last_success,
            last_failed_retrieval_at=last_failed,
            last_retrieval_at=now,
            next_retrieval_due=next_due,
            is_review_due=False,
            status=status,
            review_urgency=urgency
        )

    @classmethod
    def evaluate_retention_risk(cls, state: RetentionState) -> bool:
        """
        Determines whether a concept is in danger of being forgotten.
        """
        current_retention = cls.calculate_estimated_retention(
            state.last_retrieval_at,
            state.half_life_days
        )
        return current_retention < cls.MIN_REVIEW_THRESHOLD
