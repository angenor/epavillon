# Tasks: Webinaire PACO

**Input**: Design documents from `/specs/001-paco-webinar/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Non demandés dans la spécification — aucune tâche de test générée.

**Organization**: Tâches groupées par user story pour permettre une implémentation et des tests indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story associée (US1, US2, US3, US4, US5)
- Chemins de fichiers exacts inclus dans les descriptions

---

## Phase 1: Setup (Infrastructure partagée)

**Purpose**: Création de la structure PACO isolée, constantes, script SQL, traductions et route

- [x] T001 Create PACO directory structure: `src/views/paco/`, `src/components/paco/`, `src/composables/paco/`
- [x] T002 [P] Create PACO constants (UUIDs, Teams link placeholder) in `src/composables/paco/constants.js`
- [x] T003 [P] Create SQL setup script (fictitious event `00000000-0000-4000-a000-00000000e001`, fictitious activity `00000000-0000-4000-a000-00000000a002`, RPC `check_paco_email`) in `bank/shema_et_requettes/paco_setup.sql`
- [x] T003b [P] Document RPC function `check_paco_email` in `bank/shema_et_requettes/database_complete.sql` (Constitution V: schema changes MUST be reflected)
- [x] T004 [P] Create French translations (presentation, forms, messages, errors) in `src/locales/fr/paco.json`
- [x] T005 [P] Create English translations (presentation, forms, messages, errors) in `src/locales/en/paco.json`
- [x] T006 Add PACO i18n imports (`import paco from './paco.json' with { type: 'json' }` + spread in export) to `src/locales/fr/index.js` and `src/locales/en/index.js`
- [x] T007 Add `/paco` route (lazy-loaded, no auth guard) to `src/router/index.js`

**Checkpoint**: Structure prête — les composables et composants peuvent être créés.

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Composables métier et edge function — DOIT être terminé avant toute implémentation de user story

**⚠️ CRITICAL**: Aucune tâche de user story ne peut commencer avant la fin de cette phase

- [x] T008 [P] Create usePacoRegistration composable (`checkEmailExists` via RPC `check_paco_email`, `checkPacoRegistration` via query `activity_registrations`, `registerForPaco` via insert `activity_registrations`) in `src/composables/paco/usePacoRegistration.js`
- [x] T009 [P] Create usePacoEmail composable (`sendPacoEmail` via `supabase.functions.invoke('send-paco-email')`) in `src/composables/paco/usePacoEmail.js`
- [x] T010 [P] Create `send-paco-email` edge function (auth check, PACO registration verification, build email HTML with Teams link, call Laravel `LARAVEL_POLIVALENT_EMAIL_URL`) in `supabase/functions/send-paco-email/index.ts`

**Checkpoint**: Logique métier prête — implémentation des composants peut commencer.

---

## Phase 3: User Story 1 + User Story 2 — Inscription visiteur non connecté (Priority: P1) 🎯 MVP

**Goal**: Un visiteur non connecté peut saisir son email, puis soit s'inscrire (nouveau compte + activité), soit se connecter (compte existant) pour recevoir le lien Teams. Couvre les deux flux principaux P1.

**Independent Test**: Visiter `/paco` sans être connecté → entrer un email inexistant → remplir le formulaire d'inscription → vérifier l'entrée dans `activity_registrations` et la réception de l'email. Puis tester avec un email existant → se connecter → vérifier l'inscription automatique.

### Implementation

- [x] T011 [P] [US5] Create PacoPresentation.vue (webinar title, description, date, speakers from i18n, dark/light theme support) in `src/components/paco/PacoPresentation.vue`
- [x] T012 [P] [US1] Create PacoEmailCheck.vue (email input with validation, submit calls `checkEmailExists` from usePacoRegistration, emits `email-checked` with `{email, exists}`) in `src/components/paco/PacoEmailCheck.vue`
- [x] T013 [P] [US1] Create PacoRegisterForm.vue (platform registration fields: first_name, last_name, email pre-filled, password, country, organization + signUp via Supabase Auth + profile update + registerForPaco + sendPacoEmail) in `src/components/paco/PacoRegisterForm.vue`
- [x] T014 [P] [US2] Create PacoLoginForm.vue (email pre-filled + password, signInWithPassword via Supabase Auth, emits `login-success`) in `src/components/paco/PacoLoginForm.vue`
- [x] T015 [US1] [US2] Create PacoWebinar.vue main page with state machine (`step`: email-check → login | register → success | join), wire useAuth, usePacoRegistration, usePacoEmail, integrate PacoPresentation + PacoEmailCheck + PacoRegisterForm + PacoLoginForm, implement post-login auto-registration flow (checkPacoRegistration → registerForPaco if needed → sendPacoEmail) in `src/views/paco/PacoWebinar.vue`

**Checkpoint**: US1 + US2 fonctionnels — un visiteur non connecté peut compléter l'inscription de bout en bout.

---

## Phase 4: User Story 3 — Utilisateur connecté accède au webinaire (Priority: P2)

**Goal**: Un utilisateur déjà connecté voit directement le lien Teams s'il est inscrit, ou un formulaire pré-rempli pour s'inscrire à l'activité.

**Independent Test**: Se connecter d'abord, naviguer vers `/paco` → si déjà inscrit, le bouton Teams et le lien à copier s'affichent. Si non inscrit, le formulaire pré-rempli s'affiche → soumettre → vérifier inscription + email.

### Implementation

- [x] T016 [P] [US3] Create PacoActivityRegister.vue (pre-filled form with user's country/organization from profile, editable fields, submit calls registerForPaco + sendPacoEmail, emits `registration-complete`) in `src/components/paco/PacoActivityRegister.vue`
- [x] T017 [P] [US3] [US4] Create PacoJoinSection.vue (Teams join button opening link, copy-to-clipboard link, resend email button calling sendPacoEmail) in `src/components/paco/PacoJoinSection.vue`
- [x] T018 [US3] Wire connected user states in PacoWebinar.vue: on page load if authenticated → checkPacoRegistration → show PacoActivityRegister or PacoJoinSection; handle `registration-complete` event to transition to PacoJoinSection in `src/views/paco/PacoWebinar.vue`

**Checkpoint**: US3 fonctionnel — un utilisateur connecté accède au webinaire sans re-saisir ses informations.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gestion des cas limites, vérification i18n/thèmes, validation

- [x] T019 Implement edge case handling across all PACO components: duplicate registration detection (show join section instead of error), email sending failure (error message + retry), invalid email format validation, signup failure (email already used — suggest login), page refresh state recovery in `src/views/paco/PacoWebinar.vue` and relevant components
- [x] T020 Verify and complete i18n translations (all user-facing strings use `t()`, both fr and en complete) and dark/light theme support (all components use `dark:` Tailwind classes) across all files in `src/components/paco/` and `src/views/paco/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dépendance — peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup (T002 pour les constantes) — BLOQUE toutes les user stories
- **US1+US2 (Phase 3)**: Dépend de Foundational (T008, T009, T010) — Flux principal MVP
- **US3 (Phase 4)**: Dépend de Phase 3 (PacoWebinar.vue existe) — Peut être implémenté après Phase 3
- **Polish (Phase 5)**: Dépend de toutes les phases précédentes

### User Story Dependencies

- **US1 (P1)** + **US2 (P1)**: Fusionnées car elles partagent PacoEmailCheck.vue comme point d'entrée commun. Peuvent commencer après Phase 2.
- **US3 (P2)**: Peut commencer après Phase 3 (PacoWebinar.vue doit exister pour ajouter les états connecté)
- **US4 (P2)**: Distribuée — edge function (T010), composable (T009), resend button (T017). Pas de phase dédiée.
- **US5 (P2)**: Distribuée — PacoPresentation (T011), i18n (T004/T005), vérification (T020). Pas de phase dédiée.

### Within Each Phase

- Tasks marked [P] can run in parallel
- T015 depends on T011, T012, T013, T014 (all components must exist)
- T018 depends on T016, T017 (connected user components must exist)

### Parallel Opportunities

**Phase 1** (after T001):
```
T002 ─┐
T003 ─┤
T004 ─┼─ all in parallel (different files)
T005 ─┤
T006 ─┘
T007 ─── (can also parallel, touches different file)
```

**Phase 2** (all in parallel):
```
T008 ─┐
T009 ─┼─ all in parallel (different files)
T010 ─┘
```

**Phase 3** (T011-T014 in parallel, then T015):
```
T011 ─┐
T012 ─┼─ parallel → T015 (integrates all)
T013 ─┤
T014 ─┘
```

**Phase 4** (T016-T017 in parallel, then T018):
```
T016 ─┬─ parallel → T018 (wires into page)
T017 ─┘
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 + US2
4. **STOP and VALIDATE**: Tester le flux visiteur de bout en bout
5. Deploy si prêt — les visiteurs peuvent s'inscrire

### Incremental Delivery

1. Setup + Foundational → Infrastructure prête
2. Add US1 + US2 → Test → Deploy (MVP — inscriptions fonctionnelles)
3. Add US3 → Test → Deploy (utilisateurs connectés supportés)
4. Polish → Test → Deploy (edge cases, UX finale)

### Mapping User Stories → Tasks

| User Story | Priority | Tasks |
|-----------|----------|-------|
| US1: Nouveau visiteur s'inscrit | P1 | T012, T013, T015 |
| US2: Visiteur existant se connecte | P1 | T014, T015 |
| US3: Utilisateur connecté | P2 | T016, T017, T018 |
| US4: Envoi email Teams | P2 | T009, T010, T017 (resend) |
| US5: Page de présentation | P2 | T011, T004, T005, T020 |

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label relie la tâche à la user story pour traçabilité
- US4 et US5 n'ont pas de phase dédiée car leurs tâches sont distribuées dans les autres phases
- Chaque composant PACO doit utiliser `t()` pour tous les textes et supporter `dark:` classes
- Committer après chaque tâche ou groupe logique
- S'arrêter à chaque checkpoint pour valider la story indépendamment
