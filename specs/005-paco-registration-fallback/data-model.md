# Data Model — Inscription PACO non bloquante avec récupération des échecs

**Feature** : `005-paco-registration-fallback`
**Date** : 2026-04-10

---

## Vue d'ensemble

Trois nouvelles colonnes sont ajoutées à la table existante [`activity_registrations`](../../bank/shema_et_requettes/database_complete.sql#L413-L453). Aucune nouvelle table, aucun nouvel enum, aucun nouvel index UNIQUE (l'index partiel existant `activity_registrations_guest_session_unique` suffit).

Deux fonctions RPC sont touchées :
- `register_paco_quick` (existante) : modifiée pour supporter la **promotion** d'une ligne de secours en inscription standard via UPSERT.
- `register_paco_fallback` (nouvelle) : enregistre une ligne de secours via UPSERT en cas d'échec technique de `register_paco_quick`.

---

## 1. Entités

### 1.1 `activity_registrations` (table existante, étendue)

#### Colonnes ajoutées

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `fallback_payload` | `JSONB` | `NULL` | Payload intégral du formulaire PACO au moment de l'échec technique. `NULL` pour une inscription standard ; renseigné pour une inscription de secours. |
| `fallback_error` | `TEXT` | `NULL` | Message d'erreur technique d'origine (capture du `error.message` ou équivalent côté client/RPC). `NULL` pour une inscription standard. |
| `recovered_at` | `TIMESTAMPTZ` | `NULL` | Horodatage du rattrapage manuel par l'équipe IFDD (envoi du lien, correction des données). `NULL` = non rattrapée. |

#### Critère d'identification

Une ligne est considérée comme **inscription de secours** si et seulement si :

```sql
fallback_payload IS NOT NULL
```

Aucun enum, statut ou booléen n'est introduit.

#### Contraintes et index (inchangés)

L'index partiel existant [`activity_registrations_guest_session_unique`](../../bank/shema_et_requettes/database_complete.sql#L460-L462) couvre déjà le besoin d'unicité pour les guests PACO :

```sql
CREATE UNIQUE INDEX activity_registrations_guest_session_unique
    ON public.activity_registrations(activity_id, guest_email, session_edition)
    WHERE guest_email IS NOT NULL AND user_id IS NULL;
```

Les inscriptions PACO sont **toujours guest** (`user_id IS NULL`, `guest_email IS NOT NULL`, `registration_type = 'guest'`), donc cet index garantit qu'il n'existe **qu'une seule ligne par** `(activity_id, guest_email, session_edition)`.

Un nouvel index partiel est ajouté pour accélérer les requêtes admin filtrant les inscriptions de secours non rattrapées :

```sql
CREATE INDEX activity_registrations_fallback_pending_idx
    ON public.activity_registrations(activity_id, session_edition)
    WHERE fallback_payload IS NOT NULL AND recovered_at IS NULL;
```

#### Structure du JSON `fallback_payload`

```json
{
  "email": "participant@example.org",
  "firstName": "Jean",
  "lastName": "Dupont",
  "organization": "IFDD",
  "sessionEdition": 2,
  "countryId": "uuid-country",
  "demographic": {
    "gender": "male",
    "ageProfile": "over_35",
    "city": "Dakar",
    "professionalStatus": "employed",
    "organization": "IFDD",
    "recordingConsent": true
  },
  "capturedAt": "2026-04-30T13:45:12.345Z",
  "clientVersion": "paco-fallback-v1"
}
```

**Règles** :
- Tous les champs passés au formulaire [PacoQuickRegister.vue](../../src/components/paco/PacoQuickRegister.vue) sont présents, **sans transformation** (pas de trim côté client autre que celui appliqué avant envoi).
- `capturedAt` est l'horodatage ISO-8601 du moment où l'échec est détecté côté client.
- `clientVersion` identifie la version du client qui a produit le payload, pour le diagnostic.
- L'email est stocké **tel que saisi** dans le JSON (la normalisation `LOWER(TRIM(...))` est appliquée uniquement dans la colonne `guest_email`, pour préserver la valeur originale dans le payload).

#### Transitions d'état (cycle de vie)

```
                          ┌──────────────────────────┐
                          │ [aucune ligne]           │
                          └─────────────┬────────────┘
                                        │
                ┌───────────────────────┼─────────────────────────────┐
                │                       │                             │
    success register_paco_quick        │           error register_paco_quick
                │                       │                             │
                ▼                       │                             ▼
     ┌────────────────────┐             │              ┌─────────────────────────┐
     │ STANDARD           │             │              │ FALLBACK                │
     │ fallback_payload   │             │              │ fallback_payload = JSON │
     │     = NULL         │             │              │ fallback_error  = msg   │
     │ recovered_at = NULL│             │              │ recovered_at  = NULL    │
     └─────────┬──────────┘             │              └───────────┬─────────────┘
               │                        │                          │
               │                        │                          │
               │                        │       retry register_paco_quick succeeds
               │                        │                          │
               │                        │                          ▼
               │                        │       ┌─────────────────────────────────┐
               │                        └──────►│ STANDARD (promoted)             │
               │                                │ fallback_payload = NULL         │
               │                                │ fallback_error   = NULL         │
               │                                │ recovered_at     = PRESERVED    │
               │                                └────────────┬────────────────────┘
               │                                             │
               │                                             │
               │                admin marks recovered        │  admin marks recovered
               │                                             │
               ▼                                             ▼
    ┌────────────────────────┐         ┌────────────────────────────────────┐
    │ STANDARD RECOVERED     │         │ FALLBACK RECOVERED                 │
    │ recovered_at = NOW()   │         │ fallback_payload / fallback_error  │
    │ (rare — utile si       │         │   preserved                        │
    │  l'admin veut marquer  │         │ recovered_at  = NOW()              │
    │  une action manuelle)  │         │                                    │
    └────────────────────────┘         └────────────────────────────────────┘
```

**Règle de promotion (critique)** :
Lorsque `register_paco_quick` réussit pour un `(email, session)` ayant déjà une ligne avec `fallback_payload IS NOT NULL`, la ligne est *promue* :
- `fallback_payload` → `NULL`
- `fallback_error` → `NULL`
- Les champs `guest_*` et la ligne `paco_demographic_data` sont renseignés correctement.
- `recovered_at` est **préservé** si déjà renseigné.
- `registration_date` est **préservé** (on garde la date de la toute première tentative).

**Règle inverse (protection)** :
`register_paco_fallback` ne doit jamais dégrader une ligne standard (`fallback_payload IS NULL`) en ligne de secours. Si un tel conflit survient, la RPC retourne l'ID existant sans modification.

---

### 1.2 `paco_demographic_data` (table existante, inchangée)

Aucune modification de schéma. Le comportement change :
- En mode secours (`register_paco_fallback`), **aucune** ligne n'est insérée dans `paco_demographic_data`. Les données démographiques restent uniquement dans `fallback_payload.demographic`.
- Lors d'une promotion (voir plus haut), `register_paco_quick` insère les données démographiques à partir des champs passés en paramètre — comportement identique à aujourd'hui. Le système n'exploite pas automatiquement `fallback_payload.demographic` lors de la promotion car `register_paco_quick` reçoit déjà les champs démographiques en paramètres.

---

## 2. Migration SQL

**Fichier cible** : `bank/shema_et_requettes/005_paco_registration_fallback.sql`

```sql
-- =============================================
-- Feature 005: Inscription PACO non bloquante avec recuperation des echecs
-- Ajoute les colonnes fallback_payload, fallback_error, recovered_at
-- a activity_registrations pour supporter le mode "inscription de secours".
-- =============================================

BEGIN;

-- 1. Ajout des colonnes (idempotent)
ALTER TABLE public.activity_registrations
    ADD COLUMN IF NOT EXISTS fallback_payload JSONB,
    ADD COLUMN IF NOT EXISTS fallback_error TEXT,
    ADD COLUMN IF NOT EXISTS recovered_at TIMESTAMPTZ;

COMMENT ON COLUMN public.activity_registrations.fallback_payload IS
    'Payload JSON integral du formulaire soumis lorsque l''inscription standard a echoue techniquement. NULL pour une inscription standard. Une ligne est consideree "de secours" si fallback_payload IS NOT NULL.';

COMMENT ON COLUMN public.activity_registrations.fallback_error IS
    'Message d''erreur technique d''origine capture au moment de l''echec. NULL pour une inscription standard.';

COMMENT ON COLUMN public.activity_registrations.recovered_at IS
    'Horodatage du rattrapage manuel par l''equipe (envoi du lien, correction des donnees). NULL = non rattrapee.';

-- 2. Index partiel pour les requetes admin "inscriptions de secours a rattraper"
CREATE INDEX IF NOT EXISTS activity_registrations_fallback_pending_idx
    ON public.activity_registrations(activity_id, session_edition)
    WHERE fallback_payload IS NOT NULL AND recovered_at IS NULL;

COMMIT;
```

**Rollback** (pour `database_complete.sql` snapshot) :

```sql
BEGIN;
DROP INDEX IF EXISTS public.activity_registrations_fallback_pending_idx;
ALTER TABLE public.activity_registrations
    DROP COLUMN IF EXISTS recovered_at,
    DROP COLUMN IF EXISTS fallback_error,
    DROP COLUMN IF EXISTS fallback_payload;
COMMIT;
```

**Mise à jour requise** : `bank/shema_et_requettes/database_complete.sql` doit refléter l'ajout des trois colonnes dans la déclaration de `activity_registrations` (principe V de la constitution).

---

## 3. RPC — `register_paco_fallback` (nouvelle)

**Fichier cible** : `bank/shema_et_requettes/rpc_register_paco_fallback.sql`

### Signature

```sql
CREATE OR REPLACE FUNCTION public.register_paco_fallback(
  p_email TEXT,
  p_session_edition INTEGER,
  p_fallback_payload JSONB,
  p_error_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### Invariants

- **Idempotent** par `(activity_id, email, session_edition)` : retries successifs mettent à jour la ligne existante sans créer de doublon.
- **Protection anti-dégradation** : si une ligne existe déjà avec `fallback_payload IS NULL` (inscription standard), la RPC retourne l'UUID sans rien modifier.
- **Normalisation email** : `guest_email` est stocké en `LOWER(TRIM(p_email))`.
- **Extraction guest_\* depuis le payload** : `guest_first_name` et `guest_last_name` sont extraits de `p_fallback_payload` pour satisfaire la contrainte `check_guest_data`.
- **SECURITY DEFINER** : accessible par `anon` et `authenticated`.

### Pseudo-code

```
1. Normaliser email: v_email := LOWER(TRIM(p_email))
2. Extraire v_first_name, v_last_name, v_organization, v_country_id depuis p_fallback_payload
3. Vérifier que v_first_name et v_last_name ne sont pas NULL (sinon RAISE EXCEPTION 'fallback_invalid_payload')
4. SELECT id, fallback_payload INTO v_existing_id, v_existing_payload
   FROM activity_registrations
   WHERE activity_id = PACO_ACTIVITY_ID
     AND guest_email = v_email
     AND session_edition = p_session_edition
     AND user_id IS NULL
   FOR UPDATE
5. IF v_existing_id IS NOT NULL AND v_existing_payload IS NULL THEN
     -- Ligne standard déjà présente — ne jamais dégrader
     RETURN v_existing_id
   END IF
6. INSERT INTO activity_registrations (...) VALUES (...)
   ON CONFLICT (activity_id, guest_email, session_edition) WHERE guest_email IS NOT NULL AND user_id IS NULL
   DO UPDATE SET
       fallback_payload = EXCLUDED.fallback_payload,
       fallback_error = EXCLUDED.fallback_error,
       guest_first_name = EXCLUDED.guest_first_name,
       guest_last_name = EXCLUDED.guest_last_name,
       guest_organization = EXCLUDED.guest_organization,
       guest_country_id = EXCLUDED.guest_country_id
     WHERE activity_registrations.fallback_payload IS NOT NULL
   RETURNING id INTO v_registration_id
7. RETURN v_registration_id
```

### GRANT

```sql
GRANT EXECUTE ON FUNCTION public.register_paco_fallback(TEXT, INTEGER, JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.register_paco_fallback(TEXT, INTEGER, JSONB, TEXT) TO authenticated;
```

---

## 4. RPC — `register_paco_quick` (modifiée)

**Fichier cible** : `bank/shema_et_requettes/rpc_register_paco_quick.sql` (remplacement)

### Changements par rapport à la version actuelle

La fonction existante (signature inchangée) passe de **SELECT-then-INSERT** à **UPSERT avec promotion**. Cela garantit :
1. Si aucune ligne n'existe → INSERT standard (comportement actuel).
2. Si une ligne **standard** existe → RETURN ID existant (comportement actuel).
3. Si une ligne **de secours** existe → **promotion** en inscription standard (nouveau) :
   - `fallback_payload` et `fallback_error` mis à `NULL`
   - `guest_first_name`, `guest_last_name`, `guest_organization`, `guest_country_id` mis à jour
   - `recovered_at` préservé
   - `registration_date` préservé
   - `paco_demographic_data` inséré (ou `ON CONFLICT DO UPDATE` sur la PK `registration_id`)

### Pseudo-code (parties modifiées)

```
1. v_email := LOWER(TRIM(p_email))
2. SELECT id, fallback_payload INTO v_existing_id, v_existing_payload
   FROM activity_registrations
   WHERE activity_id = PACO_ACTIVITY_ID
     AND guest_email = v_email
     AND session_edition = p_session_edition
     AND user_id IS NULL
   FOR UPDATE
3. IF v_existing_id IS NOT NULL THEN
     IF v_existing_payload IS NULL THEN
       -- Déjà inscrit en standard
       RETURN v_existing_id
     ELSE
       -- Promotion: secours → standard
       UPDATE activity_registrations SET
         fallback_payload = NULL,
         fallback_error = NULL,
         guest_first_name = TRIM(p_first_name),
         guest_last_name = TRIM(p_last_name),
         guest_organization = NULLIF(TRIM(p_organization), ''),
         guest_country_id = p_country_id
       WHERE id = v_existing_id;

       -- Insertion/UPSERT des données démographiques
       INSERT INTO paco_demographic_data (registration_id, gender, age_profile, city, country_id,
                                          professional_status, organization, recording_consent)
       VALUES (v_existing_id, p_gender, p_age_profile, TRIM(p_city), p_country_id,
               p_professional_status, NULLIF(TRIM(p_organization), ''), p_recording_consent)
       ON CONFLICT (registration_id) DO UPDATE SET
         gender = EXCLUDED.gender,
         age_profile = EXCLUDED.age_profile,
         city = EXCLUDED.city,
         country_id = EXCLUDED.country_id,
         professional_status = EXCLUDED.professional_status,
         organization = EXCLUDED.organization,
         recording_consent = EXCLUDED.recording_consent;

       RETURN v_existing_id;
     END IF
   END IF
4. [suite: INSERT standard comme aujourd'hui]
```

**Prérequis à vérifier** : `paco_demographic_data` doit avoir une contrainte `UNIQUE (registration_id)` ou `PRIMARY KEY (registration_id)` pour supporter `ON CONFLICT`. À valider en phase d'implémentation via [paco_demographic_data.sql](../../bank/shema_et_requettes/paco_demographic_data.sql).

### GRANT

Inchangé — même signature, mêmes bénéficiaires (`anon`, `authenticated`).

---

## 5. Règles de validation (niveau base)

| Règle | Mécanisme | Portée |
|---|---|---|
| Unicité `(activity, email, session)` pour guests | Index partiel existant | Les deux RPC |
| `check_guest_data` (first/last name obligatoires) | Contrainte existante | `register_paco_fallback` extrait les noms depuis le payload |
| `check_user_or_guest` (user_id XOR guest_email) | Contrainte existante | Toujours `user_id IS NULL, guest_email IS NOT NULL` en PACO |
| Une inscription standard ne peut pas être « dégradée » en secours | Logique RPC + clause `WHERE … fallback_payload IS NOT NULL` dans `ON CONFLICT DO UPDATE` | `register_paco_fallback` |
| `recovered_at` ne peut pas précéder `registration_date` | Logique RPC (futur) — pas de contrainte SQL, validé par le flux de rattrapage | `markRegistrationRecovered` |

---

## 6. Impact sur les lectures existantes

### Requêtes inchangées (continuent de fonctionner)

- `fetchPacoStats` (compteur `total`) : reste `COUNT(*)` car unicité garantie.
- `fetchAllRegistrationDates` : les inscriptions de secours ont bien une `registration_date`.
- `deleteRegistrant` : fonctionne sur n'importe quelle ligne (standard ou secours).

### Requêtes à étendre

- `fetchPacoRegistrants` et `fetchAllRegistrantsForExport` : ajouter `fallback_payload`, `fallback_error`, `recovered_at` au `select()`, mapper `isFallback`, et fusionner les données démographiques manquantes depuis le JSON pour l'affichage.
- `fetchPacoStats` : ajouter deux compteurs dérivés dans `stats.value` :
  - `fallbackTotal` : `COUNT(*) WHERE fallback_payload IS NOT NULL`
  - `recoveredTotal` : `COUNT(*) WHERE recovered_at IS NOT NULL`

### Nouvelle mutation

- `markRegistrationRecovered(id)` : `UPDATE activity_registrations SET recovered_at = NOW() WHERE id = $1 AND fallback_payload IS NOT NULL`. Passe par l'API Supabase standard (RLS s'applique).

---

## 7. Impact sur les RLS

Les politiques RLS existantes sur `activity_registrations` doivent autoriser :
- **INSERT** : `anon` et `authenticated` (déjà autorisé pour le flux PACO guest via RPC `SECURITY DEFINER`).
- **UPDATE** : limiter `recovered_at` aux admins (via politique `auth.uid() IN admins` ou équivalent). À valider en phase d'implémentation : si aucune politique UPDATE n'existe pour les admins, il faudra en ajouter une couvrant au minimum la colonne `recovered_at` pour le rôle admin PACO.

**Point d'attention implémentation** : vérifier dans [`database_complete.sql`](../../bank/shema_et_requettes/database_complete.sql) les politiques RLS existantes sur `activity_registrations` et ajuster si nécessaire pour permettre au moins l'UPDATE de `recovered_at` par les admins authentifiés.

---

## 8. Récapitulatif FR → Data Model

| FR | Élément de data model couvrant l'exigence |
|---|---|
| FR-001 | Comportement du composable côté client (pas DB) |
| FR-002 | Colonnes `fallback_payload` + `fallback_error` ; RPC `register_paco_fallback` |
| FR-003 | Structure du JSON `fallback_payload` (§1.1) |
| FR-004 | Colonne `fallback_error` + `registration_date` existante |
| FR-005 | `COUNT(*)` inchangé (garantie par unicité) |
| FR-006 | Comportement client (pas DB) |
| FR-007 | UPSERT atomique + index partiel unique existant |
| FR-008 | Lookup `(activity_id, email, session_edition)` dans le composable |
| FR-009 | Règle de promotion dans `register_paco_quick` (§4) |
| FR-010 | Mapping `isFallback` côté composable stats |
| FR-011 | `select()` étendu pour inclure payload/error |
| FR-012 | Colonne `recovered_at` + mutation `markRegistrationRecovered` |
| FR-013 | Stratégie localStorage-only (R7) — pas de DB impliquée |
| FR-014 | Validation front-end inchangée |
| FR-015 | Clé `demographic` du JSON `fallback_payload` |
