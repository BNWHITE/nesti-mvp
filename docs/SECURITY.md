# 🔐 Security Documentation - Nesti v2

## Overview

Nesti v2 implements a comprehensive security-by-design architecture with multiple layers of protection to ensure user data privacy and compliance with EU regulations.

## Security Architecture

### 1. Authentication & Authorization

#### Password Security
- **Hashing**: Argon2id (state of the art, winner of Password Hashing Competition)
- **Parameters**: t_cost=4, m_cost=65536 (64MB), parallelism=2
- **Password Requirements**:
  - Minimum 12 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

#### JWT Tokens
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Storage**: HttpOnly, Secure, SameSite=Strict cookies
- **Algorithm**: HS256
- **Token Rotation**: Automatic on refresh

#### Session Management
- **Cookie Attributes**:
  - `HttpOnly`: true (prevents JavaScript access - anti-F12)
  - `Secure`: true (HTTPS only)
  - `SameSite`: Strict (prevents CSRF)
  - `Max-Age`: 900 seconds (15 minutes)

### 2. Encryption

#### Data at Rest (AES-256-GCM)
Encrypted fields using Cloak:
- `users.email`
- `users.first_name`
- `users.last_name`
- `posts.content`
- `comments.content`
- `chat_messages.message`
- `chat_messages.response`

#### End-to-End Encryption
Family messages use E2E encryption:
- **Algorithm**: AES-256-GCM
- **Key Exchange**: ECDH (P-256)
- **Keys**: Per-family encryption keys
- **Storage**: Keys stored in secure enclave (iOS/Android) or secure storage (Web)

#### Data in Transit
- **TLS 1.3** required
- **Certificate Pinning** (mobile apps)
- **HSTS** header with preload

### 3. Security Headers

All responses include:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 4. Rate Limiting

Per-endpoint limits:

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| AI Chat | 20 requests | 1 minute |
| Media Upload | 10 requests | 1 minute |

Implementation: Hammer with ETS backend

### 5. Anti-F12 / Inspector Protection

**Server-Side**:
- ❌ No API keys in client code
- ❌ No secrets in environment variables accessible to client
- ✅ All sensitive operations server-side validated
- ✅ HttpOnly cookies for authentication

**Client-Side (Flutter Web)**:
- ✅ Code obfuscation with `--obfuscate`
- ✅ Debug info separated with `--split-debug-info`
- ✅ No source maps in production
- ✅ Console logging disabled in production
- ✅ DevTools hooks disabled

**Build Command**:
```bash
flutter build web \
  --release \
  --obfuscate \
  --split-debug-info=build/debug-info \
  --dart-define=ENV=production \
  --no-source-maps
```

### 6. Input Validation

**Server-Side**:
- All inputs validated with Ecto changesets
- SQL injection prevention via Ecto parameterized queries
- XSS prevention via output encoding
- CSRF protection via SameSite cookies

**Client-Side**:
- Input sanitization (not relied upon for security)
- UI validation for better UX only

### 7. Dependency Security

**Automated Scanning**:
- `mix deps.audit` for Elixir dependencies
- `flutter pub audit` for Dart dependencies
- GitHub Dependabot alerts enabled

**Updates**:
- Monthly security patch updates
- Critical vulnerabilities patched within 24 hours

## Incident Response

### Vulnerability Disclosure

Report security vulnerabilities to: security@nesti.fr

**Expected Response Times**:
- Critical: 24 hours
- High: 72 hours
- Medium: 7 days
- Low: 30 days

### Incident Handling

1. **Detection**: Automated monitoring + manual reports
2. **Assessment**: Severity classification within 1 hour
3. **Containment**: Immediate for critical issues
4. **Investigation**: Root cause analysis
5. **Remediation**: Patch development and deployment
6. **Notification**: User notification if data affected (RGPD requirement)

## Compliance

### EU RGPD/GDPR
- Data encryption at rest and in transit
- User consent management
- Right to access (data export)
- Right to erasure (complete deletion)
- Data portability
- Audit logging
- Data breach notification (72 hours)

### Best Practices
- OWASP Top 10 mitigation
- CWE/SANS Top 25 mitigation
- Regular security audits
- Penetration testing (annually)

## Security Checklist

Before Production Deployment:

- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS enforced (HSTS enabled)
- [ ] Rate limiting configured
- [ ] Security headers validated
- [ ] Code obfuscation enabled (Flutter Web)
- [ ] Source maps disabled
- [ ] Console logging disabled
- [ ] Dependencies audited
- [ ] Penetration test completed
- [ ] Incident response plan documented
- [ ] RGPD compliance verified

## Monitoring

**Security Metrics**:
- Failed authentication attempts
- Rate limit violations
- Suspicious access patterns
- Data export requests
- Data deletion requests

**Alerts**:
- Multiple failed logins from same IP
- Rate limit violations
- Unusual data access patterns
- Critical dependency vulnerabilities

## Regular Security Tasks

### Daily
- Review security logs
- Monitor failed authentication attempts

### Weekly
- Dependency vulnerability scan
- Review rate limit violations

### Monthly
- Security patch updates
- Access log analysis
- User permission audit

### Quarterly
- Security training for team
- Third-party security audit

### Annually
- Penetration testing
- Disaster recovery drill
- Security policy review

## Contact

For security-related questions or concerns:
- **Email**: security@nesti.fr
- **Response Time**: 24-48 hours
- **Encrypted Communication**: PGP key available on request
