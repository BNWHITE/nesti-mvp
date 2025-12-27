-- ============================================
-- FIX: Corriger la contrainte users_role_check
-- ============================================
-- Le code JS utilise: admin, parent, teen, child, grandparent
-- La contrainte SQL acceptait: admin, parent, ado, enfant
-- On met à jour pour accepter les deux formats

-- 1. D'abord, supprimer l'ancienne contrainte sur la table users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Ajouter une nouvelle contrainte qui accepte tous les rôles valides
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'parent', 'teen', 'child', 'grandparent', 'ado', 'enfant'));

-- 3. Même chose pour family_members si elle existe
ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_role_check;
ALTER TABLE family_members ADD CONSTRAINT family_members_role_check 
  CHECK (role IN ('admin', 'parent', 'teen', 'child', 'grandparent', 'ado', 'enfant'));

-- 4. Mettre à jour les utilisateurs existants avec des rôles obsolètes
UPDATE users SET role = 'teen' WHERE role = 'ado';
UPDATE users SET role = 'child' WHERE role = 'enfant';

UPDATE family_members SET role = 'teen' WHERE role = 'ado';
UPDATE family_members SET role = 'child' WHERE role = 'enfant';

-- 5. Vérifier les rôles après correction
SELECT id, email, role FROM users ORDER BY created_at DESC LIMIT 20;
