# dorsadesign.ir/Dockerfile
# ============================================
# مرحله ۱: ساخت بک‌اند (Python)
# ============================================
FROM python:3.11-slim AS backend

WORKDIR /app

ARG PIP_INDEX_URL
ENV PIP_INDEX_URL=${PIP_INDEX_URL:-https://pypi.org/simple}

# ============================================
# ✅ لایه ۱: فقط وابستگی‌ها (تغییر نمی‌کنند مگر با تغییر requirements)
# ============================================
COPY backend/requirements/ ./backend/requirements/
RUN pip install --no-cache-dir \
    --index-url ${PIP_INDEX_URL} \
    -r backend/requirements/prod.txt

# ============================================
# ✅ لایه ۲: کد بک‌اند (کل پوشه backend کپی میشه)
# ============================================
COPY backend/ ./backend/

# ============================================
# مرحله ۲: ساخت فرانت‌اند (Node.js)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

ARG NPM_REGISTRY
ENV NPM_REGISTRY=${NPM_REGISTRY:-https://registry.npmjs.org}

# ============================================
# ✅ لایه ۱: فقط package.json (تغییر نمی‌کند مگر با تغییر وابستگی‌ها)
# ============================================
COPY frontend/package*.json ./
RUN npm config set registry ${NPM_REGISTRY} \
    && npm ci --legacy-peer-deps

# ============================================
# ✅ لایه ۲: کد فرانت‌اند
# ============================================
COPY frontend/ ./
RUN npm run build

# ============================================
# مرحله ۳: ایمیج نهایی
# ============================================
FROM python:3.11-slim

WORKDIR /app

ARG PIP_INDEX_URL
ENV PIP_INDEX_URL=${PIP_INDEX_URL:-https://pypi.org/simple}

# ============================================
# ✅ لایه ۱: وابستگی‌ها از مرحله backend
# ============================================
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# ============================================
# ✅ لایه ۲: کل پوشه backend (با همه محتویاتش)
# ============================================
COPY --from=backend /app/backend ./backend/

# ============================================
# ✅ لایه ۳: فرانت‌اند (Build شده)
# ============================================
COPY --from=frontend-builder /app/dist ./frontend/dist

# ============================================
# ✅ ایجاد پوشه‌های مورد نیاز
# ============================================
RUN mkdir -p /app/uploads/projects/covers \
    /app/uploads/projects/galleries \
    /app/logs

# ============================================
# ✅ کپی اسکریپت ورودی
# ============================================
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# ============================================
# ✅ تنظیم متغیرهای محیطی
# ============================================
ENV PYTHONPATH=/app/backend
ENV UPLOAD_DIR=/app/uploads
ENV LOG_FILE=/app/logs/app.log

# ============================================
# ✅ پورت
# ============================================
EXPOSE 8000

# ============================================
# ✅ نقطه ورود
# ============================================
ENTRYPOINT ["/docker-entrypoint.sh"]