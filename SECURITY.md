# 🛡️ Nesti MVP - Security Architecture

## 📋 Overview

Nesti MVP implements a **defense-in-depth security strategy** with multiple layers of protection to ensure zero vulnerabilities and zero data leaks.

**Security Objective: ZERO tolerance for vulnerabilities**

---

## 🏗️ Multi-Layer Security Architecture

### Plan A: Perimeter Protection
- **HTTPS Only**: All traffic encrypted with TLS 1.3
- **Rate Limiting**: Protection against brute force and DDoS
- **IP Blocking**: Automatic blocking of suspicious IPs
- **Input Validation**: All inputs validated and sanitized

### Plan B: Application Security
- **Secure Authentication**: HttpOnly cookies, no localStorage tokens
- **CSRF Protection**: Token-based CSRF prevention
- **XSS Prevention**: Content Security Policy (CSP) strict mode
- **SQL Injection Protection**: Parameterized queries only

### Plan C: Database Security
- **Row Level Security (RLS)**: Every table protected
- **Data Encryption**: AES-256-GCM for sensitive fields
- **Audit Logging**: All actions logged and monitored
- **Backup Encryption**: All backups encrypted at rest

### Plan D: Detection & Response
- **Security Event Monitoring**: Real-time threat detection
- **Intrusion Detection**: Pattern recognition for attacks
- **Incident Response**: Automated alerting and blocking
- **GDPR Compliance**: Complete data protection framework

---

## 🔐 Encryption Strategy

| Data Type | Method | Storage |
|:---|:---|:---|
| Passwords | Argon2id | Supabase Auth |
| Email, Names | AES-256-GCM | PostgreSQL BYTEA |
| Post Content | AES-256-GCM | PostgreSQL BYTEA |
| Chat Messages | AES-256-GCM | PostgreSQL BYTEA |
| JWT Tokens | HMAC-SHA256 | Cookies (HttpOnly) |
| Backups | AES-256-GCM | Encrypted storage |

### Encryption Key Management
- Keys stored in Supabase Vault (production) or environment variables (dev)
- Key rotation supported via migration scripts
- Keys NEVER committed to source code

---

## 🔒 Authentication & Authorization

### Authentication Flow
1. User logs in via Supabase Auth
2. Session token stored in HttpOnly cookie
3. Token validated on every request
4. Auto-refresh prevents session expiration
5. Tokens can be revoked (blacklist support)

### Authorization Layers
1. **Supabase Auth**: User identity verification
2. **Row Level Security**: Database-level access control
3. **Application Logic**: Business rules enforcement
4. **Audit Trail**: All access logged

### Password Security
- Minimum 8 characters
- Complexity requirements enforced
- Argon2id hashing (managed by Supabase)
- Failed login tracking and account locking
- Prevents direct password changes in database

---

## 🛡️ Input Validation

### SQL Injection Prevention
1. **Parameterized Queries**: All database queries use parameters
2. **Pattern Detection**: Function `contains_sql_injection()` blocks attacks
3. **Input Sanitization**: `sanitize_string()` validates all inputs
4. **RLS Enforcement**: Even if injection succeeds, RLS limits damage

### XSS Prevention
1. **Content Security Policy**: Strict CSP headers block inline scripts
2. **Pattern Detection**: Function `contains_xss()` blocks XSS attempts
3. **Output Encoding**: All user content escaped on render
4. **DOM Purification**: Client-side sanitization

---

## 📊 Audit & Monitoring

### Audit Logs
- **What's Logged**: All INSERT, UPDATE, DELETE operations
- **Data Anonymized**: User IDs hashed, IPs hashed
- **Immutable**: Audit logs cannot be deleted
- **Retention**: Stored indefinitely for compliance

### Security Events
- **Severity Levels**: Low, Medium, High, Critical
- **Event Types**: 
  - Failed login attempts
  - Account lockouts
  - IP blocking
  - Suspicious patterns
  - SQL injection attempts
  - XSS attempts

### Real-Time Monitoring
- Critical events trigger immediate alerts
- Automatic IP blocking after threshold
- Notifications via email/SMS for critical events

---

## 🌍 GDPR Compliance

### User Rights
1. **Right to Access**: Export all personal data (`export_user_data()`)
2. **Right to Erasure**: Delete or anonymize data (`anonymize_user_data()`)
3. **Right to Portability**: Download data in JSON format
4. **Right to Rectification**: Users can update their info
5. **Right to Object**: Users can revoke consents

### Consent Management
- Explicit consent for each data use
- Granular consent types (terms, privacy, AI, emails, analytics)
- Consent audit trail with timestamps and IP hashes
- Easy consent revocation

### Data Retention
- Posts expire after 2 years (configurable)
- Chat messages expire after 90 days
- Deleted users anonymized after 30 days
- Automatic cleanup via `cleanup_expired_data()`

### Parental Controls
- Required consent for users under 18
- Parent can control child's AI access
- Activity visibility to parents
- Configurable restrictions via JSONB

---

## 🔧 Security Configuration

### Required Environment Variables

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Database Encryption (Supabase Dashboard > Database Settings)
app.encryption_key=your-256-bit-encryption-key-here
```

### Database Setup

1. **Run Schema Creation**:
   ```bash
   # In Supabase SQL Editor
   # 1. schema_v2_secure.sql
   # 2. functions_security.sql
   # 3. rls_policies.sql
   # 4. triggers_security.sql
   # 5. indexes.sql
   ```

2. **Set Encryption Key**:
   ```sql
   -- In Supabase Dashboard: Settings > Database > Custom Config
   ALTER DATABASE postgres SET app.encryption_key = 'your-key-here';
   ```

3. **Verify Setup**:
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Check functions exist
   SELECT proname FROM pg_proc 
   WHERE proname IN ('encrypt_sensitive', 'decrypt_sensitive');
   ```

---

## 🚨 Incident Response

### Severity Levels

| Level | Response Time | Actions |
|:---|:---|:---|
| **Critical** | Immediate | Block IP, notify admin, log event, investigate |
| **High** | < 15 min | Monitor, alert admin, increase logging |
| **Medium** | < 1 hour | Log event, review patterns |
| **Low** | < 24 hours | Log for analysis |

### Response Procedures

1. **Detection**: Security event logged
2. **Classification**: Severity determined automatically
3. **Containment**: Automatic IP blocking if critical
4. **Investigation**: Review audit logs and security events
5. **Resolution**: Apply fixes, update security rules
6. **Documentation**: Update incident log

### Contact Information

- **Security Issues**: security@nesti.app (create this email)
- **CNIL Notification**: Within 72 hours of data breach
- **User Notification**: Immediate for affected users

---

## ✅ Security Checklist

### Pre-Deployment
- [ ] Encryption key configured
- [ ] RLS enabled on all tables
- [ ] All security functions deployed
- [ ] Audit triggers active
- [ ] HTTPS/TLS configured
- [ ] CSP headers configured
- [ ] Rate limiting active
- [ ] Backup strategy in place

### Ongoing Maintenance
- [ ] Weekly security audit review
- [ ] Monthly penetration testing
- [ ] Quarterly encryption key rotation
- [ ] Annual security assessment
- [ ] Continuous monitoring of security events

---

## 📚 Additional Resources

- [Database Security Guide](./docs/DATABASE_SECURITY.md)
- [Incident Response Plan](./docs/INCIDENT_RESPONSE.md)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance Guide](https://gdpr.eu/)

---

## 🔄 Version History

- **v2.0** (2024-12-20): Multi-layer security implementation
  - Added database encryption
  - Implemented RLS policies
  - Added audit logging
  - GDPR compliance
  - Parental controls

---

## 📧 Reporting a Vulnerability

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@nesti.app with details
3. Include steps to reproduce
4. Allow 48 hours for initial response
5. Coordinate disclosure timeline

**Bug Bounty**: Coming soon

---

**Last Updated**: December 20, 2024
**Security Version**: 2.0
**Compliance**: GDPR, French Data Protection Law
