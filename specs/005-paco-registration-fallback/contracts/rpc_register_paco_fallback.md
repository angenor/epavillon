# Contract — RPC `register_paco_fallback`

**Feature** : `005-paco-registration-fallback`
**Type** : Supabase RPC (Postgres function), `SECURITY DEFINER`
**Accessible par** : `anon`, `authenticated`
**Fichier d'implémentation** : `bank/shema_et_requettes/rpc_register_paco_fallback.sql`

---

## Objectif

Enregistrer une **inscription de secours PACO** lorsque l'appel à `register_paco_quick` a échoué techniquement côté client. Garantit l'idempotence et ne dégrade jamais une inscription standard existante.

---

## Signature

```sql
public.register_paco_fallback(
  p_email TEXT,
  p_session_edition INTEGER,
  p_fallback_payload JSONB,
  p_error_message TEXT
) RETURNS UUID
```

### Paramètres

| Nom | Type | Requis | Description |
|---|---|---|---|
| `p_email` | `TEXT` | ✅ | Email saisi par l'utilisateur. Normalisé en `LOWER(TRIM(...))` avant stockage dans `guest_email`. Doit être non vide. |
| `p_session_edition` | `INTEGER` | ✅ | Numéro de la session PACO ciblée (1, 2, …). |
| `p_fallback_payload` | `JSONB` | ✅ | Payload intégral du formulaire, structuré selon §1.1 de [data-model.md](../data-model.md). Doit contenir au minimum les clés `firstName`, `lastName`, `email`. |
| `p_error_message` | `TEXT` | ✅ | Message d'erreur technique capté par le `try/catch` du composable client. Peut être long (aucune limite imposée ; TEXT Postgres). |

### Retour

- `UUID` : identifiant de la ligne `activity_registrations` (nouvellement insérée, existante mise à jour, ou existante non modifiée selon les règles ci-dessous).

### Erreurs

| Code/Exception | Condition | Comportement attendu côté client |
|---|---|---|
| `fallback_invalid_payload` | `p_fallback_payload` ne contient pas `firstName` ou `lastName` non vides | Le composable bascule en **mode localStorage-only** (voir R7 dans [research.md](../research.md)). |
| `23503` (foreign_key_violation) ou autre erreur Postgres inattendue | Panne infrastructure grave | Idem : bascule en localStorage-only. |

---

## Comportement

### Cas A — Aucune ligne existante pour `(activity, email, session)`

1. INSERT dans `activity_registrations` :
   - `activity_id = '00000000-0000-4000-a000-00000000a002'` (PACO_ACTIVITY_ID)
   - `session_edition = p_session_edition`
   - `registration_type = 'guest'`
   - `guest_email = LOWER(TRIM(p_email))`
   - `guest_first_name = TRIM(p_fallback_payload->>'firstName')`
   - `guest_last_name = TRIM(p_fallback_payload->>'lastName')`
   - `guest_organization = NULLIF(TRIM(p_fallback_payload->>'organization'), '')`
   - `guest_country_id = (p_fallback_payload->>'countryId')::UUID` (NULL si absent/invalide)
   - `fallback_payload = p_fallback_payload`
   - `fallback_error = p_error_message`
   - `user_id = NULL`
2. **Aucune** insertion dans `paco_demographic_data` (les données restent uniquement dans `fallback_payload.demographic`).
3. RETURN nouvel UUID.

### Cas B — Ligne existante avec `fallback_payload IS NOT NULL` (retry de secours)

1. UPDATE la ligne existante :
   - `fallback_payload = p_fallback_payload` (dernière version)
   - `fallback_error = p_error_message` (dernier message)
   - `guest_first_name`, `guest_last_name`, `guest_organization`, `guest_country_id` mis à jour depuis le payload
   - `registration_date`, `recovered_at` **préservés**
2. RETURN UUID existant.

### Cas C — Ligne existante avec `fallback_payload IS NULL` (inscription standard déjà là)

1. **Aucune modification** de la ligne — protection anti-dégradation.
2. RETURN UUID existant (le client considère alors l'utilisateur comme déjà inscrit en standard, pas de fallback).

---

## Garanties

| Propriété | Garantie par |
|---|---|
| Atomicité | Une seule instruction `INSERT … ON CONFLICT DO UPDATE WHERE fallback_payload IS NOT NULL` |
| Idempotence | Unicité `(activity, email, session)` via index existant + UPSERT |
| Anti-dégradation | Clause `WHERE activity_registrations.fallback_payload IS NOT NULL` dans le `DO UPDATE` |
| Pas de double comptage | Index UNIQUE partiel existant |

---

## Contrat de test (Phase 2 — pour `tasks.md`)

### Test 1 — Première tentative de secours (Cas A)

**Setup** : aucune ligne `activity_registrations` pour `(PACO_ACTIVITY_ID, 'test@example.org', 2)`.

**Action** : appeler `register_paco_fallback('test@example.org', 2, <payload valide>, 'NetworkError: failed to fetch')`.

**Assertions** :
- Retourne un UUID non-NULL.
- Une ligne existe avec `fallback_payload IS NOT NULL`, `fallback_error = 'NetworkError: failed to fetch'`, `recovered_at IS NULL`.
- `guest_email = 'test@example.org'`, `guest_first_name`, `guest_last_name` extraits du payload.
- `COUNT(*) WHERE activity_id = PACO ET session_edition = 2` a augmenté de 1.

### Test 2 — Retry de secours (Cas B)

**Setup** : une ligne existe avec `fallback_payload = {v1}`, `fallback_error = 'Error A'`.

**Action** : appeler `register_paco_fallback('test@example.org', 2, {v2}, 'Error B')`.

**Assertions** :
- Retourne le même UUID que la ligne existante.
- `fallback_payload = {v2}`, `fallback_error = 'Error B'`.
- `COUNT(*)` n'a pas changé (pas de doublon).
- `registration_date` n'a pas changé.

### Test 3 — Protection anti-dégradation (Cas C)

**Setup** : une ligne standard existe (`fallback_payload IS NULL`, démographiques insérées).

**Action** : appeler `register_paco_fallback('test@example.org', 2, <payload>, 'Erreur imprévue')`.

**Assertions** :
- Retourne l'UUID de la ligne standard existante.
- `fallback_payload IS NULL` (inchangé).
- `fallback_error IS NULL` (inchangé).
- Les données démographiques sont inchangées dans `paco_demographic_data`.

### Test 4 — Payload invalide

**Action** : appeler `register_paco_fallback('test@example.org', 2, '{}'::JSONB, 'err')`.

**Assertions** : erreur Postgres `fallback_invalid_payload` levée (ou équivalent `RAISE EXCEPTION`).

---

## Sécurité

- `SECURITY DEFINER` + `SET search_path = public` pour bypasser les RLS en mode anon (identique à `register_paco_quick`).
- Pas de jointure sur d'autres tables : minimise la surface d'attaque.
- `GRANT EXECUTE` à `anon` et `authenticated`.
- Aucun SELECT arbitraire basé sur des entrées utilisateur — lookup strict sur `activity_id`, `guest_email`, `session_edition`.
