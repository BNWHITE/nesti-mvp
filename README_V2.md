# 👨‍👩‍👧‍👦 Nesti v2 - Privacy-First Family Assistant

**Nesti v2** is a complete architectural migration from React/Vercel/Supabase to **Elixir/Phoenix + Flutter** with **Privacy by Design** and strict **EU RGPD/GDPR compliance**.

## 🚀 Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Elixir + Phoenix 1.7 | Robust, scalable API with real-time features |
| **Frontend** | Flutter 3.x | Cross-platform (iOS, Android, Web) |
| **Database** | PostgreSQL (Supabase) | Relational database with RLS |
| **Hosting** | Railway (Backend) | EU-based hosting for RGPD compliance |
| **Region** | 🇫🇷 France / 🇪🇺 EU | Data sovereignty |

### Why This Migration?

**From**: React CRA + Vercel Serverless + Supabase  
**To**: Elixir + Phoenix + Flutter

**Benefits**:
- ✅ **Better Security**: Server-side validation, encrypted data at rest
- ✅ **RGPD Native**: Privacy by design, consent management, data portability
- ✅ **Scalability**: Phoenix handles millions of concurrent connections
- ✅ **Real-time**: Native WebSockets with Phoenix Channels
- ✅ **Type Safety**: Elixir's pattern matching + Dart's strong typing
- ✅ **Mobile Native**: True native iOS/Android apps with Flutter
- ✅ **EU Compliance**: Data hosted in EU, RGPD-compliant architecture

## 🔐 Privacy & Security Features

### Critical Security (Anti-F12)

**❌ What's NOT in the client code**:
- API keys
- Secrets
- Database credentials
- Encryption keys
- Sensitive business logic

**✅ What IS protected**:
- **HttpOnly cookies**: Authentication tokens not accessible via JavaScript
- **Code obfuscation**: Flutter Web code obfuscated in production
- **No source maps**: Debug information stripped from production builds
- **Console disabled**: Production builds disable console logging
- **CSP headers**: Strict Content Security Policy

### Encryption

| Data Type | Encryption Method | Algorithm |
|-----------|------------------|-----------|
| Passwords | Hashing | Argon2id |
| At-rest data | Symmetric | AES-256-GCM |
| E2E messages | End-to-end | AES-256-GCM |
| In-transit | TLS | TLS 1.3 |

### Authentication

- **JWT** with Guardian
- **Access tokens**: 15 minutes expiration
- **Refresh tokens**: 7 days expiration
- **Storage**: HttpOnly, Secure, SameSite=Strict cookies
- **Password requirements**: 12+ chars, uppercase, lowercase, number, special char

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login/register) | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| AI Chat | 20 requests | 1 minute |
| Media Upload | 10 requests | 1 minute |

## ��🇺 RGPD/GDPR Compliance

### User Rights Implemented

- ✅ **Right to Access**: Export personal data (JSON/CSV)
- ✅ **Right to Erasure**: Complete data deletion (right to be forgotten)
- ✅ **Right to Portability**: Structured data export
- ✅ **Right to Rectification**: Update personal information
- ✅ **Consent Management**: Granular consent for each feature
- ✅ **Audit Logging**: Complete activity history (anonymized)

### Minors Protection (<16 years)

- **Parental consent** required for registration
- Restricted AI features
- Enhanced privacy controls
- No external sharing
- Parental notifications

### Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Active user profile | Account lifetime |
| Deleted account | 30 days (then permanent deletion) |
| Audit logs | 1 year |
| Consent records | 3 years after withdrawal |

## 📁 Project Structure

```
nesti-mvp/
├── backend/                     # Phoenix API (Elixir)
│   ├── config/                  # Configuration files
│   ├── lib/
│   │   ├── nesti_api/          # Business logic contexts
│   │   │   ├── accounts/       # Users, authentication
│   │   │   ├── families/       # Family management
│   │   │   ├── content/        # Posts, comments
│   │   │   ├── calendar/       # Events
│   │   │   ├── activities/     # Activity discovery
│   │   │   ├── ai/             # Nesti AI integration
│   │   │   └── privacy/        # RGPD compliance
│   │   └── nesti_api_web/      # Web layer
│   │       ├── controllers/    # API endpoints
│   │       ├── channels/       # WebSockets
│   │       └── plugs/          # Security middleware
│   └── priv/repo/migrations/   # Database migrations
│
├── frontend/                    # Flutter App
│   ├── lib/
│   │   ├── core/               # Core functionality
│   │   │   ├── config/         # Configuration (NO SECRETS!)
│   │   │   ├── services/       # API, Auth, Storage
│   │   │   ├── security/       # Encryption, Secure storage
│   │   │   └── theme/          # UI theming
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── home/           # Home feed
│   │   │   ├── family/         # Family management
│   │   │   ├── calendar/       # Calendar
│   │   │   ├── discover/       # Activity discovery
│   │   │   ├── nesti_ai/       # AI assistant
│   │   │   └── settings/       # Settings & Privacy
│   │   └── shared/             # Shared components
│   └── web/                    # Web-specific config
│
├── docs/                       # Documentation
│   ├── SECURITY.md             # Security documentation
│   ├── RGPD_COMPLIANCE.md      # RGPD compliance guide
│   ├── PRIVACY_POLICY.md       # User-facing privacy policy
│   └── API_DOCUMENTATION.md    # API reference
│
└── scripts/                    # Deployment & migration
    ├── deploy_railway.sh       # Railway deployment
    ├── build_flutter_web.sh    # Secure Flutter build
    └── migrate_from_react.exs  # Data migration
```

## 🚀 Getting Started

### Prerequisites

- **Elixir** ~> 1.14
- **Erlang/OTP** ~> 25
- **Flutter** ~> 3.x
- **PostgreSQL** (via Supabase)
- **Node.js** (for tooling)

### Backend Setup

```bash
cd backend

# Install dependencies
mix deps.get

# Setup database (first time)
mix ecto.setup

# Start Phoenix server
mix phx.server
```

Server runs at: http://localhost:4000

### Frontend Setup

```bash
cd frontend

# Get Flutter packages
flutter pub get

# Run on web
flutter run -d chrome

# Run on iOS
flutter run -d ios

# Run on Android
flutter run -d android
```

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL=postgresql://...
SECRET_KEY_BASE=...
GUARDIAN_SECRET_KEY=...
CLOAK_KEY=...
OPENAI_API_KEY=...
CORS_ALLOWED_ORIGINS=https://nesti.app
```

**Frontend**: NO environment variables with secrets!  
All secrets are server-side only.

## 📱 Features

### Core Features (from v1)

1. **🏠 Family Feed** - Posts, reactions, comments, media
2. **👨‍👩‍👧‍👦 Family Management** - Members, roles, invitations
3. **📅 Family Calendar** - Events, participants, reminders
4. **🔍 Discover** - Activities, search, favorites
5. **🤖 Nesti AI** - Chat assistant (with consent)
6. **🔐 Authentication** - Email/password + OAuth Google
7. **🌙 Dark Mode** - Light/dark themes

### New in v2

8. **🔒 Enhanced Privacy** - RGPD-compliant data management
9. **🛡️ Security by Design** - End-to-end encryption
10. **📱 Native Mobile** - True iOS/Android apps
11. **⚡ Real-time** - WebSocket-powered updates
12. **🌍 EU Hosting** - Data sovereignty

## 🧪 Testing

### Backend Tests

```bash
cd backend
mix test
mix test --cover
```

### Frontend Tests

```bash
cd frontend
flutter test
flutter test --coverage
```

## 🚢 Deployment

### Backend (Railway)

```bash
./scripts/deploy_railway.sh
```

### Frontend (Flutter Web)

```bash
# Build with security optimizations
./scripts/build_flutter_web.sh

# Deploy build/web to hosting provider
# (Vercel, Netlify, Firebase Hosting, etc.)
```

## 📊 Migration from v1 (React)

```bash
# Export environment variables
export SOURCE_DATABASE_URL="postgresql://..." # Supabase
export TARGET_DATABASE_URL="postgresql://..." # Phoenix

# Run migration script
./scripts/migrate_from_react.exs
```

## 📚 Documentation

- **[Security](docs/SECURITY.md)**: Comprehensive security documentation
- **[RGPD Compliance](docs/RGPD_COMPLIANCE.md)**: GDPR compliance guide
- **[Privacy Policy](docs/PRIVACY_POLICY.md)**: User-facing policy
- **[API Docs](docs/API_DOCUMENTATION.md)**: API reference

## 🔒 Security Checklist

Before going to production:

- [ ] All secrets in environment variables
- [ ] HTTPS enforced (HSTS)
- [ ] Security headers validated
- [ ] Code obfuscation enabled
- [ ] Source maps disabled
- [ ] Rate limiting configured
- [ ] Dependencies audited
- [ ] Penetration test completed
- [ ] RGPD compliance verified
- [ ] Backup strategy implemented

## 📧 Contact

- **Security Issues**: security@nesti.fr
- **Privacy/RGPD**: privacy@nesti.fr
- **General**: contact@nesti.fr

## 📄 License

Copyright © 2024 Nesti. All rights reserved.

---

**Built with ❤️ in France 🇫🇷**  
**Privacy by Design • RGPD Compliant • EU Hosted**
