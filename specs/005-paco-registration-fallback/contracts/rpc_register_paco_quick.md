# Contract — RPC `register_paco_quick` (version modifiée)

**Feature** : `005-paco-registration-fallback`
**Type** : Supabase RPC (Postgres function), `SECURITY DEFINER` — **signature inchangée**
**Accessible par** : `anon`, `authenticated`
**Fichier d'implémentation** : `bank/shema_et_requettes/rpc_register_paco_quick.sql` (remplacement)

---

## Changements par rapport à la version actuelle

Cette contrat documente uniquement la **nouvelle logique de promotion**. Le reste de la fonction (insertion standard, validation, signature) reste identique à la version `v2 (2026-04-09)` existante.

---

## Signature (inchangée)

```sql
public.register_paco_quick(
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
  p_session_edition INTEGER DEFAULT 2
) RETURNS UUID
```

---

## Comportement (trois branches)

### Branche 1 — Nouvelle inscription (aucune ligne existante)

**Inchangé** par rapport à la version actuelle :
1. INSERT dans `activity_registrations` avec `fallback_payload IS NULL, fallback_error IS NULL`.
2. INSERT dans `paco_demographic_data`.
3. RETURN nouvel UUID.

### Branche 2 — Inscription standard déjà présente (`fallback_payload IS NULL`)

**Inchangé** par rapport à la version actuelle :
1. Lookup sur `(activity_id, guest_email OR user.email, session_edition)`.
2. Si une ligne existe, RETURN son UUID **sans modification**.

### Branche 3 — Inscription de secours existante (`fallback_payload IS NOT NULL`) — **NOUVEAU**

Lorsqu'un retry de `register_paco_quick` réussit pour un `(email, session)` qui avait précédemment une ligne de secours :

1. UPDATE `activity_registrations`:
   - `fallback_payload = NULL`
   - `fallback_error = NULL`
   - `guest_first_name = TRIM(p_first_name)`
   - `guest_last_name = TRIM(p_last_name)`
   - `guest_organization = NULLIF(TRIM(p_organization), '')`
   - `guest_country_id = p_country_id`
   - `registration_type = 'guest'`
   - `registration_date` **préservé** (garde la date de la toute première tentative)
   - `recovered_at` **préservé** (peut rester NULL ou non selon l'état)
2. INSERT ou UPSERT dans `paco_demographic_data` :
   - `ON CONFLICT (registration_id) DO UPDATE SET gender = EXCLUDED.gender, age_profile = EXCLUDED.age_profile, …`
   - **Prérequis** : `paco_demographic_data` doit avoir `registration_id` en PK ou UNIQUE (à valider en phase d'implémentation).
3. RETURN UUID existant.

---

## Garanties

| Propriété | Garantie par |
|---|---|
| Atomicité | `FOR UPDATE` sur le SELECT + UPDATE dans la même transaction plpgsql |
| Idempotence | Lookup `(email, session)` avant toute mutation |
| Promotion sans double comptage | Réutilisation de l'UUID existant, pas d'INSERT parallèle |
| Préservation historique | `registration_date` et `recovered_at` non modifiés en branche 3 |

---

## Contrat de test (Phase 2 — pour `tasks.md`)

### Test 1 — Première inscription (Branche 1, non-régression)

**Setup** : aucune ligne pour `(PACO, 'test@example.org', 2)`.

**Action** : appeler `register_paco_quick('test@example.org', 'Jean', 'Dupont', 'male', 'over_35', 'Dakar', <country_id>, 'employed', 'IFDD', true, 2)`.

**Assertions** :
- Retourne un UUID non-NULL.
- Ligne avec `fallback_payload IS NULL`, `fallback_error IS NULL`.
- `paco_demographic_data` contient une ligne liée.

### Test 2 — Retry après inscription standard (Branche 2, non-régression)

**Setup** : une ligne standard existe déjà.

**Action** : appeler à nouveau `register_paco_quick(...)` avec le même email/session.

**Assertions** :
- Retourne le même UUID.
- `COUNT(*)` n'a pas changé.
- Les champs guest_* et `paco_demographic_data` ne sont pas modifiés.

### Test 3 — Promotion d'une inscription de secours (Branche 3, NOUVEAU)

**Setup** :
- Une ligne existe avec `fallback_payload = {firstName: 'Jean', lastName: 'Dupond', …}`, `fallback_error = 'Error X'`, `recovered_at = NULL`.
- Aucune ligne dans `paco_demographic_data` pour cette inscription.

**Action** : appeler `register_paco_quick('test@example.org', 'Jean', 'Dupont', 'male', 'over_35', 'Dakar', <country_id>, 'employed', 'IFDD', true, 2)` (note : nom corrigé « Dupond » → « Dupont »).

**Assertions** :
- Retourne le même UUID que la ligne existante.
- `fallback_payload IS NULL`, `fallback_error IS NULL` (nettoyés).
- `guest_last_name = 'Dupont'` (mis à jour).
- `registration_date` préservé.
- `recovered_at` toujours NULL.
- `paco_demographic_data` contient maintenant une ligne liée avec les bonnes données.

### Test 4 — Promotion après rattrapage admin

**Setup** : ligne de secours avec `recovered_at = '2026-04-15 10:00:00+00'`.

**Action** : retry `register_paco_quick(...)` réussi.

**Assertions** :
- `fallback_payload IS NULL`, `fallback_error IS NULL`.
- `recovered_at` toujours `'2026-04-15 10:00:00+00'` (préservé malgré la promotion).

---

## Sécurité (inchangée)

- `SECURITY DEFINER` + `SET search_path = public`.
- `GRANT EXECUTE` à `anon` et `authenticated`.
- Normalisation email `LOWER(TRIM(...))` inchangée.
