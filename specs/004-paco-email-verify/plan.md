# Implementation Plan: Vérification email dans le workflow PACO

**Branch**: `004-paco-email-verify` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-paco-email-verify/spec.md`

## Summary

Le workflow d'inscription PACO pour les nouveaux utilisateurs échoue car Supabase requiert une vérification d'email avant que la session ne soit pleinement active (les RLS policies bloquent les insertions). Cette feature ajoute une étape de vérification d'email dans le workflow PACO : après soumission du formulaire d'inscription, l'utilisateur voit un écran d'attente de vérification. Les données démographiques sont stockées temporairement dans `sessionStorage`. Le `emailRedirectTo` est modifié pour rediriger vers `/paco` après vérification. Au retour sur `/paco` avec un email vérifié, le système finalise automatiquement l'inscription au webinaire et envoie le lien Teams.

## Technical Context

**Language/Version**: JavaScript (Vue 3.5+)
**Primary Dependencies**: Vue 3, Vue Router 4, Pinia, Supabase JS, TailwindCSS v4, Vue i18n, Font Awesome
**Storage**: PostgreSQL via Supabase (tables existantes `activity_registrations`, `paco_demographic_data`, `users`) + sessionStorage côté client pour données temporaires
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (SPA déployée sur Firebase Hosting)
**Project Type**: Web application (Vue SPA + Supabase backend)
**Performance Goals**: Finalisation automatique de l'inscription < 30s après vérification email
**Constraints**: Pas de modification de structure de tables en base. Pas de modification du système d'envoi d'emails de vérification Supabase.
**Scale/Scope**: Modification de 3-4 fichiers existants, création de 1 nouveau composant

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular Architecture | PASS | Nouveau composant dans `src/components/paco/`, logique dans `src/composables/paco/` |
| II. Internationalization First | PASS | Tous les nouveaux textes ajoutés dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` |
| III. Theme Support | PASS | Le nouveau composant utilise le même design dark que les autres composants PACO (fond transparent sur page sombre) |
| IV. Clean Code Discipline | PASS | DRY: réutilisation des composables existants. KISS: une seule responsabilité par composant. YAGNI: pas de sur-ingénierie. |
| V. Database Schema as Source of Truth | PASS | Aucune modification de schéma nécessaire — utilisation des tables existantes |

## Project Structure

### Documentation (this feature)

```text
specs/004-paco-email-verify/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/paco/
│   ├── PacoEmailVerification.vue    # NOUVEAU — écran d'attente de vérification
│   ├── PacoRegisterForm.vue         # MODIFIÉ — emailRedirectTo → /paco, stockage sessionStorage
│   ├── PacoActivityRegister.vue     # EXISTANT (inchangé)
│   ├── PacoEmailCheck.vue           # EXISTANT (inchangé)
│   ├── PacoLoginForm.vue            # EXISTANT (inchangé)
│   ├── PacoJoinSection.vue          # EXISTANT (inchangé)
│   └── PacoPresentation.vue         # EXISTANT (inchangé)
├── composables/paco/
│   ├── usePacoRegistration.js       # MODIFIÉ — ajout fonctions de finalisation post-vérification
│   ├── usePacoEmail.js              # EXISTANT (inchangé)
│   └── constants.js                 # EXISTANT (inchangé)
├── views/paco/
│   └── PacoWebinar.vue              # MODIFIÉ — ajout step 'verify-email', logique de finalisation
├── locales/
│   ├── fr/paco.json                 # MODIFIÉ — clés de traduction ajoutées
│   └── en/paco.json                 # MODIFIÉ — clés de traduction ajoutées
└── router/
    └── index.js                     # EXISTANT (inchangé — /paco existe déjà)
```

**Structure Decision**: SPA Vue 3 existante. Aucune nouvelle route nécessaire. Le `emailRedirectTo` de Supabase redirige vers `/paco` où la page détecte automatiquement l'état de l'utilisateur (email vérifié + non inscrit au webinaire → finalisation automatique).
