# 👨‍👩‍👧‍👦 Nesti MVP - L'Assistant Familial 🧠

**Nesti** est une application web moderne conçue pour simplifier l'organisation familiale, la communication au sein du "Nest" et la découverte d'activités adaptées. Ce projet est développé comme un Minimum Viable Product (MVP) axé sur une expérience utilisateur fluide et l'intégration d'une intelligence artificielle experte.

## 🚀 Fonctionnalités Clés du MVP

Le MVP inclut les fonctionnalités essentielles pour un lancement réussi, toutes conçues avec un design moderne basé sur les cartes (Card-based UI), conformément aux standards actuels.

| Module | Description |
| :--- | :--- |
| **Accueil (Fil Familial)** | Fil d'actualité central pour les publications et les événements importants. Inclut des cartes d'action rapide et des suggestions d'activités mises en avant. |
| **Mon Nest** | Gestion des membres de la famille (Parents/Enfants) et de leurs rôles. Fonctionnalités d'invitation/ajout de nouveaux membres via un code unique. |
| **Agenda** | Visualisation d'un calendrier et d'une liste d'événements familiaux à venir, avec un design clair et un affichage scrollable. |
| **Découvertes** | Moteur d'exploration pour trouver des activités et des loisirs (basé initialement sur les données de Rennes/Île-de-France). Inclut une barre de recherche et une simulation de carte interactive. |
| **Nesti IA (Chat)** | Assistant basé sur l'IA (via une API Vercel Serverless) pour répondre aux questions d'organisation, d'éducation et proposer des idées d'activités personnalisées. |
| **UX/UI** | Implémentation complète du **Dark Mode** et d'un système de style moderne et professionnel sur toutes les pages. |

## 💻 Stack Technique

| Catégorie | Technologie | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (CRA)** | Bibliothèque JavaScript principale pour l'interface utilisateur. |
| **Backend/BaaS** | **Supabase** | Base de données PostgreSQL, authentification (OAuth) et fonctions de sécurité (RLS). |
| **API AI** | **Vercel Serverless** | Fonction Serverless déployée pour gérer les requêtes vers OpenAI/Gemini (API `nesti-ai`). |
| **Déploiement** | **Vercel** | Plateforme de déploiement continu. |
| **Design** | **CSS Modules / CSS natif** | Styles modulaires pour un design UI/UX de haute qualité et responsive. |

## 🛠️ Configuration du Projet (Local)

Suivez ces étapes pour démarrer le projet Nesti MVP sur votre machine locale.

### Prérequis

* Node.js et npm (ou yarn)
* Compte Supabase actif
* Clés API OpenAI (ou équivalent pour l'IA)

### 1. Cloner le dépôt

```bash
git clone [URL_DU_VOTRE_DEPOT]
cd nesti-mvp
