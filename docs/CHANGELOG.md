# Change Log — dorsadesign

## [Development] — 2026-09-09 — Supabase Auth migration (`85d6986`)

- Migrated frontend auth from FastAPI JWT to Supabase Auth (`signInWithPassword`, session token, role from `app_metadata`).

## 2026-08-25 — Docker config + admin project pages (`6b85074`)

- Updated docker config and admin project pages / API service; added slug-column drop migration.

## 2026-08-16 — README + framing (`63f4299`)

- Added problem/solution framing, Persian portfolio README, fixed repo link.

## 2026-08-15 — Restore + Supabase move (`952dbe4`, `b6f72cd`)

- Restored backend/frontend accidentally deleted earlier; moved persistence toward Supabase.

## 2026-06-26/27 — Slug removal + monolingual FA

- Removed `slug` from project API/endpoints/schemas; project forms and fields are Persian-only now.
- Fixed Alembic migration state (conditional `ix_projects_slug` index check).

## 2026-06-27/29 — Docker entrypoint + uploads

- Switched to `docker-entrypoint.sh` for container init; `UPLOAD_DIR` via settings; cleaned unused envs.
