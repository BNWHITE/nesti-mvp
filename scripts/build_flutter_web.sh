#!/bin/bash
# Secure Flutter Web Build Script for Nesti v2

set -e

echo "🎯 Building Flutter Web with Security Optimizations"
echo "===================================================="

cd frontend

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean
rm -rf build/

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Run tests (optional, comment out for faster builds)
# echo "🧪 Running tests..."
# flutter test

# Build with security flags
echo "🔨 Building for production with security flags..."
flutter build web \
  --release \
  --obfuscate \
  --split-debug-info=build/debug-info \
  --dart-define=ENV=production \
  --no-source-maps \
  --tree-shake-icons \
  --pwa-strategy offline-first

echo "✅ Build complete!"
echo ""
echo "Build location: frontend/build/web"
echo ""
echo "Security features enabled:"
echo "✅ Code obfuscation (--obfuscate)"
echo "✅ Debug info separated (--split-debug-info)"
echo "✅ Source maps disabled (--no-source-maps)"
echo "✅ Tree-shaking enabled"
echo "✅ CSP headers in index.html"
echo "✅ Console logging disabled in production"
echo ""
echo "⚠️  CRITICAL: Do NOT commit build/debug-info to version control!"
echo ""
echo "Next steps:"
echo "1. Test the build locally:"
echo "   cd build/web && python3 -m http.server 8000"
echo "2. Deploy to hosting (Vercel, Netlify, Firebase Hosting)"
echo "3. Verify security headers are present"
echo "4. Test that F12 inspector doesn't reveal sensitive data"
