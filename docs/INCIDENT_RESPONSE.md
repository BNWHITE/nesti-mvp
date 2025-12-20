# 🚨 Incident Response Plan - Nesti MVP

## 📋 Overview

This document outlines the incident response procedures for security events in Nesti MVP, including detection, classification, response actions, and reporting requirements.

---

## 🎯 Objectives

1. **Rapid Detection**: Identify security incidents quickly
2. **Immediate Containment**: Stop the threat from spreading
3. **Thorough Investigation**: Understand the scope and impact
4. **Swift Recovery**: Restore normal operations
5. **Compliance**: Meet GDPR and legal reporting obligations

---

## 📊 Severity Classification

### Critical (P0)
**Response Time**: Immediate (< 5 minutes)

**Indicators**:
- Active data breach
- Database compromise
- Mass unauthorized access
- Ransomware attack
- Complete service outage
- Exposure of encryption keys

**Automatic Actions**:
- Block suspicious IPs immediately
- Alert all administrators
- Enable enhanced logging
- Prepare incident report

### High (P1)
**Response Time**: < 15 minutes

**Indicators**:
- Repeated SQL injection attempts
- Brute force attack in progress
- Unauthorized admin access attempt
- RLS policy bypass attempt
- Multiple failed authentication attempts
- Suspicious data export requests

**Automatic Actions**:
- Block offending IPs
- Alert security team
- Increase monitoring
- Log all related events

### Medium (P2)
**Response Time**: < 1 hour

**Indicators**:
- Single SQL injection attempt
- XSS attempt
- Unusual access patterns
- Failed privilege escalation
- Rate limit exceeded
- Suspicious user behavior

**Automatic Actions**:
- Log security event
- Monitor closely
- Notify security team (low priority)

### Low (P3)
**Response Time**: < 24 hours

**Indicators**:
- Invalid input format
- Single failed login
- Normal rate limit triggers
- User errors

**Automatic Actions**:
- Log for analysis
- No immediate action required

---

## 🚨 Incident Response Workflow

### Phase 1: Detection

**Monitoring Sources**:
- Security Events table (real-time)
- Audit Logs (historical)
- Supabase Auth logs
- Application logs
- Server logs
- User reports

**Detection Methods**:
- Automated alerts from `security_events` table
- Pattern recognition in audit logs
- Anomaly detection (unusual activity volume)
- Manual security reviews

### Phase 2: Classification

**Severity Assessment**:
1. Identify the incident type
2. Determine affected systems/data
3. Estimate number of affected users
4. Assess potential data exposure
5. Classify using severity matrix

**Documentation**:
```sql
-- Log the incident
INSERT INTO security_events (
  event_type,
  severity,
  ip_hash,
  user_id_hash,
  details
) VALUES (
  'data_breach_suspected',
  'critical',
  hash_ip('attacker-ip'),
  NULL,
  jsonb_build_object(
    'description', 'Unauthorized access to user data',
    'affected_tables', ARRAY['users', 'posts'],
    'estimated_records', 100
  )
);
```

### Phase 3: Containment

**Immediate Actions**:

1. **Block the Threat**:
   ```sql
   -- Block attacker IP
   SELECT block_ip_address(
     'attacker-ip-address',
     'Security incident - unauthorized access',
     NULL,  -- duration (NULL = check other params)
     true   -- permanent
   );
   ```

2. **Revoke Access**:
   ```sql
   -- Revoke all sessions for compromised user
   -- (Implementation depends on Supabase Auth integration)
   ```

3. **Isolate Affected Systems**:
   - Disable affected features temporarily
   - Enable read-only mode if necessary
   - Increase RLS enforcement

4. **Preserve Evidence**:
   ```sql
   -- Export audit logs for investigation
   SELECT * FROM audit_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   
   -- Export security events
   SELECT * FROM security_events
   WHERE severity IN ('critical', 'high')
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

### Phase 4: Investigation

**Evidence Collection**:
1. Audit logs from affected timeframe
2. Security events related to incident
3. Database query logs
4. Network traffic logs
5. User activity patterns

**Analysis Questions**:
- What was the attack vector?
- What data was accessed/modified?
- How many users/records affected?
- Was encryption effective?
- Did RLS policies hold?
- Were there any prior warnings?

**Investigation Queries**:
```sql
-- Find all actions by suspected attacker
SELECT * FROM audit_logs
WHERE user_id_hash = hash_user_id('suspected-user-id')
ORDER BY created_at DESC;

-- Check for pattern of SQL injection attempts
SELECT * FROM security_events
WHERE event_type = 'sql_injection_attempt'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Identify affected records
SELECT 
  table_name,
  COUNT(*) as affected_count
FROM audit_logs
WHERE created_at BETWEEN 'incident-start' AND 'incident-end'
AND ip_hash = 'attacker-ip-hash'
GROUP BY table_name;
```

### Phase 5: Eradication

**Remove the Threat**:
1. Patch vulnerabilities
2. Update security rules
3. Rotate compromised credentials
4. Update encryption keys if needed
5. Clean up malicious data

**Rotation Script** (if needed):
```bash
# See scripts/rotate_encryption_keys.sh
./scripts/rotate_encryption_keys.sh
```

### Phase 6: Recovery

**Restore Operations**:
1. Verify all threats eliminated
2. Restore from backup if necessary
3. Re-enable disabled features
4. Monitor closely for 48 hours
5. Gradual return to normal operations

**Recovery Verification**:
```sql
-- Verify no active security events
SELECT COUNT(*) FROM security_events
WHERE severity IN ('critical', 'high')
AND created_at > NOW() - INTERVAL '1 hour';

-- Verify RLS is working
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;  -- Should return 0 rows

-- Verify encryption functions
SELECT decrypt_sensitive(encrypt_sensitive('test'));
```

### Phase 7: Post-Incident Review

**Documentation**:
1. Timeline of events
2. Root cause analysis
3. Impact assessment
4. Response effectiveness
5. Lessons learned
6. Recommendations

**Metrics**:
- Time to detect (TTD)
- Time to respond (TTR)
- Time to recover (TTRec)
- Number of affected users
- Data exposure (if any)

---

## 📧 Notification Requirements

### GDPR Compliance (Article 33 & 34)

**Data Protection Authority (DPA)**:
- **Deadline**: Within 72 hours of discovery
- **Authority**: CNIL (France)
- **Contact**: https://www.cnil.fr/

**Required Information**:
1. Nature of the breach
2. Categories and approximate number of affected users
3. Categories and approximate number of affected records
4. Contact point for more information
5. Likely consequences
6. Measures taken or proposed

**User Notification**:
Required if breach likely to result in high risk to rights and freedoms.

**Notification Template**:
```
Subject: Important Security Notice - Nesti

Dear [User Name],

We are writing to inform you of a security incident that may have 
affected your personal data on Nesti.

What Happened:
[Brief description of incident]

What Information Was Involved:
[Types of data potentially affected]

What We Are Doing:
[Steps taken to address the incident]

What You Should Do:
[Recommended actions for users]

Contact Information:
For questions or concerns, please contact security@nesti.app

We sincerely apologize for any inconvenience this may cause.

Nesti Security Team
```

---

## 🛠️ Emergency Contacts

### Internal Team
- **Security Lead**: [Name] - [Email] - [Phone]
- **Database Admin**: [Name] - [Email] - [Phone]
- **CTO/Technical Lead**: [Name] - [Email] - [Phone]
- **Legal Counsel**: [Name] - [Email] - [Phone]

### External Contacts
- **CNIL (France DPA)**: +33 1 53 73 22 22
- **Supabase Support**: support@supabase.io
- **Vercel Support**: support@vercel.com
- **Security Consultant**: [If applicable]

### Escalation Path
1. **L1**: On-call engineer (immediate response)
2. **L2**: Security lead (< 15 minutes)
3. **L3**: CTO (< 30 minutes for P0/P1)
4. **L4**: Legal counsel (< 1 hour for data breaches)

---

## 📋 Incident Playbooks

### SQL Injection Attack

**Detection**:
```sql
SELECT * FROM security_events
WHERE event_type = 'sql_injection_attempt'
AND created_at > NOW() - INTERVAL '1 hour';
```

**Response**:
1. Block attacking IP immediately
2. Review RLS policies for affected tables
3. Check for successful injections in audit logs
4. Verify data integrity
5. Patch vulnerable input fields

### Brute Force Attack

**Detection**:
```sql
SELECT 
  ip_hash,
  COUNT(*) as attempt_count
FROM security_events
WHERE event_type = 'failed_login'
AND created_at > NOW() - INTERVAL '5 minutes'
GROUP BY ip_hash
HAVING COUNT(*) > 10;
```

**Response**:
1. Automatically block IP (should be automatic)
2. Lock affected user accounts
3. Notify affected users
4. Review authentication logs
5. Consider implementing CAPTCHA

### Data Breach

**Detection**:
- Unusual data export volume
- Unauthorized access to sensitive tables
- RLS policy violations

**Response**:
1. **Immediate**: Block access, preserve evidence
2. **Within 1 hour**: Assess scope and impact
3. **Within 24 hours**: Complete investigation
4. **Within 72 hours**: Notify CNIL
5. **Within 7 days**: Notify affected users (if required)

### Ransomware/Malware

**Detection**:
- Unexpected file modifications
- Mass data deletion
- Unusual encryption activity

**Response**:
1. Isolate affected systems immediately
2. Do NOT pay ransom
3. Restore from encrypted backups
4. Scan all systems for malware
5. Change all credentials
6. Notify law enforcement

---

## 🔧 Recovery Procedures

### Database Restore

```bash
# Stop application
vercel env rm DATABASE_URL

# Restore from backup
psql -U postgres -h db.supabase.co < backup_YYYYMMDD.sql

# Verify restore
psql -U postgres -h db.supabase.co -c "SELECT COUNT(*) FROM users;"

# Re-enable application
vercel env add DATABASE_URL
```

### Encryption Key Rotation

```bash
# Run key rotation script
./scripts/rotate_encryption_keys.sh

# Verify all data re-encrypted
psql -c "SELECT COUNT(*) FROM users WHERE email_encrypted IS NULL;"
```

---

## 📊 Incident Metrics Dashboard

```sql
-- Security incidents by severity (last 30 days)
SELECT 
  severity,
  COUNT(*) as incident_count,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_week
FROM security_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;

-- Most common attack types
SELECT 
  event_type,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY event_type
ORDER BY count DESC
LIMIT 10;

-- Blocked IPs
SELECT 
  COUNT(*) as total_blocked,
  COUNT(CASE WHEN permanent THEN 1 END) as permanent_blocks,
  COUNT(CASE WHEN blocked_until > NOW() THEN 1 END) as active_temp_blocks
FROM blocked_ips;
```

---

## ✅ Post-Incident Checklist

- [ ] Threat completely eliminated
- [ ] Vulnerabilities patched
- [ ] All systems verified secure
- [ ] Audit logs reviewed and stored
- [ ] Incident documented
- [ ] DPA notified (if required)
- [ ] Users notified (if required)
- [ ] Root cause identified
- [ ] Preventive measures implemented
- [ ] Team debriefed
- [ ] Incident report completed
- [ ] Security policies updated
- [ ] Monitoring enhanced

---

## 🔄 Continuous Improvement

**Monthly Reviews**:
- Analyze all security events
- Identify trends and patterns
- Update detection rules
- Refine response procedures

**Quarterly Audits**:
- Full security assessment
- Penetration testing
- RLS policy review
- Encryption verification

**Annual Reviews**:
- Comprehensive security review
- Third-party audit
- Incident response drill
- Policy updates

---

**Last Updated**: December 20, 2024
**Version**: 2.0
**Next Review**: March 20, 2025
