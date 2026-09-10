---
name: supabase-auth-migration
description: Use when migrating a Vite+React frontend from hand-rolled JWT auth to Supabase Auth.
---

# Supabase Auth Migration (Vite + React)

Learned migrating this repo's frontend off FastAPI JWT (commit `85d6986`).

## Steps

1. Add `@supabase/supabase-js`; set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
2. Replace login call with `supabase.auth.signInWithPassword({ email, password })`.
3. Use the session `access_token` for authenticated requests; listen to `onAuthStateChange`.
4. Read the role from `app_metadata.role` (set in Supabase Dashboard → Auth → Users),
   with a `profiles`-table fallback for reads.
5. Delete the legacy JWT store/refresh logic only after all call sites are switched.

## Pitfalls

- A stale `/api/*` rewrite (e.g. to PostgREST) breaks FastAPI-shaped calls with
  `401 No API key found` — check `vercel.json`/proxy config after switching stacks.
- Verify you are deploying the repo you edited (compare served bundle hash before/after push).
