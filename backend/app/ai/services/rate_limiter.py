from datetime import datetime, date
from typing import Dict, Tuple, Optional
from app.ai.config import ai_config
from app.ai.schemas import AIUsageStats

class AIRateLimiter:
    """
    Tracks and enforces configurable daily and per-session AI query budgets
    to guarantee cost control and prevent abuse.
    """
    def __init__(self):
        # student_id -> (date, count)
        self._daily_counts: Dict[str, Tuple[date, int]] = {}
        # (student_id, session_id) -> count
        self._session_counts: Dict[Tuple[str, str], int] = {}

    def check_and_increment(
        self,
        student_id: str,
        session_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Returns (True, None) if request is within quota;
        returns (False, failure_reason) if rate limit is exceeded.
        """
        today = datetime.utcnow().date()
        stored_date, daily_count = self._daily_counts.get(student_id, (today, 0))

        if stored_date != today:
            daily_count = 0
            self._daily_counts[student_id] = (today, 0)

        if daily_count >= ai_config.MAX_AI_REQUESTS_PER_DAY:
            return False, f"Daily AI assistance limit of {ai_config.MAX_AI_REQUESTS_PER_DAY} requests reached."

        if session_id:
            sess_key = (student_id, session_id)
            sess_count = self._session_counts.get(sess_key, 0)
            if sess_count >= ai_config.MAX_AI_REQUESTS_PER_SESSION:
                return False, f"Session AI limit of {ai_config.MAX_AI_REQUESTS_PER_SESSION} requests reached for this session."
            self._session_counts[sess_key] = sess_count + 1

        self._daily_counts[student_id] = (today, daily_count + 1)
        return True, None

    def get_stats(self, student_id: str, session_id: Optional[str] = None) -> AIUsageStats:
        today = datetime.utcnow().date()
        stored_date, daily_count = self._daily_counts.get(student_id, (today, 0))
        if stored_date != today:
            daily_count = 0

        sess_count = 0
        if session_id:
            sess_count = self._session_counts.get((student_id, session_id), 0)

        remaining = max(0, ai_config.MAX_AI_REQUESTS_PER_DAY - daily_count)

        return AIUsageStats(
            student_id=student_id,
            requests_today=daily_count,
            max_requests_per_day=ai_config.MAX_AI_REQUESTS_PER_DAY,
            requests_remaining=remaining,
            session_requests=sess_count,
            max_requests_per_session=ai_config.MAX_AI_REQUESTS_PER_SESSION
        )

    def reset_for_tests(self):
        self._daily_counts.clear()
        self._session_counts.clear()

ai_rate_limiter = AIRateLimiter()
