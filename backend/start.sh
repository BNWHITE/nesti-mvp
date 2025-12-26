#!/bin/bash
# Script to start Phoenix server with environment variables

cd "$(dirname "$0")"

echo "🚀 Starting Nesti API Backend..."

# Export environment variables directly (URL-encoded password)
export DATABASE_URL="postgresql://postgres.ozlbjohbzaommmtbwues:Ta96LD%23ntbyeu%5E@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
export SECRET_KEY_BASE="zTT3pAps5JbjYm7E5WahdGcVqtFz6t6gsl/P5OTekrulYpMvmo9l28XhhCQlhMG"
export GUARDIAN_SECRET_KEY="ExOj6bkTk0N3t0in9vZ146jsVS4LEMro"
export CLOAK_KEY="fCs6I9jHnAf2ikELmTeD8jM9treyal1NM+LFM2c1jzg="
export PORT="4000"

echo "✅ Environment configured"
echo "🌐 Starting Phoenix on port 4000..."

# Start Phoenix server
exec mix phx.server
