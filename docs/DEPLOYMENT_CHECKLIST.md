# 📋 Deployment Checklist - Nesti MVP v2 Security

## Pre-Deployment Verification

### Database Setup
- [ ] Supabase project created
- [ ] Encryption key generated (32+ characters, base64)
- [ ] Encryption key configured in Supabase: `app.encryption_key`
- [ ] Backup of current database created
- [ ] PostgreSQL client (`psql`) installed (for scripts)

### Environment Variables
- [ ] `REACT_APP_SUPABASE_URL` set
- [ ] `REACT_APP_SUPABASE_ANON_KEY` set
- [ ] `DATABASE_URL` set (for scripts)
- [ ] `NODE_ENV=production` set in production

### Code Review
- [x] All SQL files reviewed
- [x] All security functions reviewed
- [x] Frontend validation reviewed
- [x] Documentation complete
- [x] Scripts tested

---

## Step 1: Database Security Installation

### 1.1 Run Setup Script (Recommended)

```bash
# Set environment variables
export SUPABASE_PROJECT_ID="your-project-id"
export DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Run setup
chmod +x scripts/setup_supabase_security.sh
./scripts/setup_supabase_security.sh
```

**Verification**:
- [ ] Script completed without errors
- [ ] Encryption key was generated and saved
- [ ] All SQL files executed successfully
- [ ] RLS policies created
- [ ] Security functions installed

### 1.2 Manual Installation (Alternative)

If script fails, run in Supabase SQL Editor:

1. [ ] Execute `database/schema_v2_secure.sql`
2. [ ] Execute `database/functions_security.sql`
3. [ ] Execute `database/rls_policies.sql`
4. [ ] Execute `database/triggers_security.sql`
5. [ ] Execute `database/indexes.sql`

---

## Step 2: Data Migration (If Applicable)

### 2.1 Backup Current Data

```bash
# Create backup
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql
```

- [ ] Backup created successfully
- [ ] Backup file size looks correct

### 2.2 Run Migration

**Option A: Using script**
```bash
psql "$DATABASE_URL" < database/migrate_v1_to_v2.sql
```

**Option B: Supabase SQL Editor**
- [ ] Copy `database/migrate_v1_to_v2.sql` contents
- [ ] Execute in SQL Editor
- [ ] Verify no errors

### 2.3 Verify Migration

```sql
-- Check users migrated and encrypted
SELECT COUNT(*) as total, 
       COUNT(email_encrypted) as encrypted
FROM users;

-- Test decryption
SELECT decrypt_sensitive(email_encrypted) as email
FROM users LIMIT 1;
```

- [ ] All users have encrypted emails
- [ ] Decryption works correctly
- [ ] Data looks correct

---

## Step 3: Security Verification

### 3.1 Run Security Audit

```bash
export DATABASE_URL="postgresql://..."
chmod +x scripts/security_audit.sh
./scripts/security_audit.sh
```

**Expected Results**:
- [ ] ✅ Encryption key configured
- [ ] ✅ pgcrypto extension enabled
- [ ] ✅ RLS enabled on all tables (18 tables)
- [ ] ✅ Security functions exist (5+ functions)
- [ ] ✅ Security triggers exist (4+ triggers)
- [ ] ✅ Critical indexes created
- [ ] ✅ All users have encrypted data
- [ ] ✅ No critical security events

### 3.2 Manual Security Checks

```sql
-- 1. Verify RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should show: rowsecurity = true

-- 2. Verify encryption functions
SELECT proname FROM pg_proc
WHERE proname IN ('encrypt_sensitive', 'decrypt_sensitive', 
                   'log_audit_event', 'log_security_event');
-- Should return 4 rows

-- 3. Test encryption/decryption
SELECT decrypt_sensitive(encrypt_sensitive('test data'));
-- Should return: 'test data'

-- 4. Verify triggers
SELECT tgname FROM pg_trigger
WHERE tgname LIKE '%audit%' OR tgname LIKE '%prevent%';
-- Should return multiple triggers
```

- [ ] All checks pass
- [ ] No errors in any query

---

## Step 4: Frontend Integration

### 4.1 Update Application Code

**File: `src/index.js`**
```javascript
import { initializeSecurity } from './lib/security';

// Initialize security before rendering
initializeSecurity();
```

- [ ] Security initialization added
- [ ] No console errors

### 4.2 Add CSP Header

**File: `public/index.html`**
- [ ] CSP meta tag added to `<head>`
- [ ] CSP allows required domains
- [ ] No CSP violations in console

### 4.3 Update Forms with Validation

Example locations to update:
- [ ] Post creation form
- [ ] Comment submission
- [ ] User profile updates
- [ ] File uploads
- [ ] Any user input

**Template**:
```javascript
import { sanitizeString } from './lib/inputValidator';

const handleSubmit = (input) => {
  try {
    const clean = sanitizeString(input, maxLength);
    // Proceed with submission
  } catch (error) {
    alert(error.message);
  }
};
```

---

## Step 5: Production Deployment

### 5.1 Build Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -lh build/
```

- [ ] Build completed successfully
- [ ] No errors or warnings
- [ ] Build directory created

### 5.2 Deploy to Vercel

**Option A: CLI**
```bash
vercel --prod
```

**Option B: Git Push**
```bash
git push origin main
# Vercel auto-deploys
```

- [ ] Deployment successful
- [ ] No deployment errors
- [ ] Production URL accessible

### 5.3 Post-Deployment Checks

1. **Verify HTTPS**:
   - [ ] Site loads over HTTPS
   - [ ] SSL certificate valid
   - [ ] No mixed content warnings

2. **Test Authentication**:
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Session persists
   - [ ] Logout works

3. **Test Security Headers**:
   ```bash
   curl -I https://your-app.vercel.app
   ```
   - [ ] Content-Security-Policy header present
   - [ ] X-Frame-Options present
   - [ ] X-Content-Type-Options present

4. **Test RLS in Production**:
   - [ ] Users can only see their family's data
   - [ ] Cannot access other families' posts
   - [ ] Admin actions work for admins only

5. **Test Input Validation**:
   - [ ] XSS attempts blocked
   - [ ] SQL injection attempts blocked
   - [ ] File uploads validated

---

## Step 6: Monitoring Setup

### 6.1 Configure Alerts

**Supabase Dashboard**:
- [ ] Set up email alerts for errors
- [ ] Configure resource usage alerts
- [ ] Enable query performance monitoring

**Vercel Dashboard**:
- [ ] Configure deployment notifications
- [ ] Set up error tracking
- [ ] Enable analytics

### 6.2 Security Monitoring

```sql
-- Create dashboard query for security events
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
  event_type,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

- [ ] Security dashboard created
- [ ] Can query recent events
- [ ] Alerts configured for critical events

### 6.3 Schedule Regular Audits

**Daily**:
- [ ] Review security_events for critical alerts
- [ ] Check error logs

**Weekly**:
- [ ] Run `security_audit.sh`
- [ ] Review audit_logs
- [ ] Check blocked IPs

**Monthly**:
- [ ] Full security review
- [ ] Update dependencies
- [ ] Review and update policies

**Quarterly**:
- [ ] Rotate encryption keys (if needed)
- [ ] Third-party security audit
- [ ] Disaster recovery drill

---

## Step 7: Documentation

### 7.1 Team Training

- [ ] Share SECURITY.md with team
- [ ] Review DATABASE_SECURITY.md
- [ ] Discuss INCIDENT_RESPONSE.md
- [ ] Train on security scripts

### 7.2 Update Project Documentation

- [ ] Add security section to README.md
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document incident response contacts

---

## Emergency Contacts

### Internal
- Security Lead: _________________
- Database Admin: _________________
- DevOps Lead: _________________
- Legal: _________________

### External
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
- CNIL (France): +33 1 53 73 22 22

---

## Rollback Plan

If issues arise post-deployment:

### Immediate Rollback
```bash
# Revert to previous deployment in Vercel
vercel rollback [deployment-url]

# Or restore database from backup
psql "$DATABASE_URL" < backup_YYYYMMDD.sql
```

### Recovery Steps
1. [ ] Stop new user signups
2. [ ] Enable maintenance mode
3. [ ] Restore database from backup
4. [ ] Verify data integrity
5. [ ] Test core functionality
6. [ ] Re-enable user access
7. [ ] Monitor closely

---

## Final Sign-Off

Deployment completed by: _________________ Date: _________

- [ ] All checklist items completed
- [ ] Security audit passed
- [ ] Production tested and verified
- [ ] Team trained on new security features
- [ ] Monitoring configured
- [ ] Incident response plan ready

**Status**: ☐ Development ☐ Staging ☐ Production

---

**Last Updated**: December 20, 2024
**Version**: 2.0
