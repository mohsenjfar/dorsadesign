#!/bin/bash
set -e

echo "🚀 Starting dorsadesign..."
echo "📂 Working directory: $(pwd)"
echo "🐍 Python version: $(python --version)"

cd /app/backend

# ============================================
# ✅ تنظیم PYTHONPATH
# ============================================
export PYTHONPATH=/app/backend:$PYTHONPATH

# ============================================
# 📦 اجرای مهاجرت‌های دیتابیس
# ============================================
echo "📦 Running database migrations..."
python -m alembic upgrade head || {
    echo "⚠️ Migration failed, but continuing..."
}

# ============================================
# 👤 ایجاد ادمین (با متغیرهای محیطی)
# ============================================
echo "👤 Creating admin user (if not exists)..."
python seed_admin.py || echo "⚠️ Admin already exists or creation failed"

# ============================================
# 🐍 اجرای FastAPI
# ============================================
echo "🐍 Starting FastAPI backend..."
exec python -m app.main