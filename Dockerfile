# dorsadesign.ir/Dockerfile
# ============================================
# مرحله ۱: ساخت بک‌اند (Python)
# ============================================
FROM python:3.11-slim AS backend

WORKDIR /app

# ============================================
# کپی و نصب وابستگی‌های بک‌اند
# ============================================
# ✅ کپی کل پوشه requirements
COPY backend/requirements/ ./backend/requirements/

# نصب وابستگی‌های تولید (prod)
RUN pip install --no-cache-dir -r backend/requirements/prod.txt

# ============================================
# کپی کد بک‌اند
# ============================================
COPY backend/ ./backend/
COPY alembic.ini ./alembic.ini
COPY alembic/ ./alembic/

# ============================================
# مرحله ۲: ساخت فرانت‌اند (Node.js)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# کپی package.json و نصب وابستگی‌ها
COPY frontend/package*.json ./
RUN npm ci

# کپی کد فرانت‌اند و Build
COPY frontend/ ./
RUN npm run build

# ============================================
# مرحله ۳: ایمیج نهایی
# ============================================
FROM python:3.11-slim

WORKDIR /app

# ============================================
# کپی بک‌اند از مرحله اول
# ============================================
COPY --from=backend /app/backend ./backend/
COPY --from=backend /app/alembic.ini ./
COPY --from=backend /app/alembic ./alembic/

# ============================================
# کپی و نصب وابستگی‌ها (دوباره برای ایمیج نهایی)
# ============================================
COPY backend/requirements/ ./backend/requirements/
RUN pip install --no-cache-dir -r backend/requirements/prod.txt

# ============================================
# کپی فرانت‌اند (Build شده) از مرحله دوم
# ============================================
COPY --from=frontend-builder /app/dist ./frontend/dist

# ============================================
# ایجاد پوشه‌های مورد نیاز
# ============================================
RUN mkdir -p /app/uploads/projects/covers \
    /app/uploads/projects/galleries \
    /app/logs

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
ENV LOG_FILE=/app/logs/app.log

# ============================================
# پورت‌های暴露
# ============================================
EXPOSE 8000

# ============================================
# نقطه ورود
# ============================================
ENTRYPOINT ["/docker-entrypoint.sh"]