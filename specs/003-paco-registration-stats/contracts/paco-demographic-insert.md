# Contract: Insert PACO Demographic Data

**Type**: Supabase client insert (frontend → Supabase)
**Table**: `paco_demographic_data`
**Auth**: Authenticated user (RLS enforced)

## Request

Triggered after successful `activity_registrations` insert in `registerForPaco()`.

```javascript
// After registerForPaco() returns the registration_id
const { error } = await supabase
  .from('paco_demographic_data')
  .insert({
    registration_id: registrationId,  // UUID from activity_registrations
    gender: 'male' | 'female',
    age_profile: 'over_35' | 'under_35',
    city: 'Dakar',                    // free text, trimmed
    country_id: 'uuid-of-country',    // from countries table
    professional_status: 'employed' | 'student' | 'unemployed' | 'entrepreneur',
    organization: 'IFDD' | null,      // optional
    recording_consent: true            // always true (enforced by form + DB)
  })
```

## Response

**Success**: `{ data: [...], error: null }`
**Failure cases**:
- `23503` (FK violation): `registration_id` doesn't exist in `activity_registrations`
- `23505` (unique violation): demographic data already exists for this registration
- `23514` (check violation): invalid value for gender, age_profile, or professional_status
- RLS denied: user doesn't own the registration

## Sequence

1. User submits registration form
2. `registerForPaco(userId)` inserts into `activity_registrations` → returns `registration_id`
3. `insertDemographicData(registrationId, formData)` inserts into `paco_demographic_data`
4. Both operations succeed → show confirmation
5. If step 3 fails → registration exists but without demographic data (graceful degradation)

## Notes

- `registerForPaco()` must be modified to return the `registration_id` (currently returns only boolean).
- The two inserts are sequential, not transactional. If demographic insert fails, the activity registration remains valid. This is acceptable because the demographic data is supplementary.
