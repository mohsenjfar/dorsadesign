# backend/app/api/admin/__init__.py
from fastapi import APIRouter
from app.api.admin.projects import router as admin_projects_router

# ✅ prefix را حذف کنید (یا خالی بگذارید)
admin_router = APIRouter()

admin_router.include_router(
    admin_projects_router,
    tags=["Admin"],
)

__all__ = ["admin_router"]