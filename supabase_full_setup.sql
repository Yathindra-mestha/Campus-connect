-- ==========================================
-- UNIFIED SUPABASE SETUP SCRIPT
-- ==========================================

-- 1. Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  google_id TEXT NULL,
  name TEXT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT NULL,
  branch TEXT NULL,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup existing policies (to prevent duplicate errors)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 4. Create policies

-- SELECT: Allow all authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Allow authenticated users to insert their *own* profile
CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Allow users to update only their *own* profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
