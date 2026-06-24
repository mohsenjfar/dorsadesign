# backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.core.security import get_password_hash
from app.models.admin import Admin
from app.models.project import Project, ProjectStatus, ProjectType
from app.schemas.project import MultiLingualText, MultiLingualList

import uuid
from datetime import datetime, timezone

# ============================================
# ✅ دیتابیس تست (SQLite in-memory)
# ============================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ایجاد جداول
Base.metadata.create_all(bind=engine)


# ============================================
# ✅ Override dependency برای تست
# ============================================
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# ============================================
# ✅ Client تست
# ============================================
@pytest.fixture
def client():
    return TestClient(app)


# ============================================
# ✅ Session تست
# ============================================
@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# ============================================
# ✅ ایجاد داده‌های نمونه
# ============================================
@pytest.fixture
def sample_admin(db_session):
    admin = Admin(
        id=uuid.uuid4(),
        username="testadmin",
        email="admin@test.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test Admin",
        is_active=True,
        is_superuser=True,
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def sample_project(db_session):
    project = Project(
        id=uuid.uuid4(),
        title={"en": "Test Project", "fa": "پروژه تست"},
        slug="test-project",
        description={"en": "Test description", "fa": "توضیحات تست"},
        full_description={"en": "Full description", "fa": "توضیحات کامل"},
        features={"en": ["Feature 1", "Feature 2"], "fa": ["ویژگی ۱", "ویژگی ۲"]},
        project_type=ProjectType.RESIDENTIAL,
        client_name="Test Client",
        year="2024",
        area="1000",
        status=ProjectStatus.PUBLISHED,
        cover_image="/uploads/test-cover.jpg",
        gallery_images="/uploads/test-1.jpg,/uploads/test-2.jpg",
        is_featured=True,
        views=10,
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


# ============================================
# ✅ توکن احراز هویت برای تست
# ============================================
@pytest.fixture
def auth_token(client, sample_admin):
    response = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpass123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}