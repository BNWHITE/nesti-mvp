-- ============================================
-- TEST RLS POLICIES
-- ============================================
-- Test that RLS is working correctly

-- Test 1: Try to view all profiles (should fail without auth)
-- Expected: No rows returned or error
SELECT * FROM public.profiles LIMIT 5;

-- Test 2: Try to view all families (should fail without auth)
-- Expected: No rows returned or error
SELECT * FROM public.families LIMIT 5;

-- Test 3: Check that service role can still access everything
-- Run this with service_role key:
-- Expected: All rows visible
SET ROLE service_role;
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.families;
RESET ROLE;

-- Test 4: Simulate authenticated user
-- Replace 'YOUR-USER-ID' with actual UUID
DO $$
DECLARE
  test_user_id uuid := 'YOUR-USER-ID';
BEGIN
  -- Set current user context
  PERFORM set_config('request.jwt.claim.sub', test_user_id::text, true);
  
  -- Now test queries
  RAISE NOTICE 'User can see % profiles', (SELECT COUNT(*) FROM public.profiles);
  RAISE NOTICE 'User can see % families', (SELECT COUNT(*) FROM public.families);
END $$;

-- Test 5: Verify audit logging works
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  severity
) VALUES (
  auth.uid(),
  'login',
  'test',
  gen_random_uuid(),
  'low'
);

-- Check the log was created
SELECT * FROM public.audit_logs ORDER BY timestamp DESC LIMIT 1;
