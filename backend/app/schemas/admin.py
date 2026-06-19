# backend/app/schemas/admin.py
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


# ============================================
# Auth Schemas
# ============================================

class AdminLogin(BaseModel):
    """Admin login request schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=6, description="Password")


class AdminRegister(BaseModel):
    """Admin registration request schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password")
    full_name: Optional[str] = Field(None, max_length=255)


# ============================================
# Token Schemas
# ============================================

class TokenResponse(BaseModel):
    """JWT token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # User ID
    username: Optional[str] = None
    exp: Optional[datetime] = None


# ============================================
# Admin Response Schemas
# ============================================

class AdminResponse(BaseModel):
    """Admin user response schema"""
    id: UUID
    username: str
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminUpdate(BaseModel):
    """Admin update request schema"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=255)
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None