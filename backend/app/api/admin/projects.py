# backend/app/api/admin/projects.py
from fastapi import APIRouter, Depends, status, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import uuid
from app.database import get_db
from app.crud import project_crud
from app.core.security import get_current_admin
from app.core.exceptions import NotFoundException, ConflictException
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)
from app.utils.file_upload import save_upload_file, delete_file, ensure_upload_dirs
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# محدودیت تعداد تصاویر گالری
# ============================================
MAX_GALLERY_IMAGES = 3


# ============================================
# Admin Project Management Endpoints
# ============================================

@router.get("/by-id/{project_id}", response_model=ProjectResponse)
async def get_project_by_id_admin(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    دریافت کامل پروژه با ID (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    return ProjectResponse.model_validate(project)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    ایجاد پروژه جدید (فقط ادمین)
    """
    logger.info(f"current_admin: {current_admin}")

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
    به‌روزرسانی پروژه (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

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
    حذف پروژه و تصاویر مرتبط (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # حذف تصاویر مرتبط
    if project.cover_image:
        delete_file(project.cover_image)
    
    if project.gallery_images:
        for img in project.gallery_images.split(","):
            if img.strip():
                delete_file(img.strip())

    # حذف پروژه از دیتابیس
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
    آپلود تصویر کاور (فقط ادمین)
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
    آپلود چند تصویر گالری (فقط ادمین)
    """
    # بررسی محدودیت تعداد
    if len(files) > MAX_GALLERY_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"حداکثر {MAX_GALLERY_IMAGES} تصویر می‌توانید آپلود کنید."
        )
    
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
    آپلود تصویر کاور و اتصال به پروژه (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # حذف کاور قدیمی در صورت وجود
    if project.cover_image:
        delete_file(project.cover_image)

    # آپلود کاور جدید
    file_path = await save_upload_file(
        file,
        subdirectory="projects/covers",
        custom_filename=f"{project.slug}_cover"
    )

    # به‌روزرسانی پروژه
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
    آپلود تصاویر گالری و اتصال به پروژه (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # بررسی محدودیت تعداد
    existing_images = []
    if project.gallery_images:
        existing_images = [img.strip() for img in project.gallery_images.split(",") if img.strip()]
    
    if len(existing_images) + len(files) > MAX_GALLERY_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"حداکثر {MAX_GALLERY_IMAGES} تصویر مجاز است. در حال حاضر {len(existing_images)} تصویر وجود دارد."
        )

    # آپلود تصاویر جدید
    saved_paths = []
    for file in files:
        if file.filename:
            path = await save_upload_file(
                file,
                subdirectory="projects/galleries",
                custom_filename=f"{project.slug}_gallery_{uuid.uuid4().hex[:8]}"
            )
            saved_paths.append(path)

    # اضافه کردن به گالری موجود
    all_images = existing_images + saved_paths
    project.gallery_images = ",".join(all_images)

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "urls": saved_paths,
        "count": len(saved_paths),
        "message": f"{len(saved_paths)} images uploaded and attached to project"
    }