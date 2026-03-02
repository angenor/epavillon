# Quickstart: Webinaire PACO

**Branch**: `001-paco-webinar` | **Date**: 2026-03-02

## Prérequis

- Node.js, npm
- Supabase CLI (pour déployer l'edge function)
- Accès à la base de données Supabase (pour exécuter les scripts SQL)
- Accès au dashboard Supabase (pour la configuration)

## Setup en 4 étapes

### 1. Exécuter le script SQL de préparation

Exécuter dans le SQL Editor de Supabase :
- `bank/shema_et_requettes/paco_setup.sql` — crée l'event fictif, l'activité fictive, et la fonction RPC `check_paco_email`

### 2. Déployer l'edge function

```bash
supabase functions deploy send-paco-email
```

### 3. Configurer le lien Teams

Mettre à jour la constante `PACO_TEAMS_LINK` dans `src/composables/paco/constants.js` avec le lien Teams réel fourni par l'organisateur.

### 4. Démarrer le dev

```bash
npm run dev
```

Accéder à `http://localhost:5173/paco`

## Structure des fichiers PACO

```
src/
├── views/paco/
│   └── PacoWebinar.vue          # Page principale
├── components/paco/
│   ├── PacoPresentation.vue     # Section présentation du webinaire
│   ├── PacoEmailCheck.vue       # Formulaire de saisie email
│   ├── PacoLoginForm.vue        # Formulaire de connexion intégré
│   ├── PacoRegisterForm.vue     # Formulaire d'inscription intégré
│   ├── PacoActivityRegister.vue # Formulaire inscription activité (utilisateur connecté)
│   └── PacoJoinSection.vue      # Bouton/lien de connexion Teams
├── composables/paco/
│   ├── constants.js             # UUIDs et configuration PACO
│   ├── usePacoRegistration.js   # Logique d'inscription et vérification
│   └── usePacoEmail.js          # Envoi d'email PACO
└── locales/
    ├── fr/paco.json             # Traductions françaises
    └── en/paco.json             # Traductions anglaises

bank/shema_et_requettes/
└── paco_setup.sql               # Script SQL (event + activity + RPC)

supabase/functions/
└── send-paco-email/
    └── index.ts                 # Edge function d'envoi d'email
```

## Suppression après l'événement

1. Supprimer `src/views/paco/`
2. Supprimer `src/components/paco/`
3. Supprimer `src/composables/paco/`
4. Supprimer `src/locales/fr/paco.json` et `src/locales/en/paco.json`
5. Retirer l'import `paco` de `src/locales/fr/index.js` et `src/locales/en/index.js`
6. Retirer la route `/paco` de `src/router/index.js`
7. Supprimer `supabase/functions/send-paco-email/`
8. Optionnel : supprimer les entrées fictives en base (l'event et l'activity) et la fonction RPC

Les données dans `activity_registrations` restent en base pour les statistiques (identifiables par `activity_id = '00000000-0000-4000-a000-00000000a002'`).

## Test rapide

1. Ouvrir `http://localhost:5173/paco` en navigation privée
2. Entrer un email inexistant → le formulaire d'inscription doit s'afficher
3. S'inscrire → vérifier l'entrée dans `activity_registrations` via Supabase dashboard
4. Vérifier la réception de l'email avec le lien Teams
