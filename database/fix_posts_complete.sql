-- =====================================================
-- MIGRATION COMPLÈTE POUR CORRIGER LE SCHÉMA DES POSTS
-- Résoudre les problèmes d'images/vidéos et de persistance
-- =====================================================

-- 1. AJOUTER LA COLONNE image_url À posts
-- =====================================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. VÉRIFIER/CORRIGER LA STRUCTURE DE LA TABLE posts
-- =====================================================
-- S'assurer que toutes les colonnes nécessaires existent

DO $$
BEGIN
  -- Ajouter image_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN image_url TEXT;
  END IF;
  
  -- Ajouter video_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN video_url TEXT;
  END IF;
  
  -- Ajouter has_photo si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'has_photo'
  ) THEN
    ALTER TABLE posts ADD COLUMN has_photo BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Ajouter has_video si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'has_video'
  ) THEN
    ALTER TABLE posts ADD COLUMN has_video BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Ajouter media_count si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'media_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_count INTEGER DEFAULT 0;
  END IF;
  
  -- Ajouter likes_count si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. AJOUTER LES CLÉS ÉTRANGÈRES POUR LES RELATIONS
-- =====================================================

-- posts.user_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_user_id_fkey' AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- posts.author_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_author_id_fkey' AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- posts.family_id -> families.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_family_id_fkey' AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_family_id_fkey
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. POLITIQUES RLS POUR posts
-- =====================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can view posts in their family" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Politique pour voir les posts (tous les utilisateurs authentifiés peuvent voir)
CREATE POLICY "Users can view all posts" ON posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Politique pour créer des posts (utilisateurs authentifiés)
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = author_id);

-- Politique pour modifier ses propres posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = author_id);

-- Politique pour supprimer ses propres posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = author_id);

-- 5. VÉRIFIER LA STRUCTURE FINALE
-- =====================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;