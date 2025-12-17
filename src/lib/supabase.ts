import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Lo schema SQL completo è in: supabase-schema.sql
// Per usare Supabase, impostare le variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured (solo se le variabili d'ambiente sono impostate)
// Se non configurato, l'app userà localStorage come fallback
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.length > 0);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
