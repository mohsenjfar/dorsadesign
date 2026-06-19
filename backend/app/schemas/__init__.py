# backend/app/schemas/__init__.py
from app.schemas.project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectList,
)
from app.schemas.admin import (
    AdminLogin,
    AdminRegister,
    AdminResponse,
    AdminUpdate,
    TokenResponse,
    TokenRefresh,
    TokenData,
)

__all__ = [
    # Project schemas
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectListResponse",
    "ProjectList",
    # Admin schemas
    "AdminLogin",
    "AdminRegister",
    "AdminResponse",
    "AdminUpdate",
    "TokenResponse",
    "TokenRefresh",
    "TokenData",
]