# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
import hashlib
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ============================================
# Password Hashing (with pre-hashing)
# ============================================

def _prehash_password(password: str) -> str:
    """
    Pre-hash password with SHA256 to handle bcrypt's 72-byte limit.
    This ensures any length password works with bcrypt.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt with pre-hashing"""
    prehashed = _prehash_password(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(prehashed.encode(), salt).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    prehashed = _prehash_password(plain_password)
    return bcrypt.checkpw(prehashed.encode(), hashed_password.encode())

# ============================================
# JWT Token Functions
# ============================================

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token"""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError as e:
        logger.warning(f"Token validation failed: {e}")
        return None

def validate_token(token: str, token_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Validate a JWT token with optional type check"""
    payload = decode_token(token)
    if not payload:
        return None
    
    if token_type and payload.get("type") != token_type:
        logger.warning(f"Invalid token type: expected {token_type}, got {payload.get('type')}")
        return None
    
    exp = payload.get("exp")
    if exp:
        exp_datetime = datetime.fromtimestamp(exp, tz=timezone.utc)
        if datetime.now(timezone.utc) > exp_datetime:
            logger.warning("Token has expired")
            return None
    
    return payload

def get_current_user_id(token: str) -> Optional[str]:
    """Extract user ID from a valid JWT token"""
    payload = validate_token(token, token_type="access")
    return payload.get("sub") if payload else None

# ============================================
# FastAPI Dependencies
# ============================================

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """FastAPI dependency to get current user from token"""
    payload = validate_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "user_id": user_id,
        "username": payload.get("username"),
        "exp": payload.get("exp"),
    }

async def get_current_admin(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """FastAPI dependency to get current admin from token"""
    return await get_current_user(token)