# Research — Inscription PACO non bloquante avec récupération des échecs

**Feature** : `005-paco-registration-fallback`
**Date** : 2026-04-10
**Branch** : `005-paco-registration-fallback`

---

## R1. Classe d'erreurs déclenchant le mode secours

**Décision** : Toute exception attrapée par le bloc `try/catch` entourant l'appel `supabase.rpc('register_paco_quick', …)` dans `PacoQuickRegister.vue`, **en aval de la validation front-end**. Aucune classification fine (code HTTP, code Postgres, catégorie réseau) n'est effectuée côté client.

**Rationale** :
- Aligné avec l'objectif « ne jamais bloquer l'utilisateur » : la classification fine est source de trous de couverture.
- Les causes observées (WAF, contraintes SQL, timeout, blocage réseau) produisent des shapes d'erreur hétérogènes impossibles à lister exhaustivement.
- La validation front-end (champs requis, format email, sessionEdition valide) garantit que le payload est bien formé, donc toute exception en aval est, par définition, « imprévue » et cible précisément le besoin.

**Alternatives rejetées** :
- Filtrage par type d'erreur (5xx/timeouts uniquement) : manque les cas WAF et exceptions RPC métier imprévues.
- Blacklist d'erreurs métier : fragile, nécessite maintenance permanente.

**Source de vérité** : clarification Session 2026-04-10 Q1 dans [spec.md](./spec.md).

---

## R2. Identification utilisateur lors d'une resoumission sans données locales

**Décision** : Identification **exclusivement par l'email** saisi dans le formulaire. Lookup par `(activity_id, LOWER(TRIM(email)), session_edition)` dans `activity_registrations`. Aucune vérification supplémentaire (OTP, validation croisée nom/prénom, re-authentification).

**Rationale** :
- Le lien Teams du webinaire PACO est déjà en clair dans [constants.js:4](../../src/composables/paco/constants.js#L4) (`PACO_TEAMS_LINK`), donc sa confidentialité n'est pas un enjeu réel.
- Les pages PACO sont temporaires et exceptionnelles ; l'ajout d'un OTP ou d'une re-vérification complexifierait le flux pour zéro bénéfice sécurité.
- Cohérent avec le edge case déjà rédigé dans [spec.md:80](./spec.md#L80).

**Alternatives rejetées** :
- OTP via `send-email` edge function : surcharge inutile, casse l'expérience « non bloquante ».
- Validation croisée nom/prénom : fragile (fautes de frappe de l'utilisateur).

**Source de vérité** : clarification Session 2026-04-10 Q2 dans [spec.md](./spec.md).

---

## R3. Marquage admin « rattrapée »

**Décision** : Une **unique colonne** `recovered_at TIMESTAMPTZ NULL` ajoutée à `activity_registrations`. NULL = non rattrapée, valeur = date du rattrapage. Le payload JSON et le message d'erreur d'origine sont **intouchés** par cette opération.

**Rationale** :
- KISS : un seul champ, auto-porteur (état + horodatage).
- N'introduit pas d'enum à maintenir.
- Préserve totalement l'historique de l'échec (le payload et l'erreur restent accessibles pour audit post-rattrapage).
- Index partiel possible `WHERE recovered_at IS NULL` pour filtrer efficacement les inscriptions à rattraper.

**Alternatives rejetées** :
- Enum `recovery_status (pending, recovered, archived)` : YAGNI, pas de besoin actuel pour un état intermédiaire.
- Trio `is_recovered BOOLEAN + recovered_at + recovered_by` : surdimensionné (pas besoin de tracer l'admin qui rattrape pour une feature temporaire).

**Source de vérité** : clarification Session 2026-04-10 Q3 dans [spec.md](./spec.md).

---

## R4. Distinction « secours » vs « standard » au niveau base de données

**Décision** : Deux nouvelles colonnes ajoutées à `activity_registrations` :
- `fallback_payload JSONB NULL` — contenu intégral du formulaire soumis
- `fallback_error TEXT NULL` — message d'erreur technique d'origine

Le **critère d'identification** d'une inscription de secours est `fallback_payload IS NOT NULL`. Aucun enum, booléen ou statut supplémentaire n'est introduit.

**Rationale** :
- Les requêtes existantes dans [usePacoStats.js](../../src/composables/paco/usePacoStats.js) (compteurs, exports, stats) continuent de fonctionner sans modification puisqu'elles voient toujours une ligne `activity_registrations`.
- Le test « secours » est implicite : `fallback_payload IS NOT NULL`.
- Le payload JSON contient directement toutes les données nécessaires au rattrapage manuel, sans nécessiter de jointure.
- Conforme au principe V de la constitution (« Database Schema as Source of Truth ») : les données sont dans la table canonique.

**Alternatives rejetées** :
- Enum `registration_status` : introduit un état redondant avec la présence du payload.
- Booléen `is_fallback` explicite : redondant avec `fallback_payload IS NOT NULL`.
- Table dédiée `paco_fallback_registrations` : casserait le comptage unifié et dédoublerait l'identifiant de session.
- Colonne unique JSONB `fallback_meta` : imbrique inutilement l'erreur avec le payload.

**Source de vérité** : clarification Session 2026-04-10 Q4 dans [spec.md](./spec.md).

---

## R5. Déduplication standard ↔ secours et garantie d'unicité

**Décision** :
1. Réutiliser l'**index UNIQUE partiel existant** `activity_registrations_guest_session_unique` sur `(activity_id, guest_email, session_edition) WHERE guest_email IS NOT NULL AND user_id IS NULL` ([database_complete.sql:460-462](../../bank/shema_et_requettes/database_complete.sql#L460)). Aucune nouvelle contrainte n'est nécessaire.
2. Implémenter un **UPSERT atomique** dans la RPC `register_paco_fallback` (nouvelle) et dans `register_paco_quick` (modifiée) via `INSERT … ON CONFLICT (activity_id, guest_email, session_edition) DO UPDATE`.
3. **Règle de promotion** : lorsqu'un `register_paco_quick` réussit pour un `(email, session)` ayant déjà une ligne de secours, la ligne est *promue* — `fallback_payload` et `fallback_error` sont mis à `NULL`, les champs guest_* et démographiques sont renseignés, `recovered_at` est préservé.
4. **Règle inverse (protection)** : lorsqu'un `register_paco_fallback` est appelé pour un `(email, session)` ayant déjà une ligne **standard** (`fallback_payload IS NULL`), la RPC retourne l'ID existant sans modifier la ligne — une inscription standard ne doit jamais être « dégradée » en secours.

**Rationale** :
- L'index unique existant est suffisant pour garantir l'unicité `(activity, email, session)` pour les guests (qui sont le cas PACO).
- `ON CONFLICT DO UPDATE` est atomique au niveau Postgres, évitant toute condition de course entre deux tentatives concurrentes.
- Le compteur reste un simple `COUNT(*)` dans [usePacoStats.js](../../src/composables/paco/usePacoStats.js) car il y a toujours **au maximum une ligne** par `(email, session)`.
- La règle de protection empêche un retry erroné de secours de régresser une inscription standard déjà confirmée.

**Alternatives rejetées** :
- `COUNT(DISTINCT email)` : performances moindres et masque les vraies incohérences.
- Vérification applicative (SELECT puis DELETE/INSERT) : non atomique, exposée aux races conditions.
- Conservation de deux lignes + filtre anti-join : complexifie toutes les requêtes existantes.

**Source de vérité** : clarification Session 2026-04-10 Q5 dans [spec.md](./spec.md).

---

## R6. Traitement des données démographiques lors d'un secours

**Décision** :
- Pour une inscription de secours, **aucune insertion** n'est tentée dans `paco_demographic_data` (puisque cette table peut elle-même être la source de l'erreur via une contrainte FK sur `registration_id` ou une contrainte métier).
- Les données démographiques (gender, age_profile, city, country_id, professional_status, organization, recording_consent) sont intégralement conservées dans `fallback_payload` sous une clé `demographic`.
- Lors du rattrapage manuel par l'admin, ou lors d'une **promotion** automatique (R5), les données sont réinjectées dans `paco_demographic_data` à partir du JSON.

**Rationale** :
- FR-015 exige que les données démographiques soient conservées même si la table dédiée n'a pas pu être renseignée.
- Tenter un second insert dans `paco_demographic_data` alors que la RPC standard a échoué multiplie les risques sans bénéfice.
- Le JSON est l'unique source fiable en mode secours.

**Alternatives rejetées** :
- Tenter quand même l'insert dans `paco_demographic_data` : redondant et exposé aux mêmes causes d'échec.
- Créer une colonne `demographic_payload JSONB` séparée : `fallback_payload` contient déjà toutes les clés, une colonne dédiée serait redondante.

---

## R7. Stratégie client lorsque la RPC de secours échoue à son tour

**Décision** : Si `register_paco_fallback` échoue après que `register_paco_quick` a déjà échoué, le composable :
1. Loge l'erreur en `console.error` (visible Sentry/logs navigateur).
2. Persiste l'état « inscrit » localement via `markPacoRegistered(sessionEdition)` + `localStorage.setItem('paco_registration_data_session_{n}', JSON.stringify({...}))`.
3. Émet `registration-complete` auprès du parent.
4. Ne tente pas de retry automatique (pour ne pas masquer un problème d'infrastructure sérieux).

**Rationale** :
- FR-013 exige que l'accès ne soit jamais bloqué, même en cas de double échec.
- Le localStorage sert de « secours du secours » : l'utilisateur récupère l'accès à son bouton de jonction lors des prochaines visites sur cette même machine.
- Les admins ne peuvent rien récupérer dans ce cas — mais cette situation nécessite déjà une intervention d'infrastructure.

**Observabilité** : le log `console.error` est le canal de notification primaire (les pages PACO sont exceptionnelles, pas d'APM dédié). Un commentaire dans le code devra expliciter qu'un double échec indique une panne majeure à remonter.

---

## R8. Exposition côté composable et réutilisation

**Décision** : Un **seul composable consolidé** `usePacoRegistration.js` expose une nouvelle méthode haut-niveau `registerPacoWithFallback(payload)` qui encapsule la logique en 3 tentatives :
1. RPC `register_paco_quick` (chemin nominal)
2. RPC `register_paco_fallback` (plan B)
3. localStorage-only (plan C)

Elle retourne `{ status: 'standard' | 'fallback' | 'local_only', registrationId: UUID | null }`.

**Rationale** :
- DRY : `PacoQuickRegister.vue` se contente d'appeler le composable ; la logique de fallback est unique et testable.
- KISS : une seule surface d'appel pour l'UI.
- Compatible avec les principes de la constitution (I. Modular Architecture).

**Alternatives rejetées** :
- Logique dans le composant `PacoQuickRegister.vue` : couple logique métier et UI, bloque la réutilisation (ex: `PacoRegisterForm.vue`).
- Nouveau composable séparé `usePacoFallback.js` : disperse la logique d'inscription qui doit rester centralisée.

---

## R9. Évolution du composable des stats admin

**Décision** : `usePacoStats.js` est étendu pour :
- Inclure `fallback_payload`, `fallback_error`, `recovered_at` dans les `select()` de `fetchPacoRegistrants` et `fetchAllRegistrantsForExport`.
- Mapper chaque registrant avec un champ `isFallback: Boolean(fallback_payload)` et, lorsque `isFallback` est vrai, fusionner les champs manquants (gender, age_profile, etc.) depuis `fallback_payload.demographic` pour l'affichage unifié.
- Exposer une méthode `markRegistrationRecovered(registrationId)` qui fait `UPDATE activity_registrations SET recovered_at = NOW() WHERE id = $1`.

**Rationale** :
- Évite de dupliquer le mapping partout dans l'UI.
- Garantit que les statistiques démographiques (gender/age/status) incluent les inscriptions de secours lorsque le payload contient les données.
- L'opération `markRegistrationRecovered` passe par l'API Supabase standard (RLS sur `activity_registrations` protège cette mutation pour les utilisateurs authentifiés admin ; à vérifier en phase d'implémentation).

---

## R10. Contraintes RLS et sécurité de la RPC de secours

**Décision** :
- La nouvelle RPC `register_paco_fallback` est `SECURITY DEFINER` avec `SET search_path = public`, exactement comme `register_paco_quick`.
- Elle est exécutable par `anon` et `authenticated`.
- Elle **ne fait aucune requête sur d'autres tables** que `activity_registrations` (pas de JOIN, pas d'INSERT sur `paco_demographic_data` — voir R6).
- Les paramètres d'entrée sont TRIM/LOWER-normalisés pour l'email (idem `register_paco_quick`).

**Rationale** :
- Minimise la surface d'attaque : moins de jointures = moins de points de défaillance.
- Reproduit la posture de sécurité de la RPC existante, conformément à la doctrine du projet.
- Évite qu'un échec de la table démographique dans la RPC de secours ne casse elle-même l'enregistrement de l'échec.

---

## Résolution des « NEEDS CLARIFICATION »

Toutes les clarifications nécessaires à la planification ont été résolues par la session `/speckit.clarify` du 2026-04-10. Aucun `NEEDS CLARIFICATION` ne subsiste dans le Technical Context du plan.

| Item | Statut |
|---|---|
| Déclencheur du secours | Résolu (R1) |
| Identification utilisateur de retour | Résolu (R2) |
| Marquage « rattrapée » | Résolu (R3) |
| Schéma DB secours vs standard | Résolu (R4) |
| Déduplication et unicité | Résolu (R5) |
| Données démographiques en secours | Résolu (R6 — dérivé de FR-015) |
| Double échec technique | Résolu (R7 — dérivé de FR-013) |
| Surface API composable | Résolu (R8) |
| Affichage admin | Résolu (R9) |
| Sécurité RPC | Résolu (R10) |

**Outstanding** : aucun item bloquant pour Phase 1.

**Deferred** (à rediscuter post-lancement, hors scope de cette feature) :
- Politique de rétention RGPD du `fallback_payload` : à aligner sur la politique générale des pages PACO temporaires lors de leur dépose.
- Canal d'alerte en cas de double échec : pour le moment, `console.error` côté client + revue périodique des lignes `fallback_payload IS NOT NULL AND recovered_at IS NULL`.
