# backend/tests/test_api_projects.py
import pytest

class TestProjectsAPI:
    """تست‌های API عمومی پروژه‌ها"""

    def test_get_projects_empty(self, client):
        """تست دریافت لیست پروژه‌ها (خالی)"""
        response = client.get("/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)

    def test_get_projects_with_data(self, client, sample_project):
        """تست دریافت لیست پروژه‌ها (با داده)"""
        response = client.get("/api/projects?language=en")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    def test_get_project_by_slug(self, client, sample_project):
        """تست دریافت پروژه با اسلاگ"""
        response = client.get("/api/projects/test-project?language=en")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "test-project"
        assert data["title"] == "Test Project"
        assert "features" in data
        assert len(data["features"]) == 2

    def test_get_project_by_slug_fa(self, client, sample_project):
        """تست دریافت پروژه به فارسی"""
        response = client.get("/api/projects/test-project?language=fa")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "پروژه تست"
        assert "features" in data
        assert len(data["features"]) == 2
        assert "ویژگی ۱" in data["features"]

    def test_get_project_not_found(self, client):
        """تست پروژه‌ای که وجود ندارد"""
        response = client.get("/api/projects/nonexistent")
        assert response.status_code == 404
        assert "Project with slug 'nonexistent' not found" in response.json()["detail"]

    def test_get_featured_projects(self, client, sample_project):
        """تست دریافت پروژه‌های ویژه"""
        response = client.get("/api/projects/featured?limit=4&language=en")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert data[0]["is_featured"] is True

    def test_filter_by_type(self, client, sample_project):
        """تست فیلتر بر اساس نوع پروژه"""
        response = client.get("/api/projects?project_type=residential&language=en")
        assert response.status_code == 200
        data = response.json()
        if data["total"] > 0:
            for item in data["items"]:
                assert item["project_type"] == "residential"