# backend/app/models/project.py
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON  # ✅ JSON را اضافه کنید
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


class ProjectStatus(str, enum.Enum):
    """Project status options"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProjectType(str, enum.Enum):
    """Architecture project types"""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    OFFICE = "office"
    VILLA = "villa"
    CULTURAL = "cultural"
    EDUCATIONAL = "educational"
    OTHER = "other"


class Project(Base):
    """Architecture project model with multilingual support"""
    __tablename__ = "projects"

    # ============================================
    # Core Fields
    # ============================================
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # ✅ فیلدهای چندزبانه به صورت JSON
    title = Column(
        JSON,
        nullable=False,
        comment="Multilingual title: {'en': '...', 'fa': '...'}"
    )
    
    slug = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique URL identifier"
    )
    
    description = Column(
        JSON,
        nullable=True,
        comment="Multilingual short description: {'en': '...', 'fa': '...'}"
    )
    
    full_description = Column(
        JSON,
        nullable=True,
        comment="Multilingual full description: {'en': '...', 'fa': '...'}"
    )
    
    features = Column(
        JSON,
        nullable=True,
        comment="Multilingual features: {'en': ['feat1', 'feat2'], 'fa': ['...']}"
    )

    # ============================================
    # Project Information (غیر چندزبانه)
    # ============================================
    
    project_type = Column(
        Enum(ProjectType),
        nullable=True,
        comment="Type of project"
    )
    
    client_name = Column(
        String(255),
        nullable=True,
        comment="Client name"
    )
    
    year = Column(
        String(20),
        nullable=True,
        comment="Project year"
    )
    
    area = Column(
        String(50),
        nullable=True,
        comment="Area in square meters"
    )
    
    status = Column(
        Enum(ProjectStatus),
        default=ProjectStatus.DRAFT,
        nullable=False,
        comment="Publication status"
    )

    # ============================================
    # Images
    # ============================================
    
    cover_image = Column(
        String(500),
        nullable=True,
        comment="Cover image URL"
    )
    
    gallery_images = Column(
        String(500),
        nullable=True,
        comment="Gallery image URLs (comma-separated)"
    )

    # ============================================
    # Additional Features
    # ============================================
    
    is_featured = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Show in featured section"
    )
    
    views = Column(
        Integer,
        default=0,
        nullable=False,
        comment="View count"
    )

    # ============================================
    # Timestamps
    # ============================================
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Creation timestamp"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Last update timestamp"
    )

    # ============================================
    # Helper Methods
    # ============================================
    
    def get_translation(self, field: str, language: str = 'en') -> str:
        """Get translated value for a field"""
        value = getattr(self, field, None)
        if isinstance(value, dict):
            return value.get(language, value.get('en', ''))
        return value
    
    def __repr__(self):
        return f"<Project {self.get_translation('title')}>"