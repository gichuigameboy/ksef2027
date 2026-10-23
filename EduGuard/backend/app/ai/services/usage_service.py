import uuid
import logging
from datetime import datetime
from typing import List, Optional
from app.ai.schemas import AIUsageLog

logger = logging.getLogger(__name__)

class AIUsageService:
    """
    Safely records AI request telemetry without logging sensitive student text,
    tokens, passwords, or curriculum secrets.
    """
    def __init__(self):
        self._logs: List[AIUsageLog] = []

    def log_request(
        self,
        student_id: str,
        request_type: str,
        model: str,
        latency_ms: int,
        success: bool,
        error_message: Optional[str] = None
    ) -> AIUsageLog:
        log_entry = AIUsageLog(
            request_id=f"ai_req_{uuid.uuid4().hex[:12]}",
            student_id=student_id,
            request_type=request_type,
            model=model,
            latency_ms=latency_ms,
            success=success,
            error_message=error_message,
            timestamp=datetime.utcnow()
        )
        self._logs.append(log_entry)
        if not success:
            logger.warning(f"AI Request [{request_type}] for student [{student_id}] failed: {error_message}")
        else:
            logger.info(f"AI Request [{request_type}] completed via [{model}] in {latency_ms}ms")
        return log_entry

    def get_student_logs(self, student_id: str, limit: int = 50) -> List[AIUsageLog]:
        return [l for l in reversed(self._logs) if l.student_id == student_id][:limit]

    def get_recent_logs(self, limit: int = 100) -> List[AIUsageLog]:
        return list(reversed(self._logs))[:limit]

ai_usage_service = AIUsageService()
