# Contrat: RPC `register_paco_quick`

## Signature mise à jour

```sql
CREATE OR REPLACE FUNCTION public.register_paco_quick(
  p_email              TEXT,
  p_first_name         TEXT,
  p_last_name          TEXT,
  p_gender             TEXT,
  p_age_profile        TEXT,
  p_city               TEXT,
  p_country_id         UUID,
  p_professional_status TEXT,
  p_organization       TEXT,
  p_recording_consent  BOOLEAN,
  p_session_edition    INTEGER DEFAULT 2   -- NOUVEAU
)
RETURNS UUID
```

## Comportement

1. Vérifier si l'email est déjà inscrit **pour cette session** (`activity_id` + `session_edition`)
2. Si déjà inscrit → retourner l'ID existant (sans erreur)
3. Sinon → insérer dans `activity_registrations` avec `session_edition = p_session_edition`
4. Insérer les données démographiques dans `paco_demographic_data`
5. Retourner l'UUID de l'inscription

## Changement clé vs version précédente

- Ajout du paramètre `p_session_edition INTEGER DEFAULT 2`
- La vérification d'unicité filtre maintenant par `session_edition`
- Un même email peut être inscrit à plusieurs sessions distinctes
