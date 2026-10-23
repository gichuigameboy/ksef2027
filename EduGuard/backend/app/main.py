from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.routers import health, auth, subjects, learning, diagnosis, ai, teacher

def create_app() -> FastAPI:
    # Initialize Firebase Admin SDK if configured
    initialize_firebase()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Shared intelligence backend powering EduGuard's mastery, retention, and adaptive engines.",
        version="2.0.0",
        openapi_url="/api/v1/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS configuration for cross-platform access (Flutter Web, Desktop, Mobile)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Routers
    app.include_router(health.router)
    app.include_router(auth.router, prefix=settings.API_V1_STR)
    app.include_router(subjects.router, prefix=settings.API_V1_STR)
    app.include_router(learning.router, prefix=settings.API_V1_STR)
    app.include_router(diagnosis.router, prefix=settings.API_V1_STR)
    app.include_router(ai.router, prefix=settings.API_V1_STR)
    app.include_router(teacher.router)

    return app

app = create_app()
