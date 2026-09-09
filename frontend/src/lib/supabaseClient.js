// frontend/src/lib/supabaseClient.js
// Single shared Supabase client (Supabase Auth + PostgREST).
// Credentials come from Vite env vars — never hardcode keys here.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — Supabase Auth will not work. ' +
      'Set them in frontend/.env.local (local) and in Vercel project settings (deploy).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
