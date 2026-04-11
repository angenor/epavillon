# Contract — Canonical Referral Sources

**Feature**: 006-paco-referral-source
**Status**: Binding — any change here requires updating the DB CHECK, the RPCs, the i18n files, and the composable.

## 1. Canonical keys (stable identifiers)

| Order | Key (stable) | i18n key (options) | French label | English label | Colour (hex) |
|-------|--------------|--------------------|--------------|---------------|--------------|
| 1 | `ifdd_website` | `paco.referralSource.options.ifdd_website` | Site web de l'IFDD | IFDD website | `#2563eb` |
| 2 | `ifdd_linkedin` | `paco.referralSource.options.ifdd_linkedin` | LinkedIn de l'IFDD | IFDD LinkedIn | `#0a66c2` |
| 3 | `ifdd_facebook` | `paco.referralSource.options.ifdd_facebook` | Facebook de l'IFDD | IFDD Facebook | `#1877f2` |
| 4 | `ifdd_x` | `paco.referralSource.options.ifdd_x` | X de l'IFDD | IFDD X | `#0f172a` |
| 5 | `email_newsletter` | `paco.referralSource.options.email_newsletter` | Email / Newsletter | Email / Newsletter | `#059669` |
| 6 | `other` | `paco.referralSource.options.other` | Autre | Other | `#d97706` |
| 7* | `not_specified` | `paco.referralSource.notSpecified` | Non renseigné | Not specified | `#9ca3af` |

\* `not_specified` is a **display-only** bucket. It MUST NOT be written to the database. It represents rows where `referral_source IS NULL` (historical data or non-PACO activities).

## 2. Display ordering rules

- The 6 official sources MUST always be rendered in the fixed order above, both in the form `<option>` list and in the admin donut chart.
- The `not_specified` bucket (when present) MUST be rendered **last** and only if its count is strictly greater than 0 (FR-009 / clarification Q2 A + Q5 A).
- The colour for `not_specified` MUST be visually distinct from the 6 official colours (neutral grey).

## 3. Validation rules

| Rule | Enforced by |
|------|-------------|
| Only keys 1–6 are accepted as a submitted value | DB `check_referral_source_allowed` + RPC validation |
| `referral_source_other` is only writable when `referral_source = 'other'` | DB `check_referral_source_other_guard` |
| `referral_source_other` length ≤ 120 characters | DB CHECK + UI `maxlength` |
| A submission without `referral_source` is rejected before RPC call | Vue form guard (FR-004) |
| `not_specified` MUST NOT appear in any INSERT / UPDATE statement | Client-side aggregation only |

## 4. Version policy

- Adding a new canonical key: PATCH (key must be appended at the END of the list to preserve stored data ordering semantics; UI ordering updated in lockstep; DB CHECK and RPC both updated in the same migration).
- Renaming a canonical key: MAJOR (requires a data migration).
- Removing a canonical key: MAJOR (requires a data migration to `other` or `not_specified`).
