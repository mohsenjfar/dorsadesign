# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.crud.admin import admin_crud
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
)
from app.schemas.admin import (
    AdminLogin,
    TokenResponse,
    AdminResponse,
    AdminCreate,
    AdminUpdate
)

from app.models.admin import Admin 

router = APIRouter(tags=["Authentication"])


# ============================================
# Public Auth Endpoints
# ============================================

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: AdminLogin,
    db: Session = Depends(get_db),
):
    """
    Admin login endpoint
    
    Returns access and refresh tokens upon successful authentication
    """
    # Find admin by username
    admin = admin_crud.get_by_username(db, username=login_data.username)
    
    # Check if admin exists and is active
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    admin_crud.update_last_login(db, admin=admin)
    
    # Create tokens
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "username": admin.username,
            "is_superuser": admin.is_superuser,
        }
    )
    refresh_token = create_refresh_token(
        data={"sub": str(admin.id)}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# ============================================
# Alternative login using OAuth2 form (for Swagger)
# ============================================

@router.post("/login-form", response_model=TokenResponse)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login endpoint using OAuth2 form (for Swagger UI compatibility)
    """
    # Find admin by username
    admin = admin_crud.get_by_username(db, username=form_data.username)
    
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    if not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Update last login
    admin_crud.update_last_login(db, admin=admin)
    
    # Create tokens
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "username": admin.username,
            "is_superuser": admin.is_superuser,
        }
    )
    refresh_token = create_refresh_token(
        data={"sub": str(admin.id)}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# ============================================
# Token Refresh
# ============================================

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token
    """
    from app.core.security import validate_token, create_access_token, create_refresh_token
    
    # Validate refresh token
    payload = validate_token(refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    # Get admin ID from token
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Check if admin exists and is active
    from uuid import UUID
    admin = admin_crud.get(db, UUID(admin_id))
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found or inactive",
        )
    
    # Create new tokens
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "username": admin.username,
            "is_superuser": admin.is_superuser,
        }
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(admin.id)}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


# ============================================
# Logout
# ============================================

@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
):
    """
    Logout endpoint (client-side token removal)
    """
    # Since we use stateless JWT, logout is handled client-side
    # by removing the token from localStorage
    return {
        "message": "Successfully logged out",
        "detail": "Please remove the token from your client storage"
    }


# ============================================
# Current User Info
# ============================================

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current admin information
    """
    from uuid import UUID
    
    admin = admin_crud.get(db, UUID(current_user["user_id"]))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    return admin


# ============================================
# Create First Admin (Seed) - For Development Only
# ============================================

@router.post("/seed", response_model=AdminResponse)
async def create_first_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
):
    """
    Create the first admin user (for development only)
    """
    # Check if any admin exists
    first_admin = db.query(Admin).first()
    if first_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin already exists. Use admin creation via admin panel.",
        )
    
    # Check if username exists
    if admin_crud.get_by_username(db, admin_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    
    # Check if email exists
    if admin_crud.get_by_email(db, admin_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create admin
    admin = admin_crud.create(db, obj_in=admin_data)
    
    return admin

@router.put("/profile", response_model=AdminResponse)
async def update_admin_profile(
    profile_in: AdminUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_user),
):
    """
    به‌روزرسانی اطلاعات ادمین (فقط ادمین)
    
    - تغییر نام کامل
    - تغییر ایمیل
    - تغییر رمز عبور (با تأیید رمز فعلی)
    """
    from uuid import UUID
    from app.core.security import verify_password, get_password_hash

    # دریافت ادمین از دیتابیس
    admin = admin_crud.get(db, UUID(current_admin["user_id"]))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    # ============================================
    # تغییر رمز عبور (اگر درخواست شده)
    # ============================================
    if profile_in.current_password and profile_in.new_password:
        # بررسی رمز فعلی
        if not verify_password(profile_in.current_password, admin.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        # هش کردن رمز جدید
        admin.hashed_password = get_password_hash(profile_in.new_password)

    # ============================================
    # به‌روزرسانی سایر فیلدها
    # ============================================
    if profile_in.full_name is not None:
        admin.full_name = profile_in.full_name
    
    if profile_in.email is not None:
        # بررسی تکراری نبودن ایمیل (به جز خود ادمین)
        existing = admin_crud.get_by_email(db, profile_in.email)
        if existing and existing.id != admin.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        admin.email = profile_in.email

    db.add(admin)
    db.commit()
    db.refresh(admin)

    # ✅ بازگرداندن اطلاعات به‌روز شده
    return admin