# backend/test_jwt.py
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_token,
    get_password_hash,
    verify_password,
)
import uuid

def test_password_hashing():
    """Test password hashing and verification"""
    password = "test123456"
    hashed = get_password_hash(password)
    print(f"✅ Password hash: {hashed[:30]}...")
    
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False
    print("✅ Password hashing works!")


def test_jwt_tokens():
    """Test JWT creation and validation"""
    user_id = str(uuid.uuid4())
    username = "test_admin"
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": user_id, "username": username}
    )
    refresh_token = create_refresh_token(
        data={"sub": user_id}
    )
    
    print(f"✅ Access token: {access_token[:30]}...")
    print(f"✅ Refresh token: {refresh_token[:30]}...")
    
    # Validate tokens
    decoded_access = decode_token(access_token)
    decoded_refresh = decode_token(refresh_token)
    
    assert decoded_access is not None
    assert decoded_refresh is not None
    assert decoded_access.get("sub") == user_id
    assert decoded_access.get("username") == username
    assert decoded_refresh.get("type") == "refresh"
    
    print("✅ JWT tokens work!")


if __name__ == "__main__":
    test_password_hashing()
    print()
    test_jwt_tokens()