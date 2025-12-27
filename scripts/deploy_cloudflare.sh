#!/bin/bash
# Cloudflare Pages Deployment Script for Nesti React Frontend

set -e

echo "☁️  Nesti - Cloudflare Pages Deployment Script"
echo "=============================================="

# Check if wrangler CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please login to Cloudflare:"
    wrangler login
fi

echo "📦 Building React application..."
npm run build

echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy build --project-name nesti-app --branch main

echo "✅ Deployment complete!"
echo ""
echo "Your app should be available at: https://nesti-app.pages.dev"
echo "Or your custom domain if configured."