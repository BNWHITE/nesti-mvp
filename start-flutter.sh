#!/bin/bash

# Script de démarrage de l'app Flutter Nesti
# Usage: ./start-flutter.sh

cd "$(dirname "$0")/frontend"

echo "🚀 Démarrage de Nesti Flutter..."
echo "📂 Répertoire: $(pwd)"
echo "📱 Navigateur: Chrome"
echo "🔌 Port: 3001"
echo ""

flutter run -d chrome --web-port=3001
