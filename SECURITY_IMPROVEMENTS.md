# 🔐 Guide de Sécurité Maximale - Nesti Database

## ⚠️ PROBLÈMES CRITIQUES DÉTECTÉS

### 1. **Absence de RLS sur certaines tables** ❌
**Risque:** Accès non autorisé aux données
**Solution:** Le fichier `security_hardening.sql` active RLS sur TOUTES les tables

### 2. **Tables exposées sans politiques** ❌
Actuellement, plusieurs tables n'ont PAS de politiques RLS :
- `auth_attempts`
- `rate_limits`
- `security_alerts`
- `user_sessions`

**Impact:** Même avec RLS activé, sans politiques, PERSONNE ne peut accéder aux données.

### 3. **Données sensibles non chiffrées** ⚠️
- Messages familiaux (`family_messages.message_text`)
- Détails d'événements (`events.description`)
- Commentaires (`comments.content`)

### 4. **Absence de conformité RGPD** ❌
Manque de tables pour :
- Consentements utilisateurs
- Demandes d'export de données
- Demandes de suppression de données
- Journaux d'audit

### 5. **Pas de protection contre les attaques** ⚠️
- Aucun rate limiting applicatif
- Pas de détection d'activités suspectes
- Pas de logging des échecs de connexion

## ✅ AMÉLIORATIONS APPORTÉES

### 1. Row Level Security (RLS)
```sql
-- ✅ RLS activé sur TOUTES les tables
-- ✅ Politiques granulaires par rôle (admin, parent, enfant)
-- ✅ Isolation totale entre familles
```

### 2. Conformité RGPD/GDPR
```sql
-- ✅ user_consents - Tracking des consentements
-- ✅ data_export_requests - Portabilité des données
-- ✅ data_deletion_requests - Droit à l'oubli
-- ✅ audit_logs - Traçabilité complète
```

### 3. Sécurité renforcée
```sql
-- ✅ Soft delete (deleted_at) pour récupération
-- ✅ Audit automatique des changements sensibles
-- ✅ Détection d'activités suspectes
-- ✅ Tracking des tentatives de connexion échouées
```

### 4. Chiffrement
```sql
-- ✅ Support du chiffrement E2E dans family_messages
-- ✅ Génération de clés de chiffrement par famille
-- ✅ Colonnes iv et encryption_version pour rotation
```

### 5. Indexes de performance
```sql
-- ✅ Indexes sur family_members pour accès rapide
-- ✅ Indexes composites pour les requêtes courantes
-- ✅ Indexes partiels pour les données actives
```

## 🚨 ACTIONS IMMÉDIATES REQUISES

### Étape 1: Exécuter la migration de sécurité
```bash
# Dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de database/security_hardening.sql
# Exécuter la migration
```

### Étape 2: Vérifier les politiques RLS
```sql
-- Vérifier que toutes les tables ont RLS activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Résultat attendu: 0 lignes
```

### Étape 3: Activer le chiffrement E2E
```javascript
// Dans votre application, avant d'envoyer un message:
import { encryptMessage } from './encryption';

const encrypted = await encryptMessage(messageText, familyEncryptionKey);

await supabase.from('family_messages').insert({
  family_id: familyId,
  sender_id: userId,
  encrypted_content: encrypted.ciphertext,
  iv: encrypted.iv,
  is_encrypted: true
});
```

### Étape 4: Implémenter le consentement RGPD
```javascript
// Au premier login ou inscription
await supabase.from('user_consents').insert({
  user_id: userId,
  purpose: 'data_processing',
  granted: true,
  granted_at: new Date().toISOString(),
  ip_address: userIpAddress
});
```

## 📊 MATRICE DE SÉCURITÉ PAR TABLE

| Table | RLS | Chiffrement | Audit | Soft Delete | RGPD |
|-------|-----|-------------|-------|-------------|------|
| profiles | ✅ | ⚠️ (email) | ✅ | ✅ | ✅ |
| families | ✅ | ✅ | ✅ | ❌ | ✅ |
| family_members | ✅ | ❌ | ✅ | ✅ | ✅ |
| messages | ✅ | ✅ | ✅ | ❌ | ✅ |
| posts | ✅ | ⚠️ | ✅ | ❌ | ✅ |
| events | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| chat_messages | ✅ | ❌ | ✅ | ❌ | ✅ |

**Légende:**
- ✅ Implémenté
- ⚠️ Partiel
- ❌ Non implémenté

## 🔒 RECOMMANDATIONS SUPPLÉMENTAIRES

### 1. Au niveau Application (React/Elixir)

```elixir
# Backend Elixir - Rate limiting par IP
plug Hammer.Plug, [
  rate_limit: {"login", 5_000, 5}, # 5 tentatives par 5 secondes
  by: {:ip, :user_id}
]

# Validation des entrées
defmodule NestiApi.Validators do
  def validate_message(content) do
    content
    |> String.trim()
    |> sanitize_html()
    |> check_length(min: 1, max: 5000)
  end
end
```

### 2. Au niveau Supabase

```javascript
// Activer Email Verification
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: 'https://nesti.app/verify-email',
    data: {
      first_name: firstName,
      last_name: lastName
    }
  }
});

// Activer MFA (Multi-Factor Authentication)
await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
```

### 3. Au niveau Infrastructure

- [ ] **SSL/TLS obligatoire** pour toutes les connexions
- [ ] **Supabase Vault** pour stocker les secrets
- [ ] **IP Whitelisting** si possible
- [ ] **Rotation des clés** tous les 90 jours
- [ ] **Backups chiffrés** quotidiens
- [ ] **Monitoring** des logs d'audit

### 4. Protection des données sensibles

```sql
-- Masquer les emails dans les logs
CREATE OR REPLACE FUNCTION mask_email(email text)
RETURNS text AS $$
BEGIN
  RETURN 
    substring(email from 1 for 2) || 
    '***@' || 
    split_part(email, '@', 2);
END;
$$ LANGUAGE plpgsql;

-- Utiliser dans les vues publiques
CREATE VIEW public.users_public AS
SELECT 
  id,
  mask_email(email) as email,
  first_name,
  avatar_url
FROM public.profiles
WHERE deleted_at IS NULL;
```

## 🎯 CHECKLIST DE SÉCURITÉ

### Base de données
- [x] RLS activé sur toutes les tables
- [x] Politiques RLS granulaires
- [x] Indexes de performance
- [x] Triggers d'audit
- [x] Soft delete
- [x] Tables RGPD

### Application
- [ ] Validation des entrées côté serveur
- [ ] Rate limiting
- [ ] Sanitization XSS
- [ ] Protection CSRF
- [ ] Headers de sécurité (CORS, CSP)
- [ ] Chiffrement E2E des messages

### Conformité
- [ ] Politique de confidentialité
- [ ] CGU/CGV
- [ ] Consentements RGPD
- [ ] Export de données
- [ ] Suppression de données
- [ ] DPO désigné

### Monitoring
- [ ] Logs d'audit activés
- [ ] Alertes sur activités suspectes
- [ ] Dashboard de sécurité
- [ ] Tests de pénétration
- [ ] Scan de vulnérabilités

## 📞 EN CAS DE VIOLATION DE DONNÉES

1. **Isoler** immédiatement le système compromis
2. **Notifier** la CNIL dans les 72h
3. **Informer** les utilisateurs affectés
4. **Documenter** l'incident
5. **Corriger** la vulnérabilité
6. **Réviser** les processus de sécurité

## 🔗 RESSOURCES

- [RGPD - Guide de la CNIL](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Version:** 1.0  
**Dernière mise à jour:** 25 décembre 2025  
**Responsable:** Équipe Sécurité Nesti
