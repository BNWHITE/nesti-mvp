-- Vérifier que les tables existent et ont les bonnes colonnes
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier post_reactions
SELECT 'post_reactions' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'post_reactions' AND table_schema = 'public';

-- 2. Vérifier comments
SELECT 'comments' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments' AND table_schema = 'public';

-- 3. Vérifier les politiques RLS actives
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('post_reactions', 'comments');

-- 4. Vérifier qu'il y a des posts dans la base
SELECT id, content, author_id, family_id FROM posts LIMIT 5;

-- 5. Test: Insérer un like de test (remplacez les UUIDs)
-- INSERT INTO post_reactions (post_id, user_id, reaction_type) 
-- VALUES ('uuid-du-post', 'uuid-de-lutilisateur', 'like');
