# Data Model: Formulaire d'inscription PACO et Statistiques Admin

**Branch**: `003-paco-registration-stats` | **Date**: 2026-03-05

## New Entity: paco_demographic_data

Table dédiée aux données démographiques des inscrits PACO. Liée 1:1 à `activity_registrations`.

### Schema

| Column               | Type         | Nullable | Default | Constraints                                      |
| -------------------- | ------------ | -------- | ------- | ------------------------------------------------ |
| id                   | UUID         | NOT NULL | uuid_generate_v4() | PRIMARY KEY                            |
| registration_id      | UUID         | NOT NULL | —       | FK → activity_registrations(id) ON DELETE CASCADE, UNIQUE |
| gender               | TEXT         | NOT NULL | —       | CHECK (gender IN ('male', 'female'))             |
| age_profile          | TEXT         | NOT NULL | —       | CHECK (age_profile IN ('over_35', 'under_35'))   |
| city                 | TEXT         | NOT NULL | —       |                                                  |
| country_id           | UUID         | NOT NULL | —       | FK → countries(id)                               |
| professional_status  | TEXT         | NOT NULL | —       | CHECK (professional_status IN ('employed', 'student', 'unemployed', 'entrepreneur')) |
| organization         | TEXT         | NULL     | NULL    |                                                  |
| recording_consent    | BOOLEAN      | NOT NULL | —       | CHECK (recording_consent = true)                 |
| created_at           | TIMESTAMPTZ  | NOT NULL | NOW()   |                                                  |

### Design Notes

- **Valeurs stockées en anglais** (`male`/`female`, `over_35`/`under_35`, etc.) pour la cohérence avec le reste du schéma. L'affichage en français/anglais se fait via i18n côté frontend.
- **`country_id`** réutilise la table `countries` existante (même composable `useCountries()`). Note : `activity_registrations` a déjà un champ `guest_country_id` mais il n'est pas utilisé pour les inscriptions PACO de type `user`.
- **`recording_consent`** est contraint à `true` — le formulaire ne permet pas de soumettre sans consentement, et la DB l'enforce en dernier recours.
- **`registration_id` UNIQUE** — relation 1:1, une seule entrée démographique par inscription.
- **ON DELETE CASCADE** — si l'inscription est supprimée, les données démographiques le sont aussi.

### Relationships

```
activity_registrations (existing)
  ├── id (PK)
  ├── activity_id → activities(id)
  ├── user_id → users(id)
  └── ...
        │
        │ 1:1
        ▼
paco_demographic_data (new)
  ├── id (PK)
  ├── registration_id (FK, UNIQUE) → activity_registrations(id)
  ├── country_id (FK) → countries(id)
  └── ...
```

### Row Level Security (RLS)

```
Policy: "Users can insert own demographic data"
  - Operation: INSERT
  - Check: registration_id belongs to current user
    (SELECT user_id FROM activity_registrations WHERE id = registration_id) = auth.uid()

Policy: "Admins can read all demographic data"
  - Operation: SELECT
  - Check: user has role 'admin' or 'super_admin'

Policy: "Users can read own demographic data"
  - Operation: SELECT
  - Check: registration_id belongs to current user
```

### Migration SQL

```sql
-- File: bank/shema_et_requettes/paco_demographic_data.sql

CREATE TABLE public.paco_demographic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL UNIQUE
        REFERENCES public.activity_registrations(id) ON DELETE CASCADE,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    age_profile TEXT NOT NULL CHECK (age_profile IN ('over_35', 'under_35')),
    city TEXT NOT NULL,
    country_id UUID NOT NULL REFERENCES public.countries(id),
    professional_status TEXT NOT NULL
        CHECK (professional_status IN ('employed', 'student', 'unemployed', 'entrepreneur')),
    organization TEXT,
    recording_consent BOOLEAN NOT NULL CHECK (recording_consent = true),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.paco_demographic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own paco demographic data"
ON public.paco_demographic_data FOR INSERT
WITH CHECK (
    (SELECT user_id FROM public.activity_registrations WHERE id = registration_id) = auth.uid()
);

CREATE POLICY "Users can read own paco demographic data"
ON public.paco_demographic_data FOR SELECT
USING (
    (SELECT user_id FROM public.activity_registrations WHERE id = registration_id) = auth.uid()
);

CREATE POLICY "Admins can read all paco demographic data"
ON public.paco_demographic_data FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Index for join performance
CREATE INDEX idx_paco_demographic_registration
ON public.paco_demographic_data(registration_id);

-- CLEANUP (run after the event to remove PACO demographic data)
-- DROP TABLE IF EXISTS public.paco_demographic_data;
```

## Existing Entities (unchanged)

### activity_registrations

Aucune modification structurelle. Les inscriptions PACO continuent d'utiliser `activity_id = PACO_ACTIVITY_ID` et `user_id`. Les données démographiques sont dans la table séparée `paco_demographic_data`.

### countries

Aucune modification. Réutilisé tel quel via `country_id` dans `paco_demographic_data`.

### users

Aucune modification. Le profil utilisateur (prénom, nom, email) est récupéré via la jointure existante `activity_registrations.user_id → users.id`.

## Query Patterns

### Statistiques agrégées (admin)

```sql
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE d.gender = 'male') AS male_count,
    COUNT(*) FILTER (WHERE d.gender = 'female') AS female_count,
    COUNT(*) FILTER (WHERE d.age_profile = 'under_35') AS under_35_count,
    COUNT(*) FILTER (WHERE d.age_profile = 'over_35') AS over_35_count,
    COUNT(*) FILTER (WHERE d.professional_status = 'student') AS student_count,
    COUNT(*) FILTER (WHERE d.professional_status = 'employed') AS employed_count,
    COUNT(*) FILTER (WHERE d.professional_status = 'entrepreneur') AS entrepreneur_count,
    COUNT(*) FILTER (WHERE d.professional_status = 'unemployed') AS unemployed_count
FROM public.activity_registrations ar
JOIN public.paco_demographic_data d ON d.registration_id = ar.id
WHERE ar.activity_id = 'PACO_ACTIVITY_ID';
```

### Liste détaillée (admin)

```sql
SELECT
    u.first_name, u.last_name, u.email,
    d.gender, d.age_profile, d.city,
    c.name_fr AS country,
    d.professional_status, d.organization,
    ar.registration_date
FROM public.activity_registrations ar
JOIN public.users u ON u.id = ar.user_id
LEFT JOIN public.paco_demographic_data d ON d.registration_id = ar.id
LEFT JOIN public.countries c ON c.id = d.country_id
WHERE ar.activity_id = 'PACO_ACTIVITY_ID'
ORDER BY ar.registration_date DESC;
```

Note: `LEFT JOIN` sur `paco_demographic_data` pour inclure les inscriptions antérieures sans données démographiques.
