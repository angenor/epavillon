# Phase 0 Research — 006 Paco Referral Source

**Date**: 2026-04-10
**Feature**: Canal d'acquisition (referral source) pour inscription PACO
**Status**: All decisions resolved, no remaining NEEDS CLARIFICATION.

## R1 — Where to store `referral_source` in the database

### Decision
Add two new columns **directly on `public.activity_registrations`**:
- `referral_source TEXT` (nullable, `CHECK` constraint listing the 6 canonical keys)
- `referral_source_other TEXT` (nullable, length ≤ 120, must be NULL unless `referral_source = 'other'`)

### Rationale
- The **fallback registration path** (feature 005) does NOT create a `paco_demographic_data` row — it only inserts into `activity_registrations` with `fallback_payload IS NOT NULL`. Storing the referral on `paco_demographic_data` would make `FR-006` (capture referral even in fallback mode) impossible without hacks.
- Feature 005 already precedent-set storing PACO-specific columns directly on `activity_registrations` (`fallback_payload`, `fallback_error`, `recovered_at`).
- Aggregations in `usePacoStats.fetchPacoStats` query `activity_registrations` first and join `paco_demographic_data` — adding the column to the base table keeps the stats query cheap (single table scan, no conditional join).
- Nullable column = historical rows (pre-deployment) naturally fall into the "Non renseigné" bucket without backfill, aligned with FR-009 and US3.

### Alternatives considered
| Option | Why rejected |
|--------|--------------|
| Add columns to `paco_demographic_data` | Fallback rows have no `paco_demographic_data`; would violate FR-006. |
| Put the value inside `fallback_payload` JSONB | Impossible to aggregate with a single SELECT; forces client-side JSON parsing; contradicts FR-011 (single source of truth) for stats queries. |
| Create a new `paco_registration_metadata` table | YAGNI — 2 scalar columns do not warrant a new table, a new join, new RLS policies. |
| Create a Postgres ENUM type | TEXT + CHECK is the existing convention in the schema (`gender`, `professional_status`), staying consistent > enum purity. |

## R2 — Form field placement and validation semantics

### Decision
Render the `<select>` as the **last field** of the `<form>` inside `PacoQuickRegister.vue`, immediately before the `<button type="submit">`. Use native HTML5 `required` plus a Vue-level guard in `handleSubmit` to block submission and surface an i18n error under the field when the value is empty.

### Rationale
- Clarification session 2026-04-10 decided placement explicitly (Q4 answer A).
- Reusing the existing `<select>` markup pattern from "Country" and "Professional Status" keeps visual consistency and avoids new styling.
- Native `required` covers the happy path; the explicit Vue guard protects against custom validation races when the "Other" free-text field is also in play.

### Alternatives considered
- Standalone modal step after submission — rejected, adds friction with no data benefit (clarification Q4 D).
- Top of form — rejected, clarification Q4 B.
- Between identity and organization — rejected, clarification Q4 C.

## R3 — "Other" conditional free-text input

### Decision
A second field `<input type="text" maxlength="120">` appears **only** when `form.referralSource === 'other'`. It is optional. On submit, its value is trimmed and sent only if non-empty AND the selected source is `'other'`; otherwise it is explicitly set to `null` to prevent stale data when the user switches the dropdown. UI uses a simple `v-if` — no modal, no reveal animation to keep KISS.

### Rationale
- Clarification Q3 B: optional free text only when "Other" is selected.
- FR-002a / FR-002b require masking AND clearing the free text when another option is picked — handled in a `watch` on `form.referralSource` that resets `form.referralSourceOther = ''` whenever the selection leaves `'other'`.
- 120 chars ceiling prevents abuse and matches DB CHECK constraint.

### Alternatives considered
- Always-visible optional text field — rejected, confusing UX when a non-"Other" option is chosen.
- Required text when "Other" is selected — rejected (clarification Q3 C), would reduce completion rate.

## R4 — Stats visualisation: donut chart library

### Decision
Build a new `PacoReferralSourceChart.vue` using **amCharts 5 `percent` module** (`@amcharts/amcharts5/percent`), already bundled via the `@amcharts/amcharts5` dependency (no install needed). Use `PieChart` + `PieSeries` with `innerRadius = 60%` for a donut look, animated theme, and a vertical legend positioned below or to the side depending on viewport.

### Rationale
- The project already uses amCharts 5 for `PacoRegistrationChart.vue` (bars). Reusing the same library avoids adding a new dependency (constitution V) and preserves a unified visual language.
- amCharts percent module handles legend, labels, tooltips, and responsive layout out of the box.
- Colours can be forced via `PieSeries.set("colors", am5.ColorSet.new(...))` to guarantee the fixed order and the neutral grey for "Non renseigné".

### Alternatives considered
| Option | Why rejected |
|--------|--------------|
| Chart.js | New dependency, constitution V discourages unnecessary packages. |
| ECharts | Same reason. |
| Pure SVG hand-crafted donut | Reinvents responsive legend, accessibility, tooltips — fails KISS. |
| Reuse `PacoStatsCards` (cards) | Not a camembert (clarification Q1 B). |

## R5 — Stats data model on the client

### Decision
Extend `usePacoStats.fetchPacoStats`:
- Add `referral_source` to the SELECT clause on `activity_registrations`.
- After fetching, build an `orderedReferralBreakdown` array of fixed length 6 (one entry per canonical key in fixed order), counting occurrences. Append a 7th entry `{ key: 'not_specified', count: N }` only when N > 0.
- Compute `pct = count / totalAllBuckets` where `totalAllBuckets = sum of all displayed buckets` (including "Non renseigné" when present), matching FR-009.
- Expose as `stats.value.referralSource = { breakdown, totalAllBuckets }`.

### Rationale
- Computing on the client keeps the stats query simple (no GROUP BY RPC, no view).
- Volume is small (hundreds to a few thousand rows), well within browser capability.
- Guarantees deterministic ordering independent of DB row order — matches clarification Q5 A.

### Alternatives considered
- Postgres view with GROUP BY — rejected (over-engineering for this volume; adds a second fetch).
- New RPC `get_paco_referral_breakdown` — rejected YAGNI.

## R6 — CSV export columns

### Decision
Extend `usePacoCsvExport.exportToCsv` to add two columns just before the existing `Type` column:
1. `"Canal d'acquisition"` — human label in French resolved from the canonical key (via the shared `referralSources.js` `labelFr` helper). Empty string when missing.
2. `"Canal — précision"` — raw `referral_source_other` value. Empty when missing or when source ≠ "other".

### Rationale
- FR-010 mandates both columns.
- Positioning before `Type` keeps marketing-oriented columns grouped with demographic columns and technical fallback columns together.
- French labels only (existing CSV is already French-only by design).

### Alternatives considered
- Bilingual CSV headers — rejected, inconsistent with existing CSV.

## R7 — RPC signature evolution

### Decision
Add two new parameters to `public.register_paco_quick` and `public.register_paco_fallback`:
- `p_referral_source TEXT` (required, one of the 6 canonical keys)
- `p_referral_source_other TEXT DEFAULT NULL`

Both RPC functions will `DROP FUNCTION IF EXISTS` their previous signatures then `CREATE OR REPLACE` with the new parameter list, mirroring the pattern already used in `rpc_register_paco_quick.sql` v2 → v3.

### Rationale
- PostgreSQL overloading + `DROP IF EXISTS` is the existing idiom for param evolution in this project.
- Backend-level validation (CHECK constraint) defends against injection of unknown source keys.
- Passing both params explicitly keeps the RPC contract clear (no JSONB magic for a 2-scalar input).

### Alternatives considered
- Pass an `sources_payload JSONB` — rejected, adds indirection without benefit.
- Optional `p_referral_source` with server-side default — rejected, FR-005 makes it mandatory at the application layer for new registrations.

## R8 — i18n key structure

### Decision
New i18n section `paco.referralSource` in both `fr/paco.json` and `en/paco.json`:
```json
{
  "referralSource": {
    "label": "Comment avez-vous connu ce webinaire ?",
    "placeholder": "Sélectionnez un canal",
    "required": "Veuillez sélectionner un canal.",
    "otherLabel": "Précisez (facultatif)",
    "otherPlaceholder": "Ex. Recommandation d'un collègue",
    "options": {
      "ifdd_website": "Site web de l'IFDD",
      "ifdd_linkedin": "LinkedIn de l'IFDD",
      "ifdd_facebook": "Facebook de l'IFDD",
      "ifdd_x": "X de l'IFDD",
      "email_newsletter": "Email / Newsletter",
      "other": "Autre"
    },
    "chartTitle": "Canal d'acquisition",
    "chartSubtitle": "Répartition des inscrits par canal de découverte",
    "notSpecified": "Non renseigné"
  }
}
```
English mirror with translated strings (keys identical).

### Rationale
- Centralising under `paco.referralSource.*` matches the existing convention (`paco.demographic.*`, `paco.admin.*`).
- The canonical keys (`ifdd_website`, etc.) live as i18n sub-keys AND in `referralSources.js` (single source of truth for the key list; labels resolved via i18n at render time).

### Alternatives considered
- Array-of-objects i18n — rejected, Vue i18n nested keys are more ergonomic with `t()` + dynamic lookup.

## R9 — Accessibility & UX polish

### Decision
- `<select>` uses the same styling + class pattern as the existing Country/ProfessionalStatus selects.
- The conditional text field gets its own `<label>` with `aria-describedby` linking to the 120-char hint.
- Submit-blocking error is rendered as a `<p>` under the select with `role="alert"`, matching the pattern of `errorMessage` already used in the component.
- Donut chart must expose `aria-label` with a text summary (e.g. "Répartition par canal : LinkedIn 40 %, ...") for screen readers.

### Rationale
Constitution II (i18n) + general a11y hygiene, without scope creep.

## Outstanding items

None. All clarification questions answered in session 2026-04-10, all technical decisions captured above.
