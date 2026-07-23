import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable lookup supporting Vite (VITE_) and Next/Standard (NEXT_PUBLIC_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aiwuursofhcxiunklyuy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_WwZ9NhvFGG8F0g1WRl02sg_CiJXRcmv';

// Detect if valid Cloud Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
