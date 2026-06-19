# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import test_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# مدیریت چرخه حیات برنامه
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """مدیریت رویدادهای Startup و Shutdown"""
    
    # 🚀 Startup - کدی که هنگام شروع اجرا می‌شود
    logger.info("🚀 در حال راه‌اندازی dorsadesign.ir API...")
    
    if test_connection():
        logger.info("✅ اتصال به PostgreSQL برقرار شد")
    else:
        logger.error("❌ اتصال به PostgreSQL ناموفق!")
    
    yield  # ⬅️ برنامه در اینجا اجرا می‌شود
    
    # 🛑 Shutdown - کدی که هنگام توقف اجرا می‌شود
    logger.info("🛑 در حال توقف dorsadesign.ir API...")

# ============================================
# ایجاد اپلیکیشن با lifespan
# ============================================

app = FastAPI(
    title="dorsadesign.ir API",
    description="وبسایت نمایش پروژه‌های معماری",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,  # ⬅️ اضافه کردن lifespan
)

# ============================================
# CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# اندپوینت‌ها
# ============================================

@app.get("/")
async def root():
    return {
        "message": "🚀 dorsadesign.ir API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health_check():
    if test_connection():
        return {
            "status": "healthy",
            "database": "connected"
        }
    else:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }

# ============================================
# اجرا
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )