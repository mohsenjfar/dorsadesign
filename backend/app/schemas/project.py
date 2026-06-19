# backend/app/schemas/project.py
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from app.models.project import ProjectStatus, ProjectType


# ============================================
# Base Schema
# ============================================

class ProjectBase(BaseModel):
    """Base project schema with common fields"""
    title: str = Field(..., min_length=3, max_length=255, description="Project title")
    slug: str = Field(..., min_length=3, max_length=255, description="Unique URL identifier")
    description: Optional[str] = Field(None, description="Short description")
    full_description: Optional[str] = Field(None, description="Full project description")
    project_type: Optional[ProjectType] = Field(None, description="Type of project")
    client_name: Optional[str] = Field(None, max_length=255, description="Client name")
    year: Optional[str] = Field(None, max_length=20, description="Project year")
    area: Optional[str] = Field(None, max_length=50, description="Area in square meters")
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT, description="Publication status")
    cover_image: Optional[str] = Field(None, max_length=500, description="Cover image URL")
    gallery_images: Optional[str] = Field(None, description="Gallery image URLs (comma-separated)")
    is_featured: bool = Field(default=False, description="Show in featured section")


# ============================================
# Create Schemas
# ============================================

class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project"""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    slug: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    full_description: Optional[str] = None
    project_type: Optional[ProjectType] = None
    client_name: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=20)
    area: Optional[str] = Field(None, max_length=50)
    status: Optional[ProjectStatus] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[str] = None
    is_featured: Optional[bool] = None


# ============================================
# Response Schemas
# ============================================

class ProjectResponse(ProjectBase):
    """Schema for project response (full details)"""
    id: UUID
    views: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Pydantic v2 (formerly orm_mode)


class ProjectListResponse(BaseModel):
    """Schema for project list response (lightweight)"""
    id: UUID
    title: str
    slug: str
    description: Optional[str]
    cover_image: Optional[str]
    project_type: Optional[ProjectType]
    is_featured: bool
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