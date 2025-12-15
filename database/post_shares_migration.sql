-- Migration: Add post_shares table for sharing posts with family members
-- Date: 2025-12-15

-- ============================================
-- POST SHARES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate shares
  UNIQUE(post_id, shared_by, shared_with)
);

-- Index for optimizing queries
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_shared_with ON post_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_post_shares_shared_by ON post_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - POST SHARES
-- ============================================
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- Users can view shares they received or sent
CREATE POLICY "Users can view their shares" ON post_shares
  FOR SELECT
  USING (
    auth.uid() = shared_with OR auth.uid() = shared_by
  );

-- Users can create shares
CREATE POLICY "Users can create shares" ON post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- Users can delete shares they created
CREATE POLICY "Users can delete their shares" ON post_shares
  FOR DELETE
  USING (auth.uid() = shared_by);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that the table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'post_shares';

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'post_shares';
