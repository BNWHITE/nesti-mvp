-- =====================================================
-- SCRIPT COMPLET POUR LIKES, COMMENTAIRES, NOTIFICATIONS
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. VÉRIFIER/CRÉER LA TABLE user_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view profiles" ON user_profiles;
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TABLE POUR LIKES SUR COMMENTAIRES
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comment reactions" ON comment_reactions;
CREATE POLICY "Anyone can view comment reactions" ON comment_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can add comment reactions" ON comment_reactions;
CREATE POLICY "Users can add comment reactions" ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comment reactions" ON comment_reactions;
CREATE POLICY "Users can delete own comment reactions" ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- 3. AJOUTER parent_id POUR LES RÉPONSES AUX COMMENTAIRES
-- =====================================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 4. TABLE NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Qui reçoit la notification
  actor_id UUID NOT NULL, -- Qui a fait l'action
  type TEXT NOT NULL CHECK (type IN ('like_post', 'like_comment', 'comment', 'reply', 'share', 'mention')),
  post_id UUID,
  comment_id UUID,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can create notifications" ON notifications;
CREATE POLICY "Anyone can create notifications" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 5. INDEX POUR PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- 6. VÉRIFIER/CORRIGER LES RLS SUR post_reactions
-- =====================================================
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view post reactions" ON post_reactions;
CREATE POLICY "Anyone can view post reactions" ON post_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can add post reactions" ON post_reactions;
CREATE POLICY "Users can add post reactions" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own post reactions" ON post_reactions;
CREATE POLICY "Users can delete own post reactions" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- 7. VÉRIFIER/CORRIGER LES RLS SUR comments
-- =====================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can add comments" ON comments;
CREATE POLICY "Users can add comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- 8. VÉRIFICATION FINALE
-- =====================================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'post_reactions', 'comments', 'comment_reactions', 'notifications');
