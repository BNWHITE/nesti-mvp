#!/bin/bash

# Script pour servir l'application Flutter web
cd /Users/s.sy/Documents/Nesti/nesti-mvp-copilot-migrate-nesti-to-elixir-flutter/frontend/build/web

echo "Répertoire actuel: $(pwd)"
echo "Fichiers présents:"
ls -la index.html main.dart.js flutter.js 2>&1 | head -5
echo ""
echo "Démarrage du serveur HTTP sur http://127.0.0.1:8080"
echo ""

python3 -m http.server 8080 --bind 127.0.0.1
