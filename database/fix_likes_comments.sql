-- =====================================================
-- Script pour corriger les likes et commentaires
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'post_reactions', 'comments', 'profiles', 'family_members');

-- 2. Vérifier la structure de post_reactions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'post_reactions';

-- 3. Vérifier la structure de comments
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comments';

-- =====================================================
-- SI LES TABLES N'EXISTENT PAS, LES CRÉER :
-- =====================================================

-- Créer post_reactions si elle n'existe pas
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebration', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Créer comments si elle n'existe pas
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVER RLS ET CRÉER DES POLITIQUES PERMISSIVES
-- =====================================================

-- Pour post_reactions
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view reactions on posts from their families" ON post_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can remove their reactions" ON post_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON post_reactions;

-- Nouvelles politiques plus simples
CREATE POLICY "Anyone can view reactions" ON post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Pour comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view comments on posts from their families" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can add comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Nouvelles politiques plus simples
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- Lister toutes les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('post_reactions', 'comments')
ORDER BY tablename, policyname;
