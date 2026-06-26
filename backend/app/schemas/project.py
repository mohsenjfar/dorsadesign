# backend/app/schemas/project.py
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.project import ProjectStatus, ProjectType


# ============================================
# ✅ مدل‌های تک‌زبانه (فقط فارسی)
# ============================================

class ProjectBase(BaseModel):
    """Base project schema - فقط فارسی"""
    title: str = Field(..., min_length=1, max_length=255, description="عنوان پروژه")
    description: Optional[str] = Field(None, description="توضیحات کوتاه")
    full_description: Optional[str] = Field(None, description="توضیحات کامل")
    features: Optional[List[str]] = Field(default=[], description="ویژگی‌ها")
    project_type: Optional[ProjectType] = None
    client_name: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=20)
    area: Optional[str] = Field(None, max_length=50)
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT)
    cover_image: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[str] = None
    is_featured: bool = Field(default=False)


class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    full_description: Optional[str] = None
    features: Optional[List[str]] = None
    project_type: Optional[ProjectType] = None
    client_name: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=20)
    area: Optional[str] = Field(None, max_length=50)
    status: Optional[ProjectStatus] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[str] = None
    is_featured: Optional[bool] = None


# ============================================
# ✅ Response Schemas
# ============================================

class ProjectResponse(BaseModel):
    """Schema for project response"""
    id: UUID
    title: str
    description: Optional[str] = None
    full_description: Optional[str] = None
    features: Optional[List[str]] = []
    project_type: Optional[ProjectType] = None
    client_name: Optional[str] = None
    year: Optional[str] = None
    area: Optional[str] = None
    status: ProjectStatus
    cover_image: Optional[str] = None
    gallery_images: Optional[str] = None
    is_featured: bool
    views: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for project list response (lightweight)"""
    id: UUID
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    project_type: Optional[ProjectType] = None
    is_featured: bool
    features: Optional[List[str]] = []
    views: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectList(BaseModel):
    """Wrapper for paginated project list"""
    items: List[ProjectListResponse]
    total: int
    page: int
    page_size: int
    pages: int