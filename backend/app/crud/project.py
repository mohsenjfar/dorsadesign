# backend/app/crud/project.py
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional, List, Tuple
from uuid import UUID
from app.models.project import Project, ProjectStatus, ProjectType
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectCRUD:
    """CRUD operations for Project model"""

    def get(self, db: Session, project_id: UUID) -> Optional[Project]:
        """Get a single project by ID"""
        return db.query(Project).filter(Project.id == project_id).first()

    def get_by_slug(self, db: Session, slug: str) -> Optional[Project]:
        """Get a single project by slug"""
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
    ) -> Tuple[List[Project], int]:
        """
        Get multiple projects with filtering and pagination
        Returns: (list of projects, total count)
        """
        query = db.query(Project)

        # Apply filters
        if project_type:
            query = query.filter(Project.project_type == project_type)

        if status:
            query = query.filter(Project.status == status)
        else:
            # Default: only show published projects
            query = query.filter(Project.status == ProjectStatus.PUBLISHED)

        if is_featured is not None:
            query = query.filter(Project.is_featured == is_featured)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Project.title.ilike(search_term)) |
                (Project.description.ilike(search_term))
            )

        # Get total count before pagination
        total = query.count()

        # Order by created_at (newest first)
        query = query.order_by(desc(Project.created_at))

        # Apply pagination
        projects = query.offset(skip).limit(limit).all()

        return projects, total

    def get_featured(self, db: Session, limit: int = 4) -> List[Project]:
        """Get featured projects"""
        projects, _ = self.get_multi(
            db,
            is_featured=True,
            status=ProjectStatus.PUBLISHED,
            limit=limit
        )
        return projects

    def create(self, db: Session, *, obj_in: ProjectCreate) -> Project:
        """Create a new project"""
        db_obj = Project(
            title=obj_in.title,
            slug=obj_in.slug,
            description=obj_in.description,
            full_description=obj_in.full_description,
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

    def update(
        self,
        db: Session,
        *,
        db_obj: Project,
        obj_in: ProjectUpdate
    ) -> Project:
        """Update an existing project"""
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, project_id: UUID) -> Project:
        """Delete a project"""
        db_obj = self.get(db, project_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

    def increment_views(self, db: Session, *, project: Project) -> Project:
        """Increment project view count"""
        project.views += 1
        db.add(project)
        db.commit()
        db.refresh(project)
        return project


# Create singleton instance
project_crud = ProjectCRUD()