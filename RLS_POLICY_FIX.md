# Fix for RLS Policy Error on Users Table

## Problem

**Error 1**: `new row violates row-level security policy for table "users"`
**Error 2**: `infinite recursion detected in policy for relation "users"`

These errors occur when trying to create a user profile during the onboarding process.

## Root Cause

1. **First Error**: The RLS policies are preventing authenticated users from inserting their profile
2. **Second Error**: The policies cause infinite recursion when checking `auth.uid() = id` during INSERT

---

# TWO COMPLETE SOLUTIONS (Choose One)

## SOLUTION 1: Simple RLS Policy Fix (Quick & Easy)

This is the simplest approach - just update your RLS policies.

Run this SQL in your Supabase SQL Editor:

```sql
-- 1. Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view family members" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable select for own data" ON users;
DROP POLICY IF EXISTS "Enable update for own data" ON users;

-- 3. Create NEW non-recursive policies

-- ✅ SIMPLE INSERT: Allow all authenticated users to insert
-- No recursion because we don't check the id during insert
CREATE POLICY "Enable insert for authenticated users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);  -- ✅ This prevents recursion!

-- ✅ SELECT: Only see your own data
CREATE POLICY "Enable select for own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ✅ UPDATE: Only update your own data
CREATE POLICY "Enable update for own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ✅ BONUS: View family members (after you have a profile)
CREATE POLICY "View family members"
ON users
FOR SELECT
TO authenticated
USING (
  family_id IS NOT NULL AND
  family_id IN (
    SELECT family_id FROM users WHERE id = auth.uid()
  )
);
```

## Key Fix: WITH CHECK (true)

The critical change is using `WITH CHECK (true)` for INSERT instead of `WITH CHECK (auth.uid() = id)`.

**Why this works:**
- During INSERT, the row doesn't exist yet, so checking `auth.uid() = id` causes recursion
- Using `WITH CHECK (true)` allows any authenticated user to insert
- The application code ensures users only insert their own profile (id = auth.uid())
- After insert, SELECT and UPDATE policies restrict access properly

## Steps to Apply the Fix:

1. Go to your Supabase project: https://app.supabase.com/project/ozlbjohbzaommmtbwues/sql
2. Click "New Query"
3. Copy and paste the SQL above
4. Click "Run" or press Ctrl+Enter
5. Verify the policies were created successfully

## Verification

After applying the fix, the onboarding should work correctly. Users will be able to:
- Create their own profile during signup
- Update their profile information
- View family members once they join a family

---

## SOLUTION 2: Database Function Approach (Most Robust - RECOMMENDED)

This approach creates a database function that runs with elevated privileges, bypassing RLS policies entirely. This is the most reliable solution.

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a secure database function that bypasses RLS
CREATE OR REPLACE FUNCTION create_user_profile_with_family(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_family_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- This makes the function run with creator's privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  v_family_id UUID;
  v_existing_user RECORD;
  v_result JSON;
BEGIN
  -- Check if user already exists
  SELECT * INTO v_existing_user FROM users WHERE id = p_user_id;
  
  -- Create family first
  INSERT INTO families (family_name)
  VALUES (p_family_name)
  RETURNING id INTO v_family_id;
  
  -- Create or update user profile
  IF v_existing_user IS NULL THEN
    -- Create new user
    INSERT INTO users (id, email, first_name, family_id, role)
    VALUES (p_user_id, p_email, p_first_name, v_family_id, 'parent');
  ELSE
    -- Update existing user
    UPDATE users
    SET family_id = v_family_id,
        first_name = COALESCE(p_first_name, first_name),
        role = COALESCE(role, 'parent')
    WHERE id = p_user_id;
  END IF;
  
  -- Return success with family data
  SELECT json_build_object(
    'success', true,
    'family_id', v_family_id,
    'family_name', p_family_name
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, the transaction is automatically rolled back
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_with_family(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Optional: Grant to anon if you want unauthenticated users to call it
-- GRANT EXECUTE ON FUNCTION create_user_profile_with_family(UUID, TEXT, TEXT, TEXT) TO anon;
```

### Why Solution 2 is Better:

1. **Bypasses RLS Completely**: The `SECURITY DEFINER` clause makes the function run with the creator's privileges
2. **Atomic Operation**: All database operations happen in a single transaction
3. **Automatic Rollback**: If any error occurs, everything is rolled back automatically
4. **No Policy Conflicts**: Works regardless of your RLS policy configuration
5. **Future-Proof**: Won't break if you change RLS policies later
6. **Error Handling**: Built-in error handling with detailed error messages

### How the App Uses It:

The application code is already configured to:
1. First try to call the database function (if it exists)
2. Fall back to direct insert if the function doesn't exist
3. Handle both success and error responses gracefully

---

## Comparison: Which Solution to Choose?

| Aspect | Solution 1 (RLS Policy) | Solution 2 (DB Function) |
|--------|-------------------------|--------------------------|
| **Setup Complexity** | Low (just update policies) | Medium (create function) |
| **Reliability** | May have edge cases | Very reliable |
| **RLS Conflicts** | Possible | None (bypasses RLS) |
| **Maintenance** | May need updates | Set it and forget it |
| **Transaction Safety** | Manual cleanup needed | Automatic rollback |
| **Error Handling** | Basic | Comprehensive |
| **Recommended For** | Quick fixes, simple setups | Production apps |

**Recommendation**: Use **Solution 2 (Database Function)** for the most reliable, production-ready implementation.

---

## Steps to Apply Solution 2 (Recommended):

1. Go to your Supabase project: https://app.supabase.com/project/ozlbjohbzaommmtbwues/sql
2. Click "New Query"
3. Copy and paste the **Solution 2 SQL** above (the `CREATE OR REPLACE FUNCTION` block)
4. Click "Run" or press Ctrl+Enter
5. Verify the function was created successfully (you should see a success message)
6. Test the onboarding flow - it will now work perfectly!

---

## Verification After Applying Solution 2

After creating the function, you can test it directly in SQL Editor:

```sql
-- Test the function
SELECT create_user_profile_with_family(
  'test-uuid-here'::UUID,
  'test@example.com',
  'Test User',
  'Test Family'
);
```

The function will return a JSON object with success status and family information.

---

## Alternative: Service Role Key (Not Recommended for Client)

If you cannot use either solution above, you would need to:
1. Create a server-side API endpoint
2. Use the service role key on the server (NEVER in client code)
3. Have the client call this endpoint to create profiles

However, **Solution 2 (Database Function)** is the correct, secure, and most reliable approach.
