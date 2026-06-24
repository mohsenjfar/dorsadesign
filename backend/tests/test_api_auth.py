# backend/tests/test_api_auth.py
import pytest

class TestAuthAPI:
    """تست‌های API احراز هویت"""

    def test_login_success(self, client, sample_admin):
        """تست ورود موفق"""
        response = client.post(
            "/api/auth/login",
            json={"username": "testadmin", "password": "testpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, sample_admin):
        """تست ورود با رمز اشتباه"""
        response = client.post(
            "/api/auth/login",
            json={"username": "testadmin", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_wrong_username(self, client):
        """تست ورود با نام کاربری اشتباه"""
        response = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "testpass123"},
        )
        assert response.status_code == 401

    def test_get_me_success(self, client, auth_headers):
        """تست دریافت اطلاعات ادمین با توکن معتبر"""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testadmin"
        assert data["email"] == "admin@test.com"

    def test_get_me_unauthorized(self, client):
        """تست دریافت اطلاعات بدون توکن"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_refresh_token(self, client, sample_admin):
        """تست Refresh Token"""
        # ابتدا لاگین
        login_response = client.post(
            "/api/auth/login",
            json={"username": "testadmin", "password": "testpass123"},
        )
        refresh_token = login_response.json()["refresh_token"]

        # درخواست توکن جدید
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert "refresh_token" in response.json()