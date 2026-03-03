# Implementation Plan: Sécurisation du lien Teams PACO

**Branch**: `002-secure-teams-link` | **Date**: 2026-03-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-secure-teams-link/spec.md`

## Summary

Remplacer le lien Teams direct envoyé par email et affiché sur la page `/paco` par un lien vers une page gateway de la plateforme (`/paco/join`). Cette page vérifie l'authentification et l'inscription de l'utilisateur avant de le rediriger vers la réunion Teams. Les utilisateurs non inscrits sont bloqués et redirigés vers la page d'inscription PACO.

## Technical Context

**Language/Version**: JavaScript (Vue 3.5+) + TypeScript (Edge Function Deno)
**Primary Dependencies**: Vue 3, Vue Router 4, Pinia, Supabase JS, TailwindCSS v4, Vue i18n, Font Awesome
**Storage**: PostgreSQL via Supabase (table existante `activity_registrations`)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web SPA (Firebase Hosting)
**Project Type**: Web application (SPA avec pre-rendering SEO)
**Performance Goals**: Redirection vers Teams en < 3 secondes pour les utilisateurs vérifiés
**Constraints**: Module PACO isolé pour suppression post-événement. Réutiliser les composables existants.
**Scale/Scope**: ~500 utilisateurs inscrits, 1 nouvelle page, 2 fichiers modifiés

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Modular Architecture | PASS | Nouvelle vue dans `src/views/paco/`, réutilise composables existants dans `src/composables/paco/` |
| II. Internationalization First | PASS | FR-011 exige traduction FR+EN complète. Nouvelles clés ajoutées aux deux fichiers de traduction |
| III. Theme Support | PASS | FR-010 exige support dark/light. Classes Tailwind `dark:` utilisées |
| IV. Clean Code | PASS | DRY: réutilise `usePacoRegistration` et `useAuth`. KISS: page gateway simple avec machine à états. YAGNI: pas de nouvelle infrastructure |
| V. Database Schema | PASS | Aucune modification de schéma. Utilise la table `activity_registrations` et la fonction RPC `check_paco_email` existantes |

**Gate Result**: PASS — Aucune violation.

## Project Structure

### Documentation (this feature)

```text
specs/002-secure-teams-link/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── send-paco-email-update.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── views/paco/
│   ├── PacoWebinar.vue          # [EXISTING] Page inscription PACO
│   └── PacoJoinGateway.vue      # [NEW] Page gateway de vérification
├── components/paco/
│   └── PacoJoinSection.vue      # [MODIFY] Remplacer lien Teams par lien plateforme
├── composables/paco/
│   ├── constants.js             # [EXISTING] Constantes PACO (PACO_TEAMS_LINK inchangé)
│   ├── usePacoRegistration.js   # [EXISTING] Réutilisé tel quel
│   └── usePacoEmail.js          # [EXISTING] Réutilisé tel quel
├── locales/
│   ├── fr/paco.json             # [MODIFY] Ajouter clés gateway
│   └── en/paco.json             # [MODIFY] Ajouter clés gateway
├── router/
│   └── index.js                 # [MODIFY] Ajouter route /paco/join

supabase/functions/
└── send-paco-email/
    └── index.ts                 # [MODIFY] Remplacer lien Teams par lien plateforme dans l'email
```

**Structure Decision**: Suit la structure modulaire PACO existante. La nouvelle page gateway (`PacoJoinGateway.vue`) est placée dans `src/views/paco/` conformément au principe I de la constitution. Aucun nouveau dossier créé.
