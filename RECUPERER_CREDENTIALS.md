# 🔑 RÉCUPÉRER VOS CREDENTIALS SUPABASE

## Étape 1 : Aller dans Supabase Dashboard

1. **Ouvrir** : https://supabase.com/dashboard
2. **Sélectionner votre projet** Nesti (ozlbjohbzaommmtbwues)
3. **Cliquer** sur ⚙️ **Settings** (menu gauche en bas)
4. **Cliquer** sur **Database** (sous-menu)

## Étape 2 : Trouver la Connection String

Dans la section **"Connection string"**, vous verrez :

### Option A : URI (RECOMMANDÉ)
```
Sélectionner "URI" dans le dropdown
```

Vous verrez quelque chose comme :
```
postgresql://postgres:[YOUR-PASSWORD]@db.ozlbjohbzaommmtbwues.supabase.co:5432/postgres
```

**⚠️ ATTENTION** : Le mot de passe affiché est peut-être `[YOUR-PASSWORD]` - vous devez le remplacer par votre vrai mot de passe !

### Option B : Session pooling (Alternative)
```
Mode: Session pooling
Port: 5432
```

## Étape 3 : Copier les informations

Notez ces informations :

- **Host** : `db.ozlbjohbzaommmtbwues.supabase.co` (PAS le pooler !)
- **Port** : `5432` (direct) ou `6543` (transaction pooler)
- **Database** : `postgres`
- **User** : `postgres.ozlbjohbzaommmtbwues`
- **Password** : VOTRE MOT DE PASSE (le vrai !)

## Étape 4 : Mettre à jour backend/.env

Remplacez la ligne DATABASE_URL par :

```bash
# Connexion DIRECTE (recommandé)
DATABASE_URL=postgresql://postgres.ozlbjohbzaommmtbwues:[VOTRE-VRAI-MOT-DE-PASSE]@db.ozlbjohbzaommmtbwues.supabase.co:5432/postgres
```

**OU** si le mot de passe actuel (Nesti1234) est bon mais que l'host est mauvais :

```bash
# Avec le bon host
DATABASE_URL=postgresql://postgres.ozlbjohbzaommmtbwues:Nesti1234@db.ozlbjohbzaommmtbwues.supabase.co:5432/postgres
```

## Étape 5 : Réinitialiser le mot de passe (si nécessaire)

Si vous ne connaissez pas le mot de passe :

1. Dans Supabase Dashboard → Settings → Database
2. Cliquer sur **"Reset database password"**
3. Choisir un nouveau mot de passe (ex: `NestiSecure2025!`)
4. Mettre à jour `backend/.env` avec le nouveau mot de passe

## Étape 6 : Retester

```bash
cd backend
source .env
mix run test_connection.exs
```

Vous devriez voir :
```
✅ Connexion réussie!
✅ PostgreSQL version: PostgreSQL 15.x ...
✅ Tables trouvées (XX) :
  - activities
  - families
  - profiles
  ...
```

## 💡 Notes importantes

- Le **pooler** (`pooler.supabase.com`) peut causer des problèmes
- Préférez la connexion **directe** (`db.ozlbjohbzaommmtbwues.supabase.co`)
- Le port **5432** est pour les connexions directes
- Le port **6543** est pour le transaction pooling (peut avoir des limites)
