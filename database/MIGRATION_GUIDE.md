# 🚀 Guide d'Exécution - Migration de Sécurité Nesti

## ✅ Étapes pour appliquer la migration

### 1. Ouvrir Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet Nesti
3. Cliquer sur **SQL Editor** dans le menu de gauche

### 2. Exécuter la migration

1. Créer une nouvelle requête
2. Copier-coller TOUT le contenu du fichier `database/security_hardening.sql`
3. Cliquer sur **Run** (ou Ctrl/Cmd + Enter)

### 3. Vérifier l'exécution

La migration devrait s'exécuter en **~10-15 secondes** et afficher :

```
Success. No rows returned
```

### 4. Vérifications post-migration

Exécutez ces requêtes pour vérifier :

#### a) Vérifier que RLS est activé partout
```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
**Résultat attendu :** Toutes les tables doivent avoir `rowsecurity = true`

#### b) Compter les politiques RLS
```sql
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```
**Résultat attendu :** Chaque table devrait avoir au moins 1-4 politiques

#### c) Vérifier les nouvelles tables RGPD
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_consents',
  'data_export_requests',
  'data_deletion_requests',
  'audit_logs',
  'failed_login_attempts',
  'suspicious_activities'
);
```
**Résultat attendu :** 6 lignes (toutes les tables de sécurité)

#### d) Vérifier les indexes
```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```
**Résultat attendu :** 15+ indexes de performance

#### e) Vérifier les fonctions de sécurité
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'is_family_admin',
  'is_family_member',
  'is_adult_user',
  'anonymize_deleted_users',
  'generate_family_encryption_key',
  'update_updated_at_column',
  'log_sensitive_changes'
);
```
**Résultat attendu :** 7 fonctions

## 🔧 En cas d'erreur

### Erreur: "relation already exists"
✅ **Normal** - Cela signifie que certaines tables/indexes existent déjà
👉 Continuer l'exécution, les `IF NOT EXISTS` gèrent cela

### Erreur: "permission denied"
❌ **Problème** - Vous n'avez pas les droits admin
👉 Utiliser le compte admin Supabase ou le role `postgres`

### Erreur: "foreign key violation"
❌ **Problème** - Des données existantes violent les nouvelles contraintes
👉 Options:
1. Nettoyer les données orphelines avant la migration
2. Commenter temporairement les contraintes problématiques
3. Exécuter section par section

### Erreur: "syntax error"
❌ **Problème** - Version PostgreSQL incompatible
👉 Vérifier la version : `SELECT version();` (minimum: PostgreSQL 12)

## 📊 Test post-migration

### Test 1: Vérifier l'isolation des familles

```sql
-- Se connecter en tant qu'utilisateur A
-- Essayer d'accéder aux données de la famille B
SELECT * FROM public.posts 
WHERE family_id = '<family_id_of_another_user>';
```
**Résultat attendu :** 0 lignes (accès refusé)

### Test 2: Tester les consentements RGPD

```sql
-- Insérer un consentement
INSERT INTO public.user_consents (user_id, purpose, granted, granted_at)
VALUES (auth.uid(), 'data_processing', true, now());

-- Vérifier
SELECT * FROM public.user_consents WHERE user_id = auth.uid();
```
**Résultat attendu :** 1 ligne avec le consentement

### Test 3: Tester l'audit log

```sql
-- Modifier un profil
UPDATE public.profiles SET first_name = 'Test' WHERE id = auth.uid();

-- Vérifier le log
SELECT * FROM public.audit_logs 
WHERE user_id = auth.uid() 
ORDER BY timestamp DESC 
LIMIT 5;
```
**Résultat attendu :** Logs des modifications récentes

## 🎯 Actions suivantes

### Immédiatement après la migration

- [ ] **Nettoyer** les anciennes politiques RLS obsolètes
- [ ] **Tester** l'accès avec différents rôles (admin, parent, enfant)
- [ ] **Configurer** un cron job pour `anonymize_deleted_users()`
- [ ] **Activer** les alertes sur `suspicious_activities`

### Dans les prochains jours

- [ ] **Implémenter** le chiffrement E2E dans l'application
- [ ] **Créer** les formulaires de consentement RGPD
- [ ] **Ajouter** les endpoints d'export de données
- [ ] **Documenter** le processus de suppression de compte

### Pour la production

- [ ] **Backup** complet avant de lancer en prod
- [ ] **Test** de charge pour vérifier les performances
- [ ] **Monitoring** des logs d'audit
- [ ] **Documentation** pour l'équipe support

## 🔐 Cron Job pour le nettoyage automatique

Créez un cron job Supabase pour nettoyer automatiquement les anciennes données :

```sql
-- Dans Supabase Dashboard > Database > Cron Jobs
-- Créer un nouveau job qui s'exécute chaque jour à 3h du matin

SELECT cron.schedule(
  'cleanup-old-data',
  '0 3 * * *',  -- Tous les jours à 3h
  $$
  SELECT anonymize_deleted_users();
  $$
);
```

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Consulter `SECURITY_IMPROVEMENTS.md`
3. Tester avec le role `service_role` pour debug
4. Contacter l'équipe de sécurité

---

**Version:** 1.0  
**Date:** 25 décembre 2025  
**Testé sur:** PostgreSQL 15.1, Supabase
