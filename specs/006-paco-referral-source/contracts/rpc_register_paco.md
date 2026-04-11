# Contract — RPC signature changes

**Feature**: 006-paco-referral-source
**Status**: Binding — RPC signatures are cumulative; clients MUST migrate synchronously with the DB deploy.

## 1. `public.register_paco_quick`

### New v4 signature

```sql
CREATE OR REPLACE FUNCTION public.register_paco_quick(
    p_email                   TEXT,
    p_first_name              TEXT,
    p_last_name               TEXT,
    p_gender                  TEXT,
    p_age_profile             TEXT,
    p_city                    TEXT,
    p_country_id              UUID,
    p_professional_status     TEXT,
    p_organization            TEXT,
    p_recording_consent       BOOLEAN,
    p_session_edition         INTEGER DEFAULT 2,
    p_referral_source         TEXT,
    p_referral_source_other   TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;
```

### Drop cascade

Before `CREATE`, drop both old v3 AND any partial v4:

```sql
DROP FUNCTION IF EXISTS public.register_paco_quick(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER
);
DROP FUNCTION IF EXISTS public.register_paco_quick(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, TEXT
);
```

### Behavioural spec (per branch)

| Branch | Condition | Referral handling |
|--------|-----------|-------------------|
| 1. New insert | No candidate row exists for `(activity, email, session)` | INSERT `referral_source` and `referral_source_other` directly |
| 2. Idempotent return | Candidate exists AND `fallback_payload IS NULL` | UPDATE only when current columns are NULL (preserve the first-captured value); no change otherwise. Return existing `id`. |
| 3. Fallback promotion | Candidate exists AND `fallback_payload IS NOT NULL` | Overwrite `referral_source` and `referral_source_other` with the freshly validated values (same policy as `guest_first_name` etc.); clear `fallback_payload` + `fallback_error`. |

### GRANT

```sql
GRANT EXECUTE ON FUNCTION public.register_paco_quick(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, TEXT
) TO anon;
GRANT EXECUTE ON FUNCTION public.register_paco_quick(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER, TEXT, TEXT
) TO authenticated;
```

### Error surface

| Error | Cause |
|-------|-------|
| `new row for relation "activity_registrations" violates check constraint "check_referral_source_allowed"` | Caller passed an unknown source key — client bug |
| `..."check_referral_source_other_guard"` | Caller passed a non-NULL `p_referral_source_other` with a non-`other` source, OR length > 120 — client bug |

The front-end composable `registerPacoWithFallback` catches these as `technicalError` and falls back to `register_paco_fallback` as today.

## 2. `public.register_paco_fallback`

### New v2 signature

```sql
CREATE OR REPLACE FUNCTION public.register_paco_fallback(
    p_email                 TEXT,
    p_session_edition       INTEGER,
    p_fallback_payload      JSONB,
    p_error_message         TEXT,
    p_referral_source       TEXT,
    p_referral_source_other TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;
```

### Behavioural spec

- The RPC INSERTs `referral_source` and `referral_source_other` directly on the row AND embeds the same values under the JSON keys `referralSource` and `referralSourceOther` inside the stored `fallback_payload` for traceability.
- Duplicate-attempt handling (unique `(activity, email, session)` violation) MUST update the existing fallback row's referral columns only when they are currently NULL (idempotence across retry submissions).

### Error surface

Same two CHECK-related errors as `register_paco_quick`. The RPC raises them to the caller; the client currently treats any fallback RPC error as `local_only` — this is acceptable and does not change.

## 3. Front-end contract (`registerPacoWithFallback`)

Update `src/composables/paco/usePacoRegistration.js` to:

1. Accept `referralSource` and `referralSourceOther` in `PacoRegistrationInput`.
2. Pass them to `supabase.rpc('register_paco_quick', ...)` as `p_referral_source` / `p_referral_source_other`.
3. Pass them to `supabase.rpc('register_paco_fallback', ...)` with the same keys AND embed them into `fallbackPayload` for redundancy.
4. Validate `referralSource` against `PACO_REFERRAL_SOURCES` (from `referralSources.js`) and nullify `referralSourceOther` when source ≠ `other`.

```javascript
/**
 * @typedef {Object} PacoRegistrationInput
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'male'|'female'} gender
 * @property {'under_35'|'over_35'} ageProfile
 * @property {string} city
 * @property {string} countryId
 * @property {string} professionalStatus
 * @property {string} organizationName
 * @property {boolean} recordingConsent
 * @property {number} sessionEdition
 * @property {'ifdd_website'|'ifdd_linkedin'|'ifdd_facebook'|'ifdd_x'|'email_newsletter'|'other'} referralSource
 * @property {string|null} [referralSourceOther]
 */
```

## 4. Migration order (deploy lockstep)

Because the RPC signatures change, the deploy order MUST be:

1. Apply SQL migration `006_paco_referral_source.sql` (adds columns + CHECKs).
2. Apply updated `rpc_register_paco_quick.sql` (drops old, creates v4).
3. Apply updated `rpc_register_paco_fallback.sql` (drops old, creates v2).
4. Deploy the front-end build (updated `PacoQuickRegister.vue`, composables, admin).

Running step 4 before steps 2–3 will raise "function does not exist" errors because the new client passes 13 params to `register_paco_quick` while the DB still exposes 11. Running steps 2–3 before step 4 is safe: the DB accepts the new signature and the old front-end bundle simply stops working (calls with 11 params fail), so the window must be minimised.

## 5. Rollback

If the deploy fails:
1. Re-deploy the previous front-end bundle.
2. Re-apply the previous RPC definitions from `rpc_register_paco_quick.sql` v3.1 and `rpc_register_paco_fallback.sql` v1 (kept in git history).
3. Columns can stay in place (nullable, zero harm). If required by policy, run the ROLLBACK block at the end of `006_paco_referral_source.sql`.
