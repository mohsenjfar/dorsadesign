# backend/app/api/__init__.py
from fastapi import APIRouter
from app.api.projects import router as projects_router

# Create main API router
api_router = APIRouter()

# Include all sub-routers
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])

__all__ = [
    "api_router",
]