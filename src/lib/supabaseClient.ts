import { createClient } from "@supabase/supabase-js";
import { ENV_CONFIG } from "../constants/config";

const supabaseUrl = ENV_CONFIG.SUPABASE_URL || '';
const supabaseKey = ENV_CONFIG.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are MISSING! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel/Local settings.");
}

// Fallback to placeholder to prevent global crash
const clientUrl = supabaseUrl || 'https://VITE_SUPABASE_URL_IS_MISSING.supabase.co';
const clientKey = supabaseKey || 'VITE_SUPABASE_ANON_KEY_IS_MISSING';

// Export for diagnostics
export const getSupabaseConfig = () => ({
    url: clientUrl,
    key: clientKey,
    isUrlPlaceholder: clientUrl.includes('IS_MISSING'),
    isKeyPlaceholder: clientKey.includes('IS_MISSING')
});

export const supabase = createClient(clientUrl, clientKey);
