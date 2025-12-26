-- ============================================
-- NESTI SECURITY VERIFICATION SCRIPT
-- ============================================
-- Run this AFTER executing security_hardening.sql

-- 1. Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Count RLS policies
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- 3. Verify new security tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_consents',
  'data_export_requests', 
  'data_deletion_requests',
  'audit_logs',
  'failed_login_attempts',
  'suspicious_activities'
);

-- 4. Check security functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'is_family_admin',
  'is_family_member',
  'is_adult_user',
  'anonymize_deleted_users',
  'generate_family_encryption_key',
  'update_updated_at_column',
  'log_sensitive_changes'
);

-- 5. Verify triggers are active
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- 6. Check indexes for performance
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename;

-- Expected results:
-- ✅ 35+ tables with RLS enabled
-- ✅ 40+ RLS policies created
-- ✅ 6 new security tables
-- ✅ 7 security functions
-- ✅ 4+ triggers active
-- ✅ 15+ performance indexes
