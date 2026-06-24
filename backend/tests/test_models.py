# backend/tests/test_models.py
import pytest
from app.models.project import Project, ProjectStatus, ProjectType
from app.models.admin import Admin

class TestProjectModel:
    """تست‌های مدل پروژه"""

    def test_create_project(self, db_session):
        """تست ایجاد پروژه"""
        project = Project(
            title={"en": "Test", "fa": "تست"},
            slug="test",
            description={"en": "Desc", "fa": "توضیحات"},
            status=ProjectStatus.DRAFT,
        )
        db_session.add(project)
        db_session.commit()

        assert project.id is not None
        assert project.title["en"] == "Test"
        assert project.slug == "test"
        assert project.status == ProjectStatus.DRAFT

    def test_project_get_translation(self, db_session):
        """تست متد get_translation"""
        project = Project(
            title={"en": "English Title", "fa": "عنوان فارسی"},
            slug="test-translation",
        )
        db_session.add(project)
        db_session.commit()

        assert project.get_translation("title", "en") == "English Title"
        assert project.get_translation("title", "fa") == "عنوان فارسی"

    def test_project_default_values(self, db_session):
        """تست مقادیر پیش‌فرض"""
        project = Project(
            title={"en": "Test", "fa": "تست"},
            slug="test-defaults",
        )
        db_session.add(project)
        db_session.commit()

        assert project.status == ProjectStatus.DRAFT
        assert project.is_featured is False
        assert project.views == 0
        assert project.created_at is not None


class TestAdminModel:
    """تست‌های مدل ادمین"""

    def test_create_admin(self, db_session):
        """تست ایجاد ادمین"""
        admin = Admin(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed123",
            full_name="Test User",
            is_active=True,
        )
        db_session.add(admin)
        db_session.commit()

        assert admin.id is not None
        assert admin.username == "testuser"
        assert admin.is_active is True
        assert admin.created_at is not None

    def test_admin_str_method(self, db_session):
        """تست متد __str__"""
        admin = Admin(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed123",
        )
        db_session.add(admin)
        db_session.commit()

        assert str(admin) == "testuser"
        assert repr(admin) == "<Admin testuser>"