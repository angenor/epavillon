# Quickstart: Sécurisation du lien Teams PACO

**Feature**: 002-secure-teams-link
**Date**: 2026-03-02

## Overview

Ajouter une page gateway `/paco/join` qui vérifie l'authentification et l'inscription avant de rediriger vers Teams. Mettre à jour l'email et la page PACO pour utiliser ce lien plateforme.

## Setup (0 steps)

Aucune installation requise. Toutes les dépendances sont déjà présentes.

## Files to Create (1 file)

### 1. `src/views/paco/PacoJoinGateway.vue`

Page gateway avec machine à états :
- **loading** : Vérifie auth + inscription via `useAuth()` et `usePacoRegistration()`
- **login** : Affiche `PacoLoginForm` (composant existant) avec message contextuel
- **not-registered** : Message d'erreur + bouton vers `/paco`
- **redirecting** : `window.location.href = PACO_TEAMS_LINK`

Imports clés :
- `useAuth` depuis `@/composables/useAuth`
- `usePacoRegistration` depuis `@/composables/paco/usePacoRegistration`
- `PacoLoginForm` depuis `@/components/paco/PacoLoginForm.vue`
- `PACO_TEAMS_LINK` depuis `@/composables/paco/constants`

## Files to Modify (5 files)

### 2. `src/router/index.js`

Ajouter la route `/paco/join` :
```javascript
{
  path: '/paco/join',
  name: 'paco-join-gateway',
  component: () => import('../views/paco/PacoJoinGateway.vue'),
}
```
Placer **avant** la route `/paco` pour éviter les conflits de matching.

### 3. `src/components/paco/PacoJoinSection.vue`

Remplacer `PACO_TEAMS_LINK` par le lien plateforme pour :
- Le `href` du bouton "Rejoindre"
- La valeur copiée par `navigator.clipboard.writeText()`

### 4. `supabase/functions/send-paco-email/index.ts`

Remplacer le lien Teams dans le corps de l'email par le lien plateforme :
- Ajouter constante `PACO_PLATFORM_JOIN_URL`
- Modifier `buildPacoEmailText()` pour utiliser l'URL plateforme
- Mettre à jour le texte explicatif

### 5. `src/locales/fr/paco.json`

Ajouter la section `gateway` :
```json
"gateway": {
  "loading": "Vérification en cours...",
  "loginTitle": "Connexion requise",
  "loginSubtitle": "Veuillez vous connecter pour accéder au webinaire PACO.",
  "notRegisteredTitle": "Inscription requise",
  "notRegisteredMessage": "Vous devez être inscrit(e) au webinaire PACO pour accéder à la réunion.",
  "registerButton": "S'inscrire au webinaire",
  "redirecting": "Redirection vers la réunion Teams...",
  "error": "Une erreur est survenue. Veuillez réessayer."
}
```

### 6. `src/locales/en/paco.json`

Ajouter la section `gateway` (équivalent anglais).

## Verification

1. Accéder à `/paco/join` sans être connecté → formulaire de connexion affiché
2. Se connecter avec un compte inscrit → redirection vers Teams
3. Se connecter avec un compte non inscrit → message d'erreur + lien vers `/paco`
4. S'inscrire au webinaire, vérifier que l'email contient le lien plateforme (pas Teams)
5. Sur `/paco`, vérifier que "Rejoindre" et "Copier le lien" utilisent le lien plateforme

## Cleanup (post-event)

La page `PacoJoinGateway.vue` sera supprimée en même temps que le reste du module PACO. Ajouter au fichier de cleanup existant :
- `src/views/paco/PacoJoinGateway.vue`
- Route `/paco/join` dans `src/router/index.js`
- Clés `gateway` dans les fichiers i18n
