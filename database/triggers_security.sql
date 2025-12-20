-- ============================================
-- SECURITY TRIGGERS for Nesti MVP v2
-- ============================================

-- ============================================
-- AUDIT LOGGING TRIGGERS
-- ============================================

-- Function to audit INSERT operations
CREATE OR REPLACE FUNCTION audit_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    'INSERT',
    TG_TABLE_NAME,
    NEW.id,
    auth.uid(),
    true,
    NULL,
    jsonb_build_object('new_data', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit UPDATE operations
CREATE OR REPLACE FUNCTION audit_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    'UPDATE',
    TG_TABLE_NAME,
    NEW.id,
    auth.uid(),
    true,
    NULL,
    jsonb_build_object(
      'old_data', row_to_json(OLD),
      'new_data', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit DELETE operations
CREATE OR REPLACE FUNCTION audit_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    'DELETE',
    TG_TABLE_NAME,
    OLD.id,
    auth.uid(),
    true,
    NULL,
    jsonb_build_object('deleted_data', row_to_json(OLD))
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users_insert AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION audit_insert_trigger();

CREATE TRIGGER audit_users_update AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_update_trigger();

CREATE TRIGGER audit_users_delete AFTER DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_delete_trigger();

CREATE TRIGGER audit_families_insert AFTER INSERT ON families
  FOR EACH ROW EXECUTE FUNCTION audit_insert_trigger();

CREATE TRIGGER audit_families_update AFTER UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION audit_update_trigger();

CREATE TRIGGER audit_families_delete AFTER DELETE ON families
  FOR EACH ROW EXECUTE FUNCTION audit_delete_trigger();

CREATE TRIGGER audit_posts_insert AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION audit_insert_trigger();

CREATE TRIGGER audit_posts_delete AFTER DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION audit_delete_trigger();

-- ============================================
-- TIMESTAMP AUTO-UPDATE TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parental_controls_updated_at BEFORE UPDATE ON parental_controls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECURITY VALIDATION TRIGGERS
-- ============================================

-- Function to prevent direct password changes
CREATE OR REPLACE FUNCTION prevent_direct_password_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.password_hash <> NEW.password_hash THEN
    RAISE EXCEPTION 'Direct password changes are not allowed. Use authentication system.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_password_change BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_direct_password_change();

-- Function to prevent audit log deletion
CREATE OR REPLACE FUNCTION prevent_audit_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be deleted for compliance reasons';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_logs_deletion BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_deletion();

CREATE TRIGGER prevent_security_events_deletion BEFORE DELETE ON security_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_deletion();

-- ============================================
-- BUSINESS LOGIC TRIGGERS
-- ============================================

-- Function to validate family membership
CREATE OR REPLACE FUNCTION validate_family_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is actually a member of the family
  IF NOT EXISTS (
    SELECT 1 FROM family_members
    WHERE user_id = NEW.author_id
    AND family_id = NEW.family_id
  ) THEN
    RAISE EXCEPTION 'User must be a family member to create content';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_post_family_membership BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION validate_family_membership();

-- Function to check parental consent for minors
CREATE OR REPLACE FUNCTION check_parental_consent()
RETURNS TRIGGER AS $$
DECLARE
  user_age INTEGER;
  has_consent BOOLEAN;
BEGIN
  -- Calculate age
  SELECT EXTRACT(YEAR FROM AGE(date_of_birth)) INTO user_age
  FROM users WHERE id = NEW.user_id;
  
  -- If user is under 18, check for parental consent
  IF user_age IS NOT NULL AND user_age < 18 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_consents
      WHERE user_id = NEW.user_id
      AND consent_type = 'parental'
      AND granted = true
    ) INTO has_consent;
    
    IF NOT has_consent THEN
      RAISE EXCEPTION 'Parental consent required for users under 18';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply parental consent check to chat messages
CREATE TRIGGER check_parental_consent_chat BEFORE INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION check_parental_consent();

-- ============================================
-- DATA CLEANUP TRIGGERS
-- ============================================

-- Function to auto-cleanup expired data
CREATE OR REPLACE FUNCTION auto_cleanup_expired()
RETURNS TRIGGER AS $$
BEGIN
  -- This runs periodically via pg_cron or manual execution
  PERFORM cleanup_expired_data();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Note: The actual scheduling would be done via pg_cron extension
-- Example: SELECT cron.schedule('cleanup-expired', '0 2 * * *', 'SELECT auto_cleanup_expired()');

-- ============================================
-- REACTION COUNTER TRIGGERS
-- ============================================

-- Function to update reaction count on posts
CREATE OR REPLACE FUNCTION update_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET reactions_count = reactions_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET reactions_count = GREATEST(reactions_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reaction_count_insert AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_count();

CREATE TRIGGER update_reaction_count_delete AFTER DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_count();

-- ============================================
-- COMMENT COUNTER TRIGGERS
-- ============================================

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_insert AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

CREATE TRIGGER update_comment_count_delete AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ============================================
-- FAILED LOGIN TRACKING TRIGGERS
-- ============================================

-- Function to track failed login attempts
CREATE OR REPLACE FUNCTION track_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment failed attempts
  UPDATE users
  SET 
    failed_login_attempts = failed_login_attempts + 1,
    locked_until = CASE 
      WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '1 hour'
      ELSE locked_until
    END
  WHERE id = NEW.id;
  
  -- Log security event if account is locked
  IF (SELECT failed_login_attempts FROM users WHERE id = NEW.id) >= 5 THEN
    PERFORM log_security_event(
      'account_locked',
      'high',
      NULL,
      NEW.id,
      jsonb_build_object('reason', 'too_many_failed_attempts')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This would be triggered by Supabase Auth events
-- Implementation depends on Supabase hooks configuration

-- ============================================
-- EMAIL HASH GENERATION TRIGGER
-- ============================================

-- Function to auto-generate email hash
CREATE OR REPLACE FUNCTION generate_email_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_encrypted IS NOT NULL THEN
    -- Generate hash from decrypted email for searching
    -- In practice, the hash should be provided at insert time
    -- This is a fallback for safety
    IF NEW.email_hash IS NULL THEN
      RAISE EXCEPTION 'email_hash must be provided when setting email_encrypted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_email_hash BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION generate_email_hash();

-- ============================================
-- SOFT DELETE TRIGGER
-- ============================================

-- Function to handle soft deletes
CREATE OR REPLACE FUNCTION soft_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, mark as deleted
  UPDATE users
  SET deleted_at = NOW()
  WHERE id = OLD.id;
  
  -- Log the deletion
  PERFORM log_security_event(
    'user_deleted',
    'medium',
    NULL,
    OLD.id,
    jsonb_build_object('deletion_type', 'soft')
  );
  
  -- Prevent actual deletion
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Note: This would replace the normal DELETE operation
-- Uncomment to enable soft deletes:
-- CREATE TRIGGER soft_delete_users BEFORE DELETE ON users
--   FOR EACH ROW EXECUTE FUNCTION soft_delete_user();

COMMENT ON FUNCTION audit_insert_trigger() IS 'Logs all INSERT operations to audit_logs';
COMMENT ON FUNCTION audit_update_trigger() IS 'Logs all UPDATE operations to audit_logs';
COMMENT ON FUNCTION audit_delete_trigger() IS 'Logs all DELETE operations to audit_logs';
COMMENT ON FUNCTION prevent_direct_password_change() IS 'Prevents password changes outside auth system';
COMMENT ON FUNCTION prevent_audit_deletion() IS 'Protects audit logs from deletion';
COMMENT ON FUNCTION validate_family_membership() IS 'Ensures users can only post in their families';
COMMENT ON FUNCTION check_parental_consent() IS 'Requires parental consent for minors';
COMMENT ON FUNCTION update_reaction_count() IS 'Maintains accurate reaction counts';
COMMENT ON FUNCTION update_comment_count() IS 'Maintains accurate comment counts';
