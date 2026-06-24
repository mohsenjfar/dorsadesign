# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import test_connection
from app.api import api_router
import logging
from fastapi.staticfiles import StaticFiles
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.trustedhost import TrustedHostMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events"""
    logger.info("🚀 Starting dorsadesign.ir API...")
    
    if test_connection():
        logger.info("✅ Connected to PostgreSQL")
    else:
        logger.error("❌ Failed to connect to PostgreSQL!")
    
    yield
    
    logger.info("🛑 Shutting down dorsadesign.ir API...")


# ============================================
# ✅ Create FastAPI application with correct docs
# ============================================

app = FastAPI(
    title="dorsadesign.ir API",
    description="""
🏛️ **dorsadesign.ir Architecture Portfolio API**

This API provides access to architecture projects and content management.

## Features:
* 📋 List projects with filtering and pagination
* 🔍 Get project details by slug
* 🔐 Admin authentication (JWT)
* 📝 Project management (CRUD)

## Documentation:
* **Swagger UI**: `/api/docs` - Interactive API testing
* **ReDoc**: `/api/redoc` - Beautiful documentation
""",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={
        "name": "dorsadesign",
        "url": "https://dorsadesign.ir",
    },
    lifespan=lifespan,
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CORS middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# ============================================
# ✅ Include API router
# ============================================

app.include_router(api_router, prefix="/api")


# ============================================
# Health Check Endpoints
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
    else:
        return {"status": "unhealthy", "database": "disconnected"}


# ============================================
# Run
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )