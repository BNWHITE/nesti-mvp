-- ============================================
-- NESTI MVP - Supabase Database Migrations
-- Pour fonctionnalités : Commentaires, Médias, Gestion Profils
-- Date: 2025-12-11
-- ============================================

-- ============================================
-- 1. CRÉATION TABLE COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();


-- ============================================
-- 2. CRÉATION TABLE MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size INTEGER CHECK (size > 0),
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- Pour vidéos (en secondes)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);


-- ============================================
-- 3. MODIFICATION TABLE USERS
-- ============================================
-- Ajouter colonnes pour profil enrichi
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT CHECK (length(bio) <= 500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessibility_needs JSONB DEFAULT NULL;

-- Préférences notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "push": true,
  "email": true,
  "sounds": true,
  "vibration": true,
  "post_comments": true,
  "event_reminders": true,
  "family_invitations": true
}'::jsonb;

-- Paramètres de confidentialité
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "profile_visibility": "family",
  "post_visibility": "family",
  "comment_permissions": "family",
  "location_visible": false
}'::jsonb;

-- Paramètres de sécurité
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{
  "two_factor_enabled": false,
  "login_notifications": true
}'::jsonb;

-- Statistiques
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;


-- ============================================
-- 4. MODIFICATION TABLE POSTS (si nécessaire)
-- ============================================
-- Ajouter colonnes pour médias et commentaires
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_photo BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT false;


-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) - COMMENTS
-- ============================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Tous peuvent lire les commentaires de leur famille
CREATE POLICY "Users can read family comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = comments.post_id
      AND u.family_id IN (
        SELECT family_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Les utilisateurs peuvent créer leurs propres commentaires
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres commentaires
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres commentaires
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) - MEDIA
-- ============================================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Tous peuvent lire les médias de leur famille
CREATE POLICY "Users can read family media" ON media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = media.user_id
      AND u.family_id IN (
        SELECT family_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Les utilisateurs peuvent uploader leurs médias
CREATE POLICY "Users can upload media" ON media
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres médias
CREATE POLICY "Users can delete own media" ON media
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 7. FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour incrémenter le compteur de commentaires
CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comment_count = comment_count + 1
  WHERE id = NEW.post_id;
  
  UPDATE users
  SET comment_count = comment_count + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_comment_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comment_count();


-- Fonction pour décrémenter le compteur de commentaires
CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comment_count = GREATEST(comment_count - 1, 0)
  WHERE id = OLD.post_id;
  
  UPDATE users
  SET comment_count = GREATEST(comment_count - 1, 0)
  WHERE id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_comment_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comment_count();


-- Fonction pour incrémenter le compteur de médias
CREATE OR REPLACE FUNCTION increment_post_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE posts
    SET 
      media_count = media_count + 1,
      has_photo = (NEW.type = 'photo') OR has_photo,
      has_video = (NEW.type = 'video') OR has_video
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_media_insert
  AFTER INSERT ON media
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_media_count();


-- Fonction pour décrémenter le compteur de médias
CREATE OR REPLACE FUNCTION decrement_post_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.post_id IS NOT NULL THEN
    UPDATE posts
    SET media_count = GREATEST(media_count - 1, 0)
    WHERE id = OLD.post_id;
    
    -- Recalculer has_photo et has_video
    UPDATE posts
    SET 
      has_photo = EXISTS(SELECT 1 FROM media WHERE post_id = OLD.post_id AND type = 'photo'),
      has_video = EXISTS(SELECT 1 FROM media WHERE post_id = OLD.post_id AND type = 'video')
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_media_delete
  AFTER DELETE ON media
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_media_count();


-- Fonction pour mettre à jour last_active_at
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_comment_activity
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();


-- ============================================
-- 8. VUES UTILES
-- ============================================

-- Vue pour obtenir les commentaires avec informations utilisateur
CREATE OR REPLACE VIEW comments_with_users AS
SELECT 
  c.id,
  c.post_id,
  c.content,
  c.created_at,
  c.updated_at,
  u.id as user_id,
  u.email as user_email,
  u.full_name as user_name,
  u.avatar_url as user_avatar,
  u.role as user_role
FROM comments c
JOIN users u ON c.user_id = u.id;


-- Vue pour obtenir les médias avec informations utilisateur
CREATE OR REPLACE VIEW media_with_users AS
SELECT 
  m.id,
  m.post_id,
  m.type,
  m.url,
  m.thumbnail_url,
  m.size,
  m.mime_type,
  m.width,
  m.height,
  m.duration,
  m.created_at,
  u.id as user_id,
  u.email as user_email,
  u.full_name as user_name,
  u.avatar_url as user_avatar
FROM media m
JOIN users u ON m.user_id = u.id;


-- ============================================
-- 9. DONNÉES DE TEST (OPTIONNEL - À SUPPRIMER EN PRODUCTION)
-- ============================================
-- Décommenter pour ajouter des données de test

-- INSERT INTO comments (post_id, user_id, content) VALUES
-- ((SELECT id FROM posts LIMIT 1), (SELECT id FROM users LIMIT 1), 'Premier commentaire de test!'),
-- ((SELECT id FROM posts LIMIT 1), (SELECT id FROM users LIMIT 1 OFFSET 1), 'Super post! 👍');


-- ============================================
-- 10. STORAGE BUCKETS (À CRÉER MANUELLEMENT DANS SUPABASE DASHBOARD)
-- ============================================
-- Allez dans Storage → Create bucket :
-- 1. Bucket "avatars" (Public, Max file size: 2MB)
-- 2. Bucket "photos" (Public, Max file size: 10MB)
-- 3. Bucket "videos" (Public, Max file size: 50MB)

-- Policies Storage (à ajouter dans chaque bucket) :
-- SELECT: authenticated users can read
-- INSERT: authenticated users can upload their own files
-- DELETE: authenticated users can delete their own files


-- ============================================
-- VÉRIFICATIONS FINALES
-- ============================================
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('comments', 'media');

-- Vérifier les colonnes ajoutées à users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('avatar_url', 'phone', 'bio', 'notification_preferences', 'privacy_settings', 'accessibility_needs');

-- Compter les policies RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('comments', 'media');


-- ============================================
-- FIN DES MIGRATIONS
-- ============================================
-- Après avoir exécuté ce script :
-- 1. Vérifiez dans Supabase Dashboard que toutes les tables sont créées
-- 2. Créez les 3 buckets Storage manuellement
-- 3. Testez l'application
-- ============================================
