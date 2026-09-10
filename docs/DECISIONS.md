# Architecture Decisions — dorsadesign

## D1 — Auth: FastAPI JWT → Supabase Auth (2026-09)

- **Context:** Frontend maintained its own JWT login against the FastAPI backend.
- **Decision:** Use Supabase Auth (`signInWithPassword`); role from `app_metadata.role`.
- **Consequences:** Backend auth endpoints are legacy; do not build new features on them.

## D2 — Persistence: self-hosted Postgres → Supabase

- **Context:** Docker Compose ran its own Postgres; images moving to Supabase Storage.
- **Decision:** Migrate data via `supabase/migrate_data.sql`; new reads go to Supabase.
- **Status:** In progress — backend still present, Docker files retained until cutover is done.

## D3 — Content: Persian-only project fields

- **Context:** Bilingual slug/translated fields added complexity with no content to fill them.
- **Decision:** Project forms and API are monolingual (Persian); `slug` removed from endpoints.
