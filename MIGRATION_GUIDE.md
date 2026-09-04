# Dorsadesign Migration Guide: Docker → Vercel + Supabase

## Overview
This guide covers migrating from the current Docker-based deployment to a modern serverless architecture:
- **Frontend**: Vercel (React + Vite)
- **Database + Auth + Storage**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Backend API**: Railway/Render (FastAPI) — optional, can be replaced with Supabase Edge Functions later

---

## Phase 1: Supabase Setup (Do this first)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose organization, name: `dorsadesign`
3. Set database password (save it!)
4. Region: closest to users (e.g., `eu-west-1` for Iran/Europe)
5. Wait for provisioning (~2 minutes)

### 1.2 Run Database Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/schema.sql` and run
3. Verify tables created: `profiles`, `projects`, `project_images`

### 1.3 Configure Auth
1. **Authentication > Providers**: Enable Email, Google, GitHub
2. **Authentication > URL Configuration**:
   - Site URL: `https://dorsadesign.ir`
   - Redirect URLs: 
     - `https://dorsadesign.ir/auth/callback`
     - `https://dorsadesign-git-main-<username>.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback`

### 1.4 Create Storage Bucket
1. **Storage > New Bucket**: `project-images`
2. Public bucket: ✅ Yes
3. Run storage policies from `supabase/schema.sql` (commented section at bottom)

### 1.5 Get API Keys
1. **Settings > API**:
   - `Project URL` → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (backend only!)

---
## Current Status (as of migration continuation)

**✅ Completed:**
- Docker database dump saved to `dorsadesign_backup.sql` (7KB, 1 admin user, 1 project)
- Schema analysis complete: Current DB has `admins` and `projects` tables with custom enums; Supabase schema uses `profiles` (auth-linked) and `projects` with different structure
- Created `supabase/migrate_data.sql` - transforms docker data to Supabase schema (admins→auth.users+profiles, projects→projects with field mapping, gallery_images→project_images)
- Frontend `vercel.json` configured (needs Supabase project ref update in rewrites)
- Frontend uses `@supabase/supabase-js` v2, React 19, Vite 8, Tailwind 3
- Backend ready: FastAPI + SQLAlchemy + Alembic, requirements in `backend/requirements/`

**🔄 Next Steps (require user action):**

### 1. Supabase Setup (User must provide)
- [ ] Create Supabase project at supabase.com
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Enable Auth providers (Email, Google, GitHub)
- [ ] Create `project-images` storage bucket (public)
- [ ] Run storage policies from schema.sql (commented section)
- [ ] Provide: Project URL, anon key, service_role key

### 2. Database Migration
- [ ] Copy data from `dorsadesign_backup.sql` into `supabase/migrate_data.sql` temp tables
- [ ] Run `supabase/migrate_data.sql` in SQL Editor
- [ ] Verify: `SELECT COUNT(*) FROM profiles, projects, project_images;`

### 3. Frontend Deployment (Vercel)
- [ ] Create `.env.local` in `frontend/` with Supabase credentials
- [ ] Update `vercel.json` rewrites with actual Supabase project ref
- [ ] Deploy via Vercel CLI or GitHub integration
- [ ] Add env vars in Vercel Dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Configure custom domain `dorsadesign.ir`

### 4. Backend Deployment (Railway - Optional)
- [ ] Create `railway.json` (template in guide)
- [ ] Deploy to Railway with Supabase DATABASE_URL
- [ ] Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SECRET_KEY`, `CORS_ORIGINS`
- [ ] Update Vercel: `VITE_API_URL=https://your-api.railway.app`

### 5. File Storage Migration
- [ ] Download uploads volume: `docker run --rm -v dorsadesign_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .`
- [ ] Upload to Supabase Storage bucket `project-images`

---

## Schema Mapping Reference

| Docker Table | Supabase Table | Notes |
|--------------|----------------|-------|
| `admins` | `auth.users` + `profiles` | Password hashes don't migrate; users must reset password or use OAuth |
| `projects` | `projects` | Field mapping: project_type→category, status→status, cover_image→featured_image_url, gallery_images→gallery_images[] + project_images table |
| `alembic_version` | (drop) | Not needed in Supabase |

---

## Required from User

Please provide:
1. **Supabase Project URL** (e.g., `https://xyz.supabase.co`)
2. **Supabase anon key** (public, for frontend)
3. **Supabase service_role key** (secret, for backend only)
4. **Vercel account** (for GitHub integration or CLI deploy)
5. **Railway account** (optional, for backend API)

Once you provide the Supabase credentials, I can:
- Create the `.env` files
- Update `vercel.json` with the correct project ref
- Guide through running the migration SQL
- Deploy to Vercel

---

## Phase 2: Database Migration (from Docker)

### 2.1 Dump Current Database
```bash
# On the current server
docker exec dorsadesign_db pg_dump -U postgres dorsadesign > dorsadesign_backup.sql
# Or if using docker compose:
docker compose exec postgres pg_dump -U postgres dorsadesign > dorsadesign_backup.sql
```

### 2.2 Clean and Import
1. Edit `dorsadesign_backup.sql`:
   - Remove `CREATE DATABASE` / `DROP DATABASE` statements
   - Remove `OWNER` / `GRANT` statements for `postgres` user
   - Keep only `CREATE TABLE`, `INSERT`, `CREATE INDEX`, `ALTER TABLE`

2. In Supabase **SQL Editor**, run the cleaned SQL in chunks

### 2.3 Verify Data
```sql
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM profiles;
```

---

## Phase 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm install
npm run build  # Test build works
```

### 3.2 Deploy to Vercel
```bash
# Option A: Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Option B: GitHub Integration (Recommended)
# 1. Push to GitHub
# 2. Go to vercel.com > New Project > Import from GitHub
# 3. Select dorsadesign repo
# 4. Framework: Vite (auto-detected)
# 4. Add Environment Variables from .env.example
# 5. Deploy
```

### 3.3 Configure Custom Domain
1. Vercel Dashboard > Project > Settings > Domains
2. Add `dorsadesign.ir` and `www.dorsadesign.ir`
3. Configure DNS:
   - Type: `CNAME`, Name: `@`, Value: `cname.vercel-dns.com`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

---

## Phase 4: Backend Deployment (Railway - Optional)

### 4.1 Prepare Backend for Railway
```bash
cd backend
# Ensure requirements/prod.txt has all deps
# Create railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "../Dockerfile.backend"
  },
  "deploy": {
    "startCommand": "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
EOF
```

### 4.2 Deploy to Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway add --database postgresql  # Skip if using Supabase directly
railway variables set DATABASE_URL="postgresql://..." # Supabase URL
railway variables set SUPABASE_URL="https://..."
railway variables set SUPABASE_SERVICE_ROLE_KEY="..."
railway variables set SECRET_KEY="..."
railway variables set CORS_ORIGINS='["https://dorsadesign.ir","https://dorsadesign-git-main-*.vercel.app"]'
railway up
```

### 4.3 Update Frontend API URL
In Vercel: `VITE_API_URL=https://your-api.railway.app`

---

## Phase 5: File Storage Migration

### 5.1 Download Current Uploads
```bash
# From Docker volume
docker run --rm -v dorsadesign_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

### 5.2 Upload to Supabase Storage
```bash
# Extract and upload via Supabase Dashboard or CLI
# Supabase CLI:
supabase storage cp uploads/* project-images:uploads/
```

---

## Phase 6: Testing Checklist

- [ ] Auth: Sign up / Login / OAuth works
- [ ] Auth: Email verification flow
- [ ] Auth: Password reset
- [ ] Projects: List published projects
- [ ] Projects: Create/Edit/Delete (own projects)
- [ ] Projects: Image upload to Supabase Storage
- [ ] Projects: Filtering by category
- [ ] Projects: Multilingual content (EN/FA)
- [ ] Admin: Dashboard access
- [ ] Realtime: Project updates reflect instantly
- [ ] Domain: HTTPS works on dorsadesign.ir
- [ ] Performance: Lighthouse > 90

---

## Rollback Plan
If issues arise:
1. Keep Docker stack running during migration
2. DNS TTL: Set low (300s) before switch
3. Can revert DNS to old IP in minutes

---

## Cost Estimate (Monthly)

| Service | Tier | Est. Cost |
|---------|------|-----------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Railway | Hobby | $5-10 |
| **Total** | | **~$50-55** |

*vs Current VPS: ~$20-40 but with server management overhead*

---

## Next Steps After Migration

1. **Monitor**: Set up Vercel Analytics + Supabase Logs
2. **Optimize**: Add CDN caching headers, image optimization
3. **Migrate Backend**: Convert FastAPI endpoints to Supabase Edge Functions (Deno) one by one
4. **Scale**: Supabase handles connection pooling automatically