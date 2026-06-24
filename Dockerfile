# dorsadesign.ir/Dockerfile
FROM python:3.11-slim AS backend

WORKDIR /app

# ============================================
# نصب وابستگی‌های بک‌اند
# ============================================
COPY backend/requirements/prod.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# کپی کد بک‌اند
COPY backend/ ./backend/
COPY alembic.ini ./alembic.ini
COPY alembic/ ./alembic/

# ============================================
# ساخت فرانت‌اند
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ============================================
# ایمیج نهایی
# ============================================
FROM python:3.11-slim

WORKDIR /app

# ============================================
# کپی بک‌اند
# ============================================
COPY --from=backend /app/backend ./backend/
COPY --from=backend /app/alembic.ini ./
COPY --from=backend /app/alembic ./alembic/

# کپی وابستگی‌ها
COPY backend/requirements/prod.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ============================================
# کپی فرانت‌اند (Build شده)
# ============================================
COPY --from=frontend-builder /app/dist ./frontend/dist

# ============================================
# ایجاد پوشه‌های مورد نیاز
# ============================================
RUN mkdir -p /app/uploads/projects/covers /app/uploads/projects/galleries /app/logs

# ============================================
# اسکریپت ورودی
# ============================================
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# ============================================
# متغیرهای محیطی پیش‌فرض
# ============================================
ENV PYTHONPATH=/app
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]