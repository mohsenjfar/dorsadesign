# backend/app/crud/admin.py
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.models.admin import Admin
from app.schemas.admin import AdminCreate


class AdminCRUD:
    """CRUD operations for Admin model"""

    def get(self, db: Session, admin_id: UUID) -> Optional[Admin]:
        """Get admin by ID"""
        return db.query(Admin).filter(Admin.id == admin_id).first()

    def get_by_username(self, db: Session, username: str) -> Optional[Admin]:
        """Get admin by username"""
        return db.query(Admin).filter(Admin.username == username).first()

    def get_by_email(self, db: Session, email: str) -> Optional[Admin]:
        """Get admin by email"""
        return db.query(Admin).filter(Admin.email == email).first()

    def create(self, db: Session, *, obj_in: AdminCreate) -> Admin:
        """Create a new admin"""
        from app.core.security import get_password_hash
        
        db_obj = Admin(
            username=obj_in.username,
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            is_active=True,
            is_superuser=False,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_last_login(self, db: Session, *, admin: Admin) -> Admin:
        """Update admin's last login timestamp"""
        from datetime import datetime, timezone
        
        admin.last_login = datetime.now(timezone.utc)
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin


# Create singleton instance
admin_crud = AdminCRUD()