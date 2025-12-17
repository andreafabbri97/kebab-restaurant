import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Lo schema SQL completo è in: supabase-schema.sql

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jhyidrhckhoavlmmmlwq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWlkcmhja2hvYXZsbW1tbHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODkzMzIsImV4cCI6MjA4MTU2NTMzMn0.8l7i5EJiF_xJZSO__y83S7kw-bDq2PVH24sl4f5ESyM';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
