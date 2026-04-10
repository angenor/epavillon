---
description: "Task list for feature 005-paco-registration-fallback"
---

# Tasks: Inscription PACO non bloquante avec récupération des échecs

**Input** : Design documents from `/specs/005-paco-registration-fallback/`
**Prerequisites** : [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests** : Les tests automatisés sont inclus en **Phase 6 (Polish)** comme éléments OPTIONNELS, car la spec et les contrats définissent explicitement des cas de test Vitest + Playwright. Ils ne sont pas en TDD préalable.

**Organization** : Les tâches sont groupées par user story pour permettre l'implémentation et la livraison incrémentale (MVP = US1).

## Format : `[ID] [P?] [Story?] Description avec chemin de fichier`

- **[P]** : parallélisable (fichier différent, aucune dépendance sur une tâche incomplète)
- **[Story]** : [US1], [US2], [US3] — non présent pour Setup, Foundational et Polish
- Les chemins sont absolus au sein du repo

---

## Phase 1 : Setup (Infrastructure partagée)

**Purpose** : Pré-requis minimaux avant de toucher à la base de données.

- [X] T001 Vérifier la présence de la contrainte `UNIQUE (registration_id)` sur `public.paco_demographic_data` en relisant [bank/shema_et_requettes/paco_demographic_data.sql](../../bank/shema_et_requettes/paco_demographic_data.sql) — requis pour que la clause `ON CONFLICT (registration_id) DO UPDATE` de la promotion `register_paco_quick` fonctionne. Si manquante, créer une migration correctrice avant de poursuivre.

---

## Phase 2 : Foundational (Prérequis bloquants)

**Purpose** : Migration DB + RPCs + mise à jour du snapshot. **Aucune user story ne peut commencer avant la fin de cette phase.**

**⚠️ CRITICAL** : US1, US2 et US3 dépendent toutes des RPCs et des trois nouvelles colonnes.

- [X] T002 Créer la migration SQL [bank/shema_et_requettes/005_paco_registration_fallback.sql](../../bank/shema_et_requettes/005_paco_registration_fallback.sql) : `ALTER TABLE activity_registrations ADD COLUMN fallback_payload JSONB, fallback_error TEXT, recovered_at TIMESTAMPTZ` + commentaires + index partiel `activity_registrations_fallback_pending_idx` (voir §2 de [data-model.md](./data-model.md#2-migration-sql)).
- [X] T003 [P] Créer la nouvelle RPC [bank/shema_et_requettes/rpc_register_paco_fallback.sql](../../bank/shema_et_requettes/rpc_register_paco_fallback.sql) `SECURITY DEFINER` conforme à [contracts/rpc_register_paco_fallback.md](./contracts/rpc_register_paco_fallback.md) : normalisation email, extraction `firstName/lastName` du payload, `INSERT … ON CONFLICT DO UPDATE WHERE fallback_payload IS NOT NULL` (anti-dégradation), `GRANT EXECUTE` à `anon` et `authenticated`.
- [X] T004 [P] Remplacer [bank/shema_et_requettes/rpc_register_paco_quick.sql](../../bank/shema_et_requettes/rpc_register_paco_quick.sql) avec la nouvelle logique de promotion conforme à [contracts/rpc_register_paco_quick.md](./contracts/rpc_register_paco_quick.md) : ajouter la Branche 3 (`SELECT … FOR UPDATE`, si `fallback_payload IS NOT NULL` alors `UPDATE … SET fallback_payload = NULL, fallback_error = NULL, guest_* …` + `INSERT INTO paco_demographic_data … ON CONFLICT (registration_id) DO UPDATE`, préserver `registration_date` et `recovered_at`).
- [X] T005 [P] Mettre à jour [bank/shema_et_requettes/database_complete.sql](../../bank/shema_et_requettes/database_complete.sql) : refléter les trois nouvelles colonnes dans la définition de `activity_registrations` et ajouter le nouvel index partiel (principe V de la constitution — Database Schema as Source of Truth).
- [X] T006 Vérifier les politiques RLS `activity_registrations` dans [bank/shema_et_requettes/database_complete.sql](../../bank/shema_et_requettes/database_complete.sql) pour la mutation `UPDATE recovered_at` par un admin PACO authentifié ; si absente, ajouter la policy dans la migration T002 (voir §7 de [data-model.md](./data-model.md#7-impact-sur-les-rls)).
- [X] T007 Fournir les instructions manuelles de déploiement dans [specs/005-paco-registration-fallback/deployment-notes.md](./deployment-notes.md) : ordre d'exécution (`005_paco_registration_fallback.sql` → `rpc_register_paco_fallback.sql` → `rpc_register_paco_quick.sql`), commande `supabase db push` ou équivalent, vérification des GRANT. Aucune commande ne doit être exécutée automatiquement (règle projet CLAUDE.md).

**Checkpoint** : Les trois RPCs sont déployées et testables via `psql` ou Supabase Studio. Les user stories peuvent démarrer en parallèle.

---

## Phase 3 : User Story 1 - Participant qui valide son formulaire malgré une erreur technique (Priority: P1) 🎯 MVP

**Goal** : L'inscription au webinaire PACO ne bloque plus jamais visiblement l'utilisateur. En cas d'échec technique, le système bascule silencieusement en mode secours et présente immédiatement le bouton « Rejoindre le webinaire ».

**Independent Test** : Suivre [quickstart.md Scénario 1](./quickstart.md#scénario-1--utilisateur-bloqué-aujourdhui-sauvé-par-le-fallback-user-story-1) — intercepter `fetch` pour forcer un échec de `register_paco_quick`, soumettre le formulaire, vérifier que l'écran de succès s'affiche sans erreur et qu'une ligne avec `fallback_payload IS NOT NULL` existe en base.

- [X] T008 [P] [US1] Ajouter la fonction `registerPacoWithFallback(input)` dans [src/composables/paco/usePacoRegistration.js](../../src/composables/paco/usePacoRegistration.js) conforme à [contracts/composable_use_paco_registration.md](./contracts/composable_use_paco_registration.md) : cascade 3 niveaux (standard → fallback → localStorage-only), retour `{ status, registrationId, technicalError }`, jamais de rejet de promesse, appel à `markPacoRegistered` + `localStorage.setItem('paco_registration_data_session_{n}', …)` dans tous les cas.
- [X] T009 [US1] Refactorer `handleSubmit` dans [src/components/paco/PacoQuickRegister.vue](../../src/components/paco/PacoQuickRegister.vue) pour appeler `registerPacoWithFallback` (suppression du `try/catch` local, suppression du chemin `errorMessage.value = t('paco.errors.registration')`). L'émission de `registration-complete` devient inconditionnelle après succès `standard`, `fallback` ou `local_only`. Dépend de T008.
- [X] T010 [P] [US1] Si [src/components/paco/PacoRegisterForm.vue](../../src/components/paco/PacoRegisterForm.vue) contient un chemin de soumission similaire (cf. structure documentée dans plan.md), appliquer le même refactoring pour déléguer à `registerPacoWithFallback`. Sinon, confirmer par relecture que ce composant ne fait pas d'appel direct à `register_paco_quick` et marquer la tâche comme non applicable. Dépend de T008.
- [X] T011 [P] [US1] Ajouter les clés i18n `paco.registration.fallbackInfoBanner` (message discret non alarmant optionnel) dans [src/locales/fr/paco.json](../../src/locales/fr/paco.json) — uniquement si un wording dédié est retenu côté UX ; sinon supprimer cette tâche. Principe II (NON-NEGOTIABLE).
- [X] T012 [P] [US1] Ajouter les clés i18n correspondantes dans [src/locales/en/paco.json](../../src/locales/en/paco.json) en gardant la parité exacte avec T011.

**Checkpoint** : US1 entièrement fonctionnelle. L'utilisateur n'est plus jamais bloqué par un échec technique de `register_paco_quick`. Déploiement MVP possible à cette étape.

---

## Phase 4 : User Story 2 - Conservation des inscriptions échouées pour rattrapage (Priority: P1)

**Goal** : L'équipe IFDD peut consulter chaque inscription de secours depuis l'admin, voir le payload JSON complet + le message d'erreur d'origine, marquer l'inscription comme « rattrapée », et exporter un CSV enrichi.

**Independent Test** : Suivre [quickstart.md Scénario 4](./quickstart.md#scénario-4--côté-admin--consulter-et-rattraper-un-secours) — après avoir créé une inscription de secours via US1, ouvrir `/paco/admin`, vérifier l'apparition du badge orange « Secours », ouvrir la modale détails, cliquer « Marquer comme rattrapée », observer le badge vert, et exporter le CSV enrichi.

- [X] T013 [US2] Étendre le `select()` de `fetchPacoRegistrants` et `fetchAllRegistrantsForExport` dans [src/composables/paco/usePacoStats.js](../../src/composables/paco/usePacoStats.js) pour inclure `fallback_payload, fallback_error, recovered_at`. Mapper chaque ligne retournée vers un objet enrichi `{ …existant, isFallback, fallbackPayload, fallbackError, recoveredAt }`. Quand `isFallback === true` ET `paco_demographic_data` est absent, extraire `gender/ageProfile/city/countryFr/En/professionalStatus/organization` depuis `fallbackPayload.demographic` pour l'affichage uniforme (voir §1 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#1-extension-du-modèle--registrant--renvoyé-par-usepacostats)).
- [X] T014 [P] [US2] Ajouter la fonction `markRegistrationRecovered(registrationId)` dans [src/composables/paco/usePacoRegistration.js](../../src/composables/paco/usePacoRegistration.js) conforme à [contracts/composable_use_paco_registration.md §API publique ajoutée (seconde méthode)](./contracts/composable_use_paco_registration.md#api-publique-ajoutée-seconde-méthode-côté-admin) : `UPDATE activity_registrations SET recovered_at = NOW() WHERE id = $1 AND fallback_payload IS NOT NULL AND recovered_at IS NULL`, retour `{ success, error }`.
- [X] T015 [P] [US2] Étendre [src/composables/paco/usePacoCsvExport.js](../../src/composables/paco/usePacoCsvExport.js) avec quatre nouvelles colonnes : `type` (`'standard'`/`'fallback'`), `fallback_error`, `recovered_at`, `fallback_payload_json` (JSON.stringify). Préserver l'ordre et le nommage des colonnes existantes (§6 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#6-export-csv--usepacocsvexportjs)).
- [X] T016 [P] [US2] Ajouter le variant `fallback` à [src/components/paco/PacoStatusBadge.vue](../../src/components/paco/PacoStatusBadge.vue) : props `variant: 'standard' | 'fallback'` et `recovered: Boolean`, rendu orange si `!recovered`, vert si `recovered`. Dark mode `dark:` conforme constitution III.
- [X] T017 [US2] Mettre à jour [src/components/paco/PacoRegistrantTable.vue](../../src/components/paco/PacoRegistrantTable.vue) : (a) afficher `<PacoStatusBadge variant="fallback" :recovered="!!r.recoveredAt" v-if="r.isFallback" />` sur chaque ligne ; (b) ajouter une colonne « Type » (masquée sur mobile) ; (c) ajouter un bouton icône « Détails » visible uniquement sur les lignes `isFallback`. Dépend de T013 et T016.
- [X] T018 [US2] Ajouter la modale « Détails secours » dans [src/components/paco/PacoRegistrantTable.vue](../../src/components/paco/PacoRegistrantTable.vue) réutilisant l'approche de la modale de suppression existante ([PacoAdmin.vue:122-148](../../src/views/paco/PacoAdmin.vue#L122-L148)) : affiche `fallbackPayload` pretty-printed (via `<pre>{{ JSON.stringify(r.fallbackPayload, null, 2) }}</pre>`), `fallbackError`, `registrationDate`, `recoveredAt` et un bouton « Marquer comme rattrapée » visible uniquement si `!recoveredAt`. Dépend de T017.
- [X] T019 [US2] Câbler le bouton « Marquer comme rattrapée » de la modale T018 pour appeler `markRegistrationRecovered` (T014), rafraîchir la liste via `fetchPacoRegistrants`, et afficher un feedback (toast ou badge qui bascule). Dépend de T014 et T018.
- [X] T020 [P] [US2] Ajouter dans [src/locales/fr/paco.json](../../src/locales/fr/paco.json) toutes les clés énumérées au §8 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#8-contrat-i18n-fr--en) : `paco.admin.fallback.detailsTitle`, `payloadLabel`, `errorLabel`, `markRecovered`, `markRecoveredConfirm`, `recoveredAt`, `badgeFallback`, `badgeRecovered`, `exportType`, `exportError`, `exportRecoveredAt`, `exportPayload`.
- [X] T021 [P] [US2] Ajouter les mêmes clés dans [src/locales/en/paco.json](../../src/locales/en/paco.json) avec traductions anglaises équivalentes. Principe II NON-NEGOTIABLE — parité stricte avec T020.
- [X] T022 [US2] Vérifier que `subscribeToPacoChanges` dans [src/composables/paco/usePacoStats.js](../../src/composables/paco/usePacoStats.js) propage bien l'événement Realtime `UPDATE` sur `recovered_at` et rafraîchit la liste admin (aucune modification attendue — juste une vérification, voir §7 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#7-contrat-realtime)).

**Checkpoint** : US2 entièrement fonctionnelle. Les admins peuvent consulter, rattraper et exporter les inscriptions de secours.

---

## Phase 5 : User Story 3 - Comptage cohérent des inscrits incluant les inscriptions de secours (Priority: P2)

**Goal** : Les compteurs publics et administratifs reflètent exactement le nombre total d'inscrits (standard + secours), sans double comptage. Les admins peuvent filtrer par type et voir des sous-compteurs dédiés.

**Independent Test** : Suivre [quickstart.md Scénarios 2 et 3](./quickstart.md#scénario-2--resoumission-après-vidage-du-cache-edge-case) — vérifier qu'une inscription de secours augmente le total de 1, qu'une promotion ne double pas le compteur, et que les stats admin distinguent standard vs secours.

- [X] T023 [US3] Étendre `fetchPacoStats` dans [src/composables/paco/usePacoStats.js](../../src/composables/paco/usePacoStats.js) : inclure `fallback_payload, recovered_at` dans le `select()`, calculer côté client `fallbackTotal`, `recoveredTotal`, `fallbackPending = fallbackTotal - recoveredTotal` et les ajouter au retour. Le `total` global reste `COUNT(*)` inchangé car l'unicité (email, session) est garantie (voir §2 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#2-extension-de-stats-dans-fetchpacostats)). Dépend de T013.
- [X] T024 [P] [US3] Ajouter trois nouvelles cartes dans [src/components/paco/PacoStatsCards.vue](../../src/components/paco/PacoStatsCards.vue) : « Inscriptions de secours » (`fallbackTotal`), « Rattrapées » (`recoveredTotal`), « À rattraper » (`fallbackPending`) — mise en évidence visuelle si `fallbackPending > 0`. Skeleton loader, dark mode et i18n conformes. Dépend de T023.
- [X] T025 [P] [US3] Ajouter un filtre segmenté « Type d'inscription » (`all / standard / fallback / fallback_pending`) à côté du filtre session existant dans [src/views/paco/PacoAdmin.vue](../../src/views/paco/PacoAdmin.vue). Nouvelle ref `typeFilter`, filtrage côté client sur `registrants.value` (volume < 1000, pas d'optimisation SQL). Voir §5 de [contracts/ui_admin_fallback.md](./contracts/ui_admin_fallback.md#5-pacoadminvue--filtre-global).
- [X] T026 [US3] Propager le filtre `typeFilter` dans [src/components/paco/PacoRegistrantTable.vue](../../src/components/paco/PacoRegistrantTable.vue) via prop, et appliquer le filtre sur le rendu de la liste. Dépend de T025.
- [X] T027 [US3] Vérifier que le compteur public affiché dans [src/views/paco/PacoWebinar.vue](../../src/views/paco/PacoWebinar.vue) (si présent) utilise bien `fetchPacoStats().total` — aucune modification attendue car le total est déjà un `COUNT(*)` inclusif ; documenter le résultat de la vérification. Dépend de T023. **Résultat vérification (2026-04-10) :** aucun compteur public d'inscrits n'est affiché dans `PacoWebinar.vue` ni dans ses composants enfants (`PacoSession1`, `PacoSession2`, `PacoCountdown`). Aucune requête directe sur `activity_registrations` (type `count`, `head:true`) n'existe dans les composants publics PACO. **Aucune modification nécessaire.**
- [X] T028 [P] [US3] Ajouter dans [src/locales/fr/paco.json](../../src/locales/fr/paco.json) les clés de stats et de filtre : `paco.admin.stats.fallbackTotal`, `recoveredTotal`, `fallbackPending`, `fallbackTooltip`, `paco.admin.filter.type.label`, `all`, `standard`, `fallback`, `fallbackPending`.
- [X] T029 [P] [US3] Ajouter les mêmes clés dans [src/locales/en/paco.json](../../src/locales/en/paco.json). Parité stricte avec T028.

**Checkpoint** : US3 entièrement fonctionnelle. Toutes les user stories sont livrables indépendamment.

---

## Phase 6 : Polish & Cross-Cutting Concerns (optionnel)

**Purpose** : Tests automatisés, validation manuelle globale et ajustements transverses. Les tests sont **optionnels** ; ils sont listés ici uniquement parce que les contrats définissent des cas explicites.

- [ ] T030 [P] (optionnel) Écrire les 5 tests unitaires Vitest définis dans [contracts/composable_use_paco_registration.md §Contrat de test unitaire](./contracts/composable_use_paco_registration.md#contrat-de-test-unitaire-phase-2) dans `tests/unit/paco/usePacoRegistration.spec.js` : succès standard, échec → fallback, double échec → local_only, aucune exception propagée, `markRegistrationRecovered`.
- [ ] T031 [P] (optionnel) Écrire les tests unitaires Vitest pour `usePacoStats` dans `tests/unit/paco/usePacoStats.spec.js` : mapping `isFallback`, dérivation de `fallbackTotal/recoveredTotal/fallbackPending`, fusion des données démographiques depuis `fallbackPayload.demographic` quand la jointure est absente.
- [ ] T032 [P] (optionnel) Écrire un test E2E Playwright dans `tests/e2e/paco/fallback.spec.js` qui reproduit [quickstart.md Scénario 1](./quickstart.md#scénario-1--utilisateur-bloqué-aujourdhui-sauvé-par-le-fallback-user-story-1) : interception `window.fetch`, soumission du formulaire, vérification de l'écran de succès et absence de message d'erreur visible.
- [ ] T033 (optionnel) Écrire des tests pgTAP ou scripts SQL de régression dans `bank/shema_et_requettes/tests/test_paco_fallback.sql` couvrant les 4 cas de [contracts/rpc_register_paco_fallback.md](./contracts/rpc_register_paco_fallback.md#contrat-de-test-phase-2--pour-tasksmd) et les 4 cas de [contracts/rpc_register_paco_quick.md](./contracts/rpc_register_paco_quick.md#contrat-de-test-phase-2--pour-tasksmd).
- [ ] T034 Exécuter intégralement [quickstart.md](./quickstart.md) (5 scénarios) et documenter les résultats dans un commit de validation — couvre SC-001 à SC-006.
- [ ] T035 [P] Relire tous les composants/vues touchés et vérifier la parité dark mode (classes `dark:*` sur les nouveaux éléments : cartes stats, badges, modale, filtres) — principe III NON-NEGOTIABLE.
- [ ] T036 [P] Vérifier qu'aucun texte en dur n'a été introduit dans les templates Vue modifiés (grep sur `>[A-Za-zÀ-ÿ]` dans les fichiers de T017, T018, T024, T025) — principe II NON-NEGOTIABLE.
- [ ] T037 Nettoyer les `console.log`/`console.warn` non essentiels ajoutés pendant le développement. Conserver uniquement `console.warn('[PACO] Registration completed via fallback path:', result.status)` et `console.error('PACO fallback double failure:', …)` qui sont prescrits par le contrat composable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** : aucune dépendance — peut démarrer immédiatement.
- **Phase 2 (Foundational)** : dépend de Phase 1. **Bloque toutes les user stories.**
- **Phase 3 (US1)** : dépend de Phase 2. Indépendante de US2 et US3.
- **Phase 4 (US2)** : dépend de Phase 2. Indépendante de US1. T013 (enrichissement `usePacoStats`) est consommé par US3.
- **Phase 5 (US3)** : dépend de Phase 2 et de **T013 dans US2** (enrichissement du `select()`). Peut démarrer en parallèle avec la fin de US2 une fois T013 mergée.
- **Phase 6 (Polish)** : dépend des user stories concernées.

### User Story Dependencies

- **US1 (P1)** : totalement indépendante après Phase 2. → **MVP déployable dès US1.**
- **US2 (P1)** : indépendante d'US1. Peut être développée en parallèle par un second développeur.
- **US3 (P2)** : dépend de T013 d'US2 (enrichissement `usePacoStats.fetchPacoRegistrants`). Le reste d'US3 est indépendant.

### À l'intérieur de chaque user story

- **US1** : T008 (composable) avant T009 (refactor PacoQuickRegister.vue) et T010 (refactor PacoRegisterForm.vue le cas échéant). T011+T012 (i18n) parallèles à T008-T010.
- **US2** : T013 avant T017/T018/T019 ; T014 avant T019 ; T016 avant T017 ; T020+T021 (i18n) parallèles au reste ; T022 purement vérificatif.
- **US3** : T023 avant T024, T025, T027 ; T025 avant T026 ; T028+T029 (i18n) parallèles.

### Parallel Opportunities

- **Phase 2** : T003, T004, T005 peuvent être écrites en parallèle (fichiers différents). T002 peut s'écrire en parallèle aussi si on fige le nom des colonnes en amont.
- **Phase 3 (US1)** : T008 d'abord ; puis T010, T011, T012 en parallèle avec T009.
- **Phase 4 (US2)** : T014, T015, T016, T020, T021 peuvent démarrer en parallèle dès que T013 est mergée. T017 puis T018 puis T019 séquentiels (même fichier).
- **Phase 5 (US3)** : T024, T025, T028, T029 en parallèle dès que T023 est mergée.
- **Phase 6** : T030, T031, T032 en parallèle (fichiers de tests différents). T035 et T036 en parallèle.

---

## Parallel Example : User Story 1

```bash
# Étape 1 : implémenter d'abord le composable (bloquant)
Task: "T008 Ajouter registerPacoWithFallback dans src/composables/paco/usePacoRegistration.js"

# Étape 2 : lancer en parallèle le refactor du composant et l'i18n
Task: "T009 Refactor handleSubmit dans src/components/paco/PacoQuickRegister.vue"
Task: "T010 Refactor PacoRegisterForm.vue si applicable"
Task: "T011 Ajouter clés fr dans src/locales/fr/paco.json"
Task: "T012 Ajouter clés en dans src/locales/en/paco.json"
```

## Parallel Example : Phase 2 Foundational

```bash
# Écriture des 4 fichiers SQL en parallèle (fichiers indépendants)
Task: "T002 Créer 005_paco_registration_fallback.sql"
Task: "T003 Créer rpc_register_paco_fallback.sql"
Task: "T004 Remplacer rpc_register_paco_quick.sql"
Task: "T005 Mettre à jour database_complete.sql"
```

---

## Implementation Strategy

### MVP First (US1 uniquement)

1. **Phase 1 + Phase 2** : setup + migration + les deux RPCs (T001 → T007).
2. **Phase 3 (US1)** : composable + refactor `PacoQuickRegister.vue` + i18n (T008 → T012).
3. **STOP et VALIDER** : dérouler [quickstart.md Scénario 1](./quickstart.md#scénario-1--utilisateur-bloqué-aujourdhui-sauvé-par-le-fallback-user-story-1) — si l'utilisateur est bien débloqué en cas d'échec technique, le besoin critique (SC-001, SC-002, SC-005) est déjà satisfait et on peut déployer.
4. Les inscriptions de secours sont déjà en base (T002+T003) — l'équipe IFDD peut consulter manuellement via SQL en attendant US2.

### Livraison incrémentale

1. **Foundational + US1** → déploiement MVP → l'utilisateur n'est plus bloqué.
2. **US2** → admins consultent et rattrapent les secours via l'UI.
3. **US3** → stats enrichies, filtres, compteurs par type.
4. **Polish** → tests automatisés + quickstart global.

### Stratégie d'équipe (si > 1 dév)

- Dev A : Phase 2 (SQL + RPCs) → US1.
- Dev B : attend T013 d'US2 (peut être extrait en amont par Dev A puis partagé) → US3.
- Dev C (ou Dev A après US1) : US2.
- Polish partagé.

---

## Notes

- **[P] ne signifie pas obligatoire** : ces tâches sont parallélisables mais peuvent tout à fait être faites séquentiellement par un seul développeur.
- **i18n (Principe II NON-NEGOTIABLE)** : les paires T011/T012, T020/T021, T028/T029 doivent être mergées ensemble (ou dans le même commit) pour ne pas laisser fr et en désynchronisés.
- **Dark mode (Principe III NON-NEGOTIABLE)** : vérifier systématiquement les classes `dark:*` sur tout nouvel élément UI.
- **Installations et déploiements** : suivre strictement [CLAUDE.md §Installations et déploiements](../../CLAUDE.md#installations-et-déploiements) — aucune commande `supabase functions deploy` ou `npm install` ne doit être exécutée automatiquement. T007 produit les instructions manuelles.
- **Index UNIQUE existant** : `activity_registrations_guest_session_unique` est déjà en place — aucun nouvel index UNIQUE à créer (voir R5 dans [research.md](./research.md#r5-déduplication-standard--secours-et-garantie-dunicité)).
- **Commit discipline** : commit après chaque tâche ou groupe logique, suivre conventional commits (`feat:`, `fix:`, `refactor:`, `chore:` per feature SQL/composable/component).
