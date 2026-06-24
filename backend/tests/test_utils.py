# backend/tests/test_utils.py
import pytest
from fastapi import UploadFile
from app.utils.file_upload import (
    validate_file,
    save_upload_file,
    delete_file,
    ensure_upload_dirs,
)
from app.core.security import get_password_hash, verify_password

class TestSecurity:
    """تست‌های امنیتی"""

    def test_password_hashing(self):
        """تست هش کردن رمز عبور"""
        password = "mysecurepass123"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpass", hashed) is False

    def test_password_with_special_chars(self):
        """تست رمز با کاراکترهای خاص"""
        password = "P@$$w0rd!@#$%^&*()"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True


class TestFileUpload:
    """تست‌های آپلود فایل"""

    def test_ensure_upload_dirs(self):
        """تست ایجاد پوشه‌های آپلود"""
        # این تابع فقط پوشه‌ها را ایجاد می‌کند
        ensure_upload_dirs()
        # اگر به خطا نخورد، تست قبول است

    def test_delete_file_not_found(self):
        """تست حذف فایل ناموجود"""
        result = delete_file("/nonexistent/file.jpg")
        assert result is False