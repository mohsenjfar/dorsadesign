# backend/seed_admin.py
"""Create first admin user"""
from app.database import SessionLocal
from app.crud.admin import admin_crud
from app.schemas.admin import AdminCreate
import getpass
from app.models.admin import Admin

def create_admin():
    """Create the first admin user"""
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing = db.query(Admin).first()
        if existing:
            print("⚠️ Admin already exists!")
            return
        
        print("🔐 Creating first admin user...")
        username = input("Username: ")
        email = input("Email: ")
        password = getpass.getpass("Password: ")
        full_name = input("Full name (optional): ") or None
        
        admin_data = AdminCreate(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
        )
        
        admin = admin_crud.create(db, obj_in=admin_data)
        print(f"✅ Admin created successfully!")
        print(f"   ID: {admin.id}")
        print(f"   Username: {admin.username}")
        print(f"   Email: {admin.email}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()