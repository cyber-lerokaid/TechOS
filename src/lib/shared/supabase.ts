import { createClient } from '@supabase/supabase-js';

// Using fallback values for demo purposes if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eudqoegvgqiomtwqzmwk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vh9hoP2GkvkBSie2GQYM4g_JCwMjSsc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
