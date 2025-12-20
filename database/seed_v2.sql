-- ============================================
-- TEST DATA SEED for Nesti MVP v2
-- DEVELOPMENT ENVIRONMENT ONLY
-- ============================================

-- WARNING: This contains FAKE test data only
-- DO NOT use real personal information
-- DO NOT run in production

BEGIN;

-- ============================================
-- SEED ACTIVITIES (Public Catalog)
-- ============================================

INSERT INTO activities (id, title, description, category, location, price_range, min_age, max_age, rating, image_url, external_url, is_active) VALUES
(gen_random_uuid(), 'Parc de la Villette', 'Grand parc urbain avec espaces de jeux, jardins thématiques et activités culturelles', 'Parcs et jardins', 'Paris 19e, Île-de-France', 'Gratuit', 0, 99, 4.5, NULL, 'https://lavillette.com', true),
(gen_random_uuid(), 'Cité des Sciences', 'Musée interactif de sciences et technologies avec expositions pour tous les âges', 'Musées et culture', 'Paris 19e, Île-de-France', '€€', 3, 99, 4.7, NULL, 'https://cite-sciences.fr', true),
(gen_random_uuid(), 'Aquarium de Paris', 'Découverte du monde marin avec bassins tactiles et spectacles de requins', 'Loisirs', 'Paris 16e, Trocadéro', '€€€', 2, 99, 4.3, NULL, 'https://aquariumdeparis.com', true),
(gen_random_uuid(), 'Accrobranche Forest', 'Parcours d''accrobranche dans les arbres avec différents niveaux de difficulté', 'Sport et activités', 'Rambouillet, Île-de-France', '€€', 6, 99, 4.6, NULL, 'https://forest-aventure.com', true),
(gen_random_uuid(), 'Atelier Cuisine Enfants', 'Cours de cuisine ludique pour enfants avec chef professionnel', 'Ateliers créatifs', 'Paris 11e, Île-de-France', '€€', 5, 12, 4.8, NULL, 'https://ateliers-cuisine.fr', true),
(gen_random_uuid(), 'Piscine Aquaboulevard', 'Centre aquatique avec toboggans, vagues et espaces détente', 'Sport et activités', 'Paris 15e, Île-de-France', '€€', 0, 99, 4.4, NULL, 'https://aquaboulevard.fr', true),
(gen_random_uuid(), 'Théâtre Jeune Public', 'Spectacles et pièces de théâtre adaptés aux enfants', 'Spectacles', 'Paris 10e, Île-de-France', '€', 3, 12, 4.5, NULL, 'https://theatre-paris.com', true),
(gen_random_uuid(), 'Ferme Pédagogique', 'Découverte des animaux de la ferme et ateliers nature', 'Nature et animaux', 'Versailles, Île-de-France', '€', 2, 14, 4.7, NULL, 'https://ferme-versailles.fr', true);

-- ============================================
-- SEED TEST FAMILIES
-- ============================================

-- Note: In production, families are created by users
-- These are test families for development

DO $$
DECLARE
  family1_id UUID := gen_random_uuid();
  family2_id UUID := gen_random_uuid();
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
  user3_id UUID := gen_random_uuid();
  user4_id UUID := gen_random_uuid();
BEGIN
  
  -- Insert test families
  INSERT INTO families (id, family_name, description, emoji, subscription_type) VALUES
  (family1_id, 'Famille Martin', 'Une famille parisienne aimant les activités en plein air', '👨‍👩‍👧‍👦', 'free'),
  (family2_id, 'Famille Dupont', 'Famille de Rennes passionnée de culture', '👪', 'premium');
  
  -- Insert test users with encrypted data
  -- Note: In real scenario, use Supabase Auth for user creation
  INSERT INTO users (
    id, 
    email_encrypted, 
    email_hash, 
    first_name_encrypted, 
    last_name_encrypted, 
    password_hash,
    role,
    family_id
  ) VALUES
  (user1_id, encrypt_sensitive('parent1@test.dev'), hash_email('parent1@test.dev'), encrypt_sensitive('Jean'), encrypt_sensitive('Martin'), 'placeholder_hash', 'parent', family1_id),
  (user2_id, encrypt_sensitive('parent2@test.dev'), hash_email('parent2@test.dev'), encrypt_sensitive('Marie'), encrypt_sensitive('Martin'), 'placeholder_hash', 'parent', family1_id),
  (user3_id, encrypt_sensitive('parent3@test.dev'), hash_email('parent3@test.dev'), encrypt_sensitive('Pierre'), encrypt_sensitive('Dupont'), 'placeholder_hash', 'admin', family2_id),
  (user4_id, encrypt_sensitive('teen1@test.dev'), hash_email('teen1@test.dev'), encrypt_sensitive('Lucas'), encrypt_sensitive('Martin'), 'placeholder_hash', 'teen', family1_id);
  
  -- Insert family members
  INSERT INTO family_members (family_id, user_id, role) VALUES
  (family1_id, user1_id, 'admin'),
  (family1_id, user2_id, 'parent'),
  (family1_id, user4_id, 'teen'),
  (family2_id, user3_id, 'admin');
  
  -- Insert test posts with encrypted content
  INSERT INTO posts (
    content_encrypted,
    type,
    author_id,
    family_id
  ) VALUES
  (encrypt_sensitive('Belle journée au parc aujourd''hui! Les enfants se sont bien amusés 🎉'), 'default', user1_id, family1_id),
  (encrypt_sensitive('Première sortie vélo pour Lucas, il est super fier! 🚴'), 'celebration', user2_id, family1_id),
  (encrypt_sensitive('Visite du musée ce weekend, très intéressant!'), 'default', user3_id, family2_id);
  
  -- Insert test events
  INSERT INTO events (
    title,
    description_encrypted,
    start_time,
    end_time,
    location_encrypted,
    family_id,
    creator_id
  ) VALUES
  ('Pique-nique familial', encrypt_sensitive('Rendez-vous au parc pour un pique-nique'), NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', encrypt_sensitive('Parc de la Villette'), family1_id, user1_id),
  ('Réunion de famille', encrypt_sensitive('Repas mensuel tous ensemble'), NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', encrypt_sensitive('Maison'), family2_id, user3_id);
  
  RAISE NOTICE 'Test data seeded successfully';
  RAISE NOTICE 'Family 1 ID: %', family1_id;
  RAISE NOTICE 'Family 2 ID: %', family2_id;
  RAISE NOTICE 'Test user IDs: %, %, %, %', user1_id, user2_id, user3_id, user4_id;
  
END $$;

-- ============================================
-- SEED USER CONSENTS (GDPR Compliance Test)
-- ============================================

-- Add consents for test users
INSERT INTO user_consents (
  user_id,
  consent_type,
  granted,
  granted_at
)
SELECT 
  id,
  consent_type,
  true,
  NOW()
FROM users,
LATERAL (VALUES ('terms'), ('privacy'), ('analytics')) AS t(consent_type)
WHERE email_hash = hash_email('parent1@test.dev');

-- ============================================
-- SEED PARENTAL CONTROLS (Test)
-- ============================================

-- Add parental control for teen user
INSERT INTO parental_controls (
  child_user_id,
  parent_user_id,
  ai_enabled,
  chat_enabled,
  activity_visible_to_parent,
  restrictions
)
SELECT 
  (SELECT id FROM users WHERE email_hash = hash_email('teen1@test.dev')),
  (SELECT id FROM users WHERE email_hash = hash_email('parent1@test.dev')),
  false,
  true,
  true,
  '{"max_screen_time_minutes": 120, "allowed_hours": "09:00-21:00"}'::JSONB;

-- ============================================
-- VERIFY SEED DATA
-- ============================================

DO $$
DECLARE
  activities_count INTEGER;
  families_count INTEGER;
  users_count INTEGER;
  posts_count INTEGER;
  events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO activities_count FROM activities;
  SELECT COUNT(*) INTO families_count FROM families;
  SELECT COUNT(*) INTO users_count FROM users;
  SELECT COUNT(*) INTO posts_count FROM posts;
  SELECT COUNT(*) INTO events_count FROM events;
  
  RAISE NOTICE 'Seed verification:';
  RAISE NOTICE '  Activities: %', activities_count;
  RAISE NOTICE '  Families: %', families_count;
  RAISE NOTICE '  Users: %', users_count;
  RAISE NOTICE '  Posts: %', posts_count;
  RAISE NOTICE '  Events: %', events_count;
END $$;

COMMIT;

-- ============================================
-- TEST QUERIES (for verification)
-- ============================================

-- To verify encryption/decryption works:
-- SELECT 
--   id,
--   decrypt_sensitive(email_encrypted) as email,
--   decrypt_sensitive(first_name_encrypted) as first_name,
--   decrypt_sensitive(last_name_encrypted) as last_name
-- FROM users;

-- To verify posts:
-- SELECT 
--   decrypt_sensitive(content_encrypted) as content,
--   type,
--   created_at
-- FROM posts
-- ORDER BY created_at DESC;

-- To verify RLS (run as authenticated user):
-- SET LOCAL request.jwt.claims = '{"sub": "user-id-here"}';
-- SELECT * FROM posts;

COMMENT ON TABLE activities IS 'Seeded with 8 sample activities for testing';
