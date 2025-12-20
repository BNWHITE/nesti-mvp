# Nesti API - Backend Phoenix

Backend API pour l'application Nesti, déployable sur Render.

## 🚀 Démarrage rapide

### Prérequis

- Elixir 1.15+
- PostgreSQL 14+
- Docker (optionnel, pour build local)

### Installation locale

```bash
# Installer les dépendances
mix deps.get

# Créer et migrer la base de données
mix ecto.setup

# Démarrer le serveur
mix phx.server
```

L'API sera disponible sur `http://localhost:4000`

### Health Check

```bash
curl http://localhost:4000/api/health
```

## 🐳 Docker

### Build

```bash
docker build -t nesti-api .
```

### Run

```bash
docker run -p 4000:4000 \
  -e SECRET_KEY_BASE="your_secret_key_base" \
  -e DATABASE_URL="your_database_url" \
  -e ENCRYPTION_KEY="your_encryption_key" \
  -e PHX_HOST="localhost" \
  nesti-api
```

## 📚 Documentation

Pour plus d'informations sur le déploiement Render, consultez :
- [Guide de déploiement Render](../docs/DEPLOY_RENDER.md)
- [render.yaml](../render.yaml)

## 🔐 Variables d'environnement

Voir le fichier [runtime.exs](config/runtime.exs) pour la liste complète des variables d'environnement requises.

### Variables requises en production

- `SECRET_KEY_BASE` - Clé secrète pour la session (64+ caractères)
- `GUARDIAN_SECRET` - Clé pour JWT Guardian
- `ENCRYPTION_KEY` - Clé de chiffrement (32+ caractères)
- `DATABASE_URL` - URL de connexion PostgreSQL
- `PHX_HOST` - Hostname de l'application
- `OPENAI_API_KEY` - Clé API OpenAI (optionnel)

## 🧪 Tests

```bash
mix test
```

## 📝 License

Propriétaire - BNWHITE
