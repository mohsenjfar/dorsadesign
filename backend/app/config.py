# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """تنظیمات برنامه"""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # Server
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB
    
    @classmethod
    def validate(cls):
        """اعتبارسنجی تنظیمات"""
        if not cls.DATABASE_URL:
            raise ValueError("❌ DATABASE_URL در فایل .env تنظیم نشده است!")
        if cls.SECRET_KEY == "change-me-in-production":
            print("⚠️  هشدار: SECRET_KEY پیش‌فرض است! در تولید آن را تغییر دهید.")

# ایجاد نمونه از تنظیمات
settings = Settings()
settings.validate()