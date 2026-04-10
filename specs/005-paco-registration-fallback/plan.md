# Implementation Plan: Inscription PACO non bloquante avec récupération des échecs

**Branch** : `005-paco-registration-fallback` | **Date** : 2026-04-10 | **Spec** : [spec.md](./spec.md)
**Input** : Feature specification from `/specs/005-paco-registration-fallback/spec.md`

## Summary

Garantir que l'inscription au webinaire PACO n'échoue **jamais de manière visible** pour l'utilisateur, même quand l'appel à la RPC `register_paco_quick` rencontre une erreur imprévue (WAF, contrainte SQL, réseau, etc.). Le flux client bascule en trois niveaux — RPC standard → RPC de secours → localStorage-only — tandis qu'une trace exploitable (payload JSON + message d'erreur) est conservée dans une extension de la table `activity_registrations` pour permettre un rattrapage manuel par l'équipe IFDD.

**Approche technique (issue de [research.md](./research.md))** :
- **Base de données** : extension de `activity_registrations` avec `fallback_payload JSONB`, `fallback_error TEXT`, `recovered_at TIMESTAMPTZ` (aucune nouvelle table). L'index partiel UNIQUE existant `(activity_id, guest_email, session_edition)` suffit pour garantir l'absence de doublon.
- **RPC** : nouvelle RPC `register_paco_fallback` (INSERT/UPSERT atomique) + modification de `register_paco_quick` pour promouvoir une ligne de secours en inscription standard lors d'un retry réussi.
- **Composable** : `registerPacoWithFallback(input)` dans `usePacoRegistration.js` encapsule la cascade des 3 tentatives ; l'UI n'a qu'un seul appel à faire.
- **Admin** : `usePacoStats.js` étendu pour exposer `isFallback`, `fallbackPayload`, `recoveredAt` ; nouvelles cartes stats, badge, modale détails, action « Marquer rattrapée », export CSV enrichi.
- **Pages** : changements limités aux pages temporaires `PacoWebinar.vue` et `PacoAdmin.vue` et à leurs composants/composables directs, conformément à la contrainte de portée de la feature.

## Technical Context

**Language/Version** : JavaScript (ES2022+) côté Vue 3.5 (`<script setup>`) ; PL/pgSQL pour les RPC Postgres
**Primary Dependencies** : Vue 3.5, Supabase JS (`@supabase/supabase-js`), Vue Router 4, Vue i18n, Pinia, Font Awesome, TailwindCSS v4
**Storage** : PostgreSQL via Supabase — tables existantes `activity_registrations`, `paco_demographic_data` (colonnes ajoutées à `activity_registrations`) + `localStorage` navigateur en fallback ultime
**Testing** : Vitest (tests unitaires composables), Playwright (E2E `npm run test:e2e`) — cibles : `usePacoRegistration`, `usePacoStats`, composants admin, scénario de bout en bout pour `PacoWebinar.vue`
**Target Platform** : SPA Vue servie via Firebase Hosting avec pre-rendering Puppeteer ; navigateurs modernes desktop et mobile
**Project Type** : Single-project web app (Vue 3 + Supabase), pages temporaires et exceptionnelles (pas de `backend/` distinct, tout passe par Supabase)
**Performance Goals** : Accès au bouton « Rejoindre » < 2s après soumission même en cas de double échec (SC-006) ; retry silencieux acceptable < 1s additionnelle
**Constraints** :
- Conservé 100 % des soumissions valides (zéro perte, SC-002)
- Zéro message d'erreur visible côté participant en cas d'échec technique (SC-005)
- Aucune modification des flux d'inscription hors PACO
- Valeurs statiques (PACO_ACTIVITY_ID, PACO_TEAMS_LINK, sessions) restent en dur — conformément au caractère temporaire des pages
**Scale/Scope** : webinaire PACO temporaire, < 1000 inscrits attendus par session, < 10 sessions prévues ; volume de secours attendu < 5 % du total — aucun besoin d'optimisation SQL agrégée, filtrage et stats peuvent s'effectuer côté client

## Constitution Check

Évaluation contre [constitution.md](../../.specify/memory/constitution.md) v1.0.0.

### I. Modular Architecture

✅ **Conforme**.
- Nouveau code uniquement dans `src/composables/paco/`, `src/components/paco/`, `src/views/paco/` (domaine PACO isolé, déjà en place).
- Extension du composable existant `usePacoRegistration.js` avec une nouvelle fonction haut niveau `registerPacoWithFallback` — pas de nouveau fichier nécessaire (DRY).
- Le composable `usePacoStats.js` est étendu, pas dupliqué.
- SQL dans `bank/shema_et_requettes/` conformément au principe V.

### II. Internationalization First (NON-NEGOTIABLE)

✅ **Conforme**.
- Aucun texte en dur dans les templates Vue modifiés.
- Liste exhaustive des nouvelles clés i18n documentée dans [contracts/ui_admin_fallback.md §8](./contracts/ui_admin_fallback.md#8).
- Les deux fichiers `src/locales/fr/index.js` et `src/locales/en/index.js` doivent être mis à jour simultanément lors de l'implémentation (une tâche dédiée sera générée par `/speckit.tasks`).

### III. Theme Support (NON-NEGOTIABLE)

✅ **Conforme**.
- Tous les nouveaux composants/modifications respectent la charte `dark:` Tailwind existante.
- La modale « Détails secours » utilisera les mêmes conventions que la modale de confirmation de suppression déjà présente dans [PacoAdmin.vue:122-148](../../src/views/paco/PacoAdmin.vue#L122-L148).

### IV. Clean Code Discipline

✅ **Conforme**.
- **DRY** : `registerPacoWithFallback` centralise la logique qui aurait pu être dupliquée dans `PacoQuickRegister.vue`.
- **KISS** : pas d'enum de statut, pas de nouvelle table, pas de classification d'erreur — trois colonnes et une RPC suffisent.
- **YAGNI** : pas de retry automatique, pas d'observabilité externe, pas de notifications email admin — uniquement ce que la spec demande.

### V. Database Schema as Source of Truth

✅ **Conforme**.
- Migration SQL isolée dans `bank/shema_et_requettes/005_paco_registration_fallback.sql`.
- `database_complete.sql` sera mis à jour avec les 3 nouvelles colonnes et le nouvel index partiel.
- Les fichiers RPC (`rpc_register_paco_fallback.sql` nouveau, `rpc_register_paco_quick.sql` remplacé) sont versionnés dans le même dossier.

### Tech Stack & Constraints

✅ **Conforme**.
- JavaScript (pas de TypeScript).
- TailwindCSS v4 avec syntaxe `bg-color/opacity` et `cursor-pointer` explicite (déjà utilisé dans le code PACO existant).
- Supabase pour l'auth, la DB et les RPC — pas de backend séparé.
- Aucune commande `npm install` ou `supabase functions deploy` ne sera exécutée automatiquement par l'implémentation ; les instructions seront fournies dans `tasks.md`.

### Gates

✅ **Tous les gates passent — aucun écart à justifier.** Le tableau « Complexity Tracking » en bas de ce document reste vide.

## Project Structure

### Documentation (this feature)

```text
specs/005-paco-registration-fallback/
├── plan.md              # Ce fichier (/speckit.plan command output)
├── spec.md              # Spécification (avec clarifications)
├── research.md          # Phase 0 — décisions techniques consolidées
├── data-model.md        # Phase 1 — schéma SQL, RPC, transitions d'état
├── quickstart.md        # Phase 1 — scénarios de validation manuelle
├── contracts/           # Phase 1 — contrats RPC + composable + UI
│   ├── rpc_register_paco_fallback.md
│   ├── rpc_register_paco_quick.md
│   ├── composable_use_paco_registration.md
│   └── ui_admin_fallback.md
├── checklists/          # Existant (pré-spec)
└── tasks.md             # Phase 2 — à générer via /speckit.tasks (PAS créé ici)
```

### Source Code (repository root)

```text
epavillonvue/                           # racine monorepo Vue 3 + Supabase
├── src/
│   ├── composables/
│   │   └── paco/
│   │       ├── constants.js            # existant, inchangé
│   │       ├── usePacoRegistration.js  # MODIFIÉ — + registerPacoWithFallback, + markRegistrationRecovered
│   │       ├── usePacoStats.js         # MODIFIÉ — select étendu, stats enrichies
│   │       ├── usePacoCsvExport.js     # MODIFIÉ — nouvelles colonnes CSV
│   │       └── usePacoWebinarData.js   # existant, inchangé (config sessions statique)
│   ├── components/
│   │   └── paco/
│   │       ├── PacoQuickRegister.vue   # MODIFIÉ — utilise registerPacoWithFallback
│   │       ├── PacoRegisterForm.vue    # MODIFIÉ (si utilisé pour un parcours concerné)
│   │       ├── PacoStatsCards.vue      # MODIFIÉ — 3 nouvelles cartes
│   │       ├── PacoRegistrantTable.vue # MODIFIÉ — badge, colonne Type, bouton Détails, modale, filtre
│   │       └── PacoStatusBadge.vue     # MODIFIÉ — nouveau variant "fallback"
│   ├── views/
│   │   └── paco/
│   │       ├── PacoWebinar.vue         # probablement inchangé (délégation au composant d'inscription)
│   │       └── PacoAdmin.vue           # MODIFIÉ — filtre "Type", wiring du nouveau modèle stats
│   └── locales/
│       ├── fr/index.js                 # MODIFIÉ — nouvelles clés paco.admin.fallback.*, paco.admin.stats.*
│       └── en/index.js                 # MODIFIÉ — idem
├── bank/shema_et_requettes/
│   ├── 005_paco_registration_fallback.sql       # NOUVEAU — migration d'ajout de colonnes + index
│   ├── rpc_register_paco_fallback.sql           # NOUVEAU — RPC de secours
│   ├── rpc_register_paco_quick.sql              # REMPLACÉ — logique de promotion
│   └── database_complete.sql                    # MODIFIÉ — mise à jour du snapshot
└── tests/                                        # le cas échéant
    ├── unit/paco/                                # NOUVEAU — tests Vitest pour le composable
    └── e2e/paco/fallback.spec.js                 # NOUVEAU — Playwright E2E scénario bloquant → déblocage
```

**Structure Decision** : ce projet est une **single-page web app Vue 3** avec backend délégué à Supabase (pas de backend séparé dans le repo). La feature s'inscrit strictement dans le domaine `paco/` déjà isolé des flux standards de la plateforme. Aucun nouveau dossier racine n'est créé. Les modifications sont chirurgicales et restreintes aux composables, composants, vues et fichiers SQL **déjà dans le périmètre PACO**.

## Complexity Tracking

> Aucune violation de la Constitution — cette section reste vide.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)*  | *(none)*   | *(none)*                            |
