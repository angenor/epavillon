# Research: Vérification email dans le workflow PACO

**Branch**: `004-paco-email-verify` | **Date**: 2026-03-05

## R1: Stockage temporaire des données démographiques

**Decision**: Utiliser `sessionStorage` pour stocker les données démographiques entre la soumission du formulaire et la finalisation de l'inscription après vérification email.

**Rationale**:
- Les données sont temporaires et n'ont pas besoin de persister au-delà de la session du navigateur
- `sessionStorage` est disponible nativement, pas de dépendance supplémentaire
- Les données sont automatiquement nettoyées à la fermeture de l'onglet
- Pas de modification de schéma de base de données requise
- Si l'utilisateur vérifie son email dans un autre navigateur, il reviendra sur `/paco` et sera redirigé vers `activity-register` pour remplir les données démographiques (les données ne seront pas perdues car il devra les re-remplir — acceptation de ce compromis)

**Alternatives considered**:
- `localStorage` : persiste trop longtemps, risque de données obsolètes
- Table temporaire en base : complexité inutile, modification de schéma
- Cookie : taille limitée, pas adapté pour des données structurées

## R2: Mécanisme de redirection après vérification email

**Decision**: Modifier le `emailRedirectTo` dans `PacoRegisterForm.vue` de `/login` à `/paco`. La page `/paco` (PacoWebinar.vue) détecte automatiquement l'état de l'utilisateur et finalise l'inscription.

**Rationale**:
- La page `/paco` a déjà une logique `checkInitialState()` qui s'exécute au montage
- Supabase gère l'extraction du token de confirmation depuis le fragment URL (`#access_token=...`)
- Le composable `useAuth` (via le store Pinia) écoute déjà `onAuthStateChange` et met à jour l'état automatiquement
- Pas besoin de créer une route de callback PACO dédiée

**Alternatives considered**:
- Route `/paco/verify-callback` dédiée : complexité inutile, la page `/paco` gère déjà tous les états
- Garder `/login` et rediriger manuellement : perte du contexte PACO, UX dégradée

## R3: Détection de l'état de vérification email

**Decision**: Utiliser `user.email_confirmed_at` du profil Supabase Auth pour déterminer si l'email est vérifié. Si null → email non vérifié. Si présent → email vérifié.

**Rationale**:
- Supabase Auth expose `email_confirmed_at` dans l'objet user de la session
- Pas besoin de champ supplémentaire en base de données
- Fiable car géré par Supabase Auth directement

**Alternatives considered**:
- Champ custom dans `public.users` : redondant, risque de désynchronisation avec Supabase Auth

## R4: Flow de finalisation automatique post-vérification

**Decision**: Enrichir `checkInitialState()` dans `PacoWebinar.vue` pour gérer un nouvel état : utilisateur authentifié, email vérifié, mais non inscrit au webinaire ET données démographiques en sessionStorage.

**Flow**:
1. `checkInitialState()` vérifie si l'utilisateur est authentifié
2. Si oui, vérifie `email_confirmed_at` :
   - Si null → afficher l'écran `verify-email` (nouvel état)
   - Si présent → vérifier si inscrit au webinaire
     - Si inscrit → `join`
     - Si non inscrit et données en sessionStorage → finaliser automatiquement (registerForPaco + insertDemographicData + sendPacoEmail) → `join`
     - Si non inscrit et pas de données en sessionStorage → `activity-register` (formulaire démographique)

**Rationale**:
- Centralise toute la logique d'état dans `PacoWebinar.vue` (machine d'états existante)
- Gère tous les scénarios edge case (retour dans un autre navigateur, retour après temps)
- Aucune route supplémentaire nécessaire

## R5: Renvoi d'email de vérification

**Decision**: Utiliser `supabase.auth.resend({ type: 'signup', email })` pour renvoyer l'email de vérification depuis le composant `PacoEmailVerification.vue`.

**Rationale**:
- API Supabase Auth native, pas de code serveur supplémentaire
- Gestion du rate limiting par Supabase
- Le `emailRedirectTo` peut être passé à nouveau pour s'assurer que la redirection pointe vers `/paco`

**Alternatives considered**:
- Edge function custom pour renvoyer l'email : inutile, Supabase fournit déjà cette fonctionnalité

## R6: Gestion du cas "autre navigateur"

**Decision**: Si l'utilisateur vérifie son email dans un autre navigateur, il n'aura pas de données en sessionStorage. Quand il reviendra sur `/paco` dans n'importe quel navigateur :
- S'il est connecté avec email vérifié mais pas inscrit au webinaire : rediriger vers `activity-register` pour re-remplir les données démographiques
- S'il n'est pas connecté : retour au flow normal (email-check → login → activity-register)

**Rationale**:
- Compromis pragmatique : re-remplir le formulaire est acceptable car c'est un cas edge
- Pas de complexité serveur supplémentaire
- Le formulaire `PacoActivityRegister` pré-remplit déjà pays et organisation depuis le profil
