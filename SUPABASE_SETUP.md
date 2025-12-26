# 🔐 CONFIGURATION SUPABASE POUR NESTI

## Étape 1 : Exécuter la migration de sécurité

### Dans Supabase Dashboard :

1. **Ouvrir Supabase Dashboard**
   - URL : https://supabase.com/dashboard/project/ozlbjohbzaommmtbwues
   - Cliquer sur "SQL Editor" dans le menu gauche

2. **Copier-coller le fichier de migration**
   ```bash
   # Sur votre Mac, ouvrir le fichier :
   open database/security_hardening.sql
   ```
   - Copier TOUT le contenu (854 lignes)
   - Coller dans l'éditeur SQL Supabase
   - Cliquer sur **Run** ▶️
   - Attendre la confirmation (peut prendre 30-60 secondes)

3. **Vérifier que tout fonctionne**
   ```bash
   # Ensuite, copier-coller et exécuter :
   open database/verify_security.sql
   ```
   - Exécuter chaque requête une par une
   - Vérifier que vous voyez :
     - ✅ 35+ tables avec RLS activé
     - ✅ 40+ politiques RLS
     - ✅ 6 nouvelles tables (user_consents, audit_logs, etc.)
     - ✅ 7 fonctions de sécurité

## Étape 2 : Corriger la connexion Elixir

### Le problème actuel :

L'URL de connexion actuelle utilise le **pooler** qui peut causer des problèmes :
```
postgresql://postgres.ozlbjohbzaommmtbwues:Nesti1234@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Solution :

1. **Trouver l'URL de connexion directe dans Supabase**
   - Dashboard → Settings → Database
   - Section "Connection string" → Mode "Session"
   - Copier l'URL qui ressemble à :
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
     ```

2. **Ou utiliser l'URL Transaction pooling (Port 6543) avec SSL**

### Vérifier les credentials :

Dans Supabase Dashboard → Settings → Database :

- **Host** : `aws-0-eu-central-1.pooler.supabase.com`
- **Port** : `6543` (transaction) ou `5432` (direct)
- **Database** : `postgres`
- **User** : `postgres.ozlbjohbzaommmtbwues`
- **Password** : `Nesti1234`

## Étape 3 : Tester la connexion

Une fois la migration exécutée, tester le backend :

```bash
cd backend
bash start.sh
```

Le serveur devrait démarrer sans erreur "Tenant or user not found".

## 📝 Checklist

- [ ] Migration `security_hardening.sql` exécutée dans Supabase
- [ ] Script `verify_security.sql` validé (toutes les tables/policies OK)
- [ ] URL de connexion vérifiée dans backend/.env
- [ ] Backend Elixir démarre sans erreur
- [ ] Test API : `curl http://localhost:4000/api/health`

## 🆘 En cas de problème

### Erreur "Tenant or user not found"
→ Vérifier le mot de passe et l'URL dans Supabase Settings → Database

### Erreur "SSL required"
→ Ajouter `?sslmode=require` à la fin de DATABASE_URL

### Erreur "Too many connections"
→ Réduire DATABASE_POOL_SIZE dans .env à 5

### RLS bloque les requêtes
→ Le backend doit utiliser le **service_role key** (pas l'anon key)
