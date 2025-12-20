-- ============================================
-- OPTIMIZED INDEXES for Nesti MVP v2
-- ============================================

-- Note: Many indexes are already created in schema_v2_secure.sql
-- This file contains additional composite and specialized indexes

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Family members lookup by family and role
CREATE INDEX IF NOT EXISTS idx_family_members_family_role 
ON family_members(family_id, role);

-- Posts by family and creation date (for feed)
CREATE INDEX IF NOT EXISTS idx_posts_family_created 
ON posts(family_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Posts by author and family
CREATE INDEX IF NOT EXISTS idx_posts_author_family 
ON posts(author_id, family_id, created_at DESC);

-- Comments by post and creation date
CREATE INDEX IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at DESC);

-- Events by family and start time (for calendar)
CREATE INDEX IF NOT EXISTS idx_events_family_start 
ON events(family_id, start_time ASC);

-- Event participants by event and status
CREATE INDEX IF NOT EXISTS idx_event_participants_event_status 
ON event_participants(event_id, status);

-- Chat messages by user and creation date
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON chat_messages(user_id, created_at DESC) 
WHERE expires_at IS NULL OR expires_at > NOW();

-- User consents by user and type
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type 
ON user_consents(user_id, consent_type, granted);

-- ============================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- ============================================

-- Active families only
CREATE INDEX IF NOT EXISTS idx_families_active 
ON families(id, family_name) 
WHERE id IN (SELECT DISTINCT family_id FROM family_members);

-- Non-expired posts
CREATE INDEX IF NOT EXISTS idx_posts_active 
ON posts(family_id, created_at DESC) 
WHERE expires_at IS NULL OR expires_at > NOW();

-- Pending data export requests
CREATE INDEX IF NOT EXISTS idx_data_exports_pending 
ON data_exports(user_id, requested_at DESC) 
WHERE status IN ('pending', 'processing');

-- Active blocked IPs
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active 
ON blocked_ips(ip_hash, blocked_until) 
WHERE permanent = true OR blocked_until > NOW();

-- Critical security events (last 30 days)
CREATE INDEX IF NOT EXISTS idx_security_events_critical_recent 
ON security_events(severity, created_at DESC) 
WHERE severity IN ('high', 'critical') 
AND created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- FULL TEXT SEARCH INDEXES
-- ============================================

-- Note: These would work on decrypted content
-- In production with encrypted fields, FTS is limited
-- Alternative: Use application-level search after decryption

-- Activities search
CREATE INDEX IF NOT EXISTS idx_activities_search 
ON activities USING GIN (
  to_tsvector('french', 
    coalesce(title, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(category, '')
  )
);

-- ============================================
-- HASH INDEXES FOR EXACT LOOKUPS
-- ============================================

-- User email hash lookup (exact match only)
CREATE INDEX IF NOT EXISTS idx_users_email_hash_hash 
ON users USING HASH (email_hash);

-- IP hash lookup
CREATE INDEX IF NOT EXISTS idx_blocked_ips_hash_hash 
ON blocked_ips USING HASH (ip_hash);

-- ============================================
-- JSONB INDEXES FOR METADATA
-- ============================================

-- Security events details
CREATE INDEX IF NOT EXISTS idx_security_events_details 
ON security_events USING GIN (details);

-- Audit logs metadata
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata 
ON audit_logs USING GIN (metadata);

-- Parental controls restrictions
CREATE INDEX IF NOT EXISTS idx_parental_controls_restrictions 
ON parental_controls USING GIN (restrictions);

-- ============================================
-- COVERING INDEXES FOR COMMON QUERIES
-- ============================================

-- Posts with author info (covering index)
CREATE INDEX IF NOT EXISTS idx_posts_family_author_created 
ON posts(family_id, author_id, created_at DESC) 
INCLUDE (type, reactions_count, comments_count);

-- Comments with author info
CREATE INDEX IF NOT EXISTS idx_comments_post_author_created 
ON comments(post_id, author_id, created_at DESC);

-- Family members with user info
CREATE INDEX IF NOT EXISTS idx_family_members_family_user_role 
ON family_members(family_id, user_id, role) 
INCLUDE (joined_at);

-- ============================================
-- UNIQUE INDEXES FOR CONSTRAINTS
-- ============================================

-- Ensure unique family invite codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_families_invite_code_unique 
ON families(invite_code) 
WHERE invite_code IS NOT NULL;

-- Ensure unique user-family combinations
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_members_unique 
ON family_members(user_id, family_id);

-- Ensure unique reactions per user per post
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique 
ON reactions(post_id, user_id, emoji);

-- Ensure unique favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_activities_unique 
ON favorite_activities(user_id, activity_id);

-- Ensure unique event participation
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_participants_unique 
ON event_participants(event_id, user_id);

-- Ensure one parental control per child
CREATE UNIQUE INDEX IF NOT EXISTS idx_parental_controls_unique 
ON parental_controls(child_user_id);

-- ============================================
-- STATISTICS AND MAINTENANCE
-- ============================================

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE families;
ANALYZE family_members;
ANALYZE posts;
ANALYZE comments;
ANALYZE reactions;
ANALYZE events;
ANALYZE activities;
ANALYZE audit_logs;
ANALYZE security_events;

COMMENT ON INDEX idx_posts_family_created IS 'Optimizes family feed queries';
COMMENT ON INDEX idx_security_events_critical_recent IS 'Fast lookup for critical security alerts';
COMMENT ON INDEX idx_activities_search IS 'Full-text search on activities catalog';
