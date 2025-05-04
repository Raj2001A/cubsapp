import { createClient } from '@supabase/supabase-js';

// Use Vite-style env variables for frontend
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  // eslint-disable-next-line no-console
  console.error('Supabase URL is missing. Please set VITE_SUPABASE_URL in your .env file.');
}
if (!supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Supabase Anon Key is missing. Please set VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
