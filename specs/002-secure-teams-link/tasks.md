# Tasks: Sécurisation du lien Teams PACO

**Input**: Design documents from `/specs/002-secure-teams-link/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Non demandés dans la spécification. Scénarios de vérification manuelle dans quickstart.md.

**Organization**: Tasks grouped by user story. US1/US2/US3 are combined in one phase because they represent different states of the same Vue component (`PacoJoinGateway.vue`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare i18n translations and routing needed by all user stories

- [x] T001 [P] Add gateway translation keys (section `gateway`) to French locale in src/locales/fr/paco.json — keys: loading, loginTitle, loginSubtitle, notRegisteredTitle, notRegisteredMessage, registerButton, redirecting, error
- [x] T002 [P] Add gateway translation keys (section `gateway`) to English locale in src/locales/en/paco.json — same keys as T001 translated to English
- [x] T003 Add route `/paco/join` named `paco-join-gateway` with lazy-loaded PacoJoinGateway component in src/router/index.js — place BEFORE the existing `/paco` route

**Checkpoint**: Route and translations ready for gateway page implementation.

---

## Phase 2: US1+US2+US3 — Page Gateway de vérification (Priority: P1) 🎯 MVP

**Goal**: Create the gateway page `/paco/join` that verifies authentication and registration before redirecting to Teams. This single Vue component handles 3 user stories as different states of its state machine.

**Independent Test**:
- US1: Access `/paco/join` while authenticated + registered → auto-redirect to Teams in < 3s
- US2: Access `/paco/join` while not authenticated → login form shown → after login, redirect to Teams
- US3: Access `/paco/join` while authenticated but not registered → message + link to `/paco`

### Implementation

- [x] T004 [US1] Create PacoJoinGateway.vue with loading state and auto-redirect for authenticated+registered users in src/views/paco/PacoJoinGateway.vue — imports: useAuth, usePacoRegistration, PACO_TEAMS_LINK from constants.js. On mount: check isAuthenticated → if true, check registration → if registered, set state to `redirecting` and perform `window.location.href = PACO_TEAMS_LINK`. Include spinner during loading. Support dark mode (dark: classes) and i18n (t() for all text).
- [x] T005 [US2] Add login state with PacoLoginForm to PacoJoinGateway.vue in src/views/paco/PacoJoinGateway.vue — if user is not authenticated, show `login` state with contextual message (t('paco.gateway.loginTitle'), t('paco.gateway.loginSubtitle')) and render PacoLoginForm component. On login-success: re-check registration, redirect to Teams if registered, show not-registered state if not. Handle the `@back` event (no-op or hide, since there's no email-check step here).
- [x] T006 [US3] Add not-registered state to PacoJoinGateway.vue in src/views/paco/PacoJoinGateway.vue — if user is authenticated but NOT registered, show `not-registered` state with warning icon, message (t('paco.gateway.notRegisteredTitle'), t('paco.gateway.notRegisteredMessage')), and a router-link button to `/paco` (t('paco.gateway.registerButton')). Style consistent with PACO page design.

**Checkpoint**: Gateway page fully functional. All 3 P1 user stories testable independently.

---

## Phase 3: US4+US5 — Suppression du lien Teams direct (Priority: P2)

**Goal**: Remove all direct exposure of the Teams link from email and PACO page. Replace with platform gateway link.

**Independent Test**:
- US4: Register for webinar → check email content → must contain `https://epavillonclimatique.francophonie.org/paco/join` and NOT contain `teams.microsoft.com`
- US5: On `/paco` as registered user → "Rejoindre" button href = `/paco/join`, "Copier le lien" copies `/paco/join` URL

### Implementation

- [x] T007 [P] [US4] Replace Teams link with platform link in email template in supabase/functions/send-paco-email/index.ts — add constant `PACO_PLATFORM_JOIN_URL = 'https://epavillonclimatique.francophonie.org/paco/join'`. In buildPacoEmailText(): replace teamsLink parameter with PACO_PLATFORM_JOIN_URL, change label to "Lien pour accéder au webinaire", update instructions to mention connecting to ePavilion account. Keep PACO_TEAMS_LINK constant in file (unused in email but retained).
- [x] T008 [P] [US5] Replace Teams link with platform gateway link in PacoJoinSection component in src/components/paco/PacoJoinSection.vue — change `teamsLink` const from `PACO_TEAMS_LINK` to the platform join URL (`window.location.origin + '/paco/join'` or hardcoded `/paco/join` as router-link). Update `<a :href>` to use platform link. Update `copyTeamsLink()` to copy the platform URL. Remove PACO_TEAMS_LINK import (no longer needed in this component).

**Checkpoint**: Teams link completely hidden from all user-facing surfaces (email + PACO page). Only exposed during gateway redirect.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T009 Run quickstart.md verification scenarios: (1) /paco/join unauthenticated → login form, (2) login with registered account → Teams redirect, (3) login with unregistered account → message + /paco link, (4) register for webinar → email contains platform link, (5) /paco registered user → Rejoindre and Copier use platform link

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **US1+US2+US3 (Phase 2)**: Depends on Phase 1 (route + i18n keys must exist)
- **US4+US5 (Phase 3)**: Depends on Phase 1 only (independent of Phase 2)
- **Polish (Phase 4)**: Depends on Phase 2 AND Phase 3

### User Story Dependencies

- **US1** (P1): Depends on T001, T002, T003 (setup)
- **US2** (P1): Depends on T004 (US1 creates the base component)
- **US3** (P1): Depends on T005 (US2 adds login handling; US3 adds the remaining state)
- **US4** (P2): Depends on T001, T002 only — can start in parallel with Phase 2
- **US5** (P2): No dependencies on other stories — can start in parallel with Phase 2

### Within Each Phase

- Phase 1: T001 and T002 can run in parallel [P]. T003 is independent.
- Phase 2: T004 → T005 → T006 (sequential, same file)
- Phase 3: T007 and T008 can run in parallel [P] (different files)
- Phase 4: T009 runs after all previous phases

### Parallel Opportunities

```
T001 ──┐
T002 ──┼── Phase 1 complete ──┬── T004 → T005 → T006 (Phase 2) ──┐
T003 ──┘                      │                                    ├── T009
                              ├── T007 (Phase 3, parallel) ────────┤
                              └── T008 (Phase 3, parallel) ────────┘
```

---

## Parallel Example: Phase 1

```bash
# Launch all setup tasks together:
Task: "Add gateway i18n keys (FR) in src/locales/fr/paco.json"
Task: "Add gateway i18n keys (EN) in src/locales/en/paco.json"
Task: "Add route /paco/join in src/router/index.js"
```

## Parallel Example: Phase 3

```bash
# Launch US4 and US5 together (different files):
Task: "Replace Teams link in email template in supabase/functions/send-paco-email/index.ts"
Task: "Replace Teams link in PacoJoinSection in src/components/paco/PacoJoinSection.vue"
```

---

## Implementation Strategy

### MVP First (US1+US2+US3)

1. Complete Phase 1: Setup (i18n + route)
2. Complete Phase 2: Gateway page with all 3 states
3. **STOP and VALIDATE**: Test all 3 user stories independently
4. At this point the gateway works but email/PACO page still have old Teams links

### Full Delivery

1. Complete Phase 1: Setup → infrastructure ready
2. Complete Phase 2: Gateway page → core security working
3. Complete Phase 3: Email + JoinSection updates → Teams link fully hidden
4. Complete Phase 4: Verification → deploy

### Parallel Strategy

With the gateway page being sequential (same file), the best parallelization is:
- After Phase 1: Start Phase 2 (gateway) AND Phase 3 (email + join section) in parallel
- Phase 3 tasks (T007, T008) are fully independent of Phase 2

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1/US2/US3 are in the same Vue component — tasks are sequential (same file)
- US4 and US5 are independent and can run in parallel
- No database changes needed — all existing infrastructure reused
- Edge function modification (T007) requires manual deployment: `supabase functions deploy send-paco-email`
- Commit after each task or logical group
