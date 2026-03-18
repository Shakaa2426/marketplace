import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from './info';

// Create singleton Supabase client instance
export const supabase = createSupabaseClient(
  supabaseUrl,
  publicAnonKey
);

// Also export createClient for compatibility
export function createClient() {
  return supabase;
}
