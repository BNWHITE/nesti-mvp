# 🗄️ Database Security Architecture - Nesti MVP v2

## 📋 Overview

This document details the complete database security implementation for Nesti MVP, including encrypted schemas, Row Level Security (RLS) policies, audit mechanisms, and GDPR compliance features.

---

## 🔐 Encryption Architecture

### Encrypted Fields

All sensitive personal data is encrypted at rest using AES-256-GCM encryption via PostgreSQL's `pgcrypto` extension.

| Table | Encrypted Fields | Searchable Hash Fields |
|:---|:---|:---|
| **users** | `email_encrypted`, `first_name_encrypted`, `last_name_encrypted` | `email_hash` |
| **posts** | `content_encrypted` | - |
| **comments** | `content_encrypted` | - |
| **events** | `description_encrypted`, `location_encrypted` | - |
| **chat_messages** | `message_encrypted`, `response_encrypted` | - |
| **data_exports** | `file_url_encrypted` | - |

### Encryption Functions

#### `encrypt_sensitive(data TEXT) RETURNS BYTEA`
Encrypts sensitive text data using AES-256-GCM.

```sql
-- Example usage
INSERT INTO users (email_encrypted, email_hash)
VALUES (
  encrypt_sensitive('user@example.com'),
  hash_email('user@example.com')
);
```

#### `decrypt_sensitive(encrypted_data BYTEA) RETURNS TEXT`
Decrypts data that was encrypted with `encrypt_sensitive()`.

```sql
-- Example usage
SELECT 
  decrypt_sensitive(email_encrypted) as email,
  decrypt_sensitive(first_name_encrypted) as first_name
FROM users
WHERE id = auth.uid();
```

### Hashing Functions

#### `hash_email(email TEXT) RETURNS VARCHAR(64)`
Creates a SHA-256 hash of an email for indexing and searching without exposing the actual email.

#### `hash_ip(ip_address TEXT) RETURNS VARCHAR(64)`
Hashes IP addresses for privacy-preserving audit logs.

#### `hash_user_id(user_uuid UUID) RETURNS VARCHAR(64)`
Hashes user IDs for anonymized audit trails.

---

## 🛡️ Row Level Security (RLS)

Every table in the database has RLS enabled with specific policies controlling access.

### Users Table

| Policy | Operation | Rule |
|:---|:---|:---|
| `users_select_own` | SELECT | Users can view their own profile |
| `users_select_family` | SELECT | Users can view profiles of family members |
| `users_update_own` | UPDATE | Users can update their own profile (not password) |
| `users_prevent_password_change` | UPDATE | Prevents direct password modification |

### Families Table

| Policy | Operation | Rule |
|:---|:---|:---|
| `families_select_member` | SELECT | Users can view families they belong to |
| `families_update_admin` | UPDATE | Only family admins can update family info |
| `families_insert_authenticated` | INSERT | Authenticated users can create families |
| `families_delete_admin` | DELETE | Only admins can delete families |

### Posts Table

| Policy | Operation | Rule |
|:---|:---|:---|
| `posts_select_family` | SELECT | Users can view posts from their families |
| `posts_insert_family` | INSERT | Users can create posts in their families |
| `posts_update_own` | UPDATE | Users can update their own posts |
| `posts_delete_own` | DELETE | Users can delete their own posts |
| `posts_delete_admin` | DELETE | Family admins can delete any family post |

### Comments Table

| Policy | Operation | Rule |
|:---|:---|:---|
| `comments_select_family` | SELECT | Users can view comments on family posts |
| `comments_insert_family` | INSERT | Users can comment on family posts |
| `comments_update_own` | UPDATE | Users can update their own comments |
| `comments_delete_own` | DELETE | Users can delete their own comments |

### Audit & Security Tables

**Audit Logs**: NO user access. Service role only.
**Security Events**: NO user access. Service role only.
**Blocked IPs**: NO user access. Service role only.

These tables are protected from all user access to prevent tampering with security logs.

---

## 📊 Audit & Security Logging

### Audit Logs Table

Tracks all data modifications with anonymized user information.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action VARCHAR(50) NOT NULL,          -- INSERT, UPDATE, DELETE
  table_name VARCHAR(50),                -- Affected table
  record_id UUID,                        -- Affected record
  user_id_hash VARCHAR(64),              -- Anonymized user ID
  ip_hash VARCHAR(64),                   -- Anonymized IP
  user_agent_hash VARCHAR(64),           -- Anonymized user agent
  success BOOLEAN DEFAULT true,
  error_code VARCHAR(20),
  metadata JSONB,                        -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security Events Table

Records security-related events for monitoring and alerting.

```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,       -- Event category
  severity VARCHAR(20) NOT NULL,         -- low, medium, high, critical
  ip_hash VARCHAR(64),                   -- Anonymized IP
  user_id_hash VARCHAR(64),              -- Anonymized user ID
  details JSONB,                         -- Event details
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security Functions

#### `log_audit_event(...)`
Logs an audit event with automatic hashing of sensitive data.

```sql
SELECT log_audit_event(
  'UPDATE',                              -- action
  'users',                               -- table_name
  user_id,                               -- record_id
  auth.uid(),                            -- user_id
  true,                                  -- success
  NULL,                                  -- error_code
  '{"field": "avatar_url"}'::JSONB      -- metadata
);
```

#### `log_security_event(...)`
Logs a security event for monitoring.

```sql
SELECT log_security_event(
  'failed_login',                        -- event_type
  'medium',                              -- severity
  '192.168.1.1',                         -- ip_address
  user_id,                               -- user_id
  '{"attempts": 3}'::JSONB               -- details
);
```

---

## 🔒 Security Triggers

### Audit Triggers

Automatically log all data modifications:

- `audit_users_insert` - Logs user creation
- `audit_users_update` - Logs user updates
- `audit_users_delete` - Logs user deletion
- `audit_families_insert` - Logs family creation
- `audit_posts_insert` - Logs post creation
- `audit_posts_delete` - Logs post deletion

### Validation Triggers

- `prevent_password_change` - Blocks direct password modification
- `prevent_audit_logs_deletion` - Protects audit logs from deletion
- `prevent_security_events_deletion` - Protects security events
- `validate_post_family_membership` - Ensures users post only in their families
- `check_parental_consent_chat` - Requires parental consent for minors using AI

### Counter Triggers

- `update_reaction_count_insert/delete` - Maintains accurate reaction counts
- `update_comment_count_insert/delete` - Maintains accurate comment counts

### Timestamp Triggers

- `update_users_updated_at` - Auto-updates `updated_at` on user changes
- `update_families_updated_at` - Auto-updates `updated_at` on family changes
- `update_posts_updated_at` - Auto-updates `updated_at` on post changes

---

## 🌍 GDPR Compliance Tables

### User Consents

Tracks user consent for various data processing activities.

```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_type VARCHAR(50) NOT NULL,     -- terms, privacy, ai, etc.
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Consent Types**:
- `terms` - Terms of service
- `privacy` - Privacy policy
- `ai` - AI chat usage
- `emails` - Marketing emails
- `analytics` - Analytics tracking
- `parental` - Parental consent for minors

### Data Exports

Manages user data export requests (GDPR Article 20).

```sql
CREATE TABLE data_exports (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(20),                    -- pending, processing, completed, failed
  file_url_encrypted BYTEA,              -- Encrypted download URL
  requested_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,                -- Link expires after 7 days
  downloaded_at TIMESTAMPTZ
);
```

### Deletion Requests

Manages user deletion requests (GDPR Article 17).

```sql
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT,
  status VARCHAR(20),                    -- pending, confirmed, processing, completed
  requested_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  scheduled_deletion_at TIMESTAMPTZ,     -- 30-day grace period
  completed_at TIMESTAMPTZ
);
```

### GDPR Functions

#### `export_user_data(user_id UUID) RETURNS JSONB`
Exports all user data in JSON format.

```sql
SELECT export_user_data(auth.uid());
```

Returns:
```json
{
  "user": {...},
  "families": [...],
  "posts": [...],
  "comments": [...],
  "events": [...]
}
```

#### `anonymize_user_data(user_id UUID) RETURNS BOOLEAN`
Anonymizes user data while preserving data structure.

```sql
SELECT anonymize_user_data('user-uuid-here');
```

---

## 🚫 IP Blocking & Rate Limiting

### Blocked IPs Table

```sql
CREATE TABLE blocked_ips (
  id UUID PRIMARY KEY,
  ip_hash VARCHAR(64) NOT NULL UNIQUE,
  reason VARCHAR(100),
  blocked_at TIMESTAMPTZ,
  blocked_until TIMESTAMPTZ,             -- NULL for permanent blocks
  permanent BOOLEAN DEFAULT false
);
```

### Functions

#### `is_ip_blocked(ip_address TEXT) RETURNS BOOLEAN`
Checks if an IP is currently blocked.

```sql
SELECT is_ip_blocked('192.168.1.100');
```

#### `block_ip_address(ip_address, reason, duration_hours, permanent)`
Blocks an IP address.

```sql
SELECT block_ip_address(
  '192.168.1.100',
  'Brute force attack',
  24,                                    -- 24 hours
  false                                  -- Not permanent
);
```

---

## 👨‍👩‍👧‍👦 Parental Controls

### Parental Controls Table

```sql
CREATE TABLE parental_controls (
  id UUID PRIMARY KEY,
  child_user_id UUID NOT NULL UNIQUE,
  parent_user_id UUID NOT NULL,
  ai_enabled BOOLEAN DEFAULT false,
  chat_enabled BOOLEAN DEFAULT true,
  activity_visible_to_parent BOOLEAN DEFAULT true,
  restrictions JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Restrictions JSONB** example:
```json
{
  "max_screen_time_minutes": 120,
  "allowed_hours": "09:00-21:00",
  "blocked_features": ["external_links"],
  "require_approval_for": ["posts", "comments"]
}
```

---

## 📈 Performance Optimization

### Indexes

- **Hash Indexes**: For exact lookups (email_hash, ip_hash)
- **B-tree Indexes**: For range queries (created_at, start_time)
- **GIN Indexes**: For JSONB fields (metadata, details, restrictions)
- **Covering Indexes**: Include frequently accessed columns
- **Partial Indexes**: Only index active/non-deleted records

See `indexes.sql` for complete index definitions.

---

## 🔧 Maintenance Scripts

### Data Cleanup

```sql
-- Run daily to remove expired data
SELECT * FROM cleanup_expired_data();
```

Returns deleted counts for:
- Expired posts
- Expired chat messages
- Expired data exports

### Security Audit

```sql
-- Review recent security events
SELECT 
  event_type,
  severity,
  COUNT(*) as count
FROM security_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type, severity
ORDER BY severity DESC, count DESC;
```

### RLS Verification

```sql
-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 📚 Migration Guide

See `migrate_v1_to_v2.sql` for complete migration instructions.

### Migration Steps

1. **Backup Database**
   ```bash
   pg_dump > backup_v1.sql
   ```

2. **Set Encryption Key**
   ```sql
   ALTER DATABASE postgres SET app.encryption_key = 'your-key';
   ```

3. **Run Migration Scripts**
   - schema_v2_secure.sql
   - functions_security.sql
   - rls_policies.sql
   - triggers_security.sql
   - indexes.sql
   - migrate_v1_to_v2.sql

4. **Verify Migration**
   ```sql
   -- Test encryption/decryption
   SELECT decrypt_sensitive(email_encrypted) FROM users LIMIT 1;
   
   -- Check RLS
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

---

## 🔍 Security Testing

### Test RLS Policies

```sql
-- Set user context
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid"}';

-- Try to access data
SELECT * FROM posts;  -- Should only see user's family posts
```

### Test Encryption

```sql
-- Encrypt and decrypt
SELECT decrypt_sensitive(encrypt_sensitive('test data'));
```

### Test Audit Logging

```sql
-- Make a change
UPDATE users SET avatar_url = 'new.jpg' WHERE id = auth.uid();

-- Check audit log
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;
```

---

**Last Updated**: December 20, 2024
**Database Version**: 2.0 (Secure Schema)
