import { createClient } from "@supabase/supabase-js";
import { ENV_CONFIG } from "../constants/config";

const supabaseUrl = ENV_CONFIG.SUPABASE_URL || '';
const supabaseKey = ENV_CONFIG.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are MISSING! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel/Local settings.");
}

// Fallback to placeholder to prevent global crash
const clientUrl = supabaseUrl || 'https://placeholder-url-missing.supabase.co';
const clientKey = supabaseKey || 'placeholder-key-missing';

export const supabase = createClient(clientUrl, clientKey);
