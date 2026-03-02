<!--
  Sync Impact Report
  ==================
  Version change: N/A (initial) → 1.0.0
  Modified principles: N/A (first ratification)
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack & Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check section present)
    - .specify/templates/spec-template.md ✅ compatible (i18n and functional requirements align)
    - .specify/templates/tasks-template.md ✅ compatible (phase structure supports principles)
  Follow-up TODOs: None
-->

# ePavilion Constitution

## Core Principles

### I. Modular Architecture

All code MUST be organized by domain responsibility following
this structure:

- **Components**: Reusable Vue components in `src/components/`
- **Composables**: Business logic in `src/composables/`,
  with domain subfolders (`ai/`, `zoom/`)
- **Utils**: Pure utility functions in `src/utils/`,
  with domain subfolders (`zoom/`)
- **Stores**: State management with Pinia in `src/stores/`
- **Views**: Pages grouped by functional domain in `src/views/`
  (e.g., `auth/`, `events/`)
- **Router**: Route configuration in `src/router/`

Each component, composable, or utility MUST have a single,
well-defined responsibility. New functional domains MUST get
their own subfolder.

### II. Internationalization First (NON-NEGOTIABLE)

Every user-facing text MUST use the Vue i18n translation
system (`t()` / `$t()`). Hardcoded text in templates is
strictly forbidden.

- Supported languages: `fr` (default), `en`
- Translation files: `src/locales/fr/index.js`,
  `src/locales/en/index.js`
- Every new text MUST be added to both translation files
- Translation keys MUST be organized by section (`common`,
  `nav`, `user`, and domain-specific sections)

### III. Theme Support (NON-NEGOTIABLE)

All interfaces MUST support Dark and Light modes.

- Use CSS custom properties for theming
- Themes: `light`, `dark`, and IFDD custom theme
- Theme preference MUST be persisted in localStorage or
  Supabase user preferences
- Use `class="dark"` on root element for dark mode activation

### IV. Clean Code Discipline

All code MUST adhere to these principles:

- **DRY**: No code duplication. Common logic MUST be
  centralized in composables or shared utilities.
- **KISS**: Prefer simple, clear solutions. One component
  equals one responsibility. No over-engineering.
- **YAGNI**: Implement only what is needed now. No
  speculative features.

### V. Database Schema as Source of Truth

Before creating or modifying any data structure, developers
MUST consult `bank/shema_et_requettes/database_complete.sql`.

- All SQL scripts MUST be stored in `bank/shema_et_requettes/`
- Any schema modification MUST be reflected back in
  `database_complete.sql` immediately
- New tables or columns MUST respect existing relationships
  and naming conventions

## Technology Stack & Constraints

The following technology choices are binding and MUST NOT be
deviated from without a constitution amendment:

- **Framework**: Vue 3 (v3.5+) with Vite as build tool
- **Language**: JavaScript (no TypeScript unless amended)
- **Styling**: TailwindCSS v4 exclusively. No other CSS
  frameworks. IFDD brand colors and fonts are defined in
  `tailwind.config.js`
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Backend**: Supabase (database, auth, edge functions)
- **Hosting**: Firebase Hosting
- **SEO**: Pre-rendering with Puppeteer at build time
  using `@vueuse/head` for dynamic meta tags
- **Icons**: Font Awesome via `font-awesome-icon`
- **i18n**: Vue i18n

TailwindCSS v4 constraints:
- Use `bg-color/opacity` syntax (not `bg-opacity-xx`)
- Add `cursor-pointer` explicitly on buttons

Installation and deployment commands MUST NOT be executed
automatically. Provide instructions for manual execution.

## Development Workflow

### File Naming Conventions

- Views: Simple names without "View" suffix
  (e.g., `Login.vue`, not `LoginView.vue`)
- Views grouped by domain in `src/views/` subfolders
- Router imports MUST reflect the modular structure

### Quality Gates

- All features MUST support both Dark and Light themes
- All user-facing text MUST use i18n translations (fr + en)
- Database changes MUST update `database_complete.sql`
- SEO-critical pages MUST use `@vueuse/head` for meta tags
- UI components SHOULD use skeleton loaders for loading states
- Build commands (`npm run build`, `npm run preview`) may
  run freely; install/deploy commands require manual execution

### Pre-rendering & Deployment

A rebuild (`npm run build:seo`) and redeploy is required when:
- New events or activities are created
- Titles, descriptions, or cover images change

Full deploy command: `npm run deploy`

## Governance

This constitution is the authoritative reference for all
development decisions on the ePavilion project. It supersedes
ad-hoc practices and informal conventions.

### Amendment Process

1. Propose the change with rationale
2. Document the modification in the constitution
3. Update the Sync Impact Report (HTML comment at top)
4. Propagate changes to dependent templates if needed
5. Increment version per semantic versioning:
   - **MAJOR**: Principle removal or incompatible redefinition
   - **MINOR**: New principle or materially expanded guidance
   - **PATCH**: Clarifications, wording, or typo fixes

### Compliance

- All code reviews MUST verify adherence to these principles
- Complexity beyond what principles allow MUST be justified
  in a Complexity Tracking table (see plan template)
- Consult `CLAUDE.md` for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02
