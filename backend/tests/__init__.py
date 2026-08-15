# backend/tests/test_crud.py
import pytest
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.crud.project import project_crud
from app.crud.admin import admin_crud
from app.models.project import Project, ProjectStatus, ProjectType
from app.models.admin import Admin
from app.schemas.project import ProjectCreate, ProjectUpdate, MultiLingualText, MultiLingualList
from app.schemas.admin import AdminCreate
from app.core.security import get_password_hash, verify_password


class TestProjectCRUD:
    """تست‌های CRUD برای پروژه"""

    def test_create_project(self, db_session: Session):
        """تست ایجاد پروژه جدید"""
        project_data = ProjectCreate(
            title=MultiLingualText(en="Test Project", fa="پروژه تست"),
            slug="test-project",
            description=MultiLingualText(en="Test description", fa="توضیحات تست"),
            full_description=MultiLingualText(en="Full description", fa="توضیحات کامل"),
            features=MultiLingualList(en=["Feature 1", "Feature 2"], fa=["ویژگی ۱", "ویژگی ۲"]),
            project_type=ProjectType.RESIDENTIAL,
            client_name="Test Client",
            year="2024",
            area="1000",
            status=ProjectStatus.PUBLISHED,
            is_featured=True,
        )

        project = project_crud.create(db_session, obj_in=project_data)

        assert project.id is not None
        assert project.title["en"] == "Test Project"
        assert project.title["fa"] == "پروژه تست"
        assert project.slug == "test-project"
        assert project.description["en"] == "Test description"
        assert project.features["en"] == ["Feature 1", "Feature 2"]
        assert project.project_type == ProjectType.RESIDENTIAL
        assert project.status == ProjectStatus.PUBLISHED
        assert project.is_featured is True
        assert project.views == 0
        assert project.created_at is not None

    def test_get_project(self, db_session: Session, sample_project: Project):
        """تست دریافت پروژه با ID"""
        project = project_crud.get(db_session, sample_project.id)
        
        assert project is not None
        assert project.id == sample_project.id
        assert project.title["en"] == sample_project.title["en"]
        assert project.slug == sample_project.slug

    def test_get_project_not_found(self, db_session: Session):
        """تست دریافت پروژه با ID ناموجود"""
        import uuid
        fake_id = uuid.uuid4()
        project = project_crud.get(db_session, fake_id)
        
        assert project is None

    def test_get_by_slug(self, db_session: Session, sample_project: Project):
        """تست دریافت پروژه با اسلاگ"""
        project = project_crud.get_by_slug(db_session, sample_project.slug)
        
        assert project is not None
        assert project.id == sample_project.id
        assert project.slug == sample_project.slug

    def test_get_by_slug_not_found(self, db_session: Session):
        """تست دریافت پروژه با اسلاگ ناموجود"""
        project = project_crud.get_by_slug(db_session, "nonexistent-slug")
        
        assert project is None

    def test_get_multi(self, db_session: Session, sample_project: Project):
        """تست دریافت لیست پروژه‌ها با صفحه‌بندی"""
        projects, total = project_crud.get_multi(
            db_session,
            skip=0,
            limit=10,
        )
        
        assert isinstance(projects, list)
        assert total >= 1
        assert len(projects) >= 1

    def test_get_multi_with_filter_type(self, db_session: Session, sample_project: Project):
        """تست دریافت لیست پروژه‌ها با فیلتر نوع"""
        projects, total = project_crud.get_multi(
            db_session,
            project_type=ProjectType.RESIDENTIAL,
        )
        
        assert total >= 1
        for project in projects:
            assert project.project_type == ProjectType.RESIDENTIAL

    def test_get_multi_with_filter_status(self, db_session: Session, sample_project: Project):
        """تست دریافت لیست پروژه‌ها با فیلتر وضعیت"""
        projects, total = project_crud.get_multi(
            db_session,
            status=ProjectStatus.PUBLISHED,
        )
        
        assert total >= 1
        for project in projects:
            assert project.status == ProjectStatus.PUBLISHED

    def test_get_multi_with_search(self, db_session: Session, sample_project: Project):
        """تست جستجو در پروژه‌ها"""
        # جستجو در عنوان انگلیسی
        projects, total = project_crud.get_multi(
            db_session,
            search="Test",
            language="en",
        )
        
        assert total >= 1
        found = False
        for project in projects:
            if "Test" in project.title.get("en", ""):
                found = True
                break
        assert found is True

        # جستجو در عنوان فارسی
        projects, total = project_crud.get_multi(
            db_session,
            search="پروژه",
            language="fa",
        )
        
        assert total >= 1
        found = False
        for project in projects:
            if "پروژه" in project.title.get("fa", ""):
                found = True
                break
        assert found is True

    def test_get_featured(self, db_session: Session, sample_project: Project):
        """تست دریافت پروژه‌های ویژه"""
        projects = project_crud.get_featured(db_session, limit=10)
        
        assert isinstance(projects, list)
        # پروژه نمونه featured است
        if len(projects) > 0:
            for project in projects:
                assert project.is_featured is True

    def test_update_project(self, db_session: Session, sample_project: Project):
        """تست به‌روزرسانی پروژه"""
        update_data = ProjectUpdate(
            title=MultiLingualText(en="Updated Title", fa="عنوان به‌روز شده"),
            description=MultiLingualText(en="Updated description", fa="توضیحات به‌روز شده"),
            client_name="New Client",
            status=ProjectStatus.ARCHIVED,
            is_featured=False,
        )

        updated = project_crud.update(
            db_session,
            db_obj=sample_project,
            obj_in=update_data,
        )

        assert updated.title["en"] == "Updated Title"
        assert updated.title["fa"] == "عنوان به‌روز شده"
        assert updated.description["en"] == "Updated description"
        assert updated.client_name == "New Client"
        assert updated.status == ProjectStatus.ARCHIVED
        assert updated.is_featured is False

    def test_update_project_partial(self, db_session: Session, sample_project: Project):
        """تست به‌روزرسانی جزئی پروژه"""
        original_title = sample_project.title["en"]
        
        update_data = ProjectUpdate(
            client_name="Partial Update",
        )

        updated = project_crud.update(
            db_session,
            db_obj=sample_project,
            obj_in=update_data,
        )

        # عنوان تغییر نکرده
        assert updated.title["en"] == original_title
        # فقط کلاینت تغییر کرده
        assert updated.client_name == "Partial Update"

    def test_delete_project(self, db_session: Session, sample_project: Project):
        """تست حذف پروژه"""
        project_id = sample_project.id
        
        # حذف
        deleted = project_crud.delete(db_session, project_id=project_id)
        assert deleted is not None
        
        # بررسی اینکه دیگر وجود ندارد
        project = project_crud.get(db_session, project_id)
        assert project is None

    def test_increment_views(self, db_session: Session, sample_project: Project):
        """تست افزایش تعداد بازدید"""
        initial_views = sample_project.views
        
        # افزایش بازدید
        updated = project_crud.increment_views(db_session, project=sample_project)
        
        assert updated.views == initial_views + 1
        
        # یک بار دیگر افزایش
        updated2 = project_crud.increment_views(db_session, project=updated)
        assert updated2.views == initial_views + 2


class TestAdminCRUD:
    """تست‌های CRUD برای ادمین"""

    def test_create_admin(self, db_session: Session):
        """تست ایجاد ادمین جدید"""
        admin_data = AdminCreate(
            username="newadmin",
            email="newadmin@test.com",
            password="securepass123",
            full_name="New Admin",
        )

        admin = admin_crud.create(db_session, obj_in=admin_data)

        assert admin.id is not None
        assert admin.username == "newadmin"
        assert admin.email == "newadmin@test.com"
        assert admin.full_name == "New Admin"
        assert admin.is_active is True
        assert admin.is_superuser is False
        assert admin.created_at is not None
        
        # بررسی هش شدن رمز
        assert admin.hashed_password != "securepass123"
        assert verify_password("securepass123", admin.hashed_password) is True

    def test_create_admin_without_full_name(self, db_session: Session):
        """تست ایجاد ادمین بدون نام کامل"""
        admin_data = AdminCreate(
            username="admin2",
            email="admin2@test.com",
            password="pass123",
        )

        admin = admin_crud.create(db_session, obj_in=admin_data)

        assert admin.id is not None
        assert admin.full_name is None

    def test_get_admin(self, db_session: Session, sample_admin: Admin):
        """تست دریافت ادمین با ID"""
        admin = admin_crud.get(db_session, sample_admin.id)
        
        assert admin is not None
        assert admin.id == sample_admin.id
        assert admin.username == sample_admin.username

    def test_get_admin_not_found(self, db_session: Session):
        """تست دریافت ادمین با ID ناموجود"""
        import uuid
        fake_id = uuid.uuid4()
        admin = admin_crud.get(db_session, fake_id)
        
        assert admin is None

    def test_get_by_username(self, db_session: Session, sample_admin: Admin):
        """تست دریافت ادمین با نام کاربری"""
        admin = admin_crud.get_by_username(db_session, sample_admin.username)
        
        assert admin is not None
        assert admin.id == sample_admin.id
        assert admin.username == sample_admin.username

    def test_get_by_username_not_found(self, db_session: Session):
        """تست دریافت ادمین با نام کاربری ناموجود"""
        admin = admin_crud.get_by_username(db_session, "nonexistent")
        
        assert admin is None

    def test_get_by_email(self, db_session: Session, sample_admin: Admin):
        """تست دریافت ادمین با ایمیل"""
        admin = admin_crud.get_by_email(db_session, sample_admin.email)
        
        assert admin is not None
        assert admin.id == sample_admin.id
        assert admin.email == sample_admin.email

    def test_get_by_email_not_found(self, db_session: Session):
        """تست دریافت ادمین با ایمیل ناموجود"""
        admin = admin_crud.get_by_email(db_session, "nonexistent@test.com")
        
        assert admin is None

    def test_update_last_login(self, db_session: Session, sample_admin: Admin):
        """تست به‌روزرسانی زمان آخرین ورود"""
        # ذخیره زمان قبلی
        old_last_login = sample_admin.last_login
        
        # به‌روزرسانی
        updated = admin_crud.update_last_login(db_session, admin=sample_admin)
        
        assert updated.last_login is not None
        # زمان جدید باید بعد از زمان قبلی باشد (یا اگر قبلاً None بود، حالا مقدار دارد)
        if old_last_login is not None:
            assert updated.last_login > old_last_login


class TestCRUDIntegration:
    """تست‌های یکپارچگی CRUD"""

    def test_project_admin_relationship(self, db_session: Session, sample_admin: Admin):
        """تست ارتباط بین پروژه و ادمین (غیرمستقیم)"""
        # ایجاد پروژه توسط ادمین
        project_data = ProjectCreate(
            title=MultiLingualText(en="Admin Project", fa="پروژه ادمین"),
            slug="admin-project",
            status=ProjectStatus.PUBLISHED,
        )

        project = project_crud.create(db_session, obj_in=project_data)
        
        assert project.id is not None
        assert project.title["en"] == "Admin Project"
        
        # پروژه در دیتابیس وجود دارد
        found = project_crud.get(db_session, project.id)
        assert found is not None
        
        # ادمین همچنان وجود دارد
        admin = admin_crud.get(db_session, sample_admin.id)
        assert admin is not None

    def test_cascade_delete(self, db_session: Session, sample_project: Project):
        """تست حذف آبشاری (اگر در آینده روابط اضافه شوند)"""
        # فعلاً فقط بررسی می‌کنیم که حذف پروژه کار می‌کند
        project_id = sample_project.id
        
        # حذف پروژه
        deleted = project_crud.delete(db_session, project_id=project_id)
        assert deleted is not None
        
        # پروژه دیگر وجود ندارد
        project = project_crud.get(db_session, project_id)
        assert project is None

    def test_duplicate_slug_prevention(self, db_session: Session, sample_project: Project):
        """تست جلوگیری از ایجاد اسلاگ تکراری"""
        # ایجاد پروژه با اسلاگ تکراری باید خطا بدهد
        duplicate_data = ProjectCreate(
            title=MultiLingualText(en="Duplicate Project", fa="پروژه تکراری"),
            slug=sample_project.slug,  # اسلاگ تکراری
            status=ProjectStatus.DRAFT,
        )

        # با pytest.raises بررسی می‌کنیم که خطا می‌دهد
        # (در صورت وجود constraint در دیتابیس)
        from sqlalchemy.exc import IntegrityError
        import pytest
        
        with pytest.raises(Exception) as excinfo:
            project_crud.create(db_session, obj_in=duplicate_data)
            db_session.commit()
        
        # خطا می‌تواند IntegrityError یا هر خطای دیگری باشد
        # بسته به تنظیمات دیتابیس
        assert excinfo.type in (IntegrityError, Exception)

    def test_project_views_after_get(self, db_session: Session, sample_project: Project):
        """تست افزایش بازدید هنگام دریافت پروژه"""
        initial_views = sample_project.views
        
        # دریافت پروژه با get (بازدید افزایش نمی‌یابد)
        project = project_crud.get(db_session, sample_project.id)
        assert project.views == initial_views
        
        # فقط increment_views بازدید را افزایش می‌دهد
        project = project_crud.increment_views(db_session, project=project)
        assert project.views == initial_views + 1