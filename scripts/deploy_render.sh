#!/bin/bash

# =============================================================================
# Script de déploiement Render pour Nesti API
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║              🚀 NESTI - Déploiement Render                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# -----------------------------------------------------------------------------
# Vérifications préliminaires
# -----------------------------------------------------------------------------

echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ Erreur: render.yaml non trouvé. Exécutez ce script depuis la racine du projet.${NC}"
    exit 1
fi

# Vérifier Docker (pour build local)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker installé${NC}"
else
    echo -e "${YELLOW}⚠️  Docker non installé (optionnel pour build local)${NC}"
fi

# Vérifier Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git installé${NC}"

# -----------------------------------------------------------------------------
# Vérification du code
# -----------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}🔍 Vérification du code...${NC}"

# Vérifier qu'il n'y a pas de secrets dans le code
echo "   Recherche de secrets potentiels..."
SECRETS_FOUND=0

# Patterns à rechercher
PATTERNS=(
    "sk-[a-zA-Z0-9]{20,}"  # OpenAI keys
    "OPENAI_API_KEY\s*=\s*['\"][^'\"]+['\"]"
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
)

for pattern in "${PATTERNS[@]}"; do
    if grep -r -E "$pattern" --include="*.ex" --include="*.exs" --include="*.js" --include="*.dart" . 2>/dev/null | grep -v "test" | grep -v "example" | grep -v ".env.example"; then
        SECRETS_FOUND=1
    fi
done

if [ $SECRETS_FOUND -eq 1 ]; then
    echo -e "${RED}❌ ATTENTION: Des secrets potentiels ont été trouvés dans le code!${NC}"
    echo -e "${RED}   Veuillez les supprimer et utiliser des variables d'environnement.${NC}"
    read -p "Continuer quand même? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Aucun secret trouvé dans le code${NC}"
fi

# -----------------------------------------------------------------------------
# Build Docker local (test)
# -----------------------------------------------------------------------------

echo ""
read -p "Voulez-vous tester le build Docker localement? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🐳 Build Docker en cours...${NC}"
    
    cd backend
    docker build -t nesti-api:test .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build Docker réussi!${NC}"
        
        # Test rapide
        echo -e "${YELLOW}🧪 Test du container...${NC}"
        docker run -d --name nesti-test -p 4000:4000 \
            -e SECRET_KEY_BASE="test_secret_key_base_minimum_64_chars_for_testing_purposes_only" \
            -e GUARDIAN_SECRET="test_guardian_secret" \
            -e DATABASE_URL="postgresql://test:test@localhost/test" \
            -e ENCRYPTION_KEY="test_encryption_key_32_chars!!" \
            -e PHX_HOST="localhost" \
            nesti-api:test 2>/dev/null || true
            
        sleep 5
        
        if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Container fonctionne correctement!${NC}"
        else
            echo -e "${YELLOW}⚠️  Container non accessible (normal sans DB)${NC}"
        fi
        
        # Cleanup
        docker stop nesti-test 2>/dev/null || true
        docker rm nesti-test 2>/dev/null || true
    else
        echo -e "${RED}❌ Échec du build Docker${NC}"
        exit 1
    fi
    
    cd ..
fi

# -----------------------------------------------------------------------------
# Instructions de déploiement
# -----------------------------------------------------------------------------

echo ""
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║              📋 Instructions de déploiement Render                 ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Étape 1: Créer un compte Render${NC}"
echo "   → https://render.com"
echo ""

echo -e "${GREEN}Étape 2: Connecter votre repo GitHub${NC}"
echo "   → Dashboard → New + → Web Service"
echo "   → Connecter GitHub → Sélectionner BNWHITE/nesti-mvp"
echo ""

echo -e "${GREEN}Étape 3: Configurer le service${NC}"
echo "   → Name: nesti-api"
echo "   → Region: Frankfurt (EU) 🇪🇺"
echo "   → Branch: main"
echo "   → Root Directory: backend"
echo "   → Runtime: Docker"
echo ""

echo -e "${GREEN}Étape 4: Variables d'environnement${NC}"
echo "   Ajouter dans Environment → Environment Variables:"
echo ""
echo "   ┌────────────────────┬─────────────────────────────────────┐"
echo "   │ Variable           │ Valeur                              │"
echo "   ├────────────────────┼─────────────────────────────────────┤"
echo "   │ MIX_ENV            │ prod                                │"
echo "   │ PORT               │ 4000                                │"
echo "   │ SECRET_KEY_BASE    │ (Cliquer Generate)                  │"
echo "   │ GUARDIAN_SECRET    │ (Cliquer Generate)                  │"
echo "   │ ENCRYPTION_KEY     │ (Votre clé 32+ caractères)          │"
echo "   │ DATABASE_URL       │ (URL Supabase PostgreSQL)           │"
echo "   │ OPENAI_API_KEY     │ (Votre clé OpenAI)                  │"
echo "   │ PHX_HOST           │ nesti-api.onrender.com              │"
echo "   │ POOL_SIZE          │ 10                                  │"
echo "   └────────────────────┴─────────────────────────────────────┘"
echo ""

echo -e "${GREEN}Étape 5: Récupérer l'URL Supabase${NC}"
echo "   → Dashboard Supabase → Settings → Database"
echo "   → Connection string → URI"
echo "   → Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
echo ""

echo -e "${GREEN}Étape 6: Générer une clé de chiffrement${NC}"
echo "   Exécuter cette commande pour générer une clé sécurisée:"
echo ""
echo -e "${YELLOW}   openssl rand -base64 32${NC}"
echo ""

echo -e "${GREEN}Étape 7: Déployer${NC}"
echo "   → Cliquer 'Create Web Service'"
echo "   → Attendre le build (~5-10 min)"
echo "   → Vérifier le health check: https://[votre-app].onrender.com/api/health"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Prêt pour le déploiement!${NC}"
echo ""
echo "URL de votre API après déploiement:"
echo -e "${YELLOW}   https://nesti-api.onrender.com${NC}"
echo ""
