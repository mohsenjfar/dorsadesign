# backend/app/utils/image_optimizer.py

from PIL import Image
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def optimize_image(file_path: str, max_width: int = 1200, quality: int = 85):
    """
    بهینه‌سازی تصویر با تغییر اندازه و کاهش کیفیت
    """
    try:
        img = Image.open(file_path)
        
        # تغییر اندازه اگر بزرگتر باشد
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # ذخیره با کیفیت کمتر
        img.save(file_path, optimize=True, quality=quality)
        logger.info(f"Image optimized: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to optimize image: {e}")
        return False