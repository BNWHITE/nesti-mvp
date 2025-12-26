#!/bin/bash
# Railway Deployment Script for Nesti v2 Phoenix Backend

set -e

echo "🚂 Nesti v2 - Railway Deployment Script"
echo "========================================"

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g railway
fi

echo "📦 Building Phoenix application..."
cd backend

# Install dependencies
echo "Installing Elixir dependencies..."
mix deps.get --only prod
MIX_ENV=prod mix deps.compile

# Compile application
echo "Compiling application..."
MIX_ENV=prod mix compile

# Run database migrations
echo "Running database migrations..."
MIX_ENV=prod mix ecto.migrate

# Generate secret keys if not set
if [ -z "$SECRET_KEY_BASE" ]; then
    echo "⚠️  Generating SECRET_KEY_BASE..."
    export SECRET_KEY_BASE=$(mix phx.gen.secret)
    railway variables set SECRET_KEY_BASE="$SECRET_KEY_BASE"
fi

if [ -z "$GUARDIAN_SECRET_KEY" ]; then
    echo "⚠️  Generating GUARDIAN_SECRET_KEY..."
    export GUARDIAN_SECRET_KEY=$(mix phx.gen.secret)
    railway variables set GUARDIAN_SECRET_KEY="$GUARDIAN_SECRET_KEY"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway dashboard:"
echo "   - DATABASE_URL (from Supabase)"
echo "   - OPENAI_API_KEY"
echo "   - CLOAK_KEY"
echo "   - CORS_ALLOWED_ORIGINS"
echo ""
echo "2. Configure custom domain in Railway"
echo "3. Verify HTTPS is enabled"
echo "4. Test security headers: curl -I https://your-domain.com"
