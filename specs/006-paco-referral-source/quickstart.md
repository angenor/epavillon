# Quickstart — 006 Paco Referral Source

**Date**: 2026-04-10
**Feature**: Canal d'acquisition (referral source) pour inscription PACO
**Audience**: Développeur·euse exécutant la vérification end-to-end après implémentation.

Ce document décrit comment déployer, exécuter et valider manuellement la feature. Le projet n'utilise pas de framework de test unitaire (cohérence avec les features 001-005) ; la validation se fait par parcours manuels guidés ci-dessous.

## 1. Pré-requis

- Branche active : `006-paco-referral-source`
- Accès à la base Supabase du projet (clé `service_role` pour appliquer la migration + RPCs)
- `.env.local` configuré avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Node modules installés (`npm install` déjà exécuté)
- Compte admin existant pour accéder à `/paco/admin`

## 2. Déploiement (lockstep obligatoire)

L'ordre est contraignant — voir `contracts/rpc_register_paco.md` §4. Toute inversion casse le front-end.

### Étape 2.1 — Appliquer la migration SQL

Dans l'éditeur SQL Supabase (ou via psql), exécuter :

```sql
-- bank/shema_et_requettes/006_paco_referral_source.sql
```

Vérifier :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'activity_registrations'
  AND column_name IN ('referral_source', 'referral_source_other');
```

Attendu : 2 lignes, `text`, `YES` (nullable).

```sql
SELECT conname
FROM pg_constraint
WHERE conname IN ('check_referral_source_allowed', 'check_referral_source_other_guard');
```

Attendu : 2 lignes.

### Étape 2.2 — Redéployer `register_paco_quick` (v4)

Exécuter le contenu de `bank/shema_et_requettes/rpc_register_paco_quick.sql` mis à jour. Vérifier la signature :

```sql
SELECT pg_get_function_identity_arguments(oid)
FROM pg_proc
WHERE proname = 'register_paco_quick';
```

Attendu : `p_email text, p_first_name text, ..., p_session_edition integer, p_referral_source text, p_referral_source_other text` (13 paramètres).

### Étape 2.3 — Redéployer `register_paco_fallback` (v2)

Exécuter `bank/shema_et_requettes/rpc_register_paco_fallback.sql` mis à jour. Vérifier :

```sql
SELECT pg_get_function_identity_arguments(oid)
FROM pg_proc
WHERE proname = 'register_paco_fallback';
```

Attendu : 6 paramètres incluant `p_referral_source` et `p_referral_source_other`.

### Étape 2.4 — Build + déploiement front-end

```bash
npm run build:seo
# puis, selon contexte :
firebase deploy --only hosting
```

En développement local :

```bash
npm run dev
```

## 3. Parcours de validation — formulaire d'inscription (US1)

### 3.1 Cas nominal — canal "Site web de l'IFDD"

1. Ouvrir `/paco` → onglet Session 2 → cliquer "S'inscrire".
2. Remplir tous les champs du formulaire avec des valeurs valides.
3. Dans le nouveau `<select>` "Comment avez-vous connu ce webinaire ?" (dernier champ avant le bouton), choisir **Site web de l'IFDD**.
4. Vérifier que le champ texte libre "Précisez" **n'est pas affiché**.
5. Cliquer "S'inscrire".
6. Attendu : succès, redirection vers `step='join'`.
7. Vérifier en base :

    ```sql
    SELECT referral_source, referral_source_other
    FROM activity_registrations
    WHERE guest_email = 'test1@example.com' AND session_edition = 2;
    ```

    Attendu : `ifdd_website`, `NULL`.

### 3.2 Cas "Autre" avec précision libre

1. Re-ouvrir le formulaire avec un email différent.
2. Remplir les champs, sélectionner **Autre** dans le dropdown.
3. Vérifier que le champ texte `Précisez (facultatif)` **apparaît** avec `maxlength=120`.
4. Saisir `Recommandation d'un collègue de bureau`.
5. Soumettre.
6. Vérifier en base :

    ```sql
    SELECT referral_source, referral_source_other
    FROM activity_registrations
    WHERE guest_email = 'test2@example.com' AND session_edition = 2;
    ```

    Attendu : `other`, `Recommandation d'un collègue de bureau`.

### 3.3 Masquage conditionnel du champ "Précisez"

1. Ouvrir le formulaire, sélectionner **Autre**, saisir `texte exemple`.
2. Changer la sélection vers **LinkedIn de l'IFDD**.
3. Vérifier que le champ texte disparaît ET que son contenu est réinitialisé (inspecter via DevTools Vue).
4. Re-sélectionner **Autre** : le champ réapparaît **vide** (FR-002b).

### 3.4 Soumission sans canal — blocage

1. Remplir tous les champs **sauf** le canal.
2. Cliquer "S'inscrire".
3. Attendu : la soumission est bloquée, message d'erreur i18n visible sous le select (`paco.referralSource.required`).

### 3.5 Parcours fallback (coupure DB simulée)

1. Via DevTools, simuler une erreur réseau sur l'appel RPC standard (ou temporairement renommer la RPC `register_paco_quick` en base).
2. Soumettre le formulaire avec canal = **Email / Newsletter** et précision vide.
3. Attendu : fallback RPC `register_paco_fallback` s'exécute ET l'inscription est enregistrée avec `referral_source = 'email_newsletter'` sur la ligne ET dupliqué sous `fallback_payload->>'referralSource'`.

    ```sql
    SELECT referral_source,
           fallback_payload->>'referralSource' AS payload_referral,
           fallback_error IS NOT NULL AS has_error
    FROM activity_registrations
    WHERE guest_email = 'test3@example.com' AND session_edition = 2;
    ```

    Attendu : `email_newsletter`, `email_newsletter`, `true`.
4. Restaurer la RPC si nécessaire.

## 4. Parcours de validation — tableau de bord admin (US2)

### 4.1 Affichage du camembert

1. Se connecter en admin, aller sur `/paco/admin`.
2. Sélectionner Session 2 dans le filtre de session.
3. Localiser la nouvelle carte "Canal d'acquisition" (titre i18n `paco.referralSource.chartTitle`).
4. Vérifier :
   - Un donut chart amCharts 5 est rendu.
   - Les 6 canaux officiels sont listés dans l'ordre fixe (Site web, LinkedIn, Facebook, X, Email/Newsletter, Autre).
   - Les canaux à 0 inscription affichent bien une entrée de légende (pas masquée), avec `count = 0`.
   - Les pourcentages somment à 100 % sur l'ensemble des buckets affichés.
   - La carte honore le dark mode (toggler le thème pour vérifier le contraste).

### 4.2 "Non renseigné" dynamique

1. Insérer manuellement une ligne avec `referral_source IS NULL` :

    ```sql
    UPDATE activity_registrations
    SET referral_source = NULL
    WHERE id = '<id de test>';
    ```

2. Rafraîchir `/paco/admin` (ou attendre la souscription realtime).
3. Attendu : bucket "Non renseigné" (gris) apparaît **en dernier** dans la légende et dans le donut.
4. Remettre la valeur pour nettoyer.

### 4.3 Filtre de session

1. Basculer le filtre sur Session 1.
2. Vérifier que le camembert est recalculé uniquement sur les inscriptions de session 1 (qui n'ont pas encore `referral_source` historiquement → tout en "Non renseigné").

## 5. Parcours de validation — export CSV (FR-010)

1. Depuis `/paco/admin`, cliquer "Exporter CSV" pour la session 2.
2. Ouvrir le fichier exporté.
3. Vérifier l'en-tête : les colonnes `Canal d'acquisition` et `Canal — précision` sont présentes entre `Organisation` et `Date d'inscription`.
4. Vérifier sur les 3 lignes de test (§3.1, §3.2, §3.5) :
   - Ligne 1 : `Site web de l'IFDD`, `` (vide).
   - Ligne 2 : `Autre`, `Recommandation d'un collègue de bureau`.
   - Ligne 3 : `Email / Newsletter`, `` (vide).
5. Vérifier que les lignes historiques (`referral_source IS NULL`) affichent deux colonnes vides (FR-009).

## 6. Parcours de validation — règles d'intégrité DB

### 6.1 CHECK `check_referral_source_allowed`

```sql
-- Doit échouer
INSERT INTO activity_registrations (activity_id, guest_email, registration_type, session_edition, referral_source)
VALUES ('<PACO_ACTIVITY_ID>', 'check1@test.com', 'guest', 2, 'twitter');
```

Attendu : `new row for relation "activity_registrations" violates check constraint "check_referral_source_allowed"`.

### 6.2 CHECK `check_referral_source_other_guard` — non-other avec précision

```sql
-- Doit échouer
INSERT INTO activity_registrations (activity_id, guest_email, registration_type, session_edition, referral_source, referral_source_other)
VALUES ('<PACO_ACTIVITY_ID>', 'check2@test.com', 'guest', 2, 'ifdd_website', 'précision indue');
```

Attendu : `..."check_referral_source_other_guard"`.

### 6.3 CHECK `check_referral_source_other_guard` — longueur

```sql
-- Doit échouer
INSERT INTO activity_registrations (activity_id, guest_email, registration_type, session_edition, referral_source, referral_source_other)
VALUES ('<PACO_ACTIVITY_ID>', 'check3@test.com', 'guest', 2, 'other', repeat('x', 121));
```

Attendu : `..."check_referral_source_other_guard"`.

## 7. Parcours de validation — i18n FR/EN

1. Basculer la langue sur EN via le sélecteur navbar.
2. Ouvrir le formulaire : le label, placeholder et les 6 options sont en anglais (`IFDD website`, `IFDD LinkedIn`, etc.).
3. Ouvrir `/paco/admin` : titre du camembert et légende en anglais.
4. Basculer à nouveau en FR et vérifier que tout revient au français.

## 8. Parcours de validation — idempotence RPC (Branche 2)

1. Re-soumettre le formulaire avec le même email que §3.1, même session.
2. Attendu : succès silencieux (l'inscription existante est retournée, aucune nouvelle ligne).
3. Vérifier en base que `referral_source` reste `ifdd_website` (inchangé).
4. Changer la sélection à `other` + précision, resoumettre : la valeur **NE doit PAS** être écrasée (Branche 2 — politique "only when NULL").

## 9. Rollback (si nécessaire)

Voir `contracts/rpc_register_paco.md` §5 :

1. Redéployer le bundle front-end précédent.
2. Restaurer `rpc_register_paco_quick.sql` v3.1 et `rpc_register_paco_fallback.sql` v1 depuis git history.
3. Les colonnes peuvent rester en place (nullables, zéro impact).

## 10. Checklist de sign-off

- [ ] Migration SQL appliquée sans erreur.
- [ ] Les 2 RPC exposent leur nouvelle signature.
- [ ] US1 §3.1 à §3.5 validés.
- [ ] US2 §4.1 à §4.3 validés.
- [ ] US3 (données historiques) : bucket "Non renseigné" se comporte comme attendu sur session 1.
- [ ] CSV §5 contient les 2 nouvelles colonnes.
- [ ] CHECK §6.1 à §6.3 rejettent bien les inserts invalides.
- [ ] i18n §7 : FR + EN OK.
- [ ] Idempotence §8 : resoumission n'écrase pas la valeur historique.
- [ ] Dark mode vérifié sur formulaire ET admin.
- [ ] `database_complete.sql` reflète les 2 nouvelles colonnes et les CHECK.
