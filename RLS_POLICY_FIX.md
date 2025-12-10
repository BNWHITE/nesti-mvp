# Fix for RLS Policy Error on Users Table :

## Problem : 

Error: `new row violates row-level security policy for table "users"`

This error occurs when trying to create a user profile during the onboarding process.

## Root Cause
The Row-Level Security (RLS) policies on the `users` table are preventing authenticated users from inserting their own profile.

## Solution: Update RLS Policies in Supabase

You need to run this SQL in your Supabase SQL Editor:

```sql
-- 1. Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 3. Create new policies that allow users to manage their own profile

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to view family members (optional, for family features)
CREATE POLICY "Users can view family members"
ON users
FOR SELECT
TO authenticated
USING (
  family_id IN (
    SELECT family_id FROM users WHERE id = auth.uid()
  )
);
```

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
