# 🔄 Nesti v1 → v2 Migration Guide

This document guides the migration from React/Supabase to Elixir/Phoenix + Flutter.

## Overview

**From**: React (CRA) + Vercel Serverless + Supabase  
**To**: Elixir (Phoenix) + Flutter + Supabase (database only)

## Pre-Migration Checklist

- [ ] Backup current Supabase database
- [ ] Export user data for verification
- [ ] Document current API endpoints
- [ ] Notify users of upcoming migration
- [ ] Set maintenance window

## Step 1: Setup New Infrastructure

### 1.1 Backend (Phoenix on Railway)

```bash
# Clone repository
git clone <repository-url>
cd nesti-mvp/backend

# Install dependencies
mix deps.get

# Setup environment variables
cp .env.example .env
# Edit .env with actual values

# Create database
mix ecto.create

# Run migrations
mix ecto.migrate

# Test locally
mix phx.server
```

### 1.2 Frontend (Flutter)

```bash
cd nesti-mvp/frontend

# Get dependencies
flutter pub get

# Test web build
flutter run -d chrome

# Test mobile build
flutter run -d ios
flutter run -d android
```

## Step 2: Data Migration

### 2.1 Prepare Migration Script

```bash
# Set environment variables
export SOURCE_DATABASE_URL="postgresql://supabase-current-db"
export TARGET_DATABASE_URL="postgresql://phoenix-new-db"

# Verify connectivity
psql $SOURCE_DATABASE_URL -c "SELECT COUNT(*) FROM profiles;"
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 2.2 Run Migration

```bash
# Dry run (read-only, no writes)
./scripts/migrate_from_react.exs --dry-run

# Actual migration
./scripts/migrate_from_react.exs

# Verify migration
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 2.3 Data Verification

Compare counts:
```sql
-- Source (Supabase)
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM families) as families,
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM events) as events;

-- Target (Phoenix)
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM families) as families,
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM events) as events;
```

## Step 3: Deploy Backend

### 3.1 Deploy to Railway

```bash
# Login to Railway
railway login

# Link project
railway link

# Set environment variables
railway variables set SECRET_KEY_BASE=$(mix phx.gen.secret)
railway variables set GUARDIAN_SECRET_KEY=$(mix phx.gen.secret)
railway variables set DATABASE_URL="<supabase-url>"
railway variables set OPENAI_API_KEY="<openai-key>"

# Deploy
./scripts/deploy_railway.sh
```

### 3.2 Verify Backend

```bash
# Check health
curl https://api.nesti.fr/health

# Check security headers
curl -I https://api.nesti.fr

# Test authentication
curl -X POST https://api.nesti.fr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## Step 4: Deploy Frontend

### 4.1 Build Flutter Web

```bash
# Build with security flags
./scripts/build_flutter_web.sh
```

### 4.2 Deploy to Hosting

**Option A: Vercel**
```bash
cd frontend/build/web
vercel --prod
```

**Option B: Netlify**
```bash
cd frontend/build/web
netlify deploy --prod
```

**Option C: Firebase Hosting**
```bash
cd frontend
firebase deploy --only hosting
```

### 4.3 Configure Mobile Apps

```bash
# iOS
cd frontend
flutter build ios --release --obfuscate --split-debug-info=build/debug-info

# Android
flutter build apk --release --obfuscate --split-debug-info=build/debug-info
```

## Step 5: DNS & SSL Configuration

### 5.1 Backend Domain

```
Type: A Record
Name: api
Value: <railway-ip>

Type: AAAA Record (if available)
Name: api
Value: <railway-ipv6>
```

### 5.2 Frontend Domain

```
Type: CNAME
Name: app
Value: <hosting-provider>.com
```

### 5.3 Verify SSL

```bash
curl -I https://api.nesti.fr | grep -i strict-transport
curl -I https://app.nesti.fr | grep -i strict-transport
```

## Step 6: User Migration

### 6.1 Password Reset Required

Since Argon2id is used instead of bcrypt:

```elixir
# Send password reset emails to all users
NestiApi.Accounts.send_password_reset_to_all_users()
```

### 6.2 Communication

Email template:
```
Subject: Nesti v2 - Nouvelle version disponible

Bonjour,

Nous avons migré Nesti vers une nouvelle version plus sécurisée et conforme au RGPD.

Changements importants :
- Nouvelle URL : https://app.nesti.fr
- Réinitialisation du mot de passe requise
- Nouvelles fonctionnalités de confidentialité

Pour réinitialiser votre mot de passe :
https://app.nesti.fr/reset-password

Merci,
L'équipe Nesti
```

## Step 7: Monitoring & Validation

### 7.1 Setup Monitoring

```elixir
# config/prod.exs
config :nesti_api, NestiApiWeb.Endpoint,
  live_dashboard: [
    metrics: NestiApiWeb.Telemetry
  ]
```

### 7.2 Check Metrics

- Response times
- Error rates
- Database connections
- Memory usage
- Request volume

### 7.3 User Acceptance Testing

- [ ] User registration
- [ ] User login
- [ ] Family creation
- [ ] Post creation
- [ ] Calendar events
- [ ] AI assistant
- [ ] Data export
- [ ] Account deletion

## Step 8: Cutover

### 8.1 Maintenance Mode

1. Enable maintenance mode on v1
2. Final data sync
3. Switch DNS to v2
4. Monitor for issues
5. Disable v1 after 24h

### 8.2 Rollback Plan

If critical issues arise:

```bash
# Switch DNS back to v1
# Restore database backup if needed
psql $TARGET_DATABASE_URL < backup.sql

# Communicate to users
```

## Step 9: Post-Migration

### 9.1 Verify RGPD Compliance

- [ ] Consent management working
- [ ] Data export functional
- [ ] Account deletion functional
- [ ] Audit logs recording
- [ ] Parental consent for minors

### 9.2 Security Audit

```bash
# Check for exposed secrets
grep -r "API_KEY" backend/ frontend/
grep -r "SECRET" backend/ frontend/

# Verify rate limiting
ab -n 100 -c 10 https://api.nesti.fr/api/auth/login

# Check encryption
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1;"
# email, first_name, last_name should be encrypted blobs
```

### 9.3 Performance Optimization

- Enable CDN
- Configure caching
- Optimize database queries
- Monitor slow endpoints

## Step 10: Decommission v1

After 30 days of successful v2 operation:

- [ ] Delete Vercel deployment
- [ ] Archive React codebase
- [ ] Update documentation
- [ ] Celebrate! 🎉

## Troubleshooting

### Issue: Users can't login

**Cause**: Password hash format changed  
**Solution**: All users must reset password

### Issue: Missing data after migration

**Cause**: Migration script incomplete  
**Solution**: Re-run migration for specific tables

### Issue: Rate limiting too strict

**Cause**: Default limits too low  
**Solution**: Adjust limits in `rate_limiter.ex`

### Issue: CORS errors

**Cause**: Frontend domain not in CORS_ALLOWED_ORIGINS  
**Solution**: Add domain to environment variable

## Support

- **Migration Issues**: migration@nesti.fr
- **Technical Support**: support@nesti.fr
- **Security**: security@nesti.fr

## Timeline

Estimated migration timeline:

- **Week 1**: Backend setup and testing
- **Week 2**: Frontend development
- **Week 3**: Data migration testing
- **Week 4**: Deployment and monitoring
- **Week 5**: User migration and support
- **Week 6**: Post-migration optimization

Total: ~6 weeks for complete migration
