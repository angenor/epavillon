# Implementation Plan: Webinaire PACO

**Branch**: `001-paco-webinar` | **Date**: 2026-03-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-paco-webinar/spec.md`

## Summary

Page d'inscription isolée pour le webinaire PACO (Priorités d'Adaptation en Afrique Centrale et de l'Ouest). Le système utilise une entrée fictive dans `activities` (créée via script SQL) pour enregistrer les inscriptions dans `activity_registrations`. Le flux intègre la vérification d'email, les formulaires de login/register directement sur la page (sans redirection), et l'envoi automatique d'un email contenant le lien Teams via une edge function dédiée. Tout le code est isolé dans des dossiers `paco/` pour suppression facile après l'événement.

## Technical Context

**Language/Version**: JavaScript (Vue 3.5+) + TypeScript (Edge Function Deno)
**Primary Dependencies**: Vue 3, Vue Router 4, Pinia, Supabase JS, TailwindCSS v4, Vue i18n, Font Awesome
**Storage**: PostgreSQL via Supabase (tables existantes `events`, `activities`, `activity_registrations`, `users`)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (SPA déployée sur Firebase Hosting)
**Project Type**: Web application (Vue 3 SPA + Supabase Edge Functions)
**Performance Goals**: Email envoyé dans les 30 secondes post-inscription, page chargée en < 2s
**Constraints**: Tout le code PACO doit être isolé dans des dossiers dédiés pour suppression post-événement
**Scale/Scope**: ~6 composants Vue, 1 composable, 1 edge function, 1 script SQL, 2 fichiers i18n

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Détail |
|----------|--------|--------|
| I. Modular Architecture | PASS | Code PACO organisé dans `src/views/paco/`, `src/components/paco/`, `src/composables/paco/` — nouveau domaine avec son propre sous-dossier |
| II. Internationalization First | PASS | Traductions dans `src/locales/fr/paco.json` et `src/locales/en/paco.json`, tous les textes via `t()` |
| III. Theme Support | PASS | Tous les composants utilisent les classes dark: de TailwindCSS |
| IV. Clean Code Discipline | PASS | DRY (composable partagé), KISS (composants simples à responsabilité unique), YAGNI (pas de fonctionnalités spéculatives) |
| V. Database Schema as Source of Truth | PASS | Script SQL dans `bank/shema_et_requettes/paco_setup.sql`, documentation dans `database_complete.sql` |
| TailwindCSS v4 constraints | PASS | Syntaxe `bg-color/opacity`, `cursor-pointer` sur boutons |
| Install/Deploy manual | PASS | Edge function et scripts SQL fournis comme instructions manuelles |

**Post-Phase 1 Re-check**: PASS — aucun principe violé par le design.

## Project Structure

### Documentation (this feature)

```text
specs/001-paco-webinar/
├── plan.md              # Ce fichier
├── spec.md              # Spécification fonctionnelle
├── research.md          # Recherche et décisions techniques
├── data-model.md        # Modèle de données
├── quickstart.md        # Guide de démarrage rapide
├── contracts/
│   ├── send-paco-email.md    # Contrat edge function email
│   └── check-paco-email.md   # Contrat RPC vérification email
├── checklists/
│   └── requirements.md       # Checklist qualité spec
└── tasks.md             # Tâches (généré par /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── views/paco/
│   └── PacoWebinar.vue              # Page principale du webinaire
├── components/paco/
│   ├── PacoPresentation.vue         # Section présentation (titre, description, date, intervenants)
│   ├── PacoEmailCheck.vue           # Formulaire de saisie email + vérification
│   ├── PacoLoginForm.vue            # Formulaire de connexion intégré
│   ├── PacoRegisterForm.vue         # Formulaire d'inscription plateforme + activité
│   ├── PacoActivityRegister.vue     # Inscription activité pour utilisateur connecté (champs pré-remplis)
│   └── PacoJoinSection.vue          # Bouton connexion Teams + lien à copier
├── composables/paco/
│   ├── constants.js                 # UUIDs PACO, lien Teams, configuration
│   ├── usePacoRegistration.js       # Logique inscription (check email, register activity, check registration)
│   └── usePacoEmail.js              # Appel edge function send-paco-email
└── locales/
    ├── fr/paco.json                 # Traductions françaises PACO
    └── en/paco.json                 # Traductions anglaises PACO

bank/shema_et_requettes/
└── paco_setup.sql                   # Script SQL (event fictif + activity fictive + RPC check_paco_email)

supabase/functions/
└── send-paco-email/
    └── index.ts                     # Edge function envoi email PACO

src/router/index.js                  # Ajout route /paco (1 ligne)
src/locales/fr/index.js              # Ajout import paco (2 lignes)
src/locales/en/index.js              # Ajout import paco (2 lignes)
```

**Structure Decision**: Architecture isolée en dossiers `paco/` suivant le principe Modular Architecture de la constitution. Seuls 3 fichiers existants sont modifiés (router + 2 index i18n) avec des ajouts minimaux (1-2 lignes chacun) facilement identifiables et supprimables.

## Architecture des composants

### Page principale : PacoWebinar.vue

```
┌─────────────────────────────────────────────────┐
│                PacoWebinar.vue                   │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │         PacoPresentation.vue                ││
│  │  (titre, description, date, intervenants)   ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  Section dynamique (selon état utilisateur) ││
│  │                                              ││
│  │  État: non connecté, email non vérifié       ││
│  │  → PacoEmailCheck.vue                        ││
│  │                                              ││
│  │  État: email vérifié, compte existant        ││
│  │  → PacoLoginForm.vue                         ││
│  │                                              ││
│  │  État: email vérifié, pas de compte          ││
│  │  → PacoRegisterForm.vue                      ││
│  │                                              ││
│  │  État: connecté, pas inscrit PACO            ││
│  │  → PacoActivityRegister.vue                  ││
│  │                                              ││
│  │  État: connecté + inscrit PACO               ││
│  │  → PacoJoinSection.vue                       ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Flux de données

```
PacoWebinar.vue
  ├── useAuth() → isAuthenticated, user, profile
  ├── usePacoRegistration()
  │     ├── checkEmailExists(email) → appel RPC check_paco_email
  │     ├── checkPacoRegistration(userId) → query activity_registrations
  │     ├── registerForPaco(userId) → insert activity_registrations
  │     └── isRegistered (ref)
  └── usePacoEmail()
        └── sendPacoEmail(recipientEmail, recipientName) → invoke edge function
```

### Modifications fichiers existants (minimales)

**`src/router/index.js`** — Ajout d'une route :
```javascript
{
  path: '/paco',
  name: 'paco-webinar',
  component: () => import('../views/paco/PacoWebinar.vue'),
}
```

**`src/locales/fr/index.js`** — Ajout import :
```javascript
import paco from './paco.json' with { type: 'json' };
// Dans l'export: ...paco,
```

**`src/locales/en/index.js`** — Idem.

## Complexity Tracking

> Aucune violation de la constitution détectée. Pas de justification nécessaire.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (aucune)  | —          | —                                   |
