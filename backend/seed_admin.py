# backend/seed_admin.py
"""Create first admin user automatically with default credentials"""
from app.database import SessionLocal
from app.crud.admin import admin_crud
from app.schemas.admin import AdminCreate
from app.models.admin import Admin
import os

def create_admin():
    """Create the first admin user with default credentials"""
    db = SessionLocal()
    
    try:
        # Check if any admin exists
        existing = db.query(Admin).first()
        if existing:
            print("⚠️ Admin already exists! Skipping...")
            return
        
        print("🔐 Creating first admin user with default credentials...")
        
        # ============================================
        # ✅ استفاده از متغیرهای محیطی یا مقادیر پیش‌فرض
        # ============================================
        username = os.getenv("ADMIN_USERNAME", "admin")
        email = os.getenv("ADMIN_EMAIL", "admin@dorsadesign.ir")
        password = os.getenv("ADMIN_PASSWORD", "admin123")
        full_name = os.getenv("ADMIN_FULL_NAME", "Admin User")
        
        admin_data = AdminCreate(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
        )
        
        admin = admin_crud.create(db, obj_in=admin_data)
        print(f"✅ Admin created successfully!")
        print(f"   Username: {admin.username}")
        print(f"   Email: {admin.email}")
        print(f"   Password: {password}")
        print("⚠️  IMPORTANT: Please change the default password immediately!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()