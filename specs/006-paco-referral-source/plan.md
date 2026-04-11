# Implementation Plan: Canal d'acquisition (referral source) pour inscription PACO

**Branch**: `006-paco-referral-source` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-paco-referral-source/spec.md`

## Summary

Ajouter au formulaire d'inscription PACO (`PacoQuickRegister.vue`) un champ obligatoire de type dropdown positionné juste au-dessus du bouton de soumission, permettant de capturer le canal par lequel l'inscrit a connu le webinaire parmi 6 options officielles (Site web / LinkedIn / Facebook / X / Email-Newsletter / Autre), avec un champ texte libre optionnel (max 120 car.) apparaissant conditionnellement si "Autre" est sélectionné. La donnée est persistée en base dans `activity_registrations` (nouvelles colonnes `referral_source` + `referral_source_other`) via l'extension des RPC `register_paco_quick` et `register_paco_fallback`. Côté admin (`PacoAdmin.vue`), une nouvelle section affiche un camembert (donut chart amCharts 5) listant les 6 canaux dans l'ordre fixe officiel, avec la catégorie "Non renseigné" en dernier et uniquement si > 0 ; la répartition respecte le filtre de session actif. L'export CSV est étendu avec deux nouvelles colonnes.

## Technical Context

**Language/Version**: JavaScript ES2022 (Vue 3.5+)
**Primary Dependencies**: Vue 3, Vue i18n, Supabase JS, TailwindCSS v4, Font Awesome, **@amcharts/amcharts5** (déjà installé, module `percent` à importer pour le donut)
**Storage**: PostgreSQL via Supabase — table existante `activity_registrations` (2 nouvelles colonnes), RPC `register_paco_quick` et `register_paco_fallback` (signatures étendues, rétro-compatibilité via DROP/CREATE)
**Testing**: Vérification manuelle + quickstart end-to-end (pas de framework de test unitaire existant sur ce projet, en cohérence avec les features 001-005)
**Target Platform**: Web SPA Vue 3, rendu côté client + pre-rendering Puppeteer (SEO)
**Project Type**: Application web mono-projet (frontend Vue + backend Supabase)
**Performance Goals**: Aucun impact mesurable sur la soumission du formulaire (+1 select + 1 update PL/pgSQL), rendu du donut < 200 ms avec ≤ 7 segments
**Constraints**: Conformité i18n FR/EN obligatoire, dark/light mode, TailwindCSS v4 uniquement, pas de TypeScript, migrations SQL dans `bank/shema_et_requettes/`
**Scale/Scope**: Volume identique aux inscriptions PACO existantes (quelques centaines à milliers par session), 2 sessions actives, 1 formulaire impacté, 1 tableau de bord impacté

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Justification |
|----------|--------|---------------|
| I. Modular Architecture | ✅ PASS | Nouveaux composants isolés (`PacoReferralSourceChart.vue`) + extension de composables existants (`usePacoStats`, `usePacoCsvExport`, `usePacoRegistration`) + nouveau fichier `src/composables/paco/referralSources.js` (source unique de vérité des canaux). Pas de nouveau domaine créé. |
| II. Internationalization First | ✅ PASS | Toutes les nouvelles chaînes (label, options, titre de section, messages d'erreur, en-têtes CSV côté UI) ajoutées à `src/locales/fr/paco.json` et `src/locales/en/paco.json`. Les 6 clés techniques (`ifdd_website`, `ifdd_linkedin`, ...) restent non traduites. |
| III. Theme Support | ✅ PASS | Le donut amCharts 5 réutilise les classes Tailwind déjà en place dans `PacoRegistrationChart.vue` pour le conteneur (bg-white/dark:bg-gray-800). Les couleurs de segments suivent la palette existante, avec une couleur neutre (gray-400) pour "Non renseigné". |
| IV. Clean Code Discipline (DRY/KISS/YAGNI) | ✅ PASS | Source unique des canaux dans `src/composables/paco/referralSources.js`, réutilisée par formulaire, stats, CSV. Aucun helper spéculatif. Pas de refonte de `PacoAdmin`. |
| V. Database Schema as Source of Truth | ✅ PASS | Les 2 nouvelles colonnes sont ajoutées dans une nouvelle migration `006_paco_referral_source.sql` idempotente, puis répercutées dans `database_complete.sql` (bloc `CREATE TABLE activity_registrations` + commentaires de colonnes + section des RPC). |

**Contraintes stack binding respectées** :
- Vue 3 + JavaScript (pas de TS)
- TailwindCSS v4 avec syntaxe `bg-color/opacity`, `cursor-pointer` explicite
- Supabase (RPC + RLS), Firebase hosting
- amCharts 5 (déjà embarqué, module `percent`)

**Violations constitution** : aucune.

## Project Structure

### Documentation (this feature)

```text
specs/006-paco-referral-source/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 schema delta
├── quickstart.md        # Phase 1 verification steps
├── contracts/
│   ├── referral_sources.md       # Canonical list + i18n keys
│   └── rpc_register_paco.md      # Updated RPC signatures
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── paco/
│       ├── PacoQuickRegister.vue           # MODIFIED: add select + conditional text field
│       └── PacoReferralSourceChart.vue     # NEW: amCharts 5 donut component
├── composables/
│   └── paco/
│       ├── referralSources.js              # NEW: canonical list + helpers (pure JS)
│       ├── usePacoStats.js                 # MODIFIED: aggregate by referral_source
│       ├── usePacoCsvExport.js             # MODIFIED: 2 new CSV columns
│       └── usePacoRegistration.js          # MODIFIED: pass p_referral_source, p_referral_source_other
├── locales/
│   ├── fr/paco.json                        # MODIFIED: add paco.referralSource.* keys
│   └── en/paco.json                        # MODIFIED: add paco.referralSource.* keys
└── views/
    └── paco/
        └── PacoAdmin.vue                   # MODIFIED: embed PacoReferralSourceChart

bank/
└── shema_et_requettes/
    ├── 006_paco_referral_source.sql        # NEW: ALTER TABLE + update RPCs
    ├── rpc_register_paco_quick.sql         # MODIFIED: add 2 new params
    ├── rpc_register_paco_fallback.sql      # MODIFIED: capture referral in payload
    └── database_complete.sql               # MODIFIED: reflect schema changes
```

**Structure Decision** :
- **Frontend** : ajout d'un nouveau composant camembert dans `src/components/paco/` et d'un nouveau composable `referralSources.js` tenant la source unique des 6 canaux (clés techniques + ordre). Aucune nouvelle route, aucun nouveau store Pinia. Les modifications de `PacoQuickRegister.vue`, `usePacoStats.js`, `usePacoCsvExport.js`, `PacoAdmin.vue` restent chirurgicales.
- **Backend** : ajout de 2 colonnes à `activity_registrations` (précédent feature 005), mise à jour des 2 RPC PACO, conservation de la rétro-compatibilité via `DROP FUNCTION IF EXISTS` + `CREATE` comme déjà pratiqué. RLS inchangée (les policies existantes `SELECT` admin couvrent les nouvelles colonnes automatiquement). Pas de table créée, pas d'index supplémentaire (agrégation côté client suffit au volume PACO).

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

Aucune violation — section non applicable.
