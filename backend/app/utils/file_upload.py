# backend/app/utils/file_upload.py
import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ============================================
# Configuration
# ============================================

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE  # 10MB
UPLOAD_DIR = Path(settings.UPLOAD_DIR)


def ensure_upload_dirs():
    """Create upload directories if they don't exist"""
    dirs = [
        UPLOAD_DIR / "projects" / "covers",
        UPLOAD_DIR / "projects" / "galleries",
    ]
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file
    - Check extension
    - Check file size
    """
    # Check extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size (content-length header, but we'll check after reading)
    # For now, we'll check during save


async def save_upload_file(
    file: UploadFile,
    subdirectory: str = "projects",
    custom_filename: Optional[str] = None,
) -> str:
    """
    Save an uploaded file to the uploads directory
    
    Args:
        file: The uploaded file
        subdirectory: Subdirectory under uploads/
        custom_filename: Optional custom filename (without extension)
    
    Returns:
        The saved file path (relative to uploads directory)
    """
    try:
        ensure_upload_dirs()
    except Exception as e:
        logger.error(f"Failed to create upload directories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Upload directory is not accessible. Please check permissions."
        )

    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    if custom_filename:
        filename = f"{custom_filename}{file_ext}"
    else:
        filename = f"{uuid.uuid4()}{file_ext}"

    # Create full path
    file_path = UPLOAD_DIR / subdirectory / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save file
    try:
        # Read file content
        content = await file.read()

        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {MAX_FILE_SIZE // 1024 // 1024}MB"
            )

        # Write file
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"File saved: {file_path}")

        # Return relative path
        return f"/uploads/{subdirectory}/{filename}"

    except PermissionError as e:
        logger.error(f"Permission error while saving file: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Cannot write file to upload directory."
        )
    except OSError as e:
        logger.error(f"OS error while saving file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File system error. Please try again later."
        )
    except Exception as e:
        logger.error(f"Unexpected error while saving file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )


async def save_multiple_files(
    files: List[UploadFile],
    subdirectory: str = "projects/galleries",
) -> List[str]:
    """
    Save multiple uploaded files
    
    Returns:
        List of saved file paths (relative to uploads directory)
    """
    saved_paths = []
    for file in files:
        if file.filename:  # Skip empty files
            path = await save_upload_file(file, subdirectory)
            saved_paths.append(path)
    return saved_paths


def delete_file(file_path: str) -> bool:
    """
    Delete a file from the uploads directory
    
    Args:
        file_path: Relative file path (e.g., /uploads/projects/cover.jpg)
    
    Returns:
        True if deleted, False if not found
    """
    try:
        # Remove leading slash if present
        if file_path.startswith("/"):
            file_path = file_path[1:]

        full_path = Path(file_path)
        if full_path.exists():
            full_path.unlink()
            logger.info(f"File deleted: {full_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return False


def delete_old_files(file_paths: List[str]) -> None:
    """Delete multiple files"""
    for path in file_paths:
        if path:
            delete_file(path)