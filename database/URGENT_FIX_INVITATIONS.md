# 🚨 ACTION REQUIRED: Database Migration for Invitations

## Issue
The invitation system shows "Impossible de charger les invitations" because the `family_invitations` table is missing Row Level Security (RLS) policies.

## Quick Fix Steps

### Option 1: Run SQL Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy the entire content of `database/fix-invitations-rls.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify**
   - Check that query executed without errors
   - Test invitation loading in the app

### Option 2: Manual Policy Creation

If you prefer to create policies manually:

```sql
-- Enable RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to view invitations for their family
CREATE POLICY "Users can view invitations for their family"
ON family_invitations FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM users WHERE id = auth.uid()
  )
);

-- Allow users to create invitations for their family
CREATE POLICY "Users can create invitations for their family"
ON family_invitations FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM users WHERE id = auth.uid()
  )
);

-- Allow users to delete their own invitations
CREATE POLICY "Users can delete invitations they created"
ON family_invitations FOR DELETE
USING (created_by = auth.uid());

-- Allow users to update their own invitations
CREATE POLICY "Users can update invitations they created"
ON family_invitations FOR UPDATE
USING (created_by = auth.uid());
```

## What This Fixes

✅ Users can now view invitations for their family  
✅ Users can create invitations  
✅ Users can manage their own invitations  
✅ Proper security: users can only see/modify invitations for their own family  

## Testing After Migration

1. Go to "Mon Nest" page
2. Click "📧 Inviter un membre" or "Lien d'invitation"
3. You should now see invitations list (or empty state)
4. Try creating a new invitation
5. Verify it appears in the list

## Need Help?

If you encounter any errors:
1. Check the Supabase logs (Dashboard > Logs)
2. Verify the `family_invitations` table exists
3. Ensure user has proper authentication
4. Check that `users` table has `family_id` column

## Alternative: Disable RLS Temporarily (NOT RECOMMENDED)

⚠️ Only for testing purposes - **DO NOT USE IN PRODUCTION**

```sql
ALTER TABLE family_invitations DISABLE ROW LEVEL SECURITY;
```

This removes all security but allows you to test functionality. **Re-enable RLS and apply proper policies before going to production.**

---

**Priority:** HIGH 🔴  
**Impact:** Invitation system completely broken without this fix  
**Estimated Time:** 2-5 minutes  
**Risk:** Low (only adds security policies)
