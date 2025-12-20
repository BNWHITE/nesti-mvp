# 🚀 Getting Started with Nesti v2

Welcome to Nesti v2! This guide will help you set up your development environment and start contributing.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Elixir** >= 1.14 ([Installation](https://elixir-lang.org/install.html))
- **Erlang/OTP** >= 25 (usually comes with Elixir)
- **Flutter** >= 3.x ([Installation](https://flutter.dev/docs/get-started/install))
- **PostgreSQL** >= 14 (or Supabase account)
- **Git**
- **Node.js** >= 18 (for tooling)

### Optional but Recommended
- **Docker** (for local PostgreSQL)
- **VSCode** with extensions:
  - ElixirLS
  - Dart & Flutter
  - GitLens
- **Postman** or **Insomnia** (for API testing)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/BNWHITE/nesti-mvp.git
cd nesti-mvp
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
mix deps.get

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# For local PostgreSQL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nesti_dev

# Create database
mix ecto.create

# Run migrations (when available)
# mix ecto.migrate

# Start Phoenix server
mix phx.server
```

Server will start at: http://localhost:4000

### 3. Frontend Setup

```bash
cd frontend

# Get Flutter packages
flutter pub get

# Run on web (for development)
flutter run -d chrome

# Or run on mobile
flutter run -d ios      # iOS
flutter run -d android  # Android
```

## Development Workflow

### Backend Development

```bash
cd backend

# Interactive Elixir shell with app loaded
iex -S mix phx.server

# Run tests
mix test

# Run tests with coverage
mix test --cover

# Format code
mix format

# Check for dependency vulnerabilities
mix deps.audit
```

### Frontend Development

```bash
cd frontend

# Run in hot reload mode
flutter run -d chrome

# Run tests
flutter test

# Format code
dart format .

# Analyze code
flutter analyze

# Check for package vulnerabilities
flutter pub audit
```

## Project Structure

```
nesti-mvp/
├── backend/           # Phoenix API (Elixir)
├── frontend/          # Flutter app
├── docs/              # Documentation
├── scripts/           # Deployment & utilities
├── README_V2.md       # Architecture overview
└── MIGRATION_GUIDE.md # Migration instructions
```

## Common Tasks

### Add a New Backend Feature

1. Create context:
```bash
cd backend
mix phx.gen.context ContextName Resource resources field:type
```

2. Add routes in `lib/nesti_api_web/router.ex`
3. Implement controller logic
4. Add tests
5. Update documentation

### Add a New Frontend Feature

1. Create feature directory:
```bash
cd frontend/lib/features
mkdir new_feature
```

2. Add BLoC (state management):
```bash
# Create bloc files
touch new_feature/new_feature_bloc.dart
touch new_feature/new_feature_event.dart
touch new_feature/new_feature_state.dart
```

3. Add UI:
```bash
touch new_feature/new_feature_screen.dart
```

4. Add tests
5. Update routing

## Environment Variables

### Backend (.env)

**Required**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY_BASE=<generate with: mix phx.gen.secret>
GUARDIAN_SECRET_KEY=<generate with: mix phx.gen.secret>
```

**Optional**:
```bash
OPENAI_API_KEY=sk-...
CLOAK_KEY=<base64 encoded 32 bytes>
CORS_ALLOWED_ORIGINS=http://localhost:5000,https://app.nesti.fr
```

### Frontend

**NO environment variables with secrets!**  
All configuration is compile-time only.

## Database Setup

### Option 1: Local PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt install postgresql-14
sudo systemctl start postgresql

# Create database
createdb nesti_dev
createdb nesti_test
```

### Option 2: Docker

```bash
docker run --name nesti-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nesti_dev \
  -p 5432:5432 \
  -d postgres:14
```

### Option 3: Supabase

1. Create project on [supabase.com](https://supabase.com)
2. Copy connection string
3. Set `DATABASE_URL` in `.env`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
mix test

# Run specific test file
mix test test/nesti_api/accounts_test.exs

# Run with coverage
mix test --cover

# Watch mode (requires mix_test_watch)
mix test.watch
```

### Frontend Tests

```bash
cd frontend

# Run all tests
flutter test

# Run specific test
flutter test test/auth_test.dart

# Run with coverage
flutter test --coverage

# Widget tests
flutter test --tags=widget

# Integration tests
flutter test --tags=integration
```

## Debugging

### Backend (Phoenix)

```bash
# Start with debugger
iex -S mix phx.server

# In code, use:
require IEx
IEx.pry

# Or use IO.inspect for quick debugging:
user |> IO.inspect(label: "User")
```

### Frontend (Flutter)

```bash
# Run with DevTools
flutter run -d chrome --observatory-port=9090

# In code, use:
debugPrint('Debug message');

# Or use breakpoints in VSCode
```

## Code Style

### Elixir
- Follow [Elixir Style Guide](https://github.com/christopheradams/elixir_style_guide)
- Run `mix format` before committing
- Maximum line length: 120 characters

### Dart/Flutter
- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart)
- Run `dart format .` before committing
- Use Material Design 3
- Prefer composition over inheritance

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add user authentication"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat: add user registration endpoint
fix: resolve rate limiting issue
docs: update API documentation
```

## Troubleshooting

### Backend Won't Start

**Problem**: `(Mix) Could not start application`  
**Solution**: 
```bash
mix deps.clean --all
mix deps.get
mix compile
```

### Database Connection Failed

**Problem**: `(DBConnection.ConnectionError)`  
**Solution**: 
- Check DATABASE_URL in .env
- Verify PostgreSQL is running: `pg_isready`
- Check credentials

### Flutter Build Failed

**Problem**: `Error: Cannot run with sound null safety`  
**Solution**: 
```bash
flutter clean
flutter pub get
flutter run
```

### Hot Reload Not Working

**Problem**: Changes not reflected  
**Solution**: 
- Press `r` in terminal to reload
- Press `R` for full restart
- Check for syntax errors

## Resources

### Documentation
- [Elixir Docs](https://hexdocs.pm/elixir/)
- [Phoenix Docs](https://hexdocs.pm/phoenix/)
- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)

### Our Docs
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Security Guide](docs/SECURITY.md)
- [RGPD Compliance](docs/RGPD_COMPLIANCE.md)
- [Migration Guide](MIGRATION_GUIDE.md)

### Community
- [Phoenix Forum](https://elixirforum.com/c/phoenix-forum)
- [Flutter Community](https://flutter.dev/community)
- [Supabase Discord](https://discord.supabase.com/)

## Getting Help

- **Technical Questions**: Create an issue on GitHub
- **Security Issues**: security@nesti.fr
- **General Questions**: contact@nesti.fr

## Next Steps

1. ✅ Set up your development environment
2. 📚 Read [README_V2.md](README_V2.md) for architecture overview
3. 🔒 Review [SECURITY.md](docs/SECURITY.md) for security practices
4. 👨‍💻 Pick an issue to work on
5. 🚀 Create your first PR!

---

**Happy Coding! 👨‍👩‍👧‍👦**
