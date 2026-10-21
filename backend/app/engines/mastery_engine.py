from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.mastery import MasteryCategory, TopicMastery
from app.models.learning_intelligence import MasteryTrend, DifficultyProfile

class MasteryEngine:
    """
    Advanced Deterministic Mastery Engine 2.0.
    Evaluates authentic learning depth via:
    - Recency weighting (EMA with historic anchoring, preventing single-streak inflation)
    - Multi-tier difficulty progression (basic, medium, hard, application)
    - Question-type & transfer challenge performance
    - Sample-size confidence scoring [0.0, 1.0]
    - Dynamic trend analysis (improving, declining, stable, volatile)
    - Pedagogical mastery gates (higher-order verification required for Mastered)
    """

    @staticmethod
    def get_category(score: float) -> MasteryCategory:
        if score < 40.0:
            return MasteryCategory.CRITICAL
        elif score < 60.0:
            return MasteryCategory.WEAK
        elif score < 75.0:
            return MasteryCategory.DEVELOPING
        elif score < 90.0:
            return MasteryCategory.STRONG
        else:
            return MasteryCategory.MASTERED

    @classmethod
    def calculate_confidence(
        cls,
        total_attempts: int,
        difficulty_breadth: int = 1,
        has_transfer_data: bool = False
    ) -> float:
        """
        Calculates confidence score [0.0, 1.0].
        Avoids false precision when data is sparse.
        At least 8 attempts spanning multiple difficulties are required for high confidence (> 0.8).
        """
        if total_attempts <= 0:
            return 0.0

        # Attempt volume factor (reaches 0.7 at 8 attempts)
        volume_factor = min(0.70, (total_attempts / 10.0) * 0.70)

        # Difficulty diversity factor (up to 4 tiers)
        breadth_factor = min(0.20, (difficulty_breadth / 4.0) * 0.20)

        # Transfer bonus
        transfer_bonus = 0.10 if has_transfer_data else 0.0

        confidence = volume_factor + breadth_factor + transfer_bonus
        return round(min(1.0, max(0.1, confidence)), 2)

    @classmethod
    def detect_trend(cls, score_history: List[float]) -> MasteryTrend:
        """
        Evaluates learning trajectory across chronological attempt snapshots.
        """
        if not score_history or len(score_history) < 3:
            return MasteryTrend.INSUFFICIENT_DATA

        recent_window = score_history[-4:] if len(score_history) >= 4 else score_history
        delta = recent_window[-1] - recent_window[0]

        # Check for volatility (oscillation between high and low)
        diffs = [abs(recent_window[i] - recent_window[i-1]) for i in range(1, len(recent_window))]
        mean_diff = sum(diffs) / len(diffs)
        if mean_diff > 25.0:
            return MasteryTrend.VOLATILE

        if delta >= 15.0:
            return MasteryTrend.RAPIDLY_IMPROVING
        elif delta >= 5.0:
            return MasteryTrend.IMPROVING
        elif delta <= -8.0:
            return MasteryTrend.DECLINING
        else:
            return MasteryTrend.STABLE

    @classmethod
    def apply_mastery_gates(
        cls,
        raw_score: float,
        hard_acc: float,
        app_acc: float,
        transfer_acc: float = 0.0
    ) -> float:
        """
        Mastery Gating: A student cannot earn full 'Mastered' status (> 90%)
        purely by repeating basic/medium questions.
        Requires demonstrable competence on hard/application tiers.
        """
        if raw_score >= 90.0:
            if hard_acc < 50.0 or (app_acc < 50.0 and transfer_acc < 50.0):
                # Cap at top of STRONG category (89.0)
                return 89.0
        return raw_score

    @classmethod
    def calculate_mastery(
        cls,
        basic_acc: float,
        medium_acc: float,
        hard_acc: float,
        app_acc: float,
        recent_acc: float,
        total_attempts: int,
        transfer_acc: float = 0.0
    ) -> float:
        """
        Calculates holistic mastery score (0 - 100).
        Weights:
        - Recent Performance: 35% (trajectory)
        - Difficulty Tier Blend: 35% (20% basic + 30% medium + 50% hard)
        - Application / Transfer: 30% (blend of app + transfer)
        - Sample size confidence dampener scales early fluctuations
        """
        difficulty_score = (0.20 * basic_acc) + (0.30 * medium_acc) + (0.50 * hard_acc)
        effective_app = (0.60 * app_acc) + (0.40 * transfer_acc) if transfer_acc > 0 else app_acc
        
        raw_score = (0.35 * recent_acc) + (0.35 * difficulty_score) + (0.30 * effective_app)
        
        # Sample size confidence multiplier (requires at least 6 attempts for full weight)
        confidence_factor = min(1.0, 0.40 + (0.60 * (min(total_attempts, 6) / 6.0)))
        adjusted_score = raw_score * confidence_factor
        
        # Apply mastery gates to prevent false mastery
        gated_score = cls.apply_mastery_gates(adjusted_score, hard_acc, app_acc, transfer_acc)
        
        return round(max(0.0, min(100.0, gated_score)), 1)

    @classmethod
    def update_topic_mastery(
        cls,
        current_mastery: Optional[TopicMastery],
        new_attempt_correct: bool,
        difficulty: str,
        topic_id: str,
        subject_id: str,
        topic_name: str,
        question_type: str = "multiple_choice",
        is_transfer: bool = False,
        score_history: Optional[List[float]] = None
    ) -> TopicMastery:
        """
        Incrementally and deterministically updates a student's topic mastery after an attempt.
        Applies EMA (alpha=0.35) for recent accuracy and updates difficulty tiers.
        """
        now = datetime.utcnow()
        val = 100.0 if new_attempt_correct else 0.0

        if current_mastery is None:
            basic = val if difficulty == "basic" else 0.0
            med = val if difficulty == "medium" else 0.0
            hard = val if difficulty == "hard" else 0.0
            app = val if difficulty == "application" else 0.0
            recent = val
            practice = val if not is_transfer else 0.0
            transfer = val if is_transfer else 0.0
            attempts = 1
            trend = MasteryTrend.INSUFFICIENT_DATA
        else:
            attempts = current_mastery.attempts_count + 1
            # Exponential Moving Average for recent performance (alpha = 0.35)
            alpha = 0.35
            recent = (alpha * val) + ((1 - alpha) * current_mastery.recent_accuracy)
            
            basic = current_mastery.basic_accuracy
            med = current_mastery.medium_accuracy
            hard = current_mastery.hard_accuracy
            app = current_mastery.application_accuracy
            practice = getattr(current_mastery, 'practice_accuracy', 0.0)
            transfer = getattr(current_mastery, 'transfer_accuracy', 0.0)

            if difficulty == "basic":
                basic = (0.4 * val) + (0.6 * basic)
            elif difficulty == "medium":
                med = (0.4 * val) + (0.6 * med)
            elif difficulty == "hard":
                hard = (0.4 * val) + (0.6 * hard)
            elif difficulty == "application":
                app = (0.4 * val) + (0.6 * app)

            if is_transfer:
                transfer = (0.4 * val) + (0.6 * transfer) if transfer > 0 else val
            else:
                practice = (0.3 * val) + (0.7 * practice) if practice > 0 else val

            # Derive trend from history if provided, or evaluate recent direction
            if score_history:
                trend = cls.detect_trend(score_history)
            else:
                delta = recent - current_mastery.recent_accuracy
                if attempts < 3:
                    trend = MasteryTrend.INSUFFICIENT_DATA
                elif delta >= 10.0:
                    trend = MasteryTrend.RAPIDLY_IMPROVING
                elif delta >= 3.0:
                    trend = MasteryTrend.IMPROVING
                elif delta <= -8.0:
                    trend = MasteryTrend.DECLINING
                else:
                    trend = MasteryTrend.STABLE

        score = cls.calculate_mastery(basic, med, hard, app, recent, attempts, transfer)
        category = cls.get_category(score)

        # Count active difficulty tiers for confidence
        active_tiers = sum(1 for acc in [basic, med, hard, app] if acc > 0)
        confidence = cls.calculate_confidence(attempts, max(1, active_tiers), transfer > 0)

        return TopicMastery(
            topic_id=topic_id,
            subject_id=subject_id,
            topic_name=topic_name,
            mastery_score=score,
            category=category,
            basic_accuracy=round(basic, 1),
            medium_accuracy=round(med, 1),
            hard_accuracy=round(hard, 1),
            application_accuracy=round(app, 1),
            recent_accuracy=round(recent, 1),
            practice_accuracy=round(practice, 1),
            transfer_accuracy=round(transfer, 1),
            confidence=confidence,
            trend=trend,
            attempts_count=attempts,
            last_attempt_at=now,
            updated_at=now
        )
