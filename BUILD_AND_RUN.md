# Nesti v2 - Build and Run Guide

## 🚀 Quick Start

This guide explains how to set up, build, and run both the Phoenix backend and Flutter frontend.

## Prerequisites

### Backend (Phoenix/Elixir)
- Elixir 1.14+ and Erlang/OTP 25+
- PostgreSQL 14+
- Mix build tool

### Frontend (Flutter)
- Flutter SDK 3.0+
- Dart SDK 3.0+
- Web support enabled (`flutter config --enable-web`)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
mix deps.get
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost/nesti_dev

# Secrets (generate with: mix phx.gen.secret)
SECRET_KEY_BASE=your_secret_key_base_here
GUARDIAN_SECRET_KEY=your_guardian_secret_here
SESSION_SIGNING_SALT=your_session_signing_salt
SESSION_ENCRYPTION_SALT=your_session_encryption_salt

# Encryption (generate with: :crypto.strong_rand_bytes(32) |> Base.encode64())
CLOAK_KEY=your_base64_encoded_32_byte_key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5000

# Database
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=nesti_dev
PGHOST=localhost
PGPORT=5432
```

### 3. Setup Database

```bash
# Create and migrate database
mix ecto.create
mix ecto.migrate

# (Optional) Seed with sample data
mix run priv/repo/seeds.exs
```

### 4. Run Backend Server

```bash
# Development mode
mix phx.server

# Or with IEx console
iex -S mix phx.server
```

Backend will be available at `http://localhost:4000`

### 5. Run Tests

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Run specific test file
mix test test/nesti_api/accounts_test.exs
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
flutter pub get
```

### 2. Configure Environment

The API URL can be configured via environment variables:

```bash
# For local development
flutter run --dart-define=API_URL=http://localhost:4000/api/v1
```

### 3. Run Frontend (Web)

```bash
# Development mode
flutter run -d chrome

# With custom API URL
flutter run -d chrome --dart-define=API_URL=http://localhost:4000/api/v1
```

### 4. Build for Production (Web)

```bash
# Build optimized web version
flutter build web --release --dart-define=API_URL=https://api.nesti.app/api/v1

# With code obfuscation (recommended for production)
flutter build web --release --obfuscate --split-debug-info=build/debug-info
```

Built files will be in `build/web/`

### 5. Run Tests

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

## Development Workflow

### Running Backend and Frontend Together

1. Start PostgreSQL database
2. Start Phoenix backend: `cd backend && mix phx.server`
3. Start Flutter frontend: `cd frontend && flutter run -d chrome`

### Hot Reload

- **Backend**: Phoenix automatically reloads on code changes
- **Frontend**: Flutter supports hot reload with `r` key or hot restart with `R`

## API Documentation

Once the backend is running, API documentation is available at:
- Phoenix LiveDashboard: `http://localhost:4000/dev/dashboard`

## Database Management

### Migrations

```bash
# Create new migration
mix ecto.gen.migration migration_name

# Run migrations
mix ecto.migrate

# Rollback last migration
mix ecto.rollback

# Reset database (drop, create, migrate)
mix ecto.reset
```

### Database Console

```bash
# Access PostgreSQL console
psql -U postgres -d nesti_dev

# Or via Mix
mix ecto.psql
```

## Code Quality

### Backend (Elixir)

```bash
# Format code
mix format

# Check for code issues
mix credo

# Type checking with Dialyzer
mix dialyzer
```

### Frontend (Flutter)

```bash
# Analyze code
flutter analyze

# Format code
dart format lib/

# Check for outdated dependencies
flutter pub outdated
```

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection settings
cat backend/.env
```

**Compilation Errors:**
```bash
# Clean and recompile
mix deps.clean --all
mix deps.get
mix compile
```

### Frontend Issues

**Dependency Issues:**
```bash
# Clean and reinstall
flutter clean
flutter pub get
```

**Build Errors:**
```bash
# Update Flutter
flutter upgrade

# Check Flutter doctor
flutter doctor
```

## Security Checklist

Before deploying to production:

- [ ] All secrets are properly configured in environment variables
- [ ] Database encryption keys are set (CLOAK_KEY)
- [ ] JWT secrets are strong and unique (GUARDIAN_SECRET_KEY)
- [ ] CORS is configured for production domains only
- [ ] SSL/TLS certificates are properly configured
- [ ] Database backups are enabled
- [ ] Rate limiting is configured
- [ ] Flutter web build uses obfuscation

## Deployment

### Backend (Railway/Fly.io/Heroku)

The `backend/` directory includes configuration for various platforms:
- Railway: Use the Railway CLI or connect GitHub repo
- Fly.io: Use `fly.toml` configuration
- Heroku: Use `Procfile` and buildpacks

### Frontend (Vercel/Netlify)

1. Build the web app: `flutter build web --release`
2. Deploy the `build/web/` directory
3. Configure environment variables in hosting platform

## Additional Resources

- [Phoenix Documentation](https://hexdocs.pm/phoenix)
- [Flutter Documentation](https://docs.flutter.dev)
- [Elixir School](https://elixirschool.com)
- [Ecto Documentation](https://hexdocs.pm/ecto)

## Support

For issues or questions:
1. Check existing documentation
2. Search closed issues in the repository
3. Create a new issue with detailed information
