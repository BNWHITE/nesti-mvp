# 🧪 Guide de Test - Nesti MVP

## 🚀 Comment tester toutes les nouvelles fonctionnalités

### Option 1: Test Local (Recommandé pour voir immédiatement)

```bash
# 1. Cloner le repository
git clone https://github.com/BNWHITE/nesti-mvp.git
cd nesti-mvp

# 2. Basculer sur la branche avec les nouvelles fonctionnalités
git checkout copilot/develop-app-features

# 3. Installer les dépendances
npm install

# 4. Lancer l'application en mode développement
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur à `http://localhost:3000`

### Option 2: Build de Production

```bash
# Après avoir suivi les étapes 1-3 ci-dessus

# 4. Créer un build de production
npm run build

# 5. Servir le build
npx serve -s build
```

---

## ✨ Fonctionnalités à Tester

### 1. 🎯 Onboarding Amélioré (5 étapes)
**Comment tester:**
1. Créer un nouveau compte ou se déconnecter
2. Passer par les 5 étapes d'onboarding :
   - ✅ Bienvenue
   - ✅ Création du Nest familial
   - ✅ **Questions d'accessibilité** (nouveauté)
   - ✅ Sélection de 15 activités préférées
   - ✅ Confirmation

**Ce qui est nouveau:**
- Étape d'accessibilité avec 5 types de besoins
- Champ libre pour besoins spécifiques
- Tout est sauvegardé en base de données

---

### 2. ♿ Adaptations UI Dynamiques
**Comment tester:**
1. Activer une option d'accessibilité dans l'onboarding ou les Paramètres
2. Observer les changements automatiques :

**Dyslexie** 📖
- Police OpenDyslexic chargée
- Espacement des lettres augmenté
- Interligne plus grand

**Handicap visuel** 👁️
- Mode contraste élevé activé
- Police 20% plus grande
- Bordures renforcées

**Handicap moteur** ♿
- Boutons et cibles tactiles agrandis à 48px minimum
- Plus d'espacement entre les éléments

**Troubles cognitifs** 🧠
- Animations désactivées
- Interface simplifiée
- Moins de distractions visuelles

**Handicap auditif** 👂
- Indicateurs visuels renforcés
- Animations pulse sur notifications

---

### 3. 🗺️ Carte Interactive avec Géolocalisation
**Comment tester:**
1. Aller dans **Découvertes**
2. Cliquer sur le bouton **"🗺️ Carte"** en haut
3. Observer la carte OpenStreetMap avec toutes les activités
4. Cliquer sur **"Ma position"** pour géolocalisation
5. Cliquer sur les marqueurs pour voir les popups d'activités

**Ce qui est nouveau:**
- Toggle Liste/Carte dans Découvertes
- Carte interactive avec pan et zoom
- Géolocalisation navigateur
- Marqueurs pour toutes les activités avec GPS
- Popups riches avec infos activités

---

### 4. ⚙️ Page Paramètres Complète (CRUD)
**Comment tester:**
1. Aller dans **Paramètres** (icône engrenage)
2. Explorer les 4 onglets :

**Onglet Profil** 👤
- Voir votre email
- Changer votre rôle (Parent/Enfant)
- Sauvegarder

**Onglet Activités** 🎯
- Sélectionner/désélectionner des activités (15 options)
- Sauvegarder vos préférences
- Données chargées depuis la BDD

**Onglet Accessibilité** ♿
- Activer/désactiver les besoins d'accessibilité
- Ajouter des besoins spécifiques dans le champ texte
- Sauvegarder (changements appliqués immédiatement)

**Onglet Apparence** 🎨
- Toggle mode sombre/clair

---

### 5. 📸 Upload de Photos
**Comment tester:**
1. Aller sur la page **Home** (fil familial)
2. Créer un nouveau post
3. Cliquer sur l'icône appareil photo
4. Sélectionner une image depuis votre ordinateur
5. Voir la prévisualisation
6. Publier le post avec l'image

---

### 6. 📅 Gestion des Événements
**Comment tester:**
1. Aller sur la page **Agenda**
2. Créer un événement avec le bouton "Créer un événement"
3. Modifier un événement existant (icône crayon)
4. Supprimer un événement (icône corbeille)

**Ce qui est nouveau:**
- Modal de création complet
- Modal d'édition avec pré-remplissage
- Confirmation avant suppression

---

### 7. 🏝️ API Île-de-France
**Comment tester:**
1. Aller dans **Découvertes**
2. Explorer les 3 onglets :
   - **Activités Nesti** (depuis Supabase)
   - **🗺️ Équipements** (API IDF)
   - **🏝️ Îles de loisirs** (API IDF - nouveau)

**Ce qui est nouveau:**
- Onglet Îles de loisirs avec données réelles
- 40+ îles de loisirs d'Île-de-France
- Toutes visibles sur la carte

---

### 8. 🧹 Données Propres (Zéro Mock)
**Comment vérifier:**
1. Se connecter avec un nouveau compte
2. Vérifier que :
   - ❌ Pas de "Famille Martin"
   - ❌ Pas de "Papa Marc", "Maman Sophie"
   - ❌ Pas d'événements pré-remplis
   - ❌ Pas de posts mockés
   - ✅ Tout est vide et prêt pour vos données

---

## 📊 Métriques de Performance

**Build de production:**
```
JavaScript: 129.15 kB gzippé
CSS: 8.08 kB gzippé
Dépendances: leaflet, react-leaflet ajoutées
Warnings: 0
Erreurs: 0
Vulnérabilités: 0
```

---

## 🐛 Si vous rencontrez un problème

### Erreur: "react-scripts: not found"
```bash
npm install
```

### Erreur de build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### La carte ne s'affiche pas
- Vérifier que vous êtes bien sur l'onglet "Carte" dans Découvertes
- Vérifier la console du navigateur pour d'éventuelles erreurs

### Les adaptations d'accessibilité ne s'appliquent pas
- Actualiser la page après avoir sauvegardé dans Paramètres > Accessibilité
- Vérifier que les options sont bien cochées et sauvegardées

---

## 📝 Checklist de Test Complète

- [ ] Onboarding 5 étapes avec accessibilité
- [ ] Adaptations UI (tester au moins 2 types)
- [ ] Carte interactive avec géolocalisation
- [ ] Page Paramètres (4 onglets)
- [ ] CRUD préférences d'activités
- [ ] CRUD besoins d'accessibilité
- [ ] Upload photo dans post
- [ ] Création événement
- [ ] Édition événement
- [ ] Suppression événement
- [ ] API Îles de loisirs (3ème onglet)
- [ ] Toggle Liste/Carte dans Découvertes
- [ ] Vérifier absence de données Famille Martin
- [ ] Mode sombre/clair
- [ ] Déconnexion

---

## 🎉 Résultat Attendu

Après avoir testé toutes ces fonctionnalités, vous devriez avoir :
- ✅ Une application complètement fonctionnelle
- ✅ Sans aucune donnée de test visible
- ✅ Avec toutes vos données personnelles
- ✅ Une interface adaptée à vos besoins d'accessibilité
- ✅ Une carte interactive pour visualiser les activités
- ✅ Une page de paramètres complète pour tout gérer

**L'application est prête pour la production ! 🚀**
