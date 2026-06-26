# backend/app/api/projects.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.crud import project_crud
from app.schemas.project import (
    ProjectResponse,
    ProjectListResponse,
    ProjectList
)
from app.models.project import ProjectType, ProjectStatus
from app.core.exceptions import NotFoundException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=ProjectList)
async def get_projects(
    db: Session = Depends(get_db),
    language: str = Query('fa', description="Language"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    project_type: Optional[ProjectType] = Query(None, description="Filter by project type"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    search: Optional[str] = Query(None, min_length=2, description="Search by title or description"),
):
    """
    دریافت لیست پروژه‌ها با فیلتر و صفحه‌بندی
    
    فقط پروژه‌های منتشر شده (PUBLISHED) نمایش داده می‌شوند.
    """
    projects, total = project_crud.get_multi(
        db,
        skip=skip,
        limit=limit,
        project_type=project_type,
        status=ProjectStatus.PUBLISHED,
        is_featured=is_featured,
        search=search,
        language=language,
    )

    items = [
        ProjectListResponse.model_validate(p)
        for p in projects
    ]

    pages = (total + limit - 1) // limit if total > 0 else 0

    return ProjectList(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        pages=pages,
    )


@router.get("/featured", response_model=list[ProjectListResponse])
async def get_featured_projects(
    db: Session = Depends(get_db),
    language: str = Query('fa', description="Language"),
    limit: int = Query(4, ge=1, le=10, description="Number of featured projects to return"),
):
    """دریافت پروژه‌های ویژه"""
    projects = project_crud.get_featured(db, limit=limit)
    
    items = [
        ProjectListResponse.model_validate(p)
        for p in projects
    ]
    
    return items


# ✅ فقط با ID
@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_by_id(
    project_id: UUID,
    db: Session = Depends(get_db),
    language: str = Query('fa', description="Language"),
):
    """
    دریافت پروژه با شناسه (ID)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # افزایش تعداد بازدید
    project = project_crud.increment_views(db, project=project)

    return ProjectResponse.model_validate(project)