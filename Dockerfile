# dorsadesign.ir/Dockerfile
# ============================================
# مرحله ۱: ساخت بک‌اند (Python)
# ============================================
FROM python:3.11-slim AS backend

WORKDIR /app

# ============================================
# تنظیم رجیستری pip از متغیر محیطی
# ============================================
ARG PIP_INDEX_URL
ENV PIP_INDEX_URL=${PIP_INDEX_URL:-https://pypi.org/simple}

# ============================================
# کپی و نصب وابستگی‌های بک‌اند
# ============================================
COPY backend/requirements/ ./backend/requirements/

# نصب وابستگی‌های تولید (prod) با رجیستری مشخص
RUN pip install --no-cache-dir \
    --index-url ${PIP_INDEX_URL} \
    -r backend/requirements/prod.txt

# ============================================
# کپی کد بک‌اند
# ============================================
COPY backend/ ./backend/

# ============================================
# ✅ کپی فایل‌های Alembic از مسیر درست
# ============================================
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic/ ./alembic/

# ============================================
# مرحله ۲: ساخت فرانت‌اند (Node.js) با رجیستری قابل تنظیم
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# ============================================
# ✅ تنظیم رجیستری npm از متغیر محیطی
# ============================================
ARG NPM_REGISTRY
ENV NPM_REGISTRY=${NPM_REGISTRY:-https://registry.npmjs.org}

# تنظیم رجیستری npm
RUN npm config set registry ${NPM_REGISTRY}

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
# تنظیم رجیستری pip از متغیر محیطی
# ============================================
ARG PIP_INDEX_URL
ENV PIP_INDEX_URL=${PIP_INDEX_URL:-https://pypi.org/simple}

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
RUN pip install --no-cache-dir \
    --index-url ${PIP_INDEX_URL} \
    -r backend/requirements/prod.txt

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