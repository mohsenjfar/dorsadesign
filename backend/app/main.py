# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from app.config import settings
from app.database import test_connection
from app.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting dorsadesign.ir API...")
    if test_connection():
        logger.info("✅ Connected to PostgreSQL")
    else:
        logger.error("❌ Failed to connect to PostgreSQL!")
    yield
    logger.info("🛑 Shutting down dorsadesign.ir API...")


app = FastAPI(
    title="dorsadesign.ir API",
    description="🏛️ Architecture Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.router.redirect_slashes = False

app.include_router(api_router, prefix="/api")

# ============================================
# ✅ سرو فایل‌های استاتیک (آپلودها)
# ============================================
# ✅ از settings.UPLOAD_DIR استفاده کنید
UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

logger.info(f"📁 Upload directory: {UPLOAD_DIR}")
logger.info(f"📁 Exists: {os.path.exists(UPLOAD_DIR)}")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ============================================
# ✅ Middleware
# ============================================
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# ✅ Health Check
# ============================================
@app.get("/")
async def root():
    return {
        "message": "🚀 dorsadesign.ir API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    if test_connection():
        return {"status": "healthy", "database": "connected"}
    return {"status": "unhealthy", "database": "disconnected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )