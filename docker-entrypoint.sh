#!/bin/bash
set -e

echo "🚀 Starting dorsadesign..."

cd /app

# ============================================
# 📦 اجرای مهاجرت‌های دیتابیس
# ============================================
echo "📦 Running database migrations..."
python -m alembic upgrade head

# ============================================
# 👤 ایجاد ادمین (در صورت عدم وجود)
# ============================================
echo "👤 Creating admin user (if not exists)..."
cd /app/backend
python seed_admin.py || echo "⚠️ Admin already exists or creation failed"

# ============================================
# 🐍 اجرای FastAPI
# ============================================
echo "🐍 Starting FastAPI backend..."
cd /app
exec python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000