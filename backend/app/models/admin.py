# backend/app/models/admin.py
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Admin(Base):
    """Admin user model for authentication and management"""
    __tablename__ = "admins"

    # ============================================
    # Core Fields
    # ============================================
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique username for login"
    )
    
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Admin email address"
    )
    
    hashed_password = Column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password"
    )

    # ============================================
    # Profile Information
    # ============================================
    
    full_name = Column(
        String(255),
        nullable=True,
        comment="Admin's full name"
    )

    # ============================================
    # Status & Activity
    # ============================================
    
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Account active status"
    )
    
    is_superuser = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Superuser with full access"
    )

    # ============================================
    # Timestamps
    # ============================================
    
    last_login = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last login timestamp"
    )
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Account creation timestamp"
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
        return f"<Admin {self.username}>"
    
    def __str__(self):
        return self.username