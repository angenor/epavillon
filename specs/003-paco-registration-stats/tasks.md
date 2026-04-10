# Tasks: Formulaire d'inscription PACO et Statistiques Admin

**Input**: Design documents from `/specs/003-paco-registration-stats/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Non demandés explicitement — aucune tâche de test générée.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Créer le script de migration SQL et mettre à jour la documentation de la base de données.

- [x] T001 Create SQL migration script for `paco_demographic_data` table with RLS policies and index in `bank/shema_et_requettes/paco_demographic_data.sql` — copy the exact SQL from `data-model.md` Migration SQL section (CREATE TABLE, RLS policies, index, cleanup comments)
- [x] T002 [P] Update `bank/shema_et_requettes/database_complete.sql` — append the `paco_demographic_data` table definition after the existing PACO-related entries, including schema, RLS policies, and cleanup comments

**Checkpoint**: SQL scripts ready. User must execute `paco_demographic_data.sql` manually in Supabase console before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ajouter les clés i18n pour tous les nouveaux champs et modifier le composable d'inscription pour supporter les données démographiques.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add i18n translation keys for demographic fields and admin section in `src/locales/fr/paco.json` — add keys under new subsections: `paco.demographic` (labels for gender, ageProfile, city, professionalStatus, organization, recordingConsent with their option values: male/female, over35/under35, employed/student/unemployed/entrepreneur), `paco.admin` (title, stats labels for totalRegistrants/genderDistribution/ageDistribution/statusDistribution/percentMale/percentFemale/percentUnder35/percentOver35/percentEmployed/percentStudent/percentEntrepreneur/percentUnemployed, list column headers, export button label, empty state messages, notSpecified label for legacy entries)
- [x] T004 [P] Add i18n translation keys for demographic fields and admin section in `src/locales/en/paco.json` — mirror the exact same key structure as T003 with English translations
- [x] T005 Modify `registerForPaco()` in `src/composables/paco/usePacoRegistration.js` — change return value from boolean to the `registration_id` (UUID) on success (or `null` on failure). After the insert into `activity_registrations`, use `.select('id').single()` to get the inserted row's `id`. Add new function `insertDemographicData(registrationId, demographicData)` that inserts into `paco_demographic_data` table per the contract in `contracts/paco-demographic-insert.md`. Export `insertDemographicData` from the composable.

**Checkpoint**: Foundation ready — i18n keys available, registration composable returns registration_id and can insert demographic data. User stories can now begin.

---

## Phase 3: User Story 1 — Inscription à l'événement PACO (Priority: P1) 🎯 MVP

**Goal**: Enrichir les deux formulaires d'inscription PACO existants avec les champs démographiques (genre, profil d'âge, ville, pays, statut professionnel, organisation, consentement) et sauvegarder ces données dans `paco_demographic_data`.

**Independent Test**: Se connecter → accéder à `/paco` → remplir le formulaire enrichi → soumettre → vérifier en DB que `activity_registrations` ET `paco_demographic_data` contiennent les bonnes données.

### Implementation for User Story 1

- [x] T006 [US1] Enrich `src/components/paco/PacoRegisterForm.vue` — add new form fields after the existing password field: gender (radio buttons: Homme/Femme using `t('paco.demographic.male')` / `t('paco.demographic.female')`), age profile (radio buttons: Plus de 35 ans / Moins de 35 ans), city (text input, required), professional status (select dropdown: Salarié/Étudiant/Sans emploi/Entrepreneur), organization (text input, optional — already exists, keep it), recording consent (single checkbox with text from `t('paco.demographic.recordingConsent')`, required). Country dropdown already exists — keep it. Add these new fields to the `form` reactive object. Add validation: all new required fields must be filled, consent must be checked. On submit, emit the demographic data along with the existing `register-success` event payload.
- [x] T007 [US1] Enrich `src/components/paco/PacoActivityRegister.vue` — add the same demographic fields as T006 (gender, age profile, city, professional status, recording consent). Country and organization already exist in this form. Add validation for new required fields. On submit, emit demographic data alongside the existing payload.
- [x] T008 [US1] Update `src/views/paco/PacoWebinar.vue` — modify the `handleRegisterSuccess` and `handleLoginSuccess` handlers to: (1) call `registerForPaco(userId)` which now returns a `registration_id`, (2) call `insertDemographicData(registrationId, demographicData)` with the demographic form data received from the child component events, (3) handle errors gracefully (if demographic insert fails, still show success since activity registration succeeded). Add double-submit protection (disable submit button while loading, FR-010).

**Checkpoint**: User Story 1 fully functional — users can register with demographic data. Verify by submitting the form and checking both `activity_registrations` and `paco_demographic_data` tables in Supabase.

---

## Phase 4: User Story 2 — Consultation des statistiques PACO (Priority: P2)

**Goal**: Créer une rubrique admin dédiée affichant les statistiques agrégées des inscrits PACO (nombre total, répartitions par genre, âge, statut professionnel).

**Independent Test**: Accéder à la route admin PACO en tant qu'admin → vérifier que les statistiques correspondent aux données en base.

### Implementation for User Story 2

- [x] T009 [US2] Create composable `src/composables/paco/usePacoStats.js` — implement `fetchPacoStats()` that queries `activity_registrations` with embedded select on `paco_demographic_data` (gender, age_profile, professional_status) filtered by `PACO_ACTIVITY_ID` per `contracts/paco-stats-query.md` section 1. Compute client-side: `total` (all registrations), `withDemographics` (those with demographic data), percentage breakdowns for gender/ageProfile/professionalStatus calculated only from entries with demographic data. Return reactive refs: `stats`, `loading`, `error`, and the `fetchPacoStats` function.
- [x] T010 [US2] Create admin view `src/views/paco/PacoAdmin.vue` — build a stats dashboard using `usePacoStats()`. Display: page title (`t('paco.admin.title')`), total registrants card, stat cards for each category (gender: % Homme/Femme, age: % <35/>35, status: % for each of 4 statuses). Use TailwindCSS with dark mode support (`dark:` variants matching existing PACO component patterns). Show skeleton loaders while loading. Show empty state message when no registrations exist. Add `cursor-pointer` on any interactive elements per TailwindCSS v4 convention. All text via `t()`.
- [x] T011 [US2] Add admin PACO route in `src/router/index.js` — add route `{ path: '/paco/admin', name: 'paco-admin', component: () => import('../views/paco/PacoAdmin.vue'), meta: { requiresAuth: true } }`. Place it alongside the existing PACO routes (after `/paco/join` and `/paco`). Add admin role check guard (consistent with existing admin routes pattern in the router).

**Checkpoint**: User Story 2 functional — admin can view PACO registration statistics at `/paco/admin`.

---

## Phase 5: User Story 3 — Liste détaillée et export des inscrits PACO (Priority: P3)

**Goal**: Ajouter à la vue admin PACO un tableau détaillé des inscrits et la possibilité d'exporter en CSV.

**Independent Test**: Accéder à `/paco/admin` → voir le tableau des inscrits → cliquer export → vérifier que le CSV contient les bonnes colonnes et données.

### Implementation for User Story 3

- [x] T012 [US3] Extend `src/composables/paco/usePacoStats.js` — add `fetchPacoRegistrants()` function that queries `activity_registrations` with embedded select on `users` (first_name, last_name, email) and `paco_demographic_data` (gender, age_profile, city, country_id with nested countries(name_fr, name_en), professional_status, organization) per `contracts/paco-stats-query.md` section 2. Return reactive refs: `registrants`, `registrantsLoading`, `registrantsError`. Map response to a flat array of registrant objects for easy table rendering. Handle legacy registrations (null demographic data) by showing `t('paco.admin.notSpecified')` values.
- [x] T013 [P] [US3] Create composable `src/composables/paco/usePacoCsvExport.js` — implement `exportToCsv(registrants, filename)` that takes the registrants array and generates a CSV string with BOM (`\uFEFF`) for Excel compatibility. Columns: Prénom, Nom, Email, Genre, Profil d'âge, Ville, Pays, Statut professionnel, Organisation, Date d'inscription. Map enum values to French labels (male→Homme, female→Femme, etc.). Create a Blob, generate object URL, trigger download via temporary anchor element, revoke URL after download. Export the `exportToCsv` function.
- [x] T014 [US3] Add registrant list and export to `src/views/paco/PacoAdmin.vue` — below the stats section, add: (1) a section header with export button (disabled when no registrants, `cursor-pointer` class), (2) a responsive table displaying all registrant columns (prénom, nom, email, genre, profil d'âge, ville, pays, statut professionnel, organisation, date d'inscription) with TailwindCSS styling and dark mode support, (3) skeleton loader while loading, (4) empty state when no registrants. Wire export button to `usePacoCsvExport`. Use `t()` for all column headers and labels.

**Checkpoint**: User Story 3 functional — admin sees full registrant list and can export to CSV.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Vérifications finales de qualité et cohérence.

- [x] T015 Verify dark/light mode on all new and modified components — check `PacoRegisterForm.vue`, `PacoActivityRegister.vue`, `PacoAdmin.vue` render correctly in both light and dark themes. Ensure all backgrounds, text colors, borders, and interactive elements have appropriate `dark:` variants.
- [x] T016 Verify i18n completeness — confirm all visible text in new/modified components uses `t()` function. Check both `src/locales/fr/paco.json` and `src/locales/en/paco.json` have all keys used in templates. No hardcoded strings allowed.
- [x] T017 Run quickstart.md validation — follow the test flow in `specs/003-paco-registration-stats/quickstart.md` section 4: access `/paco`, register with all demographic fields, check DB, access `/paco/admin`, verify stats and list, test CSV export.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (SQL must exist before coding against the table)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (i18n keys + composable modifications)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (i18n keys). Can run in parallel with US1 if needed.
- **User Story 3 (Phase 5)**: Depends on Phase 4 (extends PacoAdmin.vue and usePacoStats.js created in US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1 (stats work independently even with 0 registrations)
- **User Story 3 (P3)**: Depends on User Story 2 (extends PacoAdmin.vue created in US2 and extends usePacoStats.js)

### Within Each User Story

- Composables before components
- Components before views
- Route registration after view creation
- All text via i18n (keys already in Phase 2)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 and T004 can run in parallel (different locale files)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Phase 2
- T012 and T013 can run in parallel within US3 (different files)

---

## Parallel Example: User Story 1

```bash
# T006 and T007 can run in parallel (different component files):
Task: "Enrich PacoRegisterForm.vue with demographic fields"
Task: "Enrich PacoActivityRegister.vue with demographic fields"

# Then T008 sequentially (depends on T006 + T007 event payloads):
Task: "Update PacoWebinar.vue to handle demographic data flow"
```

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 2 completes, US1 and US2 can start in parallel:
# US1 path: T006 → T007 → T008
# US2 path: T009 → T010 → T011
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (SQL scripts)
2. **USER ACTION**: Execute `paco_demographic_data.sql` in Supabase console
3. Complete Phase 2: Foundational (i18n + composable)
4. Complete Phase 3: User Story 1 (enriched forms)
5. **STOP and VALIDATE**: Test registration with demographic fields
6. Deploy if ready — forms capture demographic data

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test registration → Deploy (MVP — data collection active)
3. Add User Story 2 → Test stats → Deploy (admin can see statistics)
4. Add User Story 3 → Test list + export → Deploy (admin has full visibility + export)
5. Polish → Final validation → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- SQL migration must be executed manually by user in Supabase console before Phase 2 code runs
- All new components must use `cursor-pointer` on interactive elements (TailwindCSS v4)
- All text must use `t()` — no hardcoded strings
- Values stored in English in DB (male/female, over_35/under_35) — display via i18n
- Commit after each task or logical group
