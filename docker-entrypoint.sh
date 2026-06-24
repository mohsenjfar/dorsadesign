#!/bin/bash
set -e

echo "🚀 Starting dorsadesign..."

cd /app/backend  # ✅ رفتن به پوشه backend

export PYTHONPATH=/app/backend:$PYTHONPATH

echo "📦 Running database migrations..."
python -m alembic upgrade head || {
    echo "⚠️ Migration failed, but continuing..."
}

echo "👤 Creating admin user..."
python seed_admin.py || echo "⚠️ Admin already exists or creation failed"

echo "🐍 Starting FastAPI backend..."
exec python -m app.main  # ✅ اجرای app.main از داخل backend