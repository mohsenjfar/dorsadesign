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
from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_current_admin
from app.utils.file_upload import delete_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# Helper Functions
# ============================================

def get_translation(data: dict, language: str) -> str:
    """
    دریافت مقدار ترجمه‌شده از یک دیکشنری JSON
    
    Args:
        data: دیکشنری حاوی ترجمه‌ها (مثلاً {'en': '...', 'fa': '...'})
        language: زبان مورد نظر (en/fa)
    
    Returns:
        مقدار ترجمه‌شده یا رشته خالی
    """
    if not isinstance(data, dict):
        return str(data) if data else ""
    return data.get(language, data.get('en', ''))


def get_translated_list(data: dict, language: str) -> list:
    """
    دریافت لیست ترجمه‌شده از یک دیکشنری JSON
    
    Args:
        data: دیکشنری حاوی لیست ترجمه‌ها (مثلاً {'en': [...], 'fa': [...]})
        language: زبان مورد نظر (en/fa)
    
    Returns:
        لیست ترجمه‌شده یا لیست خالی
    """
    if not isinstance(data, dict):
        return []
    return data.get(language, data.get('en', []))


# ============================================
# Public Endpoints
# ============================================

# backend/app/api/projects.py

@router.get("/", response_model=ProjectList)
async def get_projects(
    db: Session = Depends(get_db),
    language: str = Query('en', description="Language (en/fa)"),
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

    # ✅ ساخت آیتم‌ها با ترجمه MANUAL
    items = []
    for p in projects:
        # ایجاد دیکشنری با مقادیر ترجمه‌شده
        item_dict = {
            "id": p.id,
            "title": get_translation(p.title, language),  # ✅ تبدیل به str
            "slug": p.slug,
            "description": get_translation(p.description, language) if p.description else None,  # ✅ تبدیل به str
            "cover_image": p.cover_image,
            "project_type": p.project_type,
            "is_featured": p.is_featured,
            "features": get_translated_list(p.features, language) if p.features else [],
            "views": p.views or 0,
            "created_at": p.created_at,
        }
        # ✅ اعتبارسنجی با Pydantic بعد از ترجمه
        item = ProjectListResponse.model_validate(item_dict)
        items.append(item)

    # محاسبه تعداد صفحات
    pages = (total + limit - 1) // limit if total > 0 else 0

    return ProjectList(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        pages=pages,
    )

# backend/app/api/projects.py

@router.get("/featured", response_model=list[ProjectListResponse])
async def get_featured_projects(
    db: Session = Depends(get_db),
    language: str = Query('en', description="Language (en/fa)"),
    limit: int = Query(4, ge=1, le=10, description="Number of featured projects to return"),
):
    """دریافت پروژه‌های ویژه"""
    projects = project_crud.get_featured(db, limit=limit)
    
    items = []
    for p in projects:
        item_dict = {
            "id": p.id,
            "title": get_translation(p.title, language),
            "slug": p.slug,
            "description": get_translation(p.description, language) if p.description else None,
            "cover_image": p.cover_image,
            "project_type": p.project_type,
            "is_featured": p.is_featured,
            "features": get_translated_list(p.features, language) if p.features else [],
            "views": p.views or 0,
            "created_at": p.created_at,
        }
        item = ProjectListResponse.model_validate(item_dict)
        items.append(item)
    
    return items


# backend/app/api/projects.py

@router.get("/{slug}", response_model=ProjectResponse)
async def get_project_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    language: str = Query('en', description="Language (en/fa)"),
):
    """
    دریافت جزئیات کامل یک پروژه با slug
    
    هنگام بازدید، تعداد بازدید (views) یک واحد افزایش می‌یابد.
    """
    project = project_crud.get_by_slug(db, slug=slug)

    if not project:
        raise NotFoundException(detail=f"Project with slug '{slug}' not found")

    # فقط پروژه‌های منتشر شده قابل مشاهده هستند
    if project.status != ProjectStatus.PUBLISHED:
        raise NotFoundException(detail="Project not found")

    # ✅ ساخت دیکشنری با مقادیر ترجمه‌شده
    project_dict = {
        "id": project.id,
        "title": get_translation(project.title, language),
        "slug": project.slug,
        "description": get_translation(project.description, language) if project.description else None,
        "full_description": get_translation(project.full_description, language) if project.full_description else None,
        "features": get_translated_list(project.features, language) if project.features else [],
        "project_type": project.project_type,
        "client_name": project.client_name,
        "year": project.year,
        "area": project.area,
        "status": project.status,
        "cover_image": project.cover_image,
        "gallery_images": project.gallery_images,
        "is_featured": project.is_featured,
        "views": project.views,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }
    
    # ✅ اعتبارسنجی با Pydantic بعد از ترجمه
    response = ProjectResponse.model_validate(project_dict)

    # افزایش تعداد بازدید
    project = project_crud.increment_views(db, project=project)

    return response


# ============================================
# Admin Endpoints (با احراز هویت)
# ============================================

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    ایجاد پروژه جدید (فقط ادمین)
    """
    # بررسی تکراری نبودن slug
    existing = project_crud.get_by_slug(db, project_in.slug)
    if existing:
        raise ConflictException(
            detail=f"Project with slug '{project_in.slug}' already exists"
        )

    project = project_crud.create(db, obj_in=project_in)
    logger.info(f"Project created by admin {current_admin['username']}: {project_in.title.get('en', '')}")

    # ✅ ساخت response_dict با تبدیل features به لیست
    response_dict = {
        "id": project.id,
        "title": project.title.get('en', '') if isinstance(project.title, dict) else str(project.title),
        "slug": project.slug,
        "description": project.description.get('en', '') if isinstance(project.description, dict) else project.description,
        "full_description": project.full_description.get('en', '') if isinstance(project.full_description, dict) else project.full_description,
        "features": project.features.get('en', []) if isinstance(project.features, dict) else (project.features if isinstance(project.features, list) else []),
        "project_type": project.project_type,
        "client_name": project.client_name,
        "year": project.year,
        "area": project.area,
        "status": project.status,
        "cover_image": project.cover_image,
        "gallery_images": project.gallery_images,
        "is_featured": project.is_featured,
        "views": project.views,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }
    
    return ProjectResponse.model_validate(response_dict)

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
    ویرایش پروژه (فقط ادمین)
    """
    project = project_crud.get(db, project_id)
    if not project:
        raise NotFoundException(detail=f"Project with ID '{project_id}' not found")

    # بررسی slug تکراری (اگر تغییر کرده باشد)
    if project_in.slug and project_in.slug != project.slug:
        existing = project_crud.get_by_slug(db, project_in.slug)
        if existing:
            raise ConflictException(
                detail=f"Project with slug '{project_in.slug}' already exists"
            )

    project = project_crud.update(db, db_obj=project, obj_in=project_in)
    logger.info(f"Project updated by admin {current_admin['username']}: {project.id}")

    return ProjectResponse.model_validate(project)


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
    logger.info(f"Project deleted by admin {current_admin['username']}: {project.id}")

    return None