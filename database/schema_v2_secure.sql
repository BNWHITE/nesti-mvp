-- ============================================
-- Nesti MVP v2 - Secure Database Schema
-- Privacy by Design with Encryption
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENCRYPTION CONFIGURATION
-- ============================================
-- Note: The encryption key should be set in Supabase vault
-- Use: SELECT vault.create_secret('encryption_key', 'your-256-bit-key');

-- ============================================
-- USERS TABLE (with encrypted fields)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_encrypted BYTEA NOT NULL,
  email_hash VARCHAR(64) NOT NULL UNIQUE,
  first_name_encrypted BYTEA,
  last_name_encrypted BYTEA,
  password_hash VARCHAR(255) NOT NULL, -- Managed by Supabase Auth
  role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('admin', 'parent', 'teen', 'child')),
  avatar_url TEXT,
  date_of_birth DATE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  must_change_password BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ,
  data_retention_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index on email_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users(email_hash);
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) DEFAULT '👨‍👩‍👧‍👦',
  invite_code VARCHAR(20) UNIQUE,
  invite_code_expires_at TIMESTAMPTZ,
  subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_families_invite_code ON families(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_families_created_at ON families(created_at);

-- ============================================
-- FAMILY_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'parent', 'teen', 'child')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, family_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);

-- ============================================
-- POSTS TABLE (with encrypted content)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_encrypted BYTEA NOT NULL,
  type VARCHAR(20) DEFAULT 'default' CHECK (type IN ('default', 'photo', 'video', 'celebration', 'milestone')),
  media_url TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  reactions_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 years')
);

CREATE INDEX IF NOT EXISTS idx_posts_family_id ON posts(family_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON posts(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- COMMENTS TABLE (with encrypted content)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_encrypted BYTEA NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description_encrypted BYTEA,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location_encrypted BYTEA,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- ============================================
-- EVENT_PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  responded_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);

-- ============================================
-- ACTIVITIES TABLE (public catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  location VARCHAR(200),
  price_range VARCHAR(20),
  min_age INTEGER,
  max_age INTEGER,
  rating DECIMAL(2,1),
  image_url TEXT,
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);

-- ============================================
-- FAVORITE_ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorite_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_activities_user_id ON favorite_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_activities_activity_id ON favorite_activities(activity_id);

-- ============================================
-- CHAT_MESSAGES TABLE (AI - encrypted)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  message_encrypted BYTEA NOT NULL,
  response_encrypted BYTEA,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_family_id ON chat_messages(family_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_expires_at ON chat_messages(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- USER_CONSENTS TABLE (GDPR)
-- ============================================
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'ai', 'emails', 'analytics', 'parental')),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_consent_type ON user_consents(consent_type);

-- ============================================
-- DATA_EXPORTS TABLE (GDPR)
-- ============================================
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  file_url_encrypted BYTEA,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);

-- ============================================
-- DELETION_REQUESTS TABLE (GDPR)
-- ============================================
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  scheduled_deletion_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);

-- ============================================
-- AUDIT_LOGS TABLE (anonymized)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  user_id_hash VARCHAR(64),
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  success BOOLEAN DEFAULT true,
  error_code VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_hash ON audit_logs(user_id_hash);

-- ============================================
-- BLOCKED_IPS TABLE (protection)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash VARCHAR(64) NOT NULL UNIQUE,
  reason VARCHAR(100),
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  permanent BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_hash ON blocked_ips(ip_hash);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_blocked_until ON blocked_ips(blocked_until) WHERE blocked_until IS NOT NULL;

-- ============================================
-- SECURITY_EVENTS TABLE (monitoring)
-- ============================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_hash VARCHAR(64),
  user_id_hash VARCHAR(64),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- ============================================
-- PARENTAL_CONTROLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS parental_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN DEFAULT false,
  chat_enabled BOOLEAN DEFAULT true,
  activity_visible_to_parent BOOLEAN DEFAULT true,
  restrictions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_user_id)
);

CREATE INDEX IF NOT EXISTS idx_parental_controls_child_user_id ON parental_controls(child_user_id);
CREATE INDEX IF NOT EXISTS idx_parental_controls_parent_user_id ON parental_controls(parent_user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_controls ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE users IS 'User accounts with encrypted personal data';
COMMENT ON TABLE families IS 'Family groups for organization';
COMMENT ON TABLE posts IS 'Family posts with encrypted content';
COMMENT ON TABLE audit_logs IS 'Security audit trail (anonymized)';
COMMENT ON TABLE security_events IS 'Security monitoring and alerting';
COMMENT ON TABLE parental_controls IS 'Parental control settings for minors';
