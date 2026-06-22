# backend/app/schemas/project.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.models.project import ProjectStatus, ProjectType


# ============================================
# Multilingual Base Models
# ============================================

class MultiLingualText(BaseModel):
    """Model for multilingual text fields"""
    en: str = Field(..., description="English text")
    fa: str = Field(..., description="Persian text")


class MultiLingualList(BaseModel):
    """Model for multilingual list fields"""
    en: List[str] = Field(default=[], description="English list")
    fa: List[str] = Field(default=[], description="Persian list")


# ============================================
# Project Schemas
# ============================================

class ProjectBase(BaseModel):
    """Base project schema with multilingual fields"""
    title: MultiLingualText
    slug: str = Field(..., min_length=3, max_length=255)
    description: Optional[MultiLingualText] = None
    full_description: Optional[MultiLingualText] = None
    features: Optional[MultiLingualList] = None
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
    title: Optional[MultiLingualText] = None
    slug: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[MultiLingualText] = None
    full_description: Optional[MultiLingualText] = None
    features: Optional[MultiLingualList] = None
    project_type: Optional[ProjectType] = None
    client_name: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=20)
    area: Optional[str] = Field(None, max_length=50)
    status: Optional[ProjectStatus] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[str] = None
    is_featured: Optional[bool] = None


# ============================================
# Response Schemas (با پشتیبانی از زبان)
# ============================================

class ProjectResponse(BaseModel):
    """Schema for project response with language support"""
    id: UUID
    title: str = Field(..., description="Translated title based on language")
    slug: str
    description: Optional[str] = Field(None, description="Translated description")
    full_description: Optional[str] = Field(None, description="Translated full description")
    features: Optional[List[str]] = Field(None, description="Translated features list")
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
    title: str = Field(..., description="Translated title")
    slug: str
    description: Optional[str] = Field(None, description="Translated description")
    cover_image: Optional[str] = None
    project_type: Optional[ProjectType] = None
    is_featured: bool
    features: Optional[List[str]] = Field(default=[], description="Translated features list")
    views: int = Field(default=0, description="View count")
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