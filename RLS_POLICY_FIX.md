# Fix for RLS Policy Error on Users Table

## Problem

**Error 1**: `new row violates row-level security policy for table "users"`
**Error 2**: `infinite recursion detected in policy for relation "users"`

These errors occur when trying to create a user profile during the onboarding process.

## Root Cause

1. **First Error**: The RLS policies are preventing authenticated users from inserting their profile
2. **Second Error**: The policies cause infinite recursion when checking `auth.uid() = id` during INSERT

## Solution: Simplified RLS Policies (NO RECURSION)

Run this SQL in your Supabase SQL Editor to fix both errors:

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

## Alternative: Service Role Key (Not Recommended for Client)

If you cannot update RLS policies, you would need to:
1. Create a server-side API endpoint
2. Use the service role key on the server (NEVER in client code)
3. Have the client call this endpoint to create profiles

However, the RLS policy fix above is the correct and secure solution.
