# backend/tests/test_api_admin.py
import pytest

class TestAdminAPI:
    """تست‌های API ادمین"""

    def test_create_project_unauthorized(self, client):
        """تست ایجاد پروژه بدون احراز هویت"""
        project_data = {
            "title": {"en": "New Project", "fa": "پروژه جدید"},
            "slug": "new-project",
            "description": {"en": "Desc", "fa": "توضیحات"},
            "status": "draft",
        }
        response = client.post("/api/admin/projects/", json=project_data)
        assert response.status_code == 401

    def test_create_project_success(self, client, auth_headers):
        """تست ایجاد پروژه با احراز هویت"""
        project_data = {
            "title": {"en": "New Project", "fa": "پروژه جدید"},
            "slug": "new-project",
            "description": {"en": "Test description", "fa": "توضیحات تست"},
            "full_description": {"en": "Full desc", "fa": "توضیحات کامل"},
            "features": {"en": ["Feature 1"], "fa": ["ویژگی ۱"]},
            "project_type": "residential",
            "client_name": "Test Client",
            "year": "2024",
            "area": "1000",
            "status": "published",
            "is_featured": True,
        }
        response = client.post("/api/admin/projects/", json=project_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["slug"] == "new-project"
        assert data["title"] == "New Project"
        assert data["status"] == "published"

    def test_create_project_duplicate_slug(self, client, auth_headers, sample_project):
        """تست ایجاد پروژه با اسلاگ تکراری"""
        project_data = {
            "title": {"en": "Duplicate", "fa": "تکراری"},
            "slug": "test-project",  # اسلاگ تکراری
            "status": "draft",
        }
        response = client.post("/api/admin/projects/", json=project_data, headers=auth_headers)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_update_project(self, client, auth_headers, sample_project):
        """تست ویرایش پروژه"""
        update_data = {
            "title": {"en": "Updated Project", "fa": "پروژه به‌روز شده"},
            "client_name": "New Client",
        }
        response = client.put(
            f"/api/admin/projects/{sample_project.id}",
            json=update_data,
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Project"
        assert data["client_name"] == "New Client"

    def test_delete_project(self, client, auth_headers, sample_project):
        """تست حذف پروژه"""
        response = client.delete(
            f"/api/admin/projects/{sample_project.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    def test_get_project_by_id_admin(self, client, auth_headers, sample_project):
        """تست دریافت پروژه با ID در پنل ادمین"""
        response = client.get(
            f"/api/admin/projects/by-id/{sample_project.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_project.id)
        assert data["slug"] == sample_project.slug