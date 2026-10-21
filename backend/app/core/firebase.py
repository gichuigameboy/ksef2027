import logging
import os
from typing import Optional, Any
try:
    import firebase_admin
    from firebase_admin import credentials, auth
    HAS_FIREBASE_ADMIN = True
except ImportError:
    firebase_admin = None
    credentials = None
    auth = None
    HAS_FIREBASE_ADMIN = False
from app.core.config import settings

logger = logging.getLogger(__name__)

_firebase_app: Optional[Any] = None

def initialize_firebase() -> Optional[Any]:
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if not HAS_FIREBASE_ADMIN or firebase_admin is None:
        logger.info("firebase_admin package not installed. Running in development auth mode.")
        return None

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    try:
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred, {
                'projectId': settings.FIREBASE_PROJECT_ID
            })
            logger.info("Firebase Admin SDK initialized successfully with service account.")
        else:
            # No explicit credentials path — stay in development/test auth mode.
            # Do NOT attempt Application Default Credentials: this causes GCP metadata
            # server connection attempts which fail in local test environments and
            # produce misleading 401s when the token bypass path is never reached.
            logger.info(
                "FIREBASE_CREDENTIALS_PATH not set. "
                "Running in development auth mode (mock token bypass active)."
            )
            _firebase_app = None
    except Exception as e:
        logger.error(f"Error initializing Firebase Admin SDK: {e}")
        _firebase_app = None

    return _firebase_app

def get_firebase_app() -> Optional[Any]:
    return _firebase_app
