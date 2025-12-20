# 🛠️ Security Scripts - Nesti MVP

This directory contains utility scripts for managing security features in the Nesti MVP application.

## Scripts Overview

### 1. setup_supabase_security.sh

**Purpose**: Automated security setup for Supabase database

**Usage**:
```bash
export SUPABASE_PROJECT_ID="your-project-id"
export DATABASE_URL="postgresql://..."
./scripts/setup_supabase_security.sh
```

**What it does**:
- ✅ Checks prerequisites (psql, environment variables)
- ✅ Generates a secure encryption key
- ✅ Creates secure database schema
- ✅ Installs security functions
- ✅ Sets up RLS policies
- ✅ Configures security triggers
- ✅ Creates optimized indexes
- ✅ Optionally migrates data from v1 to v2
- ✅ Optionally seeds test data
- ✅ Verifies installation

**Prerequisites**:
- PostgreSQL client (`psql`) installed
- Access to Supabase database
- Supabase project ID and connection string

### 2. security_audit.sh

**Purpose**: Automated security audit of the database

**Usage**:
```bash
export DATABASE_URL="postgresql://..."
./scripts/security_audit.sh
```

**What it checks**:
- 🔐 Encryption key configuration
- 🛡️ Row Level Security (RLS) on all tables
- 🔧 Security functions existence
- ⚡ Security triggers
- 📊 Database indexes
- 🔍 Data integrity (encrypted fields)
- 🔒 Password security
- 🚫 Blocked IPs
- 📈 Security metrics

**Exit Codes**:
- `0` - All checks passed
- `1` - Some checks failed

**Output**:
```
✅ Passed: 25
❌ Failed: 0
⚠️  Warnings: 2
```

### 3. rotate_encryption_keys.sh

**Purpose**: Rotate encryption keys and re-encrypt all data

**Usage**:
```bash
export DATABASE_URL="postgresql://..."
export OLD_ENCRYPTION_KEY="current-key"
export NEW_ENCRYPTION_KEY="new-key"  # Optional - will be generated
./scripts/rotate_encryption_keys.sh
```

**What it does**:
1. ⚠️ Shows safety warnings
2. 🔓 Decrypts all data with old key
3. 🔐 Re-encrypts all data with new key
4. ✅ Verifies re-encryption
5. 📝 Logs the rotation event

**Safety Features**:
- Transaction-based (rolls back on error)
- Generates secure keys automatically
- Verification after rotation
- Audit logging

**⚠️ CRITICAL WARNINGS**:
- **ALWAYS backup database before rotation**
- **Test on staging environment first**
- **Put application in maintenance mode**
- **Keep old key for 30 days (rollback)**

## Environment Variables

### Required for all scripts:

```bash
# Supabase Database Connection
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Or use Supabase-specific variables
export SUPABASE_PROJECT_ID="your-project-id"
export SUPABASE_DB_PASSWORD="your-db-password"
```

### For key rotation:

```bash
# Current encryption key (required)
export OLD_ENCRYPTION_KEY="your-current-256-bit-key"

# New encryption key (optional - will be generated if not provided)
export NEW_ENCRYPTION_KEY="your-new-256-bit-key"
```

## Security Best Practices

### 🔐 Encryption Keys

1. **Generation**:
   ```bash
   # Generate a secure 256-bit key
   openssl rand -base64 32
   ```

2. **Storage**:
   - ✅ Store in environment variables (Supabase dashboard)
   - ✅ Use secret management (Supabase Vault)
   - ❌ NEVER commit to Git
   - ❌ NEVER hardcode in application

3. **Rotation**:
   - Rotate keys every 90 days
   - Rotate immediately if compromised
   - Keep old keys for 30-day rollback period

### 🛡️ Database Security

1. **RLS Policies**:
   - Enable on ALL tables
   - Test policies before production
   - Review quarterly

2. **Audit Logs**:
   - Review weekly
   - Never delete
   - Protected from user access

3. **Backups**:
   - Daily automated backups
   - Encrypted at rest
   - Test restore procedures monthly

### 📊 Monitoring

1. **Run security audit**:
   - Weekly: `./scripts/security_audit.sh`
   - After any schema changes
   - Before production deployments

2. **Check security events**:
   ```sql
   SELECT * FROM security_events 
   WHERE severity IN ('high', 'critical')
   AND created_at > NOW() - INTERVAL '7 days';
   ```

3. **Monitor blocked IPs**:
   ```sql
   SELECT COUNT(*) FROM blocked_ips 
   WHERE permanent = true OR blocked_until > NOW();
   ```

## Troubleshooting

### Script fails with "psql: command not found"

**Solution**: Install PostgreSQL client
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Or use Supabase SQL Editor instead
```

### Encryption key not configured

**Solution**: Set encryption key in Supabase
```sql
ALTER DATABASE postgres SET app.encryption_key = 'your-key-here';
```

Or in Supabase Dashboard:
1. Go to Settings > Database
2. Scroll to "Custom Postgres Config"
3. Add: `app.encryption_key = 'your-key'`

### Permission denied errors

**Solution**: Use service role key or database admin credentials

### Migration fails

**Solution**:
1. Check database connection
2. Verify no locks on tables
3. Review error messages
4. Restore from backup if needed

## Integration with CI/CD

### GitHub Actions Example:

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday 2am
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client
      
      - name: Run Security Audit
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: ./scripts/security_audit.sh
```

## Support

For issues or questions:
- 📖 See [SECURITY.md](../SECURITY.md)
- 📖 See [docs/DATABASE_SECURITY.md](../docs/DATABASE_SECURITY.md)
- 📖 See [docs/INCIDENT_RESPONSE.md](../docs/INCIDENT_RESPONSE.md)
- 📧 Email: security@nesti.app

## Version History

- **v2.0** (2024-12-20): Initial security scripts
  - setup_supabase_security.sh
  - security_audit.sh
  - rotate_encryption_keys.sh

---

**Last Updated**: December 20, 2024
