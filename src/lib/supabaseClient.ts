import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are MISSING! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel/Local settings.");
}

// Fallback to placeholder to prevent global crash, but it will still fail on API calls
const clientUrl = supabaseUrl || 'https://placeholder-url-missing.supabase.co';
const clientKey = supabaseKey || 'placeholder-key-missing';

export const supabase = createClient(clientUrl, clientKey);
