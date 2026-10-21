import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduGuard Intelligence Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Gemini AI Models (Configurable via env)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_FAST_MODEL: str = os.getenv("GEMINI_FAST_MODEL", os.getenv("AI_HIGH_SPEED_MODEL", "gemini-2.5-flash"))
    GEMINI_REASONING_MODEL: str = os.getenv("GEMINI_REASONING_MODEL", os.getenv("AI_REASONING_MODEL", "gemini-2.5-pro"))
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    # AI Rate Limiting & Safety
    MAX_AI_REQUESTS_PER_SESSION: int = int(os.getenv("MAX_AI_REQUESTS_PER_SESSION", "25"))
    MAX_AI_REQUESTS_PER_DAY: int = int(os.getenv("MAX_AI_REQUESTS_PER_DAY", "100"))
    AI_CACHE_ENABLED: bool = os.getenv("AI_CACHE_ENABLED", "true").lower() in ("true", "1", "yes")
    
    # Firebase Configuration (ksef-project-dylan)
    FIREBASE_CREDENTIALS_PATH: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_PATH", None)
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "ksef-project-dylan")
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "AIzaSyABnASkg15jc5wxF5PRDwLhVrEeS5SyZzQ")
    FIREBASE_AUTH_DOMAIN: str = os.getenv("FIREBASE_AUTH_DOMAIN", "ksef-project-dylan.firebaseapp.com")
    FIREBASE_DATABASE_URL: str = os.getenv("FIREBASE_DATABASE_URL", "https://ksef-project-dylan-default-rtdb.firebaseio.com")
    FIREBASE_STORAGE_BUCKET: str = os.getenv("FIREBASE_STORAGE_BUCKET", "ksef-project-dylan.firebasestorage.app")
    FIREBASE_MESSAGING_SENDER_ID: str = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "1045853328419")
    FIREBASE_APP_ID: str = os.getenv("FIREBASE_APP_ID", "1:1045853328419:web:0d5e8d51a2ce8a64f00d96")
    FIREBASE_MEASUREMENT_ID: str = os.getenv("FIREBASE_MEASUREMENT_ID", "G-QXYBP0T2SN")

    # Learning Engine Parameters
    MIN_RETENTION_THRESHOLD: float = 0.70  # 70% retention decay triggers review
    MASTERY_DECAY_HALF_LIFE_DAYS: float = 14.0 # Base memory half life

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
