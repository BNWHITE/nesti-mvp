-- =====================================================
-- FIX: AJOUTER LES RELATIONS MANQUANTES ENTRE TABLES
-- Résoudre l'erreur: "Could not find a relationship between 'posts' and 'user_profiles'"
-- =====================================================

-- 1. AJOUTER LES CLÉS ÉTRANGÈRES MANQUANTES
-- =====================================================

-- Ajouter la clé étrangère pour posts.user_id -> user_profiles.id
-- (Seulement si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_user_id_fkey'
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la clé étrangère pour posts.author_id -> user_profiles.id
-- (Seulement si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_author_id_fkey'
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la clé étrangère pour post_reactions.user_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'post_reactions_user_id_fkey'
    AND table_name = 'post_reactions'
  ) THEN
    ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la clé étrangère pour comments.author_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_author_id_fkey'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la clé étrangère pour notifications.user_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_user_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la clé étrangère pour notifications.actor_id -> user_profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_actor_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. VÉRIFICATION DES RELATIONS
-- =====================================================

-- Vérifier que les relations ont été ajoutées
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('posts', 'post_reactions', 'comments', 'notifications')
ORDER BY tc.table_name, tc.constraint_name;