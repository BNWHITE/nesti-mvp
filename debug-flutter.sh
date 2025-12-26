#!/bin/bash

echo "🔧 Script de debug Flutter Web"
echo "================================"
echo ""

# Tuer les processus existants
echo "1️⃣  Nettoyage des processus..."
pkill -9 python3 2>/dev/null
sleep 1

# Aller dans le dossier frontend
cd "$(dirname "$0")/frontend"

# Compiler Flutter
echo "2️⃣  Compilation Flutter en mode profile..."
flutter build web --profile --no-wasm-dry-run

if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie !"
    echo ""
    echo "3️⃣  Démarrage du serveur HTTP sur http://localhost:3001..."
    echo ""
    cd build/web
    python3 -m http.server 3001
else
    echo "❌ Erreur de compilation"
    exit 1
fi
