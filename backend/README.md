# Nesti API v2 - Phoenix Backend

Privacy-by-Design backend built with Elixir and Phoenix Framework.

## 🔐 Security Features

### Authentication & Authorization
- **Argon2id** password hashing (state of the art)
- **JWT** with Guardian (15-min access tokens + 7-day refresh tokens)
- **HttpOnly, Secure, SameSite=Strict** cookies (anti-F12)
- **No secrets in client code** - everything server-side

### Encryption
- **At-rest encryption**: AES-256-GCM with Cloak for sensitive fields
- **End-to-end encryption**: For family messages
- **TLS 1.3** in transit

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict Permissions-Policy

### Rate Limiting
- Auth endpoints: 5 req/min per IP
- General API: 100 req/min per user
- AI Chat: 20 req/min per user
- Media uploads: 10 req/min per user

## 🇪🇺 RGPD/GDPR Compliance

### User Rights
- ✅ Right to access (data export)
- ✅ Right to be forgotten (complete deletion)
- ✅ Right to portability (JSON/CSV export)
- ✅ Consent management
- ✅ Audit logging

### Minors Protection (< 16 years)
- Parental consent required
- AI feature restrictions
- Enhanced privacy controls

## 🚀 Getting Started

### Prerequisites
- Elixir ~> 1.14
- Erlang/OTP ~> 25
- PostgreSQL (Supabase)

### Installation

```bash
# Install dependencies
mix deps.get

# Create and migrate database
mix ecto.setup

# Start Phoenix server
mix phx.server
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://...

# Secrets (generate with: mix phx.gen.secret)
SECRET_KEY_BASE=...
GUARDIAN_SECRET_KEY=...
CLOAK_KEY=...

# Sessions
SESSION_SIGNING_SALT=...
SESSION_ENCRYPTION_SALT=...

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.com

# OpenAI
OPENAI_API_KEY=sk-...
```

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
├── lib/
│   ├── nesti_api/         # Business logic contexts
│   │   ├── accounts/      # Users, authentication
│   │   ├── families/      # Family management
│   │   ├── content/       # Posts, comments, reactions
│   │   ├── calendar/      # Events
│   │   ├── activities/    # Activity discovery
│   │   ├── ai/            # Nesti AI integration
│   │   └── privacy/       # RGPD compliance
│   └── nesti_api_web/     # Web layer
│       ├── controllers/   # API endpoints
│       ├── channels/      # WebSockets
│       └── plugs/         # Security middleware
├── priv/repo/migrations/  # Database migrations
└── test/                  # Tests
```

## 🧪 Testing

```bash
# Run all tests
mix test

# Run tests with coverage
mix test --cover
```

## 🚢 Deployment (Railway)

```bash
# Deploy to Railway
./scripts/deploy_railway.sh
```

## 📚 API Documentation

See `/docs/API_DOCUMENTATION.md` for detailed API reference.

## 🔒 Security Considerations

**CRITICAL**: Never commit:
- Real API keys
- Database credentials
- Secret keys
- Encryption keys

All secrets must be environment variables on Railway.
