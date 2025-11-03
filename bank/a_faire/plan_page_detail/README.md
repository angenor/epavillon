# Page de détail d'activité - Documentation

## Introduction

Cette documentation couvre l'implémentation complète de la page de détail d'activité, incluant la fonctionnalité d'inscription sans authentification via Zoom.

## Fichiers du plan

Ce dossier contient tous les documents nécessaires pour implémenter la fonctionnalité:

### 1. **PLAN_IMPLEMENTATION.md**
Plan détaillé d'implémentation avec:
- Étapes d'implémentation ordonnées
- Structure des fichiers à créer
- Spécifications techniques complètes
- Estimation de temps de développement

### 2. **ARCHITECTURE.md**
Documentation d'architecture incluant:
- Diagrammes de flux de données
- Architecture des composants
- Stratégies de cache et performance
- Matrice de permissions
- Diagrammes de séquence

### 3. **EDGE_FUNCTION_EXAMPLE.ts**
Exemple complet de l'edge function `register-to-zoom-meeting`:
- Code TypeScript commenté
- Validation des données
- Intégration API Zoom
- Gestion des erreurs

### 4. **activity_registrations_guest_support.sql**
Script SQL de migration complet:
- Modifications de la table `activity_registrations`
- Contraintes et index
- Politiques RLS
- Fonctions utilitaires
- Vue pour faciliter les requêtes

## Résumé des fonctionnalités

### Pour les utilisateurs non authentifiés (Guests)
- Visualisation complète des détails d'activité
- Inscription à une réunion Zoom sans créer de compte
- Formulaire simplifié (email, prénom, nom, organisation optionnelle)
- Réception d'un lien Zoom personnalisé
- Téléchargement des documents

### Pour les utilisateurs authentifiés
- Toutes les fonctionnalités des guests
- Formulaire d'inscription pré-rempli
- Possibilité de poser des questions temps réel
- Historique des inscriptions

### Fonctionnalités communes
- Affichage des dates/heures dans 2 fuseaux horaires:
  - Fuseau horaire de l'événement
  - Fuseau horaire local de l'utilisateur
- Liste des intervenants (speakers)
- Documents téléchargeables
- Questions aux panélistes (lecture pour tous)
- Navigation vers d'autres activités
- Support Dark/Light mode
- Internationalisation FR/EN

## Architecture technique

### Stack technologique
- **Frontend**: Vue 3, TailwindCSS 4, Vue Router, Pinia
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **API externe**: Zoom API (inscription aux réunions)
- **i18n**: Vue i18n (Français/Anglais)

### Composants principaux

```
src/views/activities/Detail.vue (Page principale)
├── src/components/activities/ActivityHero.vue
├── src/components/activities/ActivityInfo.vue
├── src/components/activities/ActivityTimezoneDisplay.vue
├── src/components/activities/ActivitySpeakers.vue
├── src/components/activities/ActivityDocuments.vue
├── src/components/activities/ActivityRegistrationCard.vue
├── src/components/activities/ActivityQuestionsPanel.vue
└── src/components/activities/ActivitySidebar.vue
```

### Composables

```
src/composables/
├── useActivityDetail.js          (Logique métier principale)
├── useActivityRegistration.js    (Gestion des inscriptions)
├── useActivityQuestions.js       (Gestion des questions)
└── useTimezone.js                (Gestion des fuseaux horaires)
```

### Edge Functions

```
supabase/functions/
└── register-to-zoom-meeting/
    └── index.ts
```

## Base de données

### Tables modifiées/utilisées

1. **activity_registrations** (MODIFIÉE)
   - Support des inscriptions guest
   - Nouveaux champs: guest_email, guest_first_name, guest_last_name, etc.
   - Contraintes UNIQUE conditionnelles
   - Politiques RLS adaptées

2. **activities** (LECTURE)
   - Informations de l'activité

3. **activity_speakers** (LECTURE)
   - Liste des intervenants

4. **activity_documents** (LECTURE)
   - Documents associés

5. **activity_questions** (LECTURE/ÉCRITURE)
   - Questions aux panélistes

6. **zoom_meetings** (LECTURE)
   - Informations de la réunion Zoom

## Installation et déploiement

### Prérequis
- Node.js >= 18
- npm >= 9
- Supabase CLI
- Accès API Zoom (Account ID, Client ID, Client Secret)

### Étapes d'installation

#### 1. Appliquer la migration SQL

```bash
# Se connecter à la base de données Supabase
supabase db reset

# Ou appliquer manuellement le script
psql -h <supabase-host> -U postgres -d postgres -f bank/a_faire/plan_page_detail/activity_registrations_guest_support.sql
```

#### 2. Déployer l'edge function

```bash
# Depuis la racine du projet
supabase functions deploy register-to-zoom-meeting

# Définir les variables d'environnement
supabase secrets set ZOOM_ACCOUNT_ID=your_account_id
supabase secrets set ZOOM_CLIENT_ID=your_client_id
supabase secrets set ZOOM_CLIENT_SECRET=your_client_secret
```

#### 3. Installer les dépendances frontend (si nécessaire)

```bash
npm install date-fns date-fns-tz
```

#### 4. Ajouter les traductions

Mettre à jour les fichiers:
- `src/locales/fr/index.js`
- `src/locales/en/index.js`

(Voir PLAN_IMPLEMENTATION.md section 7 pour le contenu)

#### 5. Créer les composants Vue

Suivre l'ordre d'implémentation recommandé dans PLAN_IMPLEMENTATION.md section 15.

## Tests

### Tests unitaires

```bash
npm run test:unit
```

### Tests end-to-end

```bash
npm run test:e2e
```

### Tests manuels

1. **Inscription guest**:
   - Naviguer vers `/activities/:id`
   - Cliquer sur "S'inscrire"
   - Remplir le formulaire sans être connecté
   - Vérifier la réception du lien Zoom

2. **Inscription utilisateur authentifié**:
   - Se connecter
   - Naviguer vers `/activities/:id`
   - Cliquer sur "S'inscrire"
   - Vérifier que le formulaire est pré-rempli
   - Modifier si nécessaire et soumettre

3. **Questions**:
   - Se connecter
   - Naviguer vers `/activities/:id`
   - Poser une question dans la section dédiée
   - Vérifier que la question apparaît

4. **Fuseaux horaires**:
   - Vérifier l'affichage des 2 fuseaux horaires
   - Comparer avec un convertisseur de fuseau horaire en ligne

## Sécurité

### Validation des données

Toutes les entrées utilisateur sont validées:
- **Côté client**: Validation de formulaire Vue
- **Côté serveur**: Validation dans l'edge function

### Politiques RLS

Les politiques Row Level Security garantissent:
- Tout le monde peut s'inscrire (INSERT)
- Les utilisateurs voient uniquement leurs inscriptions (SELECT)
- Seuls les admins peuvent modifier/supprimer (UPDATE/DELETE)

### Protection contre les injections

- Utilisation de requêtes paramétrées Supabase
- Sanitisation des entrées dans l'edge function
- Validation des emails avec regex

## Performance

### Objectifs
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s

### Optimisations
- Lazy loading des composants non critiques
- Skeleton loaders pour améliorer la perception
- Préchargement des données critiques
- Images optimisées (eager pour hero, lazy pour le reste)
- Code splitting pour réduire le bundle initial

## Support et maintenance

### Logs et monitoring

Les edge functions loguent:
- Requêtes reçues
- Validations échouées
- Erreurs API Zoom
- Inscriptions réussies

### Troubleshooting commun

1. **Erreur "No Zoom meeting associated"**:
   - Vérifier que l'activité a un `zoom_meeting_id` non null
   - Vérifier que la réunion existe dans la table `zoom_meetings`

2. **Erreur "Already registered"**:
   - Normal si l'utilisateur essaie de s'inscrire 2 fois
   - Afficher le lien Zoom existant

3. **Erreur API Zoom**:
   - Vérifier les credentials Zoom (ZOOM_ACCOUNT_ID, etc.)
   - Vérifier que le meeting_id est valide
   - Consulter les logs de l'edge function

4. **Questions ne s'affichent pas**:
   - Vérifier les politiques RLS sur `activity_questions`
   - Vérifier que `is_visible = true` et `is_disabled = false`

## Améliorations futures

Voir PLAN_IMPLEMENTATION.md section 17 pour la liste complète des améliorations prévues (v2).

## Contact et support

Pour toute question ou problème:
- Consulter d'abord cette documentation
- Vérifier les logs dans Supabase Dashboard
- Créer une issue dans le repository du projet

---

**Dernière mise à jour**: 2025-11-03
**Version**: 1.0
**Auteur**: IFDD Team
