#!/bin/bash
# Script to start Elixir Backend

echo "🚀 Starting Nesti Elixir Backend..."
cd backend

# Export environment variables from .env file
if [ -f .env ]; then
  echo "📄 Loading environment from .env file..."
  set -a
  source .env
  set +a
else
  echo "⚠️  No .env file found, using defaults..."
  # Fallback to hardcoded values (UPDATED WITH CORRECT CREDENTIALS)
  export DATABASE_URL="postgresql://postgres.ozlbjohbzaommmtbwues:Ta96LD%23ntbyeu%5E@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
  export DATABASE_POOL_SIZE="5"
  export SECRET_KEY_BASE="zTT3pAps5JbjYm7E5WahdGcVqtFz6t6gsl/P5OTekrulYpMvmo9l28XhhCQlhMG"
  export GUARDIAN_SECRET_KEY="ExOj6bkTk0N3t0in9vZ146jsVS4LEMro"
  export CLOAK_KEY="fCs6I9jHnAf2ikELmTeD8jM9treyal1NM+LFM2c1jzg="
  export SESSION_SIGNING_SALT="nesti_session_sign"
  export SESSION_ENCRYPTION_SALT="nesti_session_enc"
  export CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8080"
  export PHX_HOST="localhost"
  export PORT="4000"
  export NODE_ENV="development"
  export LOG_LEVEL="debug"
fi

echo "📦 Compiling..."
mix compile

echo "🔌 Starting Phoenix server on http://localhost:$PORT..."
mix phx.server
