# 🚀 NESTI - Checklist Lancement (Objectif: Lundi prochain)

## 📊 État Actuel (26 Décembre 2025)

### ✅ Ce qui fonctionne
- [x] **Backend Elixir/Phoenix** déployé sur Render (https://nesti-mvp.onrender.com)
- [x] **Frontend React** déployé sur Vercel (https://nest-i.vercel.app)
- [x] **Base de données Supabase** configurée et fonctionnelle
- [x] **Authentification** (inscription, connexion email)
- [x] **RLS Policies** activées sur toutes les tables critiques
- [x] **5 utilisateurs** enregistrés et confirmés
- [x] **5 membres** assignés à une famille
- [x] **26 activités** disponibles
- [x] **Logger sécurisé** (pas de logs en production)
- [x] **Source maps désactivées**
- [x] **Build React** sans erreurs

### ⚠️ À corriger
- [ ] **Domaine nesti-app.fr** - DNS à configurer chez Hostinger
- [ ] **Création de posts** - Composant CreatePost simule seulement
- [ ] **Commentaires** - Besoin de vrais posts pour fonctionner
- [ ] **Onboarding** - Création famille automatique à vérifier
- [ ] **Warnings ESLint** - Whitespace dans Auth.js
- [ ] **Variables d'environnement Vercel** - Vérifier SUPABASE_URL/KEY

---

## 📋 Plan d'Action (7 jours)

### Jour 1-2: Configuration Domaine & Infra
- [ ] Configurer DNS chez Hostinger (A record + CNAME)
- [ ] Ajouter nesti-app.fr dans Vercel
- [ ] Mettre à jour URLs autorisées dans Supabase
- [ ] Configurer SSL/HTTPS automatique

### Jour 3-4: Corrections Critiques
- [ ] Implémenter vraie création de posts dans CreatePost.js
- [ ] Vérifier et corriger l'onboarding (création famille)
- [ ] Tester parcours complet: inscription → création famille → post → commentaire
- [ ] Corriger warnings ESLint dans Auth.js

### Jour 5: Tests & Sécurité
- [ ] Test complet sur mobile (responsive)
- [ ] Test sur différents navigateurs (Chrome, Safari, Firefox)
- [ ] Vérifier rate limiting (hammer_plug)
- [ ] Audit sécurité final

### Jour 6: Optimisation
- [ ] Optimiser images (compression, lazy loading)
- [ ] Vérifier temps de chargement (< 3s)
- [ ] Cache des requêtes fréquentes

### Jour 7: Documentation & Lancement
- [ ] Guide utilisateur rapide
- [ ] Préparer annonce de lancement
- [ ] Backup base de données
- [ ] GO LIVE! 🎉

---

## 🔧 Commandes Utiles

### Déployer les changements
```bash
git add -A && git commit -m "description" && git push origin elixir-flutter-v2
```

### Vérifier la base de données
```bash
cd backend && mix run -e 'NestiApi.Repo.query!("SELECT COUNT(*) FROM users")'
```

### Build local
```bash
npm run build
```

### Tester en local
```bash
npm start
```

---

## 🌐 URLs Importantes

| Service | URL |
|---------|-----|
| Frontend (actuel) | https://nest-i.vercel.app |
| Frontend (futur) | https://nesti-app.fr |
| Backend | https://nesti-mvp.onrender.com |
| Supabase Dashboard | https://supabase.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Repo | https://github.com/BNWHITE/nesti-mvp |

---

## 📞 Contacts Support

- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com
- **Hostinger**: support chat

---

*Dernière mise à jour: 26 Décembre 2025*
