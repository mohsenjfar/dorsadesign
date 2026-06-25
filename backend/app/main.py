# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# ============================================
# ✅ مسیرهای API و آپلود
# ============================================
app.include_router(api_router, prefix="/api")

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ============================================
# ✅ سرو فایل‌های استاتیک فرانت‌اند
# ============================================
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
FRONTEND_DIR = os.path.abspath(FRONTEND_DIR)

if os.path.exists(FRONTEND_DIR):
    # سرو فایل‌های assets (css, js, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """سرو صفحات فرانت‌اند (SPA)"""
        file_path = os.path.join(FRONTEND_DIR, full_path)
        
        # اگر فایل وجود داشت، برگردون
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # در غیر این صورت، index.html رو برگردون (برای SPA)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    logger.warning(f"⚠️ Frontend build not found at: {FRONTEND_DIR}")

# ============================================
# ✅ Middleware
# ============================================
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "status": "running",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
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