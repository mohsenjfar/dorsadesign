# backend/app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ✅ Base for all models
Base = declarative_base()

# ============================================
# ✅ IMPORTANT: Import all models for Alembic
# ============================================
# This ensures Alembic can discover all models
from app.models import Project, Admin  # noqa

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Successfully connected to PostgreSQL!")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection error: {e}")
        return False