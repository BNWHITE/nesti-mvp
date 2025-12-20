# 🚀 Security Implementation Guide - Nesti MVP v2

## 📋 Quick Start

This guide walks you through implementing the complete multi-layer security architecture for Nesti MVP.

---

## 📝 Prerequisites

Before starting:

- [ ] Supabase project created
- [ ] Database access credentials
- [ ] Node.js and npm installed
- [ ] PostgreSQL client installed (optional but recommended)
- [ ] Backup of existing database (if migrating)

---

## 🎯 Implementation Steps

### Step 1: Database Security Setup

#### 1.1 Generate Encryption Key

```bash
# Generate a secure 256-bit encryption key
openssl rand -base64 32

# Save this key securely - you'll need it!
# Example output: Xt7Q9vK3mL2pR5nF8hJ1wS4dG6yB0zA=
```

#### 1.2 Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings > Database**
3. Scroll to **Custom Postgres Config**
4. Add:
   ```
   app.encryption_key = 'your-generated-key-here'
   ```
5. Save changes

#### 1.3 Run Security Setup Script

```bash
# Set environment variables
export SUPABASE_PROJECT_ID="your-project-id"
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run setup script
cd /path/to/nesti-mvp
chmod +x scripts/setup_supabase_security.sh
./scripts/setup_supabase_security.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Create secure schema
- ✅ Install security functions
- ✅ Set up RLS policies
- ✅ Configure triggers
- ✅ Create indexes

#### 1.4 Manual Setup (Alternative)

If you prefer manual setup or the script fails:

1. Open Supabase SQL Editor
2. Run these files in order:
   - `database/schema_v2_secure.sql`
   - `database/functions_security.sql`
   - `database/rls_policies.sql`
   - `database/triggers_security.sql`
   - `database/indexes.sql`

### Step 2: Data Migration (If Needed)

If you have existing data to migrate:

```bash
# IMPORTANT: Backup first!
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Run migration
psql "$DATABASE_URL" < database/migrate_v1_to_v2.sql
```

Or in Supabase SQL Editor:
- Copy contents of `database/migrate_v1_to_v2.sql`
- Execute the migration

### Step 3: Frontend Security Integration

#### 3.1 Update Application Entry Point

Edit `src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeSecurity } from './lib/security';

// Initialize security features
const securityConfig = initializeSecurity();
console.log('Security initialized:', securityConfig.browserSecurity);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 3.2 Add Content Security Policy

Edit `public/index.html` to add CSP meta tag:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://*.supabase.co; frame-src 'none'; object-src 'none';">
    <!-- rest of head -->
  </head>
  <!-- rest of html -->
</html>
```

#### 3.3 Add Input Validation to Forms

Example for post creation:

```javascript
import { sanitizeString, containsXSS, containsSQLInjection } from './lib/inputValidator';

const handleCreatePost = async (content) => {
  try {
    // Validate and sanitize input
    const sanitized = sanitizeString(content, 2000);
    
    // Additional checks
    if (containsXSS(content) || containsSQLInjection(content)) {
      alert('Invalid content detected');
      return;
    }
    
    // Proceed with creating post
    await createPost(sanitized);
  } catch (error) {
    console.error('Validation error:', error);
  }
};
```

#### 3.4 Add File Upload Validation

Example for media upload:

```javascript
import { validateFileUpload } from './lib/inputValidator';

const handleFileUpload = async (file) => {
  const validation = validateFileUpload(
    file,
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    10 // 10MB limit
  );
  
  if (!validation.success) {
    alert(validation.message);
    return;
  }
  
  // Proceed with upload
  await uploadFile(file);
};
```

#### 3.5 Add Rate Limiting

Example for API calls:

```javascript
import { rateLimiter } from './lib/inputValidator';

const handleAPICall = async () => {
  const allowed = rateLimiter.isAllowed('api_call', 10, 60000); // 10 calls per minute
  
  if (!allowed) {
    alert('Too many requests. Please wait.');
    return;
  }
  
  // Make API call
  await makeAPICall();
};
```

### Step 4: Environment Configuration

#### 4.1 Update .env File

Create `.env.local` (never commit this file):

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Environment
NODE_ENV=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
```

#### 4.2 Production Environment Variables

In Vercel Dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

### Step 5: Verification

#### 5.1 Run Security Audit

```bash
export DATABASE_URL="postgresql://..."
./scripts/security_audit.sh
```

Expected output:
```
✅ Encryption key configured
✅ RLS enabled on all tables
✅ Security functions exist
✅ Triggers installed
```

#### 5.2 Test Encryption

In Supabase SQL Editor:

```sql
-- Test encryption/decryption
SELECT 
  encrypt_sensitive('test@example.com') as encrypted,
  decrypt_sensitive(encrypt_sensitive('test@example.com')) as decrypted;
```

#### 5.3 Test RLS Policies

```sql
-- Set user context (replace with real user ID)
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Try to query data
SELECT * FROM posts;
-- Should only return posts from user's families
```

#### 5.4 Test Frontend Validation

1. Try to submit a form with `<script>alert('xss')</script>`
   - Should be blocked with "Invalid input detected"

2. Try to submit SQL: `'; DROP TABLE users; --`
   - Should be blocked with "potential SQL injection detected"

3. Upload a file > 10MB
   - Should be blocked with size limit error

---

## 🧪 Testing Checklist

Before deploying to production:

### Database Security
- [ ] Encryption key is set and works
- [ ] RLS is enabled on all tables
- [ ] Security functions are installed
- [ ] Triggers are active
- [ ] Indexes are created
- [ ] Audit logging works
- [ ] Can't access other users' data

### Frontend Security
- [ ] Input validation works
- [ ] XSS detection works
- [ ] SQL injection detection works
- [ ] File upload validation works
- [ ] Rate limiting works
- [ ] CSP headers are set
- [ ] Console is disabled in production

### Authentication
- [ ] Users can sign up
- [ ] Users can log in
- [ ] Session management works
- [ ] Logout works
- [ ] Password reset works

### GDPR Compliance
- [ ] User consent tracking works
- [ ] Data export works
- [ ] Deletion request works
- [ ] Privacy policy is accessible
- [ ] Terms of service is accessible

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit passed
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Encryption key saved securely
- [ ] Monitoring configured
- [ ] Incident response plan ready

### Deploy to Production

```bash
# Build production version
npm run build

# Deploy to Vercel
vercel --prod

# Or using Git
git push origin main
# Vercel will auto-deploy
```

### Post-Deployment Verification

1. **Check HTTPS**:
   - Verify site loads over HTTPS
   - Check SSL certificate is valid

2. **Test Security Headers**:
   ```bash
   curl -I https://your-app.vercel.app
   ```
   Should see:
   - `Content-Security-Policy`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`

3. **Test Authentication**:
   - Sign up new user
   - Log in
   - Access protected routes

4. **Monitor Logs**:
   - Check Supabase logs
   - Check Vercel logs
   - Review security events

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Review security events
- [ ] Check for critical alerts
- [ ] Monitor error rates

### Weekly Tasks
- [ ] Run security audit
- [ ] Review audit logs
- [ ] Check blocked IPs
- [ ] Update dependencies

### Monthly Tasks
- [ ] Full security review
- [ ] Penetration testing
- [ ] Backup verification
- [ ] Policy review

### Quarterly Tasks
- [ ] Encryption key rotation
- [ ] Security training
- [ ] Disaster recovery drill
- [ ] Third-party audit

---

## 🆘 Troubleshooting

### Issue: Encryption not working

**Symptoms**: Can't decrypt data, errors with `encrypt_sensitive()`

**Solutions**:
1. Check encryption key is set:
   ```sql
   SHOW app.encryption_key;
   ```

2. Verify pgcrypto extension:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
   ```

3. Test encryption:
   ```sql
   SELECT decrypt_sensitive(encrypt_sensitive('test'));
   ```

### Issue: RLS blocking all access

**Symptoms**: Users can't see any data

**Solutions**:
1. Check user is authenticated:
   ```sql
   SELECT auth.uid();
   ```

2. Verify user belongs to a family:
   ```sql
   SELECT * FROM family_members WHERE user_id = auth.uid();
   ```

3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'posts';
   ```

### Issue: Performance problems

**Symptoms**: Slow queries, timeouts

**Solutions**:
1. Check indexes:
   ```sql
   SELECT * FROM pg_indexes WHERE schemaname = 'public';
   ```

2. Analyze query plans:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM posts WHERE family_id = 'uuid';
   ```

3. Update statistics:
   ```sql
   ANALYZE posts;
   ```

---

## 📚 Additional Resources

- [SECURITY.md](../SECURITY.md) - Complete security guide
- [DATABASE_SECURITY.md](./DATABASE_SECURITY.md) - Database details
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Incident procedures
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance](https://gdpr.eu/)

---

**Last Updated**: December 20, 2024
**Version**: 2.0
