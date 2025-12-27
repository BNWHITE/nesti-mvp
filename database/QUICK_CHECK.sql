-- ============================================
-- SCRIPT DE VÉRIFICATION RAPIDE - NESTI
-- ============================================

-- Vérifier les tables
SELECT '=== TABLES ===' as section;
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'user_profiles', 'posts', 'post_reactions', 'comments', 'notifications')
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT '=== POLITIQUES RLS ===' as section;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les données
SELECT '=== DONNÉES ===' as section;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'User Profiles:' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Posts:' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 'Post Reactions:' as table_name, COUNT(*) as count FROM post_reactions
UNION ALL
SELECT 'Comments:' as table_name, COUNT(*) as count FROM comments;

-- Test de connexion (devrait réussir si authentifié)
SELECT '=== TEST CONNEXION ===' as section;
SELECT
  auth.uid() as current_user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN '✅ CONNECTÉ' ELSE '❌ NON CONNECTÉ' END as status;

-- Test d'insertion like (si connecté et posts existent)
SELECT '=== TEST LIKE ===' as section;
DO $$
DECLARE
    user_id UUID := auth.uid();
    post_record RECORD;
    result TEXT;
BEGIN
    IF user_id IS NULL THEN
        result := '❌ NON CONNECTÉ - Impossible de tester';
    ELSE
        -- Chercher un post
        SELECT id INTO post_record FROM posts LIMIT 1;

        IF post_record.id IS NULL THEN
            result := '❌ AUCUN POST - Créer un post d''abord';
        ELSE
            -- Tester insertion like
            INSERT INTO post_reactions (post_id, user_id, reaction_type)
            VALUES (post_record.id, user_id, 'like')
            ON CONFLICT (post_id, user_id, reaction_type) DO NOTHING;

            result := '✅ LIKE TEST RÉUSSI - ID: ' || post_record.id;
        END IF;
    END IF;

    RAISE NOTICE '%', result;
END $$;