# backend/app/crud/project.py
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import Optional, List, Tuple
from uuid import UUID
from app.models.project import Project, ProjectStatus, ProjectType
from app.schemas.project import ProjectCreate, ProjectUpdate
import re


def generate_slug_from_title(title: str) -> str:
    """تولید اسلاگ از عنوان"""
    if not title:
        return 'untitled'
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower().strip())
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug or 'untitled'


def get_unique_slug(db: Session, base_slug: str) -> str:
    """تولید اسلاگ یکتا"""
    slug = base_slug
    counter = 1
    while db.query(Project).filter(Project.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


class ProjectCRUD:
    def get(self, db: Session, project_id: UUID) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    def get_by_slug(self, db: Session, slug: str) -> Optional[Project]:
        return db.query(Project).filter(Project.slug == slug).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 20,
        project_type: Optional[ProjectType] = None,
        status: Optional[ProjectStatus] = None,
        is_featured: Optional[bool] = None,
        search: Optional[str] = None,
        language: str = 'fa',
    ) -> Tuple[List[Project], int]:
        query = db.query(Project)

        if project_type:
            query = query.filter(Project.project_type == project_type)

        if status:
            query = query.filter(Project.status == status)
        else:
            query = query.filter(Project.status == ProjectStatus.PUBLISHED)

        if is_featured is not None:
            query = query.filter(Project.is_featured == is_featured)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Project.title.ilike(search_term),
                    Project.description.ilike(search_term),
                )
            )

        total = query.count()
        query = query.order_by(desc(Project.created_at))
        projects = query.offset(skip).limit(limit).all()

        return projects, total

    def get_featured(self, db: Session, limit: int = 4) -> List[Project]:
        projects, _ = self.get_multi(db, is_featured=True, status=ProjectStatus.PUBLISHED, limit=limit)
        return projects

    def create(self, db: Session, *, obj_in: ProjectCreate) -> Project:
        # ✅ تولید اسلاگ اگر ارسال نشده باشد
        slug = obj_in.slug
        if not slug:
            base_slug = generate_slug_from_title(obj_in.title)
            slug = get_unique_slug(db, base_slug)

        db_obj = Project(
            title=obj_in.title,
            slug=slug,
            description=obj_in.description,
            full_description=obj_in.full_description,
            features=",".join(obj_in.features) if obj_in.features else None,
            project_type=obj_in.project_type,
            client_name=obj_in.client_name,
            year=obj_in.year,
            area=obj_in.area,
            status=obj_in.status,
            cover_image=obj_in.cover_image,
            gallery_images=obj_in.gallery_images,
            is_featured=obj_in.is_featured,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Project, obj_in: ProjectUpdate) -> Project:
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == 'features' and value is not None:
                setattr(db_obj, field, ",".join(value) if value else None)
            else:
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, project_id: UUID) -> Project:
        db_obj = self.get(db, project_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

    def increment_views(self, db: Session, *, project: Project) -> Project:
        project.views += 1
        db.add(project)
        db.commit()
        db.refresh(project)
        return project


project_crud = ProjectCRUD()