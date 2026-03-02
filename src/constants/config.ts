export const ENV_CONFIG = {
    SUPABASE_URL: (import.meta as any).env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '',
    GOOGLE_CLIENT_ID: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '779781376861-biqrgahce5qi427un2o1go6m65l411h6.apps.googleusercontent.com',
    GITHUB: {
        OWNER: (import.meta as any).env.VITE_GITHUB_REPO_OWNER || 'Yathindra-mestha',
        NAME: (import.meta as any).env.VITE_GITHUB_REPO_NAME || 'Campus_connect',
    }
};
