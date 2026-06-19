# backend/app/models/project.py
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
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
    RESIDENTIAL = "residential"      # مسکونی
    COMMERCIAL = "commercial"        # تجاری
    OFFICE = "office"                # اداری
    VILLA = "villa"                  # ویلایی
    CULTURAL = "cultural"            # فرهنگی
    EDUCATIONAL = "educational"      # آموزشی
    OTHER = "other"                  # سایر


class Project(Base):
    """Architecture project model"""
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
    
    title = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Project title"
    )
    
    slug = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique URL identifier"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Short description"
    )
    
    full_description = Column(
        Text,
        nullable=True,
        comment="Full project description"
    )

    # ============================================
    # Project Information
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
        String(500),  # Simple approach, comma-separated URLs
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
    # Methods
    # ============================================
    
    def __repr__(self):
        return f"<Project {self.title}>"
    
    def __str__(self):
        return self.title