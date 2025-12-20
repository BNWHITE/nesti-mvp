# 🚀 Guide de Déploiement Render

Ce guide explique comment déployer le backend Nesti API sur Render.

## 📋 Prérequis

- Compte GitHub avec accès au repo `BNWHITE/nesti-mvp`
- Compte Render (gratuit pour commencer)
- Compte Supabase (pour la base de données)
- Clé API OpenAI (optionnel, pour Nesti IA)

## 🌍 Pourquoi Render ?

| Avantage | Détail |
|:---|:---|
| **Région EU** | Frankfurt disponible (conformité RGPD) |
| **Auto-deploy** | Déploiement automatique sur push |
| **SSL gratuit** | HTTPS automatique |
| **Docker support** | Build optimisé |
| **Logs en temps réel** | Debugging facile |

## 📝 Étapes de déploiement

### 1. Créer un compte Render

1. Aller sur [render.com](https://render.com)
2. Cliquer "Get Started for Free"
3. S'inscrire avec GitHub (recommandé)

### 2. Créer un Web Service

1. Dashboard → **New +** → **Web Service**
2. Connecter votre repo GitHub
3. Sélectionner `BNWHITE/nesti-mvp`

### 3. Configurer le service

| Paramètre | Valeur |
|:---|:---|
| **Name** | `nesti-api` |
| **Region** | `Frankfurt (EU)` 🇪🇺 |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Plan** | `Starter` ($7/mois) ou `Free` |

### 4. Variables d'environnement

Dans **Environment** → **Environment Variables**, ajouter :

#### Variables auto-générées (cliquer "Generate")
- `SECRET_KEY_BASE`
- `GUARDIAN_SECRET`

#### Variables manuelles

| Variable | Description | Exemple |
|:---|:---|:---|
| `MIX_ENV` | Environnement | `prod` |
| `PORT` | Port de l'app | `4000` |
| `ENCRYPTION_KEY` | Clé chiffrement (32+ chars) | `votre_cle_secrete_32_caracteres!` |
| `DATABASE_URL` | URL PostgreSQL Supabase | `postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres` |
| `OPENAI_API_KEY` | Clé API OpenAI | `sk-...` |
| `PHX_HOST` | Domaine de l'app | `nesti-api.onrender.com` |
| `POOL_SIZE` | Connexions DB | `10` |

### 5. Récupérer l'URL Supabase

1. Dashboard Supabase → **Settings** → **Database**
2. Section **Connection string** → **URI**
3. Copier l'URL complète
4. Coller dans `DATABASE_URL` sur Render

### 6. Générer une clé de chiffrement

```bash
# Générer une clé sécurisée
openssl rand -base64 32

# Ou en Elixir
:crypto.strong_rand_bytes(32) |> Base.encode64()
```

### 7. Déployer

1. Cliquer **Create Web Service**
2. Attendre le build (~5-10 minutes)
3. Vérifier les logs pour les erreurs

## ✅ Vérification du déploiement

### Health Check

```bash
curl https://nesti-api.onrender.com/api/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2025-12-20T12:00:00Z",
  "version": "0.1.0"
}
```

### Deep Health Check

```bash
curl https://nesti-api.onrender.com/api/health/deep
```

Réponse attendue :
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "latency_ms": 5.2
  },
  "timestamp": "2025-12-20T12:00:00Z",
  "version": "0.1.0"
}
```

## 🔧 Configuration avancée

### Domaine personnalisé

1. Settings → Custom Domains
2. Ajouter votre domaine (ex: `api.nesti.app`)
3. Configurer les DNS chez votre registrar
4. Mettre à jour `PHX_HOST`

### Auto-scaling (plan payant)

```yaml
# Dans render.yaml
scaling:
  minInstances: 1
  maxInstances: 5
  targetMemoryPercent: 80
  targetCPUPercent: 80
```

### Logs

- Dashboard → Logs (temps réel)
- Filtrer par niveau (info, warning, error)

## 🚨 Dépannage

### Erreur: "Database connection failed"

1. Vérifier `DATABASE_URL` (format correct)
2. Vérifier que Supabase autorise les connexions externes
3. Vérifier le pool size (pas trop élevé pour le plan Supabase)

### Erreur: "SECRET_KEY_BASE missing"

1. Aller dans Environment Variables
2. Cliquer "Generate" pour `SECRET_KEY_BASE`
3. Redéployer

### Build trop long

1. Vérifier le Dockerfile
2. S'assurer que les dépendances sont en cache
3. Considérer un plan plus puissant

## 📊 Métriques

Render fournit des métriques de base :
- CPU usage
- Memory usage
- Request count
- Response time

Pour des métriques avancées, intégrer :
- [AppSignal](https://appsignal.com) (recommandé pour Elixir)
- [Datadog](https://datadoghq.com)
- [New Relic](https://newrelic.com)

## 🔐 Sécurité

- ✅ SSL/TLS automatique
- ✅ Variables d'environnement chiffrées
- ✅ Réseau privé (plan Team)
- ✅ IP statique (plan payant)

## 💰 Coûts estimés

| Plan | Prix | Inclus |
|:---|:---|:---|
| **Free** | $0/mois | 750h/mois, sleep après 15min |
| **Starter** | $7/mois | Always-on, 512MB RAM |
| **Standard** | $25/mois | 2GB RAM, auto-scaling |
| **Pro** | $85/mois | 4GB RAM, priorité |

Recommandation : **Starter** pour le MVP, **Standard** pour la production.
