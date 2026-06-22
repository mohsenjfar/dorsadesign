# backend/app/api/admin/projects.py
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.crud import project_crud
from app.core.security import get_current_admin
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)
from app.models.project import Project, ProjectStatus
from app.utils.file_upload import save_upload_file, delete_file, ensure_upload_dirs
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# Admin Project Management Endpoints
# ============================================

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Create a new project (Admin only)
    """
    logger.info(f"current_admin: {current_admin}")

    # Check if slug already exists
    existing = project_crud.get_by_slug(db, project_in.slug)
    if existing:
        raise ConflictException(
            detail=f"Project with slug '{project_in.slug}' already exists"
        )

    project = project_crud.create(db, obj_in=project_in)
    logger.info(f"Project created by admin {current_admin['username']}: {project.title}")

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Update an existing project (Admin only)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # Check if slug is being changed and already exists
    if project_in.slug and project_in.slug != project.slug:
        existing = project_crud.get_by_slug(db, project_in.slug)
        if existing:
            raise ConflictException(
                detail=f"Project with slug '{project_in.slug}' already exists"
            )

    project = project_crud.update(db, db_obj=project, obj_in=project_in)
    logger.info(f"Project updated by admin {current_admin['username']}: {project.title}")

    return project


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Delete a project and its associated images (Admin only)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # Delete associated images
    if project.cover_image:
        delete_file(project.cover_image)
    if project.gallery_images:
        for img in project.gallery_images.split(","):
            if img.strip():
                delete_file(img.strip())

    # Delete project from database
    project_crud.delete(db, project_id=project_id)
    logger.info(f"Project deleted by admin {current_admin['username']}: {project.title}")

    return None


# ============================================
# Image Upload Endpoints
# ============================================

@router.post("/upload/cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Upload a cover image for a project (Admin only)
    """
    ensure_upload_dirs()
    file_path = await save_upload_file(file, subdirectory="projects/covers")
    
    return {
        "url": file_path,
        "message": "Cover image uploaded successfully"
    }


@router.post("/upload/gallery")
async def upload_gallery_images(
    files: List[UploadFile] = File(...),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Upload multiple gallery images (Admin only)
    """
    ensure_upload_dirs()
    saved_paths = []
    
    for file in files:
        if file.filename:
            path = await save_upload_file(file, subdirectory="projects/galleries")
            saved_paths.append(path)
    
    return {
        "urls": saved_paths,
        "count": len(saved_paths),
        "message": f"{len(saved_paths)} images uploaded successfully"
    }


@router.post("/upload/cover-to-project/{project_id}")
async def upload_cover_to_project(
    project_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Upload a cover image and attach it to a project (Admin only)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # Delete old cover if exists
    if project.cover_image:
        delete_file(project.cover_image)

    # Upload new cover
    file_path = await save_upload_file(
        file,
        subdirectory="projects/covers",
        custom_filename=f"{project.slug}_cover"
    )

    # Update project
    project.cover_image = file_path
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "url": file_path,
        "message": "Cover image uploaded and attached to project"
    }


@router.post("/upload-gallery-to-project/{project_id}")
async def upload_gallery_to_project(
    project_id: UUID,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Upload gallery images and attach them to a project (Admin only)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # Upload new gallery images
    saved_paths = []
    for file in files:
        if file.filename:
            path = await save_upload_file(
                file,
                subdirectory="projects/galleries",
                custom_filename=f"{project.slug}_gallery_{uuid.uuid4().hex[:8]}"
            )
            saved_paths.append(path)

    # Append to existing gallery
    existing = []
    if project.gallery_images:
        existing = [img.strip() for img in project.gallery_images.split(",") if img.strip()]
    
    all_images = existing + saved_paths
    project.gallery_images = ",".join(all_images)

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "urls": saved_paths,
        "count": len(saved_paths),
        "message": f"{len(saved_paths)} images uploaded and attached to project"
    }

