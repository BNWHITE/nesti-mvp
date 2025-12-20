-- ============================================
-- SECURITY FUNCTIONS for Nesti MVP v2
-- ============================================

-- ============================================
-- ENCRYPTION & DECRYPTION FUNCTIONS
-- ============================================

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT)
RETURNS BYTEA AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- In production, retrieve key from Supabase Vault
  -- encryption_key := vault.get_secret('encryption_key');
  -- For now, use environment variable (set in Supabase dashboard)
  encryption_key := current_setting('app.encryption_key', true);
  
  -- Validate encryption key is configured
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;
  
  -- Validate minimum key length (base64 32 bytes = ~44 chars)
  IF length(encryption_key) < 32 THEN
    RAISE EXCEPTION 'Encryption key too short. Minimum 32 characters required';
  END IF;
  
  -- Use AES-256 encryption
  RETURN pgp_sym_encrypt(data, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Encryption failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted_data BYTEA)
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- In production, retrieve key from Supabase Vault
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;
  
  IF encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using AES-256
  RETURN pgp_sym_decrypt(encrypted_data, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Decryption failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HASHING FUNCTIONS
-- ============================================

-- Function to hash email for indexing
CREATE OR REPLACE FUNCTION hash_email(email TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(lower(trim(email)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to hash IP address
CREATE OR REPLACE FUNCTION hash_ip(ip_address TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(ip_address, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to hash user agent
CREATE OR REPLACE FUNCTION hash_user_agent(user_agent TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(user_agent, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to hash user ID for audit logs
CREATE OR REPLACE FUNCTION hash_user_id(user_uuid UUID)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(user_uuid::TEXT, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- VALIDATION FUNCTIONS
-- ============================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to detect SQL injection patterns
-- Note: This is a basic detection - use with parameterized queries as primary defense
CREATE OR REPLACE FUNCTION contains_sql_injection(input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check for dangerous SQL patterns only in suspicious contexts
  -- Reduced false positives by requiring multiple indicators
  IF input IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for SQL injection with multiple dangerous patterns
  RETURN (
    -- SQL comments with dangerous keywords
    (input ~* '(--|\/\*).*\b(DROP|DELETE|UPDATE|INSERT|ALTER)\b') OR
    -- UNION-based injection
    (input ~* '\bUNION\b.*\bSELECT\b') OR
    -- Boolean-based injection with operators
    (input ~* '(\bOR\b|\bAND\b)\s*[''"]?\s*\d+\s*=\s*\d+') OR
    -- Stacked queries
    (input ~* ';\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\b') OR
    -- Hex encoding attempt
    (input ~* '0x[0-9a-f]+')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to detect XSS patterns
CREATE OR REPLACE FUNCTION contains_xss(input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check for common XSS patterns
  RETURN input ~* '(<script|<iframe|<object|<embed|javascript:|onerror=|onload=)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to sanitize string input
CREATE OR REPLACE FUNCTION sanitize_string(input TEXT, max_length INTEGER DEFAULT 1000)
RETURNS TEXT AS $$
BEGIN
  IF input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check for injection patterns
  IF contains_sql_injection(input) THEN
    RAISE EXCEPTION 'Invalid input detected: potential SQL injection';
  END IF;
  
  IF contains_xss(input) THEN
    RAISE EXCEPTION 'Invalid input detected: potential XSS';
  END IF;
  
  -- Trim and limit length
  RETURN substring(trim(input), 1, max_length);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- AUDIT FUNCTIONS
-- ============================================

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type VARCHAR(50),
  p_severity VARCHAR(20),
  p_ip_address TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  ip_hash_val VARCHAR(64);
  user_hash_val VARCHAR(64);
BEGIN
  -- Hash sensitive data
  IF p_ip_address IS NOT NULL THEN
    ip_hash_val := hash_ip(p_ip_address);
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    user_hash_val := hash_user_id(p_user_id);
  END IF;
  
  -- Insert security event
  INSERT INTO security_events (
    event_type,
    severity,
    ip_hash,
    user_id_hash,
    details
  ) VALUES (
    p_event_type,
    p_severity,
    ip_hash_val,
    user_hash_val,
    p_details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action VARCHAR(50),
  p_table_name VARCHAR(50),
  p_record_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_code VARCHAR(20) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
  user_hash_val VARCHAR(64);
BEGIN
  -- Hash user ID
  IF p_user_id IS NOT NULL THEN
    user_hash_val := hash_user_id(p_user_id);
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    action,
    table_name,
    record_id,
    user_id_hash,
    success,
    error_code,
    metadata
  ) VALUES (
    p_action,
    p_table_name,
    p_record_id,
    user_hash_val,
    p_success,
    p_error_code,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GDPR COMPLIANCE FUNCTIONS
-- ============================================

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update user record with anonymized data
  UPDATE users
  SET
    email_encrypted = encrypt_sensitive('anonymized@deleted.user'),
    email_hash = hash_email('anonymized@deleted.user'),
    first_name_encrypted = encrypt_sensitive('Deleted'),
    last_name_encrypted = encrypt_sensitive('User'),
    avatar_url = NULL,
    date_of_birth = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the anonymization
  PERFORM log_audit_event(
    'anonymize_user',
    'users',
    p_user_id,
    p_user_id,
    true,
    NULL,
    jsonb_build_object('timestamp', NOW())
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_audit_event(
      'anonymize_user',
      'users',
      p_user_id,
      p_user_id,
      false,
      'ANONYMIZATION_ERROR',
      jsonb_build_object('error', SQLERRM)
    );
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export user data (GDPR)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Collect all user data
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u) FROM (
      SELECT 
        id,
        decrypt_sensitive(email_encrypted) as email,
        decrypt_sensitive(first_name_encrypted) as first_name,
        decrypt_sensitive(last_name_encrypted) as last_name,
        avatar_url,
        date_of_birth,
        created_at
      FROM users WHERE id = p_user_id
    ) u),
    'families', (SELECT jsonb_agg(row_to_json(f)) FROM (
      SELECT f.* FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = p_user_id
    ) f),
    'posts', (SELECT jsonb_agg(row_to_json(p)) FROM (
      SELECT 
        id,
        decrypt_sensitive(content_encrypted) as content,
        type,
        created_at
      FROM posts WHERE author_id = p_user_id
    ) p),
    'comments', (SELECT jsonb_agg(row_to_json(c)) FROM (
      SELECT 
        id,
        decrypt_sensitive(content_encrypted) as content,
        created_at
      FROM comments WHERE author_id = p_user_id
    ) c),
    'events', (SELECT jsonb_agg(row_to_json(e)) FROM (
      SELECT 
        id,
        title,
        decrypt_sensitive(description_encrypted) as description,
        start_time,
        created_at
      FROM events WHERE creator_id = p_user_id
    ) e)
  ) INTO user_data;
  
  -- Log the export
  PERFORM log_audit_event(
    'export_user_data',
    'users',
    p_user_id,
    p_user_id,
    true
  );
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE(table_name TEXT, deleted_count INTEGER) AS $$
DECLARE
  posts_deleted INTEGER;
  messages_deleted INTEGER;
  exports_deleted INTEGER;
BEGIN
  -- Delete expired posts
  DELETE FROM posts WHERE expires_at < NOW();
  GET DIAGNOSTICS posts_deleted = ROW_COUNT;
  
  -- Delete expired chat messages
  DELETE FROM chat_messages WHERE expires_at < NOW();
  GET DIAGNOSTICS messages_deleted = ROW_COUNT;
  
  -- Delete expired data exports
  DELETE FROM data_exports WHERE expires_at < NOW() AND status = 'completed';
  GET DIAGNOSTICS exports_deleted = ROW_COUNT;
  
  -- Log cleanup
  PERFORM log_audit_event(
    'cleanup_expired_data',
    'system',
    NULL,
    NULL,
    true,
    NULL,
    jsonb_build_object(
      'posts_deleted', posts_deleted,
      'messages_deleted', messages_deleted,
      'exports_deleted', exports_deleted
    )
  );
  
  -- Return results
  RETURN QUERY
  SELECT 'posts'::TEXT, posts_deleted
  UNION ALL
  SELECT 'chat_messages'::TEXT, messages_deleted
  UNION ALL
  SELECT 'data_exports'::TEXT, exports_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(p_ip_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  ip_hash_val VARCHAR(64);
  is_blocked BOOLEAN;
BEGIN
  ip_hash_val := hash_ip(p_ip_address);
  
  SELECT EXISTS(
    SELECT 1 FROM blocked_ips
    WHERE ip_hash = ip_hash_val
    AND (permanent = true OR blocked_until > NOW())
  ) INTO is_blocked;
  
  RETURN is_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block IP address
CREATE OR REPLACE FUNCTION block_ip_address(
  p_ip_address TEXT,
  p_reason VARCHAR(100),
  p_duration_hours INTEGER DEFAULT 24,
  p_permanent BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  ip_hash_val VARCHAR(64);
  block_id UUID;
  blocked_until_val TIMESTAMPTZ;
BEGIN
  ip_hash_val := hash_ip(p_ip_address);
  
  IF NOT p_permanent THEN
    blocked_until_val := NOW() + (p_duration_hours || ' hours')::INTERVAL;
  END IF;
  
  INSERT INTO blocked_ips (
    ip_hash,
    reason,
    blocked_until,
    permanent
  ) VALUES (
    ip_hash_val,
    p_reason,
    blocked_until_val,
    p_permanent
  )
  ON CONFLICT (ip_hash) DO UPDATE
  SET 
    reason = EXCLUDED.reason,
    blocked_until = EXCLUDED.blocked_until,
    permanent = EXCLUDED.permanent,
    blocked_at = NOW()
  RETURNING id INTO block_id;
  
  -- Log security event
  PERFORM log_security_event(
    'ip_blocked',
    'high',
    p_ip_address,
    NULL,
    jsonb_build_object(
      'reason', p_reason,
      'duration_hours', p_duration_hours,
      'permanent', p_permanent
    )
  );
  
  RETURN block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION encrypt_sensitive(TEXT) IS 'Encrypts sensitive data using AES-256';
COMMENT ON FUNCTION decrypt_sensitive(BYTEA) IS 'Decrypts sensitive data encrypted with AES-256';
COMMENT ON FUNCTION log_security_event IS 'Logs security events for monitoring';
COMMENT ON FUNCTION log_audit_event IS 'Logs audit events for compliance';
COMMENT ON FUNCTION cleanup_expired_data IS 'Removes expired data per retention policy';
COMMENT ON FUNCTION is_ip_blocked IS 'Checks if an IP address is blocked';
COMMENT ON FUNCTION block_ip_address IS 'Blocks an IP address for security reasons';
