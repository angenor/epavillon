# Deployment Notes — Feature 005: PACO Registration Fallback

**Feature** : `005-paco-registration-fallback`
**Date** : 2026-04-10
**Auteur** : Implementation session

---

## Ordre de deploiement (obligatoire)

Les scripts SQL doivent etre executes dans l'ordre suivant via le Supabase SQL Editor (projet prod) ou `psql`. Chaque script est idempotent et peut etre rejoue sans risque.

### 1. Migration des colonnes + index + policy UPDATE

```bash
# Fichier : bank/shema_et_requettes/005_paco_registration_fallback.sql
```

Contenu :
- Ajoute les colonnes `fallback_payload JSONB`, `fallback_error TEXT`, `recovered_at TIMESTAMPTZ` a `activity_registrations`.
- Cree l'index partiel `activity_registrations_fallback_pending_idx` sur les inscriptions de secours non rattrapees.
- Cree la policy RLS `"Admins can update activity registrations"` (roles `paco`, `admin`, `super_admin`).

**Verification post-deploiement** :
```sql
-- 1. Les colonnes existent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'activity_registrations'
  AND column_name IN ('fallback_payload', 'fallback_error', 'recovered_at');
-- Attendu : 3 lignes

-- 2. L'index partiel existe
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname = 'activity_registrations_fallback_pending_idx';
-- Attendu : 1 ligne

-- 3. La policy UPDATE existe
SELECT policyname FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'activity_registrations'
  AND cmd = 'UPDATE';
-- Attendu : 1 ligne ("Admins can update activity registrations")
```

### 2. Nouvelle RPC `register_paco_fallback`

```bash
# Fichier : bank/shema_et_requettes/rpc_register_paco_fallback.sql
```

Contenu :
- Cree la fonction `public.register_paco_fallback(TEXT, INTEGER, JSONB, TEXT) RETURNS UUID`.
- `SECURITY DEFINER` + `SET search_path = public`.
- `GRANT EXECUTE` a `anon` et `authenticated`.
- Idempotente par `(activity_id, guest_email, session_edition)`.
- Anti-degradation : ne remplace jamais une inscription standard existante.

**Verification post-deploiement** :
```sql
SELECT proname, pronargs, proargtypes::regtype[]
FROM pg_proc
WHERE proname = 'register_paco_fallback'
  AND pronamespace = 'public'::regnamespace;
-- Attendu : 1 ligne, 4 arguments (text, integer, jsonb, text)
```

### 3. RPC `register_paco_quick` v3 (logique de promotion)

```bash
# Fichier : bank/shema_et_requettes/rpc_register_paco_quick.sql
```

Contenu :
- Remplace la v2 existante (meme signature, 11 parametres).
- Ajoute la **Branche 3 (promotion)** : si une ligne de secours existe pour `(email, session)`, elle est nettoyee (`fallback_payload = NULL`, `fallback_error = NULL`) et les donnees demographiques sont upsert dans `paco_demographic_data`.
- `registration_date` et `recovered_at` sont **preserves** lors de la promotion.
- Utilise `SELECT FOR UPDATE` pour eviter les courses concurrentes avec `register_paco_fallback`.

**Verification post-deploiement** :
```sql
-- 1. La fonction existe avec la bonne signature
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'register_paco_quick'
  AND pronamespace = 'public'::regnamespace;
-- Attendu : 1 ligne, 11 arguments

-- 2. Le commentaire indique la version v3 avec promotion
SELECT obj_description(
  'public.register_paco_quick(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER)'::regprocedure
);
-- Attendu : mention "promotion d une inscription de secours (feature 005)"
```

---

## Tests de validation manuels (quickstart)

Apres le deploiement, executer les scenarios de `specs/005-paco-registration-fallback/quickstart.md` :

1. **Scenario 1** — Inscription standard reussie (Branche 1, non-regression).
2. **Scenario 2** — Inscription de secours quand RPC standard echoue (simulation : couper le reseau ou bloquer la RPC).
3. **Scenario 3** — Promotion : retry standard apres inscription de secours (Branche 3).
4. **Scenario 4** — Rattrapage admin : `markRegistrationRecovered(id)`.
5. **Scenario 5** — Anti-degradation : `register_paco_fallback` sur ligne standard ne degrade pas.

---

## Rollback

Si un probleme est detecte apres deploiement, les scripts peuvent etre annules :

```sql
BEGIN;

-- 1. Restaurer l'ancienne version de register_paco_quick (v2)
--    depuis le commit precedent dans git :
--    git show HEAD~1:bank/shema_et_requettes/rpc_register_paco_quick.sql
-- Puis executer le contenu.

-- 2. Supprimer register_paco_fallback
DROP FUNCTION IF EXISTS public.register_paco_fallback(TEXT, INTEGER, JSONB, TEXT);

-- 3. Supprimer la policy UPDATE
DROP POLICY IF EXISTS "Admins can update activity registrations" ON public.activity_registrations;

-- 4. Supprimer l'index partiel
DROP INDEX IF EXISTS public.activity_registrations_fallback_pending_idx;

-- 5. ATTENTION : ne pas supprimer les colonnes fallback_* si
--    des donnees de secours ont deja ete collectees ! On garde
--    les colonnes en place et on se contente de retirer le flux
--    cote application.
-- ALTER TABLE public.activity_registrations
--     DROP COLUMN IF EXISTS recovered_at,
--     DROP COLUMN IF EXISTS fallback_error,
--     DROP COLUMN IF EXISTS fallback_payload;

COMMIT;
```

---

## Securite — points d'attention

1. **WAF/ModSecurity** : le payload JSONB peut contenir des caracteres Unicode speciaux (em dash, accents). La RPC `register_paco_fallback` est appelee directement depuis le client (anon), donc pas via une edge function Supabase. Les contraintes WAF IPs Supabase (voir memoire projet 2026-03-05) ne s'appliquent pas ici.

2. **RLS** : la nouvelle policy UPDATE est restreinte aux roles `paco`, `admin`, `super_admin`. Les anonymes ne peuvent modifier `recovered_at` que via l'admin authentifie.

3. **Payload size** : aucune limite stricte n'est imposee sur `fallback_payload`. En pratique, le formulaire PACO genere < 2 KB par inscription. Si un abus etait detecte (payloads volumineux), ajouter `CHECK (octet_length(fallback_payload::text) < 10240)` sur la colonne.

4. **Idempotence** : la RPC `register_paco_fallback` utilise `ON CONFLICT DO UPDATE` avec `WHERE activity_registrations.fallback_payload IS NOT NULL`, garantissant qu'une ligne standard existante ne sera jamais ecrasee.

---

## Ordre de deploiement cote application

1. **Phase DB** : executer les 3 scripts SQL dans l'ordre ci-dessus (peut etre fait avant le deploiement frontend, la logique est retrocompatible).
2. **Phase Frontend** : deployer la nouvelle version Vue (appels a `registerPacoWithFallback` + UI admin etendue).
3. **Phase Verification** : executer les scenarios manuels du quickstart.

En cas de rollback frontend, la partie DB reste en place sans impact (les colonnes `fallback_*` sont nullable et l'ancien code ne les utilise pas).
