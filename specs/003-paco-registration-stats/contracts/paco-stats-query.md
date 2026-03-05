# Contract: Query PACO Statistics & Registrant List

**Type**: Supabase client queries (frontend → Supabase)
**Tables**: `activity_registrations`, `paco_demographic_data`, `users`, `countries`
**Auth**: Admin role required (RLS enforced)

## 1. Aggregate Statistics

```javascript
const { data, error } = await supabase
  .from('activity_registrations')
  .select(`
    id,
    paco_demographic_data (
      gender,
      age_profile,
      professional_status
    )
  `)
  .eq('activity_id', PACO_ACTIVITY_ID)
```

**Processing** (client-side):
- Total inscrits = `data.length`
- Filtered demographic entries = entries with `paco_demographic_data` not null
- Percentages calculated from filtered count only

**Response shape**:
```javascript
{
  total: 150,
  withDemographics: 142,
  gender: { male: 55.6, female: 44.4 },
  ageProfile: { under35: 38.0, over35: 62.0 },
  professionalStatus: { employed: 40.1, student: 25.4, entrepreneur: 22.5, unemployed: 12.0 }
}
```

## 2. Detailed Registrant List

```javascript
const { data, error } = await supabase
  .from('activity_registrations')
  .select(`
    id,
    registration_date,
    users (
      first_name,
      last_name,
      email
    ),
    paco_demographic_data (
      gender,
      age_profile,
      city,
      country_id,
      countries ( name_fr, name_en ),
      professional_status,
      organization
    )
  `)
  .eq('activity_id', PACO_ACTIVITY_ID)
  .order('registration_date', { ascending: false })
```

**Response shape** (per row):
```javascript
{
  id: 'uuid',
  registration_date: '2026-03-05T10:30:00Z',
  users: { first_name: 'Jean', last_name: 'Dupont', email: 'jean@example.com' },
  paco_demographic_data: {
    gender: 'male',
    age_profile: 'over_35',
    city: 'Dakar',
    country_id: 'uuid',
    countries: { name_fr: 'Sénégal', name_en: 'Senegal' },
    professional_status: 'employed',
    organization: 'IFDD'
  } // or null for legacy registrations
}
```

## 3. CSV Export

**Type**: Client-side generation (no server contract)

Columns: Prénom, Nom, Email, Genre, Profil d'âge, Ville, Pays, Statut professionnel, Organisation, Date d'inscription

Generated from the same data as the detailed list query above, transformed to CSV with BOM (`\uFEFF`) for Excel compatibility.
