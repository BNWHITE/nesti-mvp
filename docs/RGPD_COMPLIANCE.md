# 🇪🇺 RGPD/GDPR Compliance - Nesti v2

## Vue d'ensemble

Nesti v2 est conçu avec le principe "Privacy by Design" et respecte strictement le Règlement Général sur la Protection des Données (RGPD/GDPR) de l'Union Européenne.

## Bases Légales du Traitement

### 1. Consentement (Article 6(1)(a))
- Consentement explicite requis pour chaque fonctionnalité
- Consentement enregistré avec horodatage
- Possibilité de retirer le consentement à tout moment

### 2. Exécution d'un Contrat (Article 6(1)(b))
- Traitement nécessaire pour fournir le service Nesti
- Gestion du compte utilisateur
- Communication entre membres de la famille

### 3. Intérêt Légitime (Article 6(1)(f))
- Sécurité et prévention de la fraude
- Amélioration du service (avec anonymisation)

## Droits des Utilisateurs

### Droit d'Accès (Article 15)
**Implémentation**:
- Endpoint API: `GET /api/privacy/my-data`
- Export complet des données personnelles
- Formats: JSON, CSV
- Délai de réponse: 30 jours maximum

**Données Incluses**:
- Profil utilisateur
- Données familiales
- Publications et commentaires
- Événements calendrier
- Historique des consentements
- Logs d'audit (anonymisés)

### Droit de Rectification (Article 16)
**Implémentation**:
- Endpoint API: `PUT /api/users/me`
- Modification des informations personnelles
- Validation serveur de toutes les modifications

### Droit à l'Effacement (Article 17)
**Implémentation**:
- Endpoint API: `DELETE /api/privacy/delete-account`
- Suppression complète ou anonymisation
- Délai de traitement: 30 jours maximum
- Notification à l'utilisateur

**Processus de Suppression**:
1. Demande de suppression enregistrée
2. Vérification de l'identité
3. Période de réflexion (7 jours)
4. Suppression effective:
   - Suppression des données personnelles
   - Anonymisation des contributions (posts, commentaires)
   - Conservation des logs anonymisés (légalement requis)

### Droit à la Portabilité (Article 20)
**Implémentation**:
- Endpoint API: `POST /api/privacy/export-data`
- Format structuré et couramment utilisé (JSON/CSV)
- Possibilité de transfert direct (sur demande)

### Droit d'Opposition (Article 21)
**Implémentation**:
- Refus du traitement pour marketing (opt-out)
- Refus de l'IA Nesti
- Refus du profilage
- Paramètres dans `/settings/privacy`

### Droit à la Limitation (Article 18)
**Implémentation**:
- Gel temporaire du compte
- Arrêt du traitement (sauf stockage)

## Protection des Mineurs (<16 ans)

### Consentement Parental (Article 8)

**Vérification de l'Âge**:
- Date de naissance obligatoire à l'inscription
- Vérification automatique de l'âge

**Processus pour Mineurs**:
1. Inscription avec date de naissance
2. Si < 16 ans → consentement parental requis
3. Email envoyé au parent/tuteur
4. Validation du parent via lien sécurisé
5. Compte activé seulement après validation

**Restrictions pour Mineurs**:
- Pas d'accès à l'IA Nesti (sans consentement explicite du parent)
- Pas de partage externe
- Profil privé par défaut
- Notifications parentales activées

**Schéma Base de Données**:
```sql
CREATE TABLE users (
  ...
  date_of_birth DATE,
  parental_consent_given BOOLEAN DEFAULT FALSE,
  parental_consent_date TIMESTAMPTZ,
  parental_email TEXT,
  ...
);
```

## Gestion des Consentements

### Types de Consentements

| Consentement | Requis | Retractable | Granularité |
|--------------|--------|-------------|-------------|
| Utilisation du service | Oui | Non* | Globale |
| IA Nesti | Non | Oui | Fonctionnalité |
| Partage familial | Oui | Oui | Fonctionnalité |
| Notifications | Non | Oui | Type |
| Analytics (anonymisé) | Non | Oui | Globale |

*Le consentement de base ne peut être retiré qu'en supprimant le compte

### Traçabilité des Consentements

**Table `user_consents`**:
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  purpose TEXT NOT NULL,
  granted BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);
```

**Informations Enregistrées**:
- Qui a consenti (user_id)
- À quoi (purpose)
- Quand (granted_at)
- Comment (ip_address, user_agent)
- Modifications (historique complet)

## Sécurité des Données

### Chiffrement

**Au Repos** (Article 32):
- AES-256-GCM pour données sensibles
- Champs chiffrés:
  - Email
  - Prénom, Nom
  - Contenu des messages
  - Contenu des posts

**En Transit**:
- TLS 1.3 obligatoire
- HSTS activé
- Pas de communication non chiffrée

**End-to-End**:
- Messages familiaux chiffrés côté client
- Clés jamais stockées sur le serveur

### Minimisation des Données (Article 5(1)(c))
- Collecte uniquement des données nécessaires
- Pas de données excessives
- Suppression automatique des données temporaires

### Pseudonymisation et Anonymisation

**Pour Analytics**:
- Identifiants pseudonymisés
- Pas de données personnelles
- Agrégation uniquement

**Pour Audit Logs**:
- IDs hash256
- Pas de contenu
- Conservation limitée (1 an)

## Rétention des Données

### Durées de Conservation

| Type de Données | Durée | Base Légale |
|-----------------|-------|-------------|
| Profil utilisateur actif | Durée du compte | Contrat |
| Données de connexion | 1 an | Sécurité |
| Logs d'audit | 1 an | Obligation légale |
| Données compte supprimé | 30 jours | Droit à l'oubli |
| Consentements | 3 ans après retrait | Preuve légale |

### Suppression Automatique

**Implémentation**:
```elixir
defmodule NestiApi.Privacy.DataRetention do
  # Tâche quotidienne
  def cleanup_expired_data do
    # Supprimer les comptes en attente de suppression > 30 jours
    # Supprimer les logs > 1 an
    # Supprimer les données temporaires
  end
end
```

## Violations de Données (Article 33-34)

### Processus de Notification

**Délais**:
- Notification à la CNIL: 72 heures
- Notification aux utilisateurs: Sans délai indu

**Conditions de Notification aux Utilisateurs**:
- Risque élevé pour les droits et libertés
- Données sensibles compromises
- Échec du chiffrement

**Contenu de la Notification**:
- Nature de la violation
- Conséquences probables
- Mesures prises
- Point de contact

**Template Email**:
```
Objet: [URGENT] Incident de sécurité - Action requise

Cher utilisateur Nesti,

Nous vous informons qu'un incident de sécurité a affecté vos données 
personnelles le [DATE].

Nature: [DESCRIPTION]
Données affectées: [LISTE]
Actions prises: [MESURES]

Recommandations: [ACTIONS UTILISATEUR]

Contact: security@nesti.fr
```

## Transferts de Données

### Localisation des Données
- **Serveurs**: UE (France) via Railway
- **Base de données**: UE via Supabase (région EU)
- **Aucun transfert hors UE** sauf:
  - OpenAI (États-Unis) - avec garanties contractuelles

### Garanties pour OpenAI
- Clauses contractuelles types (CCT)
- Pseudonymisation avant envoi
- Minimisation des données
- Pas de données personnelles identifiantes

## Analyse d'Impact (DPIA)

**Quand Réalisée**:
- Avant lancement de nouvelles fonctionnalités
- Utilisation de nouvelles technologies
- Changements majeurs de traitement

**Dernière DPIA**: [DATE]

## Registre des Activités de Traitement

### Traitement 1: Gestion des Comptes
- **Finalité**: Authentification et gestion du compte
- **Base légale**: Contrat
- **Données**: Email, mot de passe (hash), nom, prénom
- **Destinataires**: Personnel autorisé uniquement
- **Durée**: Durée du compte + 30 jours
- **Transferts**: Aucun

### Traitement 2: Communication Familiale
- **Finalité**: Partage d'informations dans la famille
- **Base légale**: Consentement
- **Données**: Posts, commentaires, photos
- **Destinataires**: Membres de la famille uniquement
- **Durée**: Durée du compte
- **Chiffrement**: Oui (E2E)

### Traitement 3: IA Nesti
- **Finalité**: Assistant familial intelligent
- **Base légale**: Consentement
- **Données**: Messages utilisateur (pseudonymisés)
- **Destinataires**: OpenAI (sous-traitant)
- **Durée**: Traitement immédiat, pas de conservation
- **Transferts**: États-Unis (CCT)

## Conformité Organisationnelle

### Délégué à la Protection des Données (DPO)
- **Contact**: dpo@nesti.fr
- **Rôle**: Surveillance de la conformité RGPD
- **Disponibilité**: Lundi-Vendredi 9h-18h

### Formation du Personnel
- Formation RGPD annuelle obligatoire
- Sensibilisation à la sécurité
- Procédures d'incident

### Audits
- **Internes**: Trimestriels
- **Externes**: Annuels
- **Pénétration**: Annuels

## Documentation Utilisateur

### Informations Fournies (Article 13-14)

**À l'inscription**:
- Identité du responsable de traitement
- Finalités et base légale
- Destinataires des données
- Durée de conservation
- Droits de l'utilisateur
- Droit de déposer une plainte (CNIL)

**Politique de Confidentialité**:
- Disponible à `/privacy-policy`
- Langue claire et accessible
- Mise à jour régulière
- Notification des changements majeurs

## Contact RGPD

Pour toute question relative à vos données personnelles:
- **Email**: privacy@nesti.fr / dpo@nesti.fr
- **Délai de réponse**: 30 jours maximum
- **Autorité de contrôle**: CNIL (France)
  - www.cnil.fr
  - Téléphone: 01 53 73 22 22

## Checklist de Conformité

- [x] Privacy by Design implémenté
- [x] Chiffrement des données sensibles
- [x] Consentement explicite enregistré
- [x] Droit d'accès (export de données)
- [x] Droit à l'effacement
- [x] Droit à la portabilité
- [x] Protection des mineurs (<16 ans)
- [x] Registre des traitements documenté
- [ ] DPO désigné (TODO si > 250 employés)
- [ ] DPIA réalisée
- [ ] Clauses contractuelles avec sous-traitants
- [x] Procédure de violation de données
- [x] Politique de confidentialité accessible

## Mises à Jour

**Version**: 2.0  
**Date**: 2024-12-20  
**Prochaine révision**: 2025-06-20
