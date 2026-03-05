# Quickstart: Vérification email dans le workflow PACO

**Branch**: `004-paco-email-verify` | **Date**: 2026-03-05

## Prerequisites

1. Base de données Supabase avec les tables existantes (`activity_registrations`, `paco_demographic_data`, `users`)
2. Script PACO initial déjà exécuté (`bank/shema_et_requettes/paco_setup.sql`)
3. Script démographique déjà exécuté (`bank/shema_et_requettes/paco_demographic_data.sql`)
4. Branche `004-paco-email-verify` checkoutée
5. Vérification que l'option "Confirm email" est activée dans Supabase Dashboard > Authentication > Settings

## Setup Steps

### 1. Vérifier la configuration Supabase Auth

Dans le dashboard Supabase > Authentication > URL Configuration :
- **Site URL** : `https://epavillonclimatique.francophonie.org` (ou `http://localhost:5173` en dev)
- **Redirect URLs** : Ajouter `http://localhost:5173/paco` et `https://epavillonclimatique.francophonie.org/paco` à la liste des URLs autorisées

### 2. Lancer le développement

```bash
npm run dev
```

### 3. Tester le flow principal (User Story 1)

1. Accéder à `/paco`
2. Entrer un **nouvel email** (non existant sur la plateforme)
3. Remplir le formulaire d'inscription :
   - Prénom, Nom, Mot de passe
   - Genre, Profil d'âge, Ville, Pays, Statut professionnel, Organisation
   - Cocher le consentement d'enregistrement
4. Soumettre → vérifier que l'écran de vérification d'email s'affiche
5. Vérifier que l'écran contient :
   - Un message expliquant qu'un email de vérification a été envoyé
   - L'adresse email affichée
   - Un bouton pour renvoyer l'email de vérification
   - Une icône/animation d'attente
6. Ouvrir la boîte email → cliquer sur le lien de vérification
7. Vérifier la redirection vers `/paco`
8. Vérifier que l'inscription au webinaire est finalisée automatiquement
9. Vérifier l'affichage de l'écran de confirmation (step `join` avec bouton Teams)
10. Vérifier la réception de l'email contenant le lien Teams

### 4. Tester le renvoi d'email (Edge case)

1. Suivre les étapes 1-4 du test principal
2. Sur l'écran de vérification, cliquer "Renvoyer l'email"
3. Vérifier le feedback visuel (message de confirmation)
4. Vérifier la réception d'un nouvel email de vérification

### 5. Tester le retour (User Story 2)

1. Suivre les étapes 1-4 du test principal (soumettre sans vérifier l'email)
2. Fermer l'onglet ou naviguer ailleurs
3. Revenir sur `/paco`
4. Vérifier que l'écran de vérification d'email s'affiche à nouveau
5. Vérifier l'email → revenir sur `/paco`
6. Vérifier la finalisation automatique

### 6. Tester le cas "autre navigateur"

1. Suivre les étapes 1-4 du test principal dans le navigateur A
2. Ouvrir le lien de vérification dans le navigateur B
3. Dans le navigateur A, rafraîchir `/paco`
4. Vérifier que le système détecte l'email vérifié et finalise l'inscription (ou redirige vers activity-register si sessionStorage perdu)

### 7. Tester les traductions

1. Basculer en anglais via le sélecteur de langue
2. Vérifier que tous les textes de l'écran de vérification sont en anglais
3. Revenir en français et vérifier

## Key Files

### Modifiés
- `src/components/paco/PacoRegisterForm.vue` — emailRedirectTo changé vers `/paco`, stockage sessionStorage après signUp
- `src/composables/paco/usePacoRegistration.js` — ajout fonctions de finalisation et gestion sessionStorage
- `src/views/paco/PacoWebinar.vue` — nouvel état `verify-email`, logique de finalisation automatique dans checkInitialState
- `src/locales/fr/paco.json` — nouvelles clés de traduction
- `src/locales/en/paco.json` — nouvelles clés de traduction

### Nouveaux
- `src/components/paco/PacoEmailVerification.vue` — composant écran de vérification d'email

## Cleanup (post-event)

Ce composant fait partie du système PACO. Pour le supprimer, suivre les instructions de cleanup dans `specs/003-paco-registration-stats/quickstart.md` qui couvre la suppression de tout le dossier `src/components/paco/`.
