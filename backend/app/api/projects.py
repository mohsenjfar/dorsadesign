# backend/app/api/projects.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.crud import project_crud
from app.schemas.project import (
    ProjectResponse,
    ProjectListResponse,
    ProjectList,
    ProjectCreate,
    ProjectUpdate,
)
from app.models.project import ProjectType, ProjectStatus
from app.core.exceptions import NotFoundException, ConflictException, ValidationException

router = APIRouter()


# ============================================
# Public Endpoints
# ============================================

@router.get("/", response_model=ProjectList)
async def get_projects(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    project_type: Optional[ProjectType] = Query(None, description="Filter by project type"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    search: Optional[str] = Query(None, min_length=2, description="Search by title or description"),
):
    """
    Get list of projects with filtering and pagination
    
    Returns published projects only (for public access)
    """
    projects, total = project_crud.get_multi(
        db,
        skip=skip,
        limit=limit,
        project_type=project_type,
        status=ProjectStatus.PUBLISHED,  # Only published projects
        is_featured=is_featured,
        search=search,
    )

    # Calculate total pages
    pages = (total + limit - 1) // limit if total > 0 else 0

    return ProjectList(
        items=[ProjectListResponse.model_validate(p) for p in projects],
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        pages=pages,
    )


@router.get("/featured", response_model=list[ProjectListResponse])
async def get_featured_projects(
    db: Session = Depends(get_db),
    limit: int = Query(4, ge=1, le=10, description="Number of featured projects to return"),
):
    """Get list of featured projects"""
    projects = project_crud.get_featured(db, limit=limit)
    return [ProjectListResponse.model_validate(p) for p in projects]


@router.get("/{slug}", response_model=ProjectResponse)
async def get_project_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get project details by slug
    
    Automatically increments view count when accessed
    """
    project = project_crud.get_by_slug(db, slug=slug)

    if not project:
        raise NotFoundException(detail=f"Project with slug '{slug}' not found")

    # Only allow access to published projects
    if project.status != ProjectStatus.PUBLISHED:
        raise NotFoundException(detail="Project not found")

    # Increment view count
    project = project_crud.increment_views(db, project=project)

    return ProjectResponse.model_validate(project)