---
description: "Task list for 006-paco-referral-source implementation"
---

# Tasks: Canal d'acquisition (referral source) pour inscription PACO

**Input**: Design documents from `/specs/006-paco-referral-source/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Pas de framework de tests unitaires sur ce projet (cohérence features 001-005). La validation repose sur `quickstart.md` exécuté manuellement.

**Organization**: Tâches regroupées par user story pour permettre implémentation et validation indépendantes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut être exécuté en parallèle (fichier distinct, pas de dépendance sur une tâche incomplète)
- **[Story]**: Rattachement à une user story (`US1`, `US2`, `US3`)
- Chaque tâche référence un chemin de fichier précis

## Path Conventions

Application web mono-projet Vue 3 + Supabase :

- Frontend Vue : `src/`
- Migrations et RPCs SQL : `bank/shema_et_requettes/`
- i18n : `src/locales/{fr,en}/paco.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Vérifications pré-implémentation. Aucune nouvelle dépendance npm à installer (amCharts 5 déjà bundlé).

- [X] T001 Vérifier la branche active `006-paco-referral-source` et l'absence de modifications non commitées via `git status`
- [X] T002 Vérifier dans [package.json](package.json) que `@amcharts/amcharts5` est déjà présent (aucune install nécessaire)
- [X] T003 Créer les fichiers vides (placeholders) à modifier en Phase 2+ pour faciliter la navigation : [src/composables/paco/referralSources.js](src/composables/paco/referralSources.js), [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue), [bank/shema_et_requettes/006_paco_referral_source.sql](bank/shema_et_requettes/006_paco_referral_source.sql)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Socle partagé par les 3 user stories — schéma DB, RPCs, source unique des canaux, i18n. Aucune user story ne peut démarrer tant que ces tâches ne sont pas toutes terminées.

**⚠️ CRITICAL**: Le déploiement de la Phase 2 DOIT suivre l'ordre strict défini dans `contracts/rpc_register_paco.md` §4 (migration SQL → RPC quick v4 → RPC fallback v2 → front-end). La Phase 3+ ne peut commencer qu'une fois toutes les tâches Phase 2 mergées.

### Base de données & RPCs

- [X] T004 Écrire la migration [bank/shema_et_requettes/006_paco_referral_source.sql](bank/shema_et_requettes/006_paco_referral_source.sql) idempotente : `ALTER TABLE public.activity_registrations ADD COLUMN IF NOT EXISTS referral_source TEXT`, `ADD COLUMN IF NOT EXISTS referral_source_other TEXT`, ajout des 2 CHECK constraints (`check_referral_source_allowed`, `check_referral_source_other_guard`) dans un bloc `DO $$ ... $$` et `COMMENT ON COLUMN` pour les 2 colonnes, incluant le bloc ROLLBACK en commentaire (voir `data-model.md` §1.3)
- [X] T005 Mettre à jour [bank/shema_et_requettes/rpc_register_paco_quick.sql](bank/shema_et_requettes/rpc_register_paco_quick.sql) vers la signature v4 (13 paramètres) : ajout de `p_referral_source TEXT` et `p_referral_source_other TEXT DEFAULT NULL`, `DROP FUNCTION IF EXISTS` des signatures v3 (11 params) ET v4 (13 params), implémentation des 3 branches (insert / idempotent / fallback promotion) selon `contracts/rpc_register_paco.md` §1, GRANT EXECUTE à `anon` et `authenticated`
- [X] T006 Mettre à jour [bank/shema_et_requettes/rpc_register_paco_fallback.sql](bank/shema_et_requettes/rpc_register_paco_fallback.sql) vers la signature v2 (6 paramètres) : ajout de `p_referral_source TEXT` et `p_referral_source_other TEXT DEFAULT NULL`, DROP/CREATE, INSERT des 2 colonnes directement sur la ligne ET duplication dans `p_fallback_payload` JSONB sous les clés `referralSource` / `referralSourceOther`, gestion du cas unique-violation (UPDATE idempotent quand NULL), GRANT EXECUTE à `anon` et `authenticated` (voir `contracts/rpc_register_paco.md` §2)
- [X] T007 Mettre à jour [bank/shema_et_requettes/database_complete.sql](bank/shema_et_requettes/database_complete.sql) : ajouter les 2 colonnes `referral_source` et `referral_source_other` dans le bloc `CREATE TABLE public.activity_registrations`, ajouter les 2 CHECK constraints, ajouter les `COMMENT ON COLUMN`, mettre à jour la section RPC avec les nouvelles signatures `register_paco_quick` v4 et `register_paco_fallback` v2

### Source unique des canaux (composable)

- [X] T008 Implémenter [src/composables/paco/referralSources.js](src/composables/paco/referralSources.js) : export `PACO_REFERRAL_SOURCES` (array ordonné des 6 clés), `PACO_REFERRAL_NOT_SPECIFIED = 'not_specified'`, fonction `referralSourceI18nKey(source)` qui renvoie `paco.referralSource.options.<key>` ou `paco.referralSource.notSpecified`, map `PACO_REFERRAL_COLORS` avec les hex (voir `data-model.md` §3.1), fonction helper `getReferralSourceLabelFr(key)` qui renvoie le libellé FR canonique pour l'export CSV (résolution statique sans i18n), et `MAX_REFERRAL_OTHER_LENGTH = 120`

### Internationalisation (i18n)

- [X] T009 [P] Ajouter la section `paco.referralSource` dans [src/locales/fr/paco.json](src/locales/fr/paco.json) : `label`, `placeholder`, `required`, `otherLabel`, `otherPlaceholder`, `otherMaxLengthHint`, `options` (6 entrées avec clés stables), `chartTitle`, `chartSubtitle`, `notSpecified`, `csvHeader`, `csvOtherHeader` (voir `research.md` R8)
- [X] T010 [P] Ajouter la section `paco.referralSource` dans [src/locales/en/paco.json](src/locales/en/paco.json) avec les mêmes clés traduites en anglais (`IFDD website`, `IFDD LinkedIn`, `IFDD Facebook`, `IFDD X`, `Email / Newsletter`, `Other`, etc.)

**Checkpoint**: Schéma DB, RPCs, composable source-unique et i18n en place. Les user stories peuvent démarrer.

---

## Phase 3: User Story 1 - Sélection du canal lors de l'inscription (Priority: P1) 🎯 MVP

**Goal**: Le formulaire `PacoQuickRegister.vue` propose un `<select>` obligatoire en bas de formulaire avec les 6 canaux officiels, un champ texte libre conditionnel apparaît si "Autre" est sélectionné (max 120 car.), et la valeur est persistée via les 2 RPCs `register_paco_quick` et `register_paco_fallback`.

**Independent Test**: Ouvrir `/paco` Session 2 → remplir le formulaire → tester chaque option du dropdown + le cas "Autre" avec précision → vérifier en base que `referral_source` et `referral_source_other` sont persistés selon les spécifications de `quickstart.md` §3.1–§3.5.

### Implementation for User Story 1

- [X] T011 [US1] Étendre la typedef `PacoRegistrationInput` dans [src/composables/paco/usePacoRegistration.js](src/composables/paco/usePacoRegistration.js) : ajouter `referralSource` (obligatoire) et `referralSourceOther` (optionnel, nullable) conformément à `contracts/rpc_register_paco.md` §3
- [X] T012 [US1] Mettre à jour la fonction `registerPacoWithFallback` dans [src/composables/paco/usePacoRegistration.js](src/composables/paco/usePacoRegistration.js) : importer `PACO_REFERRAL_SOURCES` et `MAX_REFERRAL_OTHER_LENGTH` depuis `referralSources.js`, valider `referralSource` contre la liste canonique (erreur locale si invalide), nullifier `referralSourceOther` si `referralSource !== 'other'`, trimmer et tronquer la précision à 120 caractères
- [X] T013 [US1] Dans [src/composables/paco/usePacoRegistration.js](src/composables/paco/usePacoRegistration.js), passer `p_referral_source` et `p_referral_source_other` à l'appel `supabase.rpc('register_paco_quick', ...)` (branche standard)
- [X] T014 [US1] Dans [src/composables/paco/usePacoRegistration.js](src/composables/paco/usePacoRegistration.js), passer `p_referral_source` et `p_referral_source_other` à l'appel `supabase.rpc('register_paco_fallback', ...)` (branche fallback) ET ajouter `referralSource` + `referralSourceOther` dans l'objet `fallbackPayload` sérialisé pour traçabilité (FR-006)
- [X] T015 [US1] Dans [src/composables/paco/usePacoRegistration.js](src/composables/paco/usePacoRegistration.js), mettre à jour la branche `local_only` (localStorage fallback) pour inclure `referralSource` et `referralSourceOther` dans le payload stocké
- [X] T016 [US1] Ajouter les champs `referralSource: ''` et `referralSourceOther: ''` dans l'objet `reactive` `form` de [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue) et importer `PACO_REFERRAL_SOURCES` + `MAX_REFERRAL_OTHER_LENGTH` depuis `src/composables/paco/referralSources.js`
- [X] T017 [US1] Dans [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue), ajouter un `watch` sur `form.referralSource` qui réinitialise `form.referralSourceOther = ''` dès que la sélection quitte `'other'` (FR-002b)
- [X] T018 [US1] Dans le `<template>` de [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue), ajouter le `<select>` obligatoire (avec attribut `required`) juste AVANT le `<button type="submit">`, itérant sur `PACO_REFERRAL_SOURCES` avec `{{ t('paco.referralSource.options.' + source) }}` et placeholder depuis `paco.referralSource.placeholder`, en réutilisant les classes Tailwind existantes des selects Country/ProfessionalStatus (dark/light mode)
- [X] T019 [US1] Dans [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue), ajouter le champ texte conditionnel `<input type="text" maxlength="120" v-if="form.referralSource === 'other'">` sous le select, avec label `paco.referralSource.otherLabel`, placeholder `paco.referralSource.otherPlaceholder`, hint i18n `paco.referralSource.otherMaxLengthHint` lié via `aria-describedby`
- [X] T020 [US1] Dans la fonction `handleSubmit` (ou équivalent) de [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue), ajouter la validation Vue qui bloque la soumission et affiche un `<p role="alert">` avec `paco.referralSource.required` si `form.referralSource` est vide (FR-004)
- [X] T021 [US1] Dans [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue), enrichir le payload passé à `registerPacoWithFallback(...)` avec `referralSource: form.referralSource` et `referralSourceOther: form.referralSource === 'other' ? (form.referralSourceOther.trim() || null) : null`

**Checkpoint**: US1 fonctionnelle — les nouvelles inscriptions persistent correctement `referral_source` et `referral_source_other`. Exécuter `quickstart.md` §3.1 à §3.5 pour valider.

---

## Phase 4: User Story 2 - Visualisation des statistiques par canal (Priority: P1)

**Goal**: `PacoAdmin.vue` affiche une section dédiée avec un camembert amCharts 5 listant les 6 canaux dans l'ordre fixe officiel (même à 0) et `Non renseigné` en dernier uniquement si > 0. La répartition respecte le filtre de session actif et le CSV export inclut 2 nouvelles colonnes.

**Independent Test**: Insérer des inscriptions de test couvrant chaque canal, ouvrir `/paco/admin`, vérifier que le donut chart reflète les données pour chaque filtre de session (Toutes / Session 1 / Session 2), et vérifier que le CSV export contient les 2 nouvelles colonnes (voir `quickstart.md` §4 et §5).

### Implementation for User Story 2

- [X] T022 [US2] Dans [src/composables/paco/usePacoStats.js](src/composables/paco/usePacoStats.js), ajouter `referral_source` et `referral_source_other` à la liste des colonnes sélectionnées dans la requête de `fetchPacoStats` sur `activity_registrations`
- [X] T023 [US2] Dans [src/composables/paco/usePacoStats.js](src/composables/paco/usePacoStats.js), créer une fonction helper `buildReferralSourceBreakdown(rows)` qui construit un tableau de longueur 6 dans l'ordre `PACO_REFERRAL_SOURCES`, compte les occurrences, ajoute une 7e entrée `{ key: 'not_specified', count: N }` uniquement si `N > 0`, calcule `percent` sur le total incluant les buckets affichés, et retourne `{ breakdown, total }` (voir `data-model.md` §3.3)
- [X] T024 [US2] Dans [src/composables/paco/usePacoStats.js](src/composables/paco/usePacoStats.js), exposer le résultat via `stats.value.referralSource = buildReferralSourceBreakdown(filteredRegistrations)` en respectant le filtre de session actif, et s'assurer que la fonction `mapRegistrantRow` propage bien `referralSource` et `referralSourceOther` vers chaque ligne de `registrants`
- [X] T025 [US2] Dans [src/composables/paco/usePacoStats.js](src/composables/paco/usePacoStats.js), mettre à jour `fetchAllRegistrantsForExport` pour inclure les 2 nouvelles colonnes dans le SELECT et le mapping retourné
- [X] T026 [US2] Implémenter [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue) : composant Vue 3 `<script setup>` recevant une prop `breakdown` (tableau de `{ key, count, percent }`) et `total` ; importer `@amcharts/amcharts5`, `@amcharts/amcharts5/percent`, `@amcharts/amcharts5/themes/Animated` ; créer un `PieChart` avec `innerRadius = am5.percent(60)` ; ajouter une `PieSeries` configurée avec les couleurs de `PACO_REFERRAL_COLORS` dans l'ordre du breakdown ; résoudre les labels via `t(referralSourceI18nKey(key))` ; disposer de la légende ; exposer un `aria-label` texte résumant les % ; disposer le conteneur avec classes Tailwind `bg-white dark:bg-gray-800 rounded-xl shadow p-4` en cohérence avec `PacoRegistrationChart.vue`
- [X] T027 [US2] Gérer dans [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue) le lifecycle amCharts : `onMounted` pour créer le root, `onBeforeUnmount` pour `root.dispose()`, et un `watch` sur la prop `breakdown` pour mettre à jour les données via `series.data.setAll(...)` sans recréer le root
- [X] T028 [US2] Ajouter un titre (`paco.referralSource.chartTitle`) et sous-titre (`paco.referralSource.chartSubtitle`) via `t()` dans le template de [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue) au-dessus du conteneur du donut
- [X] T029 [US2] Dans [src/views/paco/PacoAdmin.vue](src/views/paco/PacoAdmin.vue), importer `PacoReferralSourceChart` et l'intégrer dans la section statistiques (après `PacoRegistrationChart` ou à un emplacement cohérent dans la grille existante), en passant `:breakdown="stats.referralSource?.breakdown ?? []"` et `:total="stats.referralSource?.total ?? 0"`
- [X] T030 [US2] Dans [src/views/paco/PacoAdmin.vue](src/views/paco/PacoAdmin.vue), vérifier que le composant est bien conditionné par `v-if="stats.referralSource"` pour éviter les erreurs de rendu pendant le chargement initial, et que le skeleton loader existant reste cohérent
- [X] T031 [US2] Dans [src/composables/paco/usePacoCsvExport.js](src/composables/paco/usePacoCsvExport.js), importer `getReferralSourceLabelFr` depuis `referralSources.js`, ajouter les 2 nouveaux en-têtes `"Canal d'acquisition"` et `"Canal — précision"` dans le tableau d'en-têtes juste entre `"Organisation"` et `"Date d'inscription"`, et les 2 valeurs correspondantes (`r.referralSource ? getReferralSourceLabelFr(r.referralSource) : ''` et `r.referralSourceOther ?? ''`) dans la construction de ligne CSV (voir `data-model.md` §3.4)
- [X] T032 [US2] Vérifier que l'échappement CSV existant (quotes autour des valeurs, doublement des `"`) est bien appliqué aux 2 nouvelles colonnes dans [src/composables/paco/usePacoCsvExport.js](src/composables/paco/usePacoCsvExport.js), particulièrement pour `referralSourceOther` qui peut contenir des virgules et des apostrophes

**Checkpoint**: US2 fonctionnelle — le donut chart est rendu dans PacoAdmin et le CSV export contient les 2 nouvelles colonnes. Exécuter `quickstart.md` §4 et §5 pour valider.

---

## Phase 5: User Story 3 - Gestion historique des inscrits sans canal (Priority: P2)

**Goal**: Les inscriptions antérieures au déploiement (où `referral_source IS NULL`) apparaissent dans une catégorie "Non renseigné" distincte, affichée uniquement si son compteur > 0, en dernier dans la légende et avec une couleur neutre grise. Le CSV export affiche une valeur vide pour ces lignes.

**Independent Test**: Filtrer PacoAdmin sur Session 1 (session historique sans `referral_source`) et vérifier que le bucket "Non renseigné" est affiché en dernier avec la couleur grise et le bon compte, et que l'export CSV affiche une valeur vide dans la colonne `Canal d'acquisition` pour ces lignes (voir `quickstart.md` §4.2 et §4.3).

### Implementation for User Story 3

- [X] T033 [US3] Vérifier dans [src/composables/paco/usePacoStats.js](src/composables/paco/usePacoStats.js) (fonction `buildReferralSourceBreakdown`) que le compteur `not_specified` est bien incrémenté pour les lignes où `referral_source IS NULL OR referral_source NOT IN PACO_REFERRAL_SOURCES`, et que la 7e entrée n'est ajoutée que si `count > 0` (FR-009)
- [X] T034 [US3] Vérifier dans [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue) que l'ordre d'affichage (donut slices + légende) place bien `not_specified` EN DERNIER lorsqu'il est présent, avec la couleur `PACO_REFERRAL_COLORS.not_specified` (gris neutre) visuellement distincte des 6 canaux officiels
- [X] T035 [US3] Vérifier dans [src/composables/paco/usePacoCsvExport.js](src/composables/paco/usePacoCsvExport.js) que le cas `referralSource IS NULL` produit bien une chaîne vide dans la colonne `"Canal d'acquisition"` (et non la mention "Non renseigné") — conformément à la clarification acceptée (comportement attendu = champ vide)

**Checkpoint**: US3 fonctionnelle — les inscriptions historiques apparaissent proprement dans le bucket "Non renseigné" sans fausser les pourcentages.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation finale, vérifications d'accessibilité, vérification i18n bilingue, et exécution complète de `quickstart.md`.

- [X] T036 [P] Relire [src/components/paco/PacoQuickRegister.vue](src/components/paco/PacoQuickRegister.vue) pour garantir la conformité dark/light mode sur le nouveau select et le champ "Précisez" (classes Tailwind `dark:bg-gray-800`, `dark:text-white`, `dark:border-gray-700`, `cursor-pointer` explicite sur le select)
- [X] T037 [P] Relire [src/components/paco/PacoReferralSourceChart.vue](src/components/paco/PacoReferralSourceChart.vue) pour garantir la conformité dark/light mode du conteneur et la lisibilité de la légende amCharts (utiliser le thème Animated existant en cohérence avec `PacoRegistrationChart.vue`)
- [X] T038 [P] Vérifier que les 2 fichiers [src/locales/fr/paco.json](src/locales/fr/paco.json) et [src/locales/en/paco.json](src/locales/en/paco.json) sont exhaustifs : toutes les clés utilisées dans `PacoQuickRegister.vue`, `PacoReferralSourceChart.vue` et les messages d'erreur sont traduites dans les 2 langues (lancer une recherche `t('paco.referralSource` dans `src/` pour comparer)
- [ ] T039 Appliquer manuellement la migration `006_paco_referral_source.sql` sur la base Supabase (via l'éditeur SQL), puis les 2 RPCs mises à jour, dans l'ordre strict : migration → quick v4 → fallback v2 (voir `contracts/rpc_register_paco.md` §4) — **ACTION UTILISATEUR REQUISE**
- [X] T040 Lancer `npm run build` localement pour détecter toute erreur de build (import manquant, clé i18n manquante, etc.) avant déploiement
- [ ] T041 Exécuter intégralement le parcours de validation manuelle décrit dans [specs/006-paco-referral-source/quickstart.md](specs/006-paco-referral-source/quickstart.md) §3 à §8, puis cocher la checklist de sign-off §10 — **ACTION UTILISATEUR REQUISE** (après T039)
- [X] T042 Mettre à jour [bank/shema_et_requettes/database_complete.sql](bank/shema_et_requettes/database_complete.sql) si T007 n'a pas été fait de manière exhaustive : s'assurer que les commentaires de colonnes et les signatures RPC sont bien synchronisés avec l'état final
- [X] T043 Nettoyer tout `console.log` ou commentaire de debug introduit durant l'implémentation dans les fichiers modifiés de cette feature (search `console.log` sur les fichiers listés dans le plan)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dépendance — démarrage immédiat.
- **Foundational (Phase 2)**: Dépend de Phase 1. **BLOQUE** toutes les user stories.
- **US1 (Phase 3)**: Dépend de Phase 2 (composable `referralSources.js`, i18n, RPCs mises à jour).
- **US2 (Phase 4)**: Dépend de Phase 2 (colonnes SQL, composable).
- **US3 (Phase 5)**: Dépend de Phase 4 (fonction `buildReferralSourceBreakdown`, composant chart, CSV export).
- **Polish (Phase 6)**: Dépend de toutes les user stories complétées.

### User Story Dependencies

- **US1 (P1)**: Indépendante de US2 et US3. Peut être implémentée et testée seule (un admin peut insérer manuellement les données dans Supabase pour tester US2 avant que US1 ne soit terminée).
- **US2 (P1)**: Indépendante de US1 (peut être développée en parallèle si un·e autre dev insère des données de test à la main).
- **US3 (P2)**: Extension de US2 — les 3 tâches (T033-T035) sont des vérifications sur des fichiers déjà modifiés par US2. À traiter séquentiellement après US2.

### Within Each User Story

- Phase 3 (US1) : modifs `usePacoRegistration.js` (T011-T015) peuvent précéder celles de `PacoQuickRegister.vue` (T016-T021) pour que le composable soit prêt quand le composant l'appelle.
- Phase 4 (US2) : modifs `usePacoStats.js` (T022-T025) → puis création `PacoReferralSourceChart.vue` (T026-T028) → puis intégration dans `PacoAdmin.vue` (T029-T030) → puis CSV export (T031-T032).

### Parallel Opportunities

- **Phase 2** : T009 et T010 (fichiers i18n FR et EN) parallélisables [P]. T004, T005, T006, T007, T008 touchent des fichiers distincts et pourraient être parallélisés, mais les RPCs (T005, T006) dépendent logiquement de la migration (T004) — à exécuter séquentiellement lors du déploiement.
- **Phase 3 (US1) vs Phase 4 (US2)** : Entièrement parallélisables entre deux développeur·euse·s une fois Phase 2 mergée.
- **Phase 6** : T036, T037, T038 parallélisables [P].

---

## Parallel Example: Phase 2 i18n

```bash
# T009 et T010 peuvent tourner en parallèle :
Task: "Ajouter la section paco.referralSource dans src/locales/fr/paco.json"
Task: "Ajouter la section paco.referralSource dans src/locales/en/paco.json"
```

## Parallel Example: US1 vs US2 (équipe de 2)

```bash
# Dev A — User Story 1 (formulaire)
Task: "T011-T015 — Étendre usePacoRegistration.js"
Task: "T016-T021 — Modifier PacoQuickRegister.vue"

# Dev B — User Story 2 (admin + CSV)
Task: "T022-T025 — Étendre usePacoStats.js"
Task: "T026-T028 — Créer PacoReferralSourceChart.vue"
Task: "T029-T032 — Intégrer dans PacoAdmin.vue et CSV export"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

Les deux user stories sont P1 — l'MVP inclut les deux.

1. Phase 1 (Setup) → Phase 2 (Foundational)
2. Phase 3 (US1) + Phase 4 (US2) en parallèle si possible, sinon US1 → US2 en séquentiel
3. **STOP et VALIDATE** : exécuter `quickstart.md` §3, §4, §5
4. Déployer (migration SQL + RPCs + front-end en lockstep)

### Incremental Delivery

1. Setup + Foundational → Base prête (aucune régression visible pour l'utilisateur final)
2. US1 → Les nouvelles inscriptions capturent le canal
3. US2 → Les admins voient la répartition + CSV
4. US3 → Polish sur les inscriptions historiques (vérification)
5. Polish → Validation finale quickstart + build

### Parallel Team Strategy

Avec 2 développeur·euse·s :

1. Dev A et Dev B coopèrent sur Phase 2 (SQL + composable partagés)
2. Dev A prend US1, Dev B prend US2
3. Dev A valide US3 (puisqu'il/elle connaît la fonction `buildReferralSourceBreakdown`)
4. Polish + déploiement coopératif

---

## Notes

- **[P]** = fichiers différents, aucune dépendance ⇒ parallélisable
- **[Story]** = rattachement user story (traçabilité)
- **Pas de tests automatisés** sur ce projet — validation manuelle via `quickstart.md` (§3 à §10)
- **Commit fréquent** : un commit par groupe logique (ex. T004+T007 = "sql: migration 006 referral source")
- **Déploiement** : obligatoirement dans l'ordre `migration → quick RPC → fallback RPC → front-end` (voir `contracts/rpc_register_paco.md` §4)
- **Rollback** : voir `contracts/rpc_register_paco.md` §5 — les colonnes peuvent rester en place en cas de rollback front-end
- **Source unique des canaux** : toute évolution de la liste des 6 canaux doit se faire dans `src/composables/paco/referralSources.js` ET dans la CHECK constraint DB (migration) ET dans les 2 fichiers i18n — aucune autre source n'est autorisée
