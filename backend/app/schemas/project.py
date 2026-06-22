# backend/app/schemas/project.py
from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
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
    title: Union[str, Dict[str, str]] = Field(..., description="Title (translated or full JSON)")
    slug: str
    description: Optional[Union[str, Dict[str, str]]] = Field(None, description="Description")
    full_description: Optional[Union[str, Dict[str, str]]] = Field(None, description="Full description")
    features: Optional[Union[List[str], Dict[str, List[str]]]] = Field(None, description="Features")
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

    # ============================================
    # ✅ Validator برای تبدیل خودکار JSON به رشته
    # ============================================
    @model_validator(mode='before')
    @classmethod
    def validate_translations(cls, data: Any) -> Any:
        """Convert JSON fields to strings if they are dicts"""
        if isinstance(data, dict):
            # اگر title دیکشنری است، مقدار 'en' را استخراج کن
            if 'title' in data and isinstance(data['title'], dict):
                data['title'] = data['title'].get('en', '')
            
            if 'description' in data and isinstance(data['description'], dict):
                data['description'] = data['description'].get('en', '')
            
            if 'full_description' in data and isinstance(data['full_description'], dict):
                data['full_description'] = data['full_description'].get('en', '')
            
            if 'features' in data and isinstance(data['features'], dict):
                data['features'] = data['features'].get('en', [])
        
        return data


class ProjectListResponse(BaseModel):
    """Schema for project list response (lightweight)"""
    id: UUID
    title: Union[str, Dict[str, str]] = Field(..., description="Title")
    slug: str
    description: Optional[Union[str, Dict[str, str]]] = Field(None, description="Description")
    cover_image: Optional[str] = None
    project_type: Optional[ProjectType] = None
    is_featured: bool
    features: Optional[Union[List[str], Dict[str, List[str]]]] = Field(default=[], description="Features")
    views: int = Field(default=0, description="View count")
    created_at: datetime

    class Config:
        from_attributes = True

    # ✅ Validator برای تبدیل خودکار
    @model_validator(mode='before')
    @classmethod
    def validate_translations(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'title' in data and isinstance(data['title'], dict):
                data['title'] = data['title'].get('en', '')
            if 'description' in data and isinstance(data['description'], dict):
                data['description'] = data['description'].get('en', '')
            if 'features' in data and isinstance(data['features'], dict):
                data['features'] = data['features'].get('en', [])
        return data


class ProjectList(BaseModel):
    """Wrapper for paginated project list"""
    items: List[ProjectListResponse]
    total: int
    page: int
    page_size: int
    pages: int