-- Migration SQL for Co-Nests, Family Invitations, and Member Permissions
-- This adds support for linked families, invitation links, and age-based restrictions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table co_nests for linking families together
CREATE TABLE IF NOT EXISTS co_nests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id_1 UUID REFERENCES families(id) ON DELETE CASCADE,
  family_id_2 UUID REFERENCES families(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id_1, family_id_2),
  CHECK (family_id_1 < family_id_2) -- Ensure consistent ordering to prevent duplicates
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_co_nests_family_id_1 ON co_nests(family_id_1);
CREATE INDEX IF NOT EXISTS idx_co_nests_family_id_2 ON co_nests(family_id_2);
CREATE INDEX IF NOT EXISTS idx_co_nests_status ON co_nests(status);

-- Add date of birth and restriction level to family members
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS restriction_level TEXT DEFAULT 'standard' CHECK (restriction_level IN ('full', 'moderate', 'minimal', 'none'));
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{}';

-- Table for family invitations via link
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  invite_link TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (uses_count <= max_uses)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_code ON family_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_family_invitations_expires ON family_invitations(expires_at);

-- Add support for Co-Nest events
ALTER TABLE events ADD COLUMN IF NOT EXISTS shared_with_co_nest UUID REFERENCES co_nests(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_co_nest_event BOOLEAN DEFAULT FALSE;

-- Create index for co-nest events
CREATE INDEX IF NOT EXISTS idx_events_co_nest ON events(shared_with_co_nest) WHERE shared_with_co_nest IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE co_nests ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for co_nests
CREATE POLICY "Users can view co_nests of their families" ON co_nests
  FOR SELECT USING (
    family_id_1 IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    OR family_id_2 IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family admins can create co_nests" ON co_nests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id IN (family_id_1, family_id_2)
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins can update co_nests" ON co_nests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id IN (family_id_1, family_id_2)
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins can delete co_nests" ON co_nests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id IN (family_id_1, family_id_2)
      AND role IN ('admin', 'parent')
    )
  );

-- RLS Policies for family_invitations
CREATE POLICY "Anyone can view valid invitations" ON family_invitations
  FOR SELECT USING (expires_at > NOW() AND uses_count < max_uses);

CREATE POLICY "Family admins can create invitations" ON family_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id = family_invitations.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins can update invitations" ON family_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id = family_invitations.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins can delete invitations" ON family_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() 
      AND family_id = family_invitations.family_id
      AND role IN ('admin', 'parent')
    )
  );

-- Function to calculate age from birth_date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get automatic restriction level based on age
CREATE OR REPLACE FUNCTION get_auto_restriction_level(birth_date DATE)
RETURNS TEXT AS $$
DECLARE
  member_age INTEGER;
BEGIN
  IF birth_date IS NULL THEN
    RETURN 'standard';
  END IF;
  
  member_age := calculate_age(birth_date);
  
  IF member_age < 14 THEN
    RETURN 'full'; -- Children under 14: full restrictions
  ELSIF member_age < 18 THEN
    RETURN 'moderate'; -- Teens 14-17: moderate restrictions (can be reduced by parents)
  ELSE
    RETURN 'none'; -- Adults 18+: no restrictions
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update restriction level when birth_date changes
CREATE OR REPLACE FUNCTION update_restriction_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-update if custom_permissions doesn't override it
  IF NEW.custom_permissions->>'override_restriction' IS NULL THEN
    NEW.restriction_level := get_auto_restriction_level(NEW.birth_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_restriction_level
  BEFORE INSERT OR UPDATE OF birth_date ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_restriction_level();

-- Function to validate invitation code and increment usage
CREATE OR REPLACE FUNCTION use_invitation_code(code TEXT)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
  family_id_result UUID;
BEGIN
  -- Find valid invitation
  SELECT id, family_id INTO invitation_id, family_id_result
  FROM family_invitations
  WHERE invite_code = code
    AND expires_at > NOW()
    AND uses_count < max_uses
  FOR UPDATE;
  
  IF invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation code';
  END IF;
  
  -- Increment usage count
  UPDATE family_invitations
  SET uses_count = uses_count + 1
  WHERE id = invitation_id;
  
  RETURN family_id_result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE co_nests IS 'Links two families together to share content and events';
COMMENT ON TABLE family_invitations IS 'Invitation links for joining families';
COMMENT ON COLUMN family_members.birth_date IS 'Member birth date for age calculation and permissions';
COMMENT ON COLUMN family_members.restriction_level IS 'Access restriction level based on age: full (< 14), moderate (14-17), minimal, none (18+)';
COMMENT ON COLUMN family_members.custom_permissions IS 'JSONB field for custom permission overrides';
COMMENT ON FUNCTION calculate_age IS 'Calculate current age from birth date';
COMMENT ON FUNCTION get_auto_restriction_level IS 'Get appropriate restriction level based on age';
COMMENT ON FUNCTION use_invitation_code IS 'Validate and use an invitation code, returning the family_id';
