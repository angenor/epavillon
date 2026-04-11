# Phase 1 Data Model — 006 Paco Referral Source

**Date**: 2026-04-10
**Scope**: Delta applied to `public.activity_registrations` and the two PACO registration RPCs.

## 1. Schema Delta

### 1.1 Table `public.activity_registrations`

Two new nullable columns are appended after the feature 005 columns. No existing column is modified.

| Column | Type | Nullable | Default | Constraint |
|--------|------|----------|---------|------------|
| `referral_source` | `TEXT` | YES | `NULL` | `CHECK (referral_source IS NULL OR referral_source IN ('ifdd_website','ifdd_linkedin','ifdd_facebook','ifdd_x','email_newsletter','other'))` |
| `referral_source_other` | `TEXT` | YES | `NULL` | `CHECK (referral_source_other IS NULL OR (referral_source = 'other' AND char_length(referral_source_other) <= 120))` |

**Notes**
- `NULL` on both columns = historical row (pre-deployment) or a non-PACO registration. Both cases surface as "Non renseigné" in PacoAdmin when they belong to the filtered PACO session.
- The CHECK constraint on `referral_source_other` enforces at the DB level that a precision is only allowed when source = `'other'`, mirroring FR-002b.
- Length ceiling 120 characters matches the UI `maxlength` in `PacoQuickRegister.vue` (FR-002a).
- No new index. The PACO stats queries already filter on `activity_id` + `session_edition`, which remain selective enough at PACO's volume.

### 1.2 RLS

No new policy required:
- Existing `"Users can view their own registrations"` covers reading own rows (columns inherited).
- Existing `"Admins can view all activity registrations"` covers the admin dashboard aggregation.
- Existing INSERT policy `"Users can register to activities"` applies to authenticated inserts; the `register_paco_quick` RPC runs `SECURITY DEFINER` which bypasses RLS for guest inserts.
- Existing UPDATE policy (feature 005) for admins remains untouched.

### 1.3 Migration file

New file: `bank/shema_et_requettes/006_paco_referral_source.sql` (idempotent):

```sql
BEGIN;

ALTER TABLE public.activity_registrations
    ADD COLUMN IF NOT EXISTS referral_source TEXT,
    ADD COLUMN IF NOT EXISTS referral_source_other TEXT;

-- Add CHECK constraints only if they do not already exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_referral_source_allowed'
    ) THEN
        ALTER TABLE public.activity_registrations
            ADD CONSTRAINT check_referral_source_allowed
            CHECK (
                referral_source IS NULL
                OR referral_source IN (
                    'ifdd_website',
                    'ifdd_linkedin',
                    'ifdd_facebook',
                    'ifdd_x',
                    'email_newsletter',
                    'other'
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_referral_source_other_guard'
    ) THEN
        ALTER TABLE public.activity_registrations
            ADD CONSTRAINT check_referral_source_other_guard
            CHECK (
                referral_source_other IS NULL
                OR (
                    referral_source = 'other'
                    AND char_length(referral_source_other) <= 120
                )
            );
    END IF;
END
$$;

COMMENT ON COLUMN public.activity_registrations.referral_source IS
    'Feature 006 — canal par lequel l''inscrit PACO a decouvert le webinaire (6 options officielles + NULL historique).';
COMMENT ON COLUMN public.activity_registrations.referral_source_other IS
    'Feature 006 — precision libre optionnelle lorsque referral_source = ''other'' (max 120 caracteres).';

COMMIT;

-- ============================================
-- ROLLBACK (manuel)
-- ============================================
-- BEGIN;
-- ALTER TABLE public.activity_registrations
--     DROP CONSTRAINT IF EXISTS check_referral_source_other_guard,
--     DROP CONSTRAINT IF EXISTS check_referral_source_allowed,
--     DROP COLUMN IF EXISTS referral_source_other,
--     DROP COLUMN IF EXISTS referral_source;
-- COMMIT;
```

## 2. RPC contract evolution

### 2.1 `register_paco_quick`

**Previous signature** (v3.1, feature 005):

```text
register_paco_quick(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_gender TEXT,
    p_age_profile TEXT,
    p_city TEXT,
    p_country_id UUID,
    p_professional_status TEXT,
    p_organization TEXT,
    p_recording_consent BOOLEAN,
    p_session_edition INTEGER
) RETURNS UUID
```

**New signature** (v4, feature 006) — two new required params appended:

```text
register_paco_quick(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_gender TEXT,
    p_age_profile TEXT,
    p_city TEXT,
    p_country_id UUID,
    p_professional_status TEXT,
    p_organization TEXT,
    p_recording_consent BOOLEAN,
    p_session_edition INTEGER,
    p_referral_source TEXT,
    p_referral_source_other TEXT DEFAULT NULL
) RETURNS UUID
```

Behavioural changes (kept minimal):
- All 3 branches (new insert / idempotent return / fallback promotion) write `referral_source` and `referral_source_other` on `activity_registrations`.
- On Branch 2 (idempotent return), the function UPDATEs `referral_source` and `referral_source_other` only when they are currently NULL, preserving historical values if the user re-submits the same form.
- On Branch 3 (fallback promotion), the function overwrites `referral_source` and `referral_source_other` with the freshly validated values (same policy as `guest_first_name` etc.).
- `DROP FUNCTION IF EXISTS` is called on both the v3 and v4 signatures for a clean rebuild, matching the existing idiom.

### 2.2 `register_paco_fallback`

Same parameter addition. In the fallback path, `referral_source` and `referral_source_other` are stored directly on the inserted row AND embedded in the `fallback_payload` JSONB under `referralSource` / `referralSourceOther` for traceability, matching the existing convention of duplicating form fields into the payload (see `feature 005` fallback RPC).

## 3. Frontend data structures

### 3.1 Canonical referral sources (new composable)

New file `src/composables/paco/referralSources.js`:

```javascript
// Single source of truth for PACO referral sources.
// Ordering here drives:
//   - the order of <option> elements in the registration form,
//   - the order of slices + legend entries in the admin donut chart,
//   - the order of buckets in client-side aggregation.
// Keys are stable, non-translated, and must match the DB CHECK constraint.

export const PACO_REFERRAL_SOURCES = [
  'ifdd_website',
  'ifdd_linkedin',
  'ifdd_facebook',
  'ifdd_x',
  'email_newsletter',
  'other'
]

export const PACO_REFERRAL_NOT_SPECIFIED = 'not_specified'

/**
 * Return the i18n key for a given canonical referral source.
 * @param {string} source
 * @returns {string}
 */
export function referralSourceI18nKey(source) {
  if (source === PACO_REFERRAL_NOT_SPECIFIED) return 'paco.referralSource.notSpecified'
  return `paco.referralSource.options.${source}`
}

/**
 * Return the display colour for a given canonical source (amCharts5 hex).
 * "not_specified" uses a neutral grey distinct from the 6 official channels.
 */
export const PACO_REFERRAL_COLORS = {
  ifdd_website:     '#2563eb', // blue-600
  ifdd_linkedin:    '#0a66c2', // LinkedIn brand
  ifdd_facebook:    '#1877f2', // Facebook brand
  ifdd_x:           '#0f172a', // slate-900
  email_newsletter: '#059669', // emerald-600
  other:            '#d97706', // amber-600
  not_specified:    '#9ca3af'  // gray-400 (neutral)
}
```

### 3.2 `PacoQuickRegister.vue` form state delta

Two new reactive fields added to the existing `form` reactive object:

```javascript
const form = reactive({
  // ...existing fields
  referralSource: '',        // one of PACO_REFERRAL_SOURCES, required
  referralSourceOther: ''    // free text, max 120 chars, only when referralSource === 'other'
})

watch(() => form.referralSource, (next) => {
  if (next !== 'other') form.referralSourceOther = ''
})
```

Submission payload additions (passed to `registerPacoWithFallback`):
```javascript
referralSource: form.referralSource,
referralSourceOther: form.referralSource === 'other'
  ? (form.referralSourceOther.trim() || null)
  : null
```

### 3.3 Stats breakdown shape (`usePacoStats`)

```javascript
stats.value.referralSource = {
  // fixed-order array, length 6 or 7 (7 when not_specified count > 0)
  breakdown: [
    { key: 'ifdd_website',     count: 12, percent: 24.0 },
    { key: 'ifdd_linkedin',    count:  8, percent: 16.0 },
    { key: 'ifdd_facebook',    count:  5, percent: 10.0 },
    { key: 'ifdd_x',           count:  0, percent:  0.0 },
    { key: 'email_newsletter', count: 15, percent: 30.0 },
    { key: 'other',            count:  7, percent: 14.0 },
    { key: 'not_specified',    count:  3, percent:  6.0 }  // only if > 0
  ],
  total: 50 // sum of all displayed buckets (denominator used for percent)
}
```

### 3.4 CSV row schema delta

New columns injected between `"Organisation"` and `"Date d'inscription"` in `usePacoCsvExport`:

| Position | Header | Source |
|----------|--------|--------|
| 11 (new) | `Canal d'acquisition` | `r.referralSourceLabelFr` (resolved from canonical key via shared helper), empty string if NULL |
| 12 (new) | `Canal — précision` | `r.referralSourceOther`, empty string if NULL |

The subsequent columns (`Date d'inscription`, `Type`, `Erreur technique`, `Rattrapé le`, `Payload JSON (secours)`) shift by 2 positions.

## 4. Validation Rules Matrix

| Layer | Rule | Enforcement |
|-------|------|-------------|
| UI form | `referralSource` must be set before submit | `required` on `<select>` + Vue guard in `handleSubmit` |
| UI form | `referralSourceOther` visible only when source = `other` | `v-if` |
| UI form | `referralSourceOther` trimmed and max 120 chars | `maxlength="120"` + `.trim()` |
| Composable (client) | Payload nullifies `referralSourceOther` when source ≠ `other` | `registerPacoWithFallback` input sanitization |
| RPC `register_paco_quick` | Must not accept unknown source key | DB `CHECK` fires → RPC raises EXCEPTION |
| RPC `register_paco_fallback` | Always writes referral fields + duplicates into `fallback_payload` JSONB | Explicit PL/pgSQL assignment |
| DB table | `referral_source_other NOT NULL` only when `referral_source = 'other'` AND length ≤ 120 | `check_referral_source_other_guard` |

## 5. Affected entities summary

| Entity | Change type | Backwards compatible? |
|--------|-------------|----------------------|
| `public.activity_registrations` | Additive (2 new nullable columns + 2 CHECK) | ✅ yes — existing queries unaffected, RLS untouched |
| `public.register_paco_quick` RPC | Signature extended (2 required params) | ⚠️ not source-compat — all callers must be updated in the same deploy |
| `public.register_paco_fallback` RPC | Signature extended (2 required params) | ⚠️ same |
| `paco_demographic_data` | **Unchanged** | ✅ |
| Existing PACO stats / CSV / chart components | Extensions only, no breaking rename | ✅ |
