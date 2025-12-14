-- ============================================
-- NESTI MVP - RLS Policy Fixes for Invitations
-- Fix for Bug #3: "Impossible de charger les invitations"
-- Date: 2025-12-14
-- ============================================

-- ============================================
-- 1. DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Users can view invitations for their family" ON family_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their family" ON family_invitations;
DROP POLICY IF EXISTS "Users can delete invitations they created" ON family_invitations;
DROP POLICY IF EXISTS "Users can update invitations they created" ON family_invitations;

-- ============================================
-- 2. CREATE RLS POLICIES FOR family_invitations
-- ============================================

-- Policy: Users can view invitations for their family
-- Users should be able to see all invitations for families they belong to
CREATE POLICY "Users can view invitations for their family"
ON family_invitations
FOR SELECT
USING (
  family_id IN (
    SELECT family_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy: Users can create invitations for their family
-- Users can create invitations for families they belong to
CREATE POLICY "Users can create invitations for their family"
ON family_invitations
FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy: Users can delete invitations they created
-- Users can only delete invitations they created themselves
CREATE POLICY "Users can delete invitations they created"
ON family_invitations
FOR DELETE
USING (
  created_by = auth.uid()
);

-- Policy: Users can update invitations they created
-- Users can only update invitations they created themselves
CREATE POLICY "Users can update invitations they created"
ON family_invitations
FOR UPDATE
USING (
  created_by = auth.uid()
);

-- ============================================
-- 3. ENABLE RLS ON family_invitations
-- ============================================
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE FUNCTION TO USE INVITATION CODE
-- ============================================
-- This function increments the uses_count when an invitation is used
CREATE OR REPLACE FUNCTION use_invitation_code(code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  family_id_result UUID;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM family_invitations
  WHERE invite_code = code
    AND expires_at > NOW()
    AND uses_count < max_uses;

  -- Check if invitation is valid
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''invitation invalide ou expiré';
  END IF;

  -- Increment uses_count
  UPDATE family_invitations
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE id = invitation_record.id;

  family_id_result := invitation_record.family_id;
  
  RETURN family_id_result;
END;
$$;

-- ============================================
-- 5. GRANT EXECUTE PERMISSION ON FUNCTION
-- ============================================
GRANT EXECUTE ON FUNCTION use_invitation_code(TEXT) TO authenticated;

-- ============================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id 
ON family_invitations(family_id);

CREATE INDEX IF NOT EXISTS idx_family_invitations_invite_code 
ON family_invitations(invite_code);

CREATE INDEX IF NOT EXISTS idx_family_invitations_created_by 
ON family_invitations(created_by);

CREATE INDEX IF NOT EXISTS idx_family_invitations_expires_at 
ON family_invitations(expires_at);

-- ============================================
-- NOTES:
-- ============================================
-- This migration fixes the "Impossible de charger les invitations" error
-- by setting up proper Row Level Security policies for the family_invitations table.
--
-- The policies ensure that:
-- 1. Users can only view invitations for families they belong to
-- 2. Users can only create invitations for their own family
-- 3. Users can only delete/update invitations they created
--
-- The use_invitation_code function is a secure function that can be called
-- to increment the usage count when someone accepts an invitation.
--
-- To apply this migration to your Supabase database:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
