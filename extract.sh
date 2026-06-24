#!/bin/bash

# Extract project files with unique names
OUTPUT="./project_context"
rm -rf "$OUTPUT"
mkdir -p "$OUTPUT/backend"
mkdir -p "$OUTPUT/frontend"

# ============================================
# Backend files (with unique names)
# ============================================
cp backend/app/main.py "$OUTPUT/backend/main.py" 2>/dev/null
cp backend/app/config.py "$OUTPUT/backend/config.py" 2>/dev/null
cp backend/app/database.py "$OUTPUT/backend/database.py" 2>/dev/null

# Models (rename to avoid conflict)
cp backend/app/models/project.py "$OUTPUT/backend/models_project.py" 2>/dev/null
cp backend/app/models/admin.py "$OUTPUT/backend/models_admin.py" 2>/dev/null

# Schemas (rename to avoid conflict)
cp backend/app/schemas/project.py "$OUTPUT/backend/schemas_project.py" 2>/dev/null
cp backend/app/schemas/admin.py "$OUTPUT/backend/schemas_admin.py" 2>/dev/null

# API (rename to avoid conflict)
cp backend/app/api/projects.py "$OUTPUT/backend/api_projects.py" 2>/dev/null
cp backend/app/api/auth.py "$OUTPUT/backend/api_auth.py" 2>/dev/null
cp backend/app/api/admin/projects.py "$OUTPUT/backend/api_admin_projects.py" 2>/dev/null

# CRUD (rename to avoid conflict)
cp backend/app/crud/project.py "$OUTPUT/backend/crud_project.py" 2>/dev/null
cp backend/app/crud/admin.py "$OUTPUT/backend/crud_admin.py" 2>/dev/null

# Core
cp backend/app/core/security.py "$OUTPUT/backend/core_security.py" 2>/dev/null
cp backend/app/core/exceptions.py "$OUTPUT/backend/core_exceptions.py" 2>/dev/null

# Utils
cp backend/app/utils/file_upload.py "$OUTPUT/backend/file_upload.py" 2>/dev/null

# Alembic
cp backend/alembic/env.py "$OUTPUT/backend/alembic_env.py" 2>/dev/null
cp backend/alembic.ini "$OUTPUT/backend/alembic.ini" 2>/dev/null

# Requirements
cp backend/requirements/base.txt "$OUTPUT/backend/base.txt" 2>/dev/null
cp backend/requirements/dev.txt "$OUTPUT/backend/dev.txt" 2>/dev/null
cp backend/requirements/prod.txt "$OUTPUT/backend/prod.txt" 2>/dev/null

# Seeds
cp backend/seed_admin.py "$OUTPUT/backend/seed_admin.py" 2>/dev/null
cp backend/seed_data.py "$OUTPUT/backend/seed_data.py" 2>/dev/null

# __init__.py files (keep them)
cp backend/app/__init__.py "$OUTPUT/backend/app_init.py" 2>/dev/null
cp backend/app/models/__init__.py "$OUTPUT/backend/models_init.py" 2>/dev/null
cp backend/app/schemas/__init__.py "$OUTPUT/backend/schemas_init.py" 2>/dev/null
cp backend/app/api/__init__.py "$OUTPUT/backend/api_init.py" 2>/dev/null
cp backend/app/api/admin/__init__.py "$OUTPUT/backend/api_admin_init.py" 2>/dev/null
cp backend/app/crud/__init__.py "$OUTPUT/backend/crud_init.py" 2>/dev/null
cp backend/app/core/__init__.py "$OUTPUT/backend/core_init.py" 2>/dev/null

# ============================================
# Frontend files (with unique names)
# ============================================
# Root files
cp frontend/package.json "$OUTPUT/frontend/package.json" 2>/dev/null
cp frontend/vite.config.js "$OUTPUT/frontend/vite.config.js" 2>/dev/null
cp frontend/tailwind.config.js "$OUTPUT/frontend/tailwind.config.js" 2>/dev/null

# Src files
cp frontend/src/main.jsx "$OUTPUT/frontend/main.jsx" 2>/dev/null
cp frontend/src/App.jsx "$OUTPUT/frontend/App.jsx" 2>/dev/null

# Pages
cp frontend/src/pages/Home.jsx "$OUTPUT/frontend/Home.jsx" 2>/dev/null
cp frontend/src/pages/About.jsx "$OUTPUT/frontend/About.jsx" 2>/dev/null
cp frontend/src/pages/Contact.jsx "$OUTPUT/frontend/Contact.jsx" 2>/dev/null
cp frontend/src/pages/ProjectDetail.jsx "$OUTPUT/frontend/ProjectDetail.jsx" 2>/dev/null
cp frontend/src/pages/admin/Login.jsx "$OUTPUT/frontend/admin_Login.jsx" 2>/dev/null
cp frontend/src/pages/admin/Dashboard.jsx "$OUTPUT/frontend/admin_Dashboard.jsx" 2>/dev/null
cp frontend/src/pages/admin/CreateProject.jsx "$OUTPUT/frontend/admin_CreateProject.jsx" 2>/dev/null
cp frontend/src/pages/admin/EditProject.jsx "$OUTPUT/frontend/admin_EditProject.jsx" 2>/dev/null

# Components
cp frontend/src/components/common/Layout.jsx "$OUTPUT/frontend/Layout.jsx" 2>/dev/null
cp frontend/src/components/common/Header.jsx "$OUTPUT/frontend/Header.jsx" 2>/dev/null
cp frontend/src/components/common/Footer.jsx "$OUTPUT/frontend/Footer.jsx" 2>/dev/null
cp frontend/src/components/home/Hero.jsx "$OUTPUT/frontend/Hero.jsx" 2>/dev/null
cp frontend/src/components/home/ProjectCard.jsx "$OUTPUT/frontend/ProjectCard.jsx" 2>/dev/null
cp frontend/src/components/home/ProjectGrid.jsx "$OUTPUT/frontend/ProjectGrid.jsx" 2>/dev/null
cp frontend/src/components/home/FilterBar.jsx "$OUTPUT/frontend/FilterBar.jsx" 2>/dev/null
cp frontend/src/components/admin/ProtectedRoute.jsx "$OUTPUT/frontend/ProtectedRoute.jsx" 2>/dev/null

# Contexts
cp frontend/src/contexts/AuthContext.jsx "$OUTPUT/frontend/AuthContext.jsx" 2>/dev/null
cp frontend/src/contexts/LanguageContext.jsx "$OUTPUT/frontend/LanguageContext.jsx" 2>/dev/null
cp frontend/src/contexts/ThemeContext.jsx "$OUTPUT/frontend/ThemeContext.jsx" 2>/dev/null

# Hooks & Services
cp frontend/src/hooks/useProjects.js "$OUTPUT/frontend/useProjects.js" 2>/dev/null
cp frontend/src/services/api.js "$OUTPUT/frontend/api.js" 2>/dev/null

# i18n
cp frontend/src/locales/fa/translation.json "$OUTPUT/frontend/translation_fa.json" 2>/dev/null
cp frontend/src/locales/en/translation.json "$OUTPUT/frontend/translation_en.json" 2>/dev/null

echo "✅ Done! Files copied to: $OUTPUT"