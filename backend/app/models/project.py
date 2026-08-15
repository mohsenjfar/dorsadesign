# backend/app/models/project.py
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProjectType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    OFFICE = "office"
    VILLA = "villa"
    CULTURAL = "cultural"
    EDUCATIONAL = "educational"
    OTHER = "other"


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    title = Column(String(255), nullable=False, comment="عنوان پروژه")
    description = Column(Text, nullable=True, comment="توضیحات کوتاه")
    full_description = Column(Text, nullable=True, comment="توضیحات کامل")
    features = Column(Text, nullable=True, comment="ویژگی‌ها (جداسازی با کاما)")
    
    project_type = Column(Enum(ProjectType), nullable=True)
    client_name = Column(String(255), nullable=True)
    year = Column(String(20), nullable=True)
    area = Column(String(50), nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    
    cover_image = Column(String(500), nullable=True)
    gallery_images = Column(String(500), nullable=True)
    
    is_featured = Column(Boolean, default=False, nullable=False)
    views = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Project {self.title}>"