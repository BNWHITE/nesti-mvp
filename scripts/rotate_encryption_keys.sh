#!/bin/bash

# ============================================
# Encryption Key Rotation Script
# Re-encrypts all data with new key
# ============================================

set -e

echo "🔐 Encryption Key Rotation Script"
echo "=================================="
echo ""

# Configuration
DATABASE_URL="${DATABASE_URL}"
OLD_KEY="${OLD_ENCRYPTION_KEY}"
NEW_KEY="${NEW_ENCRYPTION_KEY}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Warnings
echo -e "${RED}⚠️  WARNING: This operation is critical!${NC}"
echo ""
echo "This script will:"
echo "1. Decrypt all data with the old key"
echo "2. Re-encrypt all data with the new key"
echo "3. Update the database configuration"
echo ""
echo "Before proceeding:"
echo "  ✅ Create a full database backup"
echo "  ✅ Test the new encryption key"
echo "  ✅ Ensure the application is in maintenance mode"
echo "  ✅ Have the old key available for rollback"
echo ""

# Check prerequisites
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$OLD_KEY" ]; then
    echo -e "${RED}❌ OLD_ENCRYPTION_KEY not set${NC}"
    echo "Set it with: export OLD_ENCRYPTION_KEY='your-old-key'"
    exit 1
fi

if [ -z "$NEW_KEY" ]; then
    echo "Generating new encryption key..."
    NEW_KEY=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    echo -e "${GREEN}New key generated: $NEW_KEY${NC}"
    echo ""
    echo "⚠️  Save this key securely!"
    echo ""
fi

# Confirm
echo "Are you ready to proceed with key rotation? (yes/no)"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS])$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔄 Starting key rotation..."
echo ""

# Create rotation SQL script with parameter placeholders
cat > /tmp/key_rotation.sql << 'EOFTEMPLATE'
-- ============================================
-- Encryption Key Rotation
-- Generated: TIMESTAMP_PLACEHOLDER
-- ============================================

BEGIN;

-- Create temporary decryption storage
-- Note: Old key is read from environment at runtime
CREATE TEMP TABLE temp_users_decrypted AS
SELECT 
  id,
  pgp_sym_decrypt(email_encrypted, current_setting('app.old_encryption_key')) as email,
  pgp_sym_decrypt(first_name_encrypted, current_setting('app.old_encryption_key')) as first_name,
  pgp_sym_decrypt(last_name_encrypted, current_setting('app.old_encryption_key')) as last_name
FROM users
WHERE email_encrypted IS NOT NULL;

CREATE TEMP TABLE temp_posts_decrypted AS
SELECT 
  id,
  pgp_sym_decrypt(content_encrypted, current_setting('app.old_encryption_key')) as content
FROM posts
WHERE content_encrypted IS NOT NULL;

CREATE TEMP TABLE temp_comments_decrypted AS
SELECT 
  id,
  pgp_sym_decrypt(content_encrypted, current_setting('app.old_encryption_key')) as content
FROM comments
WHERE content_encrypted IS NOT NULL;

CREATE TEMP TABLE temp_events_decrypted AS
SELECT 
  id,
  pgp_sym_decrypt(description_encrypted, current_setting('app.old_encryption_key')) as description,
  pgp_sym_decrypt(location_encrypted, current_setting('app.old_encryption_key')) as location
FROM events
WHERE description_encrypted IS NOT NULL OR location_encrypted IS NOT NULL;

CREATE TEMP TABLE temp_chat_messages_decrypted AS
SELECT 
  id,
  pgp_sym_decrypt(message_encrypted, current_setting('app.old_encryption_key')) as message,
  CASE 
    WHEN response_encrypted IS NOT NULL 
    THEN pgp_sym_decrypt(response_encrypted, current_setting('app.old_encryption_key'))
    ELSE NULL
  END as response
FROM chat_messages
WHERE message_encrypted IS NOT NULL;

-- Re-encrypt users with new key
UPDATE users u
SET 
  email_encrypted = pgp_sym_encrypt(t.email, current_setting('app.encryption_key')),
  first_name_encrypted = pgp_sym_encrypt(t.first_name, current_setting('app.encryption_key')),
  last_name_encrypted = pgp_sym_encrypt(t.last_name, current_setting('app.encryption_key'))
FROM temp_users_decrypted t
WHERE u.id = t.id;

-- Re-encrypt posts
UPDATE posts p
SET content_encrypted = pgp_sym_encrypt(t.content, current_setting('app.encryption_key'))
FROM temp_posts_decrypted t
WHERE p.id = t.id;

-- Re-encrypt comments
UPDATE comments c
SET content_encrypted = pgp_sym_encrypt(t.content, current_setting('app.encryption_key'))
FROM temp_comments_decrypted t
WHERE c.id = t.id;

-- Re-encrypt events
UPDATE events e
SET 
  description_encrypted = pgp_sym_encrypt(COALESCE(t.description, ''), current_setting('app.encryption_key')),
  location_encrypted = pgp_sym_encrypt(COALESCE(t.location, ''), current_setting('app.encryption_key'))
FROM temp_events_decrypted t
WHERE e.id = t.id;

-- Re-encrypt chat messages
UPDATE chat_messages cm
SET 
  message_encrypted = pgp_sym_encrypt(t.message, current_setting('app.encryption_key')),
  response_encrypted = CASE 
    WHEN t.response IS NOT NULL 
    THEN pgp_sym_encrypt(t.response, current_setting('app.encryption_key'))
    ELSE NULL
  END
FROM temp_chat_messages_decrypted t
WHERE cm.id = t.id;

-- Log the rotation
INSERT INTO audit_logs (
  action,
  table_name,
  success,
  metadata
) VALUES (
  'ENCRYPTION_KEY_ROTATION',
  'database',
  true,
  jsonb_build_object(
    'timestamp', NOW(),
    'rotated_tables', ARRAY['users', 'posts', 'comments', 'events', 'chat_messages']
  )
);

-- Verify re-encryption (sample check)
DO $VERIFICATION$
DECLARE
  test_result TEXT;
BEGIN
  SELECT pgp_sym_decrypt(email_encrypted, current_setting('app.encryption_key')) INTO test_result
  FROM users
  WHERE email_encrypted IS NOT NULL
  LIMIT 1;
  
  IF test_result IS NULL THEN
    RAISE EXCEPTION 'Verification failed: Unable to decrypt with new key';
  END IF;
  
  RAISE NOTICE 'Verification successful: Data can be decrypted with new key';
END $VERIFICATION$;

COMMIT;
EOFTEMPLATE

# Replace timestamp placeholder
sed -i "s/TIMESTAMP_PLACEHOLDER/$(date)/" /tmp/key_rotation.sql

# Execute rotation with keys passed as session variables (safer than embedding in SQL)
echo "📝 Executing key rotation..."
PGOPTIONS="-c app.old_encryption_key=$OLD_KEY -c app.encryption_key=$NEW_KEY" \
psql "$DATABASE_URL" < /tmp/key_rotation.sql
    echo -e "${GREEN}✅ Key rotation completed successfully!${NC}"
    echo ""
    echo "======================================"
    echo "New Encryption Key: $NEW_KEY"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Update app.encryption_key in Supabase dashboard"
    echo "2. Update NEW_ENCRYPTION_KEY in environment variables"
    echo "3. Test decryption with new key"
    echo "4. Remove maintenance mode"
    echo "5. Keep old key for 30 days (rollback period)"
    echo ""
    
    # Clean up
    rm -f /tmp/key_rotation.sql
    
    # Verification
    echo "🔍 Running verification..."
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_users FROM users;" -q
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_posts FROM posts;" -q
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_comments FROM comments;" -q
    
    echo ""
    echo "✅ Verification complete"
else
    echo -e "${RED}❌ Key rotation failed!${NC}"
    echo "Check the error messages above."
    echo "Database transaction should have rolled back."
    rm -f /tmp/key_rotation.sql
    exit 1
fi

echo ""
echo "======================================"
echo "🎉 Key Rotation Complete!"
echo "======================================"
