-- ============================================
-- MIGRATION SCRIPT: v1 (current) to v2 (secure)
-- Nesti MVP Database Migration
-- ============================================

-- IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING THIS MIGRATION
-- Run: pg_dump -U postgres -h localhost nesti_db > backup_v1.sql

BEGIN;

-- ============================================
-- STEP 1: Create new tables from schema_v2
-- ============================================

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: New table creation is handled by schema_v2_secure.sql
-- This migration focuses on data transformation

-- ============================================
-- STEP 2: Add encryption key configuration
-- ============================================

-- The encryption key should be set as a configuration parameter
-- In Supabase dashboard: Settings > Database > Custom Postgres config
-- Add: app.encryption_key = 'your-256-bit-encryption-key-here'

-- Verify encryption key is set
DO $$
BEGIN
  IF current_setting('app.encryption_key', true) IS NULL THEN
    RAISE WARNING 'Encryption key not set! Set app.encryption_key in database configuration';
  END IF;
END $$;

-- ============================================
-- STEP 3: Migrate profiles to users table
-- ============================================

-- Check if old profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    
    -- Migrate profiles to users table with encryption
    INSERT INTO users (
      id,
      email_encrypted,
      email_hash,
      first_name_encrypted,
      last_name_encrypted,
      password_hash,
      avatar_url,
      created_at,
      updated_at
    )
    SELECT 
      p.id,
      encrypt_sensitive(p.email),
      hash_email(p.email),
      encrypt_sensitive(COALESCE(p.first_name, '')),
      encrypt_sensitive(COALESCE(p.last_name, '')),
      -- Password hash comes from auth.users, use placeholder
      encode(digest(p.id::TEXT, 'sha256'), 'hex'),
      p.avatar_url,
      p.created_at,
      p.updated_at
    FROM profiles p
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Migrated % users from profiles table', (SELECT COUNT(*) FROM profiles);
  END IF;
END $$;

-- ============================================
-- STEP 4: Migrate posts with content encryption
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    
    -- Check if old posts table has different structure
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'content'
    ) THEN
      
      -- Migrate old posts to new structure
      INSERT INTO posts (
        id,
        content_encrypted,
        type,
        media_url,
        author_id,
        family_id,
        created_at,
        updated_at
      )
      SELECT 
        id,
        encrypt_sensitive(COALESCE(content, '')),
        COALESCE(type, 'default'),
        image_url,
        author_id,
        family_id,
        created_at,
        updated_at
      FROM posts
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Migrated % posts with encryption', (SELECT COUNT(*) FROM posts);
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 5: Migrate comments with encryption
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'content'
  ) THEN
    
    -- Create temporary table for migration
    CREATE TEMP TABLE comments_migration AS
    SELECT 
      id,
      encrypt_sensitive(COALESCE(content, '')) as content_encrypted,
      post_id,
      author_id,
      created_at
    FROM comments;
    
    -- Clear existing comments if needed
    TRUNCATE TABLE comments CASCADE;
    
    -- Insert encrypted comments
    INSERT INTO comments (
      id,
      content_encrypted,
      post_id,
      author_id,
      created_at
    )
    SELECT * FROM comments_migration;
    
    DROP TABLE comments_migration;
    
    RAISE NOTICE 'Migrated % comments with encryption', (SELECT COUNT(*) FROM comments);
  END IF;
END $$;

-- ============================================
-- STEP 6: Migrate events with encryption
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'description'
  ) THEN
    
    -- Migrate events
    UPDATE events e
    SET 
      description_encrypted = encrypt_sensitive(COALESCE(description, '')),
      location_encrypted = encrypt_sensitive(COALESCE(location, ''))
    WHERE description_encrypted IS NULL;
    
    RAISE NOTICE 'Encrypted descriptions for % events', (SELECT COUNT(*) FROM events);
  END IF;
END $$;

-- ============================================
-- STEP 7: Update family_members roles
-- ============================================

-- Normalize role names if needed
UPDATE family_members
SET role = CASE
  WHEN role = 'ado' THEN 'teen'
  WHEN role = 'enfant' THEN 'child'
  WHEN role NOT IN ('admin', 'parent', 'teen', 'child') THEN 'parent'
  ELSE role
END
WHERE role NOT IN ('admin', 'parent', 'teen', 'child');

-- ============================================
-- STEP 8: Initialize security tables
-- ============================================

-- Create initial audit log entry
INSERT INTO audit_logs (
  action,
  table_name,
  success,
  metadata
) VALUES (
  'MIGRATION',
  'database',
  true,
  jsonb_build_object(
    'version', 'v1_to_v2',
    'timestamp', NOW(),
    'description', 'Database migration to secure schema'
  )
);

-- ============================================
-- STEP 9: Verify data integrity
-- ============================================

DO $$
DECLARE
  users_count INTEGER;
  posts_count INTEGER;
  comments_count INTEGER;
  families_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM users;
  SELECT COUNT(*) INTO posts_count FROM posts;
  SELECT COUNT(*) INTO comments_count FROM comments;
  SELECT COUNT(*) INTO families_count FROM families;
  
  RAISE NOTICE 'Migration verification:';
  RAISE NOTICE '  Users: %', users_count;
  RAISE NOTICE '  Families: %', families_count;
  RAISE NOTICE '  Posts: %', posts_count;
  RAISE NOTICE '  Comments: %', comments_count;
  
  -- Check for encryption
  IF EXISTS (SELECT 1 FROM users WHERE email_encrypted IS NULL LIMIT 1) THEN
    RAISE WARNING 'Some users have NULL email_encrypted - check encryption';
  END IF;
END $$;

-- ============================================
-- STEP 10: Update RLS policies
-- ============================================

-- RLS policies are created by rls_policies.sql
-- This ensures they are enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 11: Create security functions
-- ============================================

-- Security functions are created by functions_security.sql
-- Verify they exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'encrypt_sensitive'
  ) THEN
    RAISE WARNING 'Security functions not found - run functions_security.sql';
  END IF;
END $$;

-- ============================================
-- STEP 12: Apply security triggers
-- ============================================

-- Triggers are created by triggers_security.sql
-- Verify critical triggers exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_users_insert'
  ) THEN
    RAISE WARNING 'Audit triggers not found - run triggers_security.sql';
  END IF;
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION CHECKS
-- ============================================

-- Run these queries to verify migration success:

-- 1. Check encryption
-- SELECT 
--   id, 
--   decrypt_sensitive(email_encrypted) as email,
--   decrypt_sensitive(first_name_encrypted) as first_name
-- FROM users LIMIT 5;

-- 2. Check RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'posts', 'families');

-- 3. Check audit logs
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- ROLLBACK PROCEDURE (if needed)
-- ============================================

-- If migration fails, restore from backup:
-- psql -U postgres -h localhost nesti_db < backup_v1.sql

COMMENT ON SCHEMA public IS 'Nesti MVP v2 - Migrated to secure schema with encryption';
