# AGENTS.md — dorsadesign

## Branch flow (development-first)

- Active work branch: `development`. Eat, sleep, commit on `development`; merge to `main` only for releases.
- Never commit directly to `main`. Open a PR `development` → `main` when cutting a release.
- Keep commits small and push `development` regularly (`git push origin development`).

## Repo layout

- `frontend/` — Vite + React 19 portfolio site (Persian/English, Tailwind).
- `backend/` — FastAPI API (SQLAlchemy + Alembic, Postgres). Being phased out in favor of Supabase.
- `supabase/` — data-migration SQL (`migrate_data.sql`).
- `docker-compose.yml` / `Dockerfile.backend` / `Dockerfile.frontend` — legacy self-hosted deploy.

## Build / test commands

```bash
# Frontend
cd frontend && npm install
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # production build → frontend/dist
npm run lint     # eslint

# Backend
cd backend
pip install -r requirements/base.txt   # or requirements/dev.txt for local dev
pytest                                 # backend/tests/ (auth, projects, admin, crud, models)
alembic upgrade head                   # apply DB migrations
python seed_admin.py                   # seed initial admin user
uvicorn app.main:app --reload          # local API → http://localhost:8000
```

## Environment

- Backend vars: root `.env.example` (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `UPLOAD_DIR`, …).
  Copy to `.env` — never commit real values.
- Frontend vars (Vite, **missing from `.env.example` — add as needed**):
  `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Auth is Supabase Auth now (`frontend/src/lib/`, `contexts/`): login via
  `signInWithPassword`, role from `app_metadata.role`. Do not reintroduce hand-rolled JWT.

## Supabase notes

- Project images live in Supabase Storage; catalogue data migrates via `supabase/migrate_data.sql`
  (run AFTER the schema in Supabase SQL Editor).
- `profiles` table mirrors auth users; admin role is set in Dashboard → Auth → Users → `app_metadata: {"role": "admin"}`.

## Commit conventions

- Observed history style: `fix: …`, `refactor: …`, or plain imperative summary
  (e.g. `Migrate frontend auth from FastAPI JWT to Supabase Auth`).
- Use `type(scope): subject` where it fits (`fix`, `feat`, `refactor`, `chore`, `docs`).
- No CI on this repo — run `pytest` + `npm run build` locally before pushing.

## Safety

- Never print or commit secrets (`.env`, service-role keys, DB passwords).
- `dorsadesign_backup.sql` at root is untracked local data — leave it alone.
