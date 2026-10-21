import hashlib
import json
import time
from typing import Optional, Any, Dict
from app.ai.config import ai_config

class AICacheService:
    """
    In-memory cache for suitable AI responses (e.g. concept explanations,
    static hints, worked examples).
    Guarantees that personalized responses remain strictly isolated per student.
    """
    def __init__(self, ttl_seconds: int = 3600):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._ttl_seconds = ttl_seconds

    def _generate_key(self, scope: str, payload: Dict[str, Any], student_id: Optional[str] = None) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        hash_digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]
        if student_id:
            return f"{scope}:{student_id}:{hash_digest}"
        return f"{scope}:shared:{hash_digest}"

    def get(self, scope: str, payload: Dict[str, Any], student_id: Optional[str] = None) -> Optional[Any]:
        if not ai_config.AI_CACHE_ENABLED:
            return None

        key = self._generate_key(scope, payload, student_id)
        entry = self._cache.get(key)
        if not entry:
            return None

        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None

        return entry["data"]

    def set(self, scope: str, payload: Dict[str, Any], data: Any, student_id: Optional[str] = None):
        if not ai_config.AI_CACHE_ENABLED:
            return

        key = self._generate_key(scope, payload, student_id)
        self._cache[key] = {
            "data": data,
            "expires_at": time.time() + self._ttl_seconds
        }

    def clear(self):
        self._cache.clear()

ai_cache = AICacheService()
