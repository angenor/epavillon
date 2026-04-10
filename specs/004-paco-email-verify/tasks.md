# Tasks: Vérification email dans le workflow PACO

**Input**: Design documents from `/specs/004-paco-email-verify/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Préparer les traductions et les fondations partagées entre les user stories.

- [x] T001 [P] Add email verification i18n keys to `src/locales/fr/paco.json` — add keys under `paco.verifyEmail`: `title` ("Vérifiez votre email"), `subtitle` ("Un email de vérification a été envoyé à {email}. Cliquez sur le lien dans l'email pour finaliser votre inscription au webinaire."), `resendButton` ("Renvoyer l'email de vérification"), `resending` ("Envoi en cours..."), `resent` ("Email renvoyé avec succès !"), `resendError` ("Erreur lors de l'envoi. Veuillez réessayer."), `waitingTitle` ("En attente de vérification"), `checkInbox` ("Vérifiez votre boîte de réception et vos spams"), `autoFinalize` ("Finalisation de votre inscription..."), `autoFinalizeSuccess` ("Inscription au webinaire finalisée !"), `autoFinalizeError` ("Erreur lors de la finalisation. Veuillez réessayer.")
- [x] T002 [P] Add email verification i18n keys to `src/locales/en/paco.json` — add keys under `paco.verifyEmail`: `title` ("Verify your email"), `subtitle` ("A verification email has been sent to {email}. Click the link in the email to complete your webinar registration."), `resendButton` ("Resend verification email"), `resending` ("Sending..."), `resent` ("Email resent successfully!"), `resendError` ("Error sending email. Please try again."), `waitingTitle` ("Waiting for verification"), `checkInbox` ("Check your inbox and spam folder"), `autoFinalize` ("Finalizing your registration..."), `autoFinalizeSuccess` ("Webinar registration complete!"), `autoFinalizeError` ("Error finalizing registration. Please try again.")

**Checkpoint**: i18n keys ready for both languages.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ajouter les fonctions utilitaires dans le composable pour le stockage temporaire et la finalisation post-vérification.

**⚠️ CRITICAL**: Les user stories dépendent de ces fonctions.

- [x] T003 Add sessionStorage helpers to `src/composables/paco/usePacoRegistration.js` — add functions `savePendingRegistration(data)` to store `{userId, email, name, demographicData, timestamp}` in sessionStorage key `paco_pending_registration`, `getPendingRegistration()` to retrieve and validate (return null if > 24h old or userId mismatch), and `clearPendingRegistration()` to remove. Export all three functions.
- [x] T004 Add `finalizePacoRegistration(userId)` function to `src/composables/paco/usePacoRegistration.js` — this function reads pending data from sessionStorage via `getPendingRegistration()`, calls `registerForPaco(userId)`, then `insertDemographicData(registrationId, demographicData)`, then clears sessionStorage via `clearPendingRegistration()`. Returns `{ success: boolean, registrationId: string|null }`. Handles errors gracefully.

**Checkpoint**: Composable functions ready for use by both user stories.

---

## Phase 3: User Story 1 — Inscription PACO complète pour un nouvel utilisateur (Priority: P1) 🎯 MVP

**Goal**: Un nouvel utilisateur peut s'inscrire, vérifier son email, et avoir son inscription au webinaire finalisée automatiquement avec réception du lien Teams.

**Independent Test**: Accéder à `/paco` avec un nouvel email, remplir le formulaire, vérifier l'email, confirmer la finalisation automatique et la réception du lien Teams.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/components/paco/PacoEmailVerification.vue` — new component showing: envelope icon (Font Awesome `fas envelope`), title via `t('paco.verifyEmail.title')`, subtitle with email address interpolated via `t('paco.verifyEmail.subtitle', { email })`, "check inbox" hint via `t('paco.verifyEmail.checkInbox')`, resend button calling `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin + '/paco' } })` with loading/success/error states. Props: `email` (String, required). Design: same dark glass style as other PACO components (bg-white/10, backdrop-blur, rounded-xl, text-white). Emit no events — parent handles state transitions.
- [x] T006 [US1] Modify `src/components/paco/PacoRegisterForm.vue` — change `emailRedirectTo` from `${window.location.origin}/login` to `${window.location.origin}/paco`. After successful signUp (before emitting `register-success`), call `savePendingRegistration({ userId: authData.user.id, email: props.email, name: \`${form.firstName} ${form.lastName}\`.trim(), demographicData: { gender, ageProfile, city, countryId, professionalStatus, organization: organizationName, recordingConsent } })`. Import `savePendingRegistration` from `usePacoRegistration`. Keep the existing `register-success` emit but remove `demographicData` from the payload (it's now in sessionStorage).
- [x] T007 [US1] Modify `src/views/paco/PacoWebinar.vue` — (1) Import `PacoEmailVerification` component. (2) Add `verify-email` to the step state machine. (3) Add template block for `step === 'verify-email'` rendering `PacoEmailVerification` with `:email="checkedEmail"`. (4) Modify `handleRegisterSuccess`: instead of calling `registerForPaco` immediately, set `step.value = 'verify-email'` (the registration will be finalized after email verification). (5) Modify `checkInitialState()`: after confirming `isAuthenticated && user`, check `user.value.email_confirmed_at` — if null, set `step.value = 'verify-email'` and `checkedEmail.value = user.value.email`. If email confirmed, check PACO registration: if registered → `join`; if not registered, call `finalizePacoRegistration(user.value.id)` then `sendPacoEmail` then → `join` (if sessionStorage data exists) or → `activity-register` (if no sessionStorage data). Import `finalizePacoRegistration`, `getPendingRegistration`, `clearPendingRegistration` from `usePacoRegistration`.

**Checkpoint**: User Story 1 functional — new users can register, verify email, and get automatically enrolled in the webinar.

---

## Phase 4: User Story 2 — Retour d'un utilisateur après inscription PACO incomplète (Priority: P2)

**Goal**: Un utilisateur qui a créé son compte via PACO mais n'a pas encore vérifié son email, ou qui l'a vérifié entre-temps, voit le bon écran à son retour sur `/paco`.

**Independent Test**: Créer un compte via PACO sans vérifier l'email, revenir sur `/paco`, vérifier l'affichage de l'écran d'attente. Puis vérifier l'email et revenir — confirmer la finalisation automatique.

### Implementation for User Story 2

- [x] T008 [US2] Enhance `checkInitialState()` in `src/views/paco/PacoWebinar.vue` — ensure the flow handles returning users: (1) If authenticated with `email_confirmed_at === null`, show `verify-email` step (set `checkedEmail` from `user.value.email`). (2) If authenticated with email confirmed but not registered for PACO: attempt auto-finalization from sessionStorage; if no sessionStorage data, redirect to `activity-register`. (3) Add a `watch` on `user` to detect when `email_confirmed_at` changes from null to a value (user verified email in another tab) — trigger auto-finalization. This task builds on T007's changes, adding the watch and handling edge cases for returning users.

**Checkpoint**: User Story 2 functional — returning users with pending verification see the correct screen and get auto-enrolled when email is verified.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Vérifications finales de qualité et cohérence.

- [x] T009 Verify i18n completeness — confirm all visible text in `PacoEmailVerification.vue` and modified components uses `t()` function. Check both `src/locales/fr/paco.json` and `src/locales/en/paco.json` have all keys used in templates. No hardcoded strings allowed.
- [x] T010 Verify dark theme on `PacoEmailVerification.vue` — ensure the component renders correctly on the dark PACO background (consistent with PacoRegisterForm and PacoLoginForm styling: white text, white/10 borders, green accent colors).
- [x] T011 Run `npm run build` to verify no compilation errors after all changes.
- [x] T012 Run quickstart.md validation — follow the test flow in `specs/004-paco-email-verify/quickstart.md`: access `/paco`, register with new email, verify email verification screen appears, test resend button, verify email, confirm auto-finalization and Teams link email.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can run in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — T003 then T004 (sequential, same file)
- **User Story 1 (Phase 3)**: Depends on Phase 2 — T005 [P] with T006 (different files), then T007 (depends on T005, T006)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (T007) — T008 modifies same file as T007
- **Polish (Phase 5)**: Depends on all previous phases — T009 through T012 sequential

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). Core MVP — must complete first.
- **User Story 2 (P2)**: Depends on User Story 1 (Phase 3) — enhances the same `checkInitialState()` function.

### Parallel Opportunities

- T001 and T002 can run in parallel (different locale files)
- T005 and T006 can run in parallel (different component files)

---

## Parallel Example: Phase 1

```bash
# Launch both i18n tasks together:
Task T001: "Add FR verification keys to src/locales/fr/paco.json"
Task T002: "Add EN verification keys to src/locales/en/paco.json"
```

## Parallel Example: User Story 1

```bash
# Launch component creation and form modification together:
Task T005: "Create PacoEmailVerification.vue in src/components/paco/"
Task T006: "Modify PacoRegisterForm.vue emailRedirectTo and sessionStorage"
# Then sequentially:
Task T007: "Modify PacoWebinar.vue with verify-email step" (depends on T005, T006)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: i18n keys (T001, T002)
2. Complete Phase 2: Composable functions (T003, T004)
3. Complete Phase 3: User Story 1 (T005, T006, T007)
4. **STOP and VALIDATE**: Test new user registration + email verification + auto-finalization
5. Deploy if ready

### Full Delivery

1. Complete MVP (Phases 1-3)
2. Add User Story 2 (Phase 4: T008) — returning user handling
3. Polish (Phase 5: T009-T012) — i18n, theme, build, validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Supabase Redirect URL `/paco` must be added to allowed redirect URLs in Supabase Dashboard (manual step by user)
- `sessionStorage` data expires after 24h — validated by timestamp check in `getPendingRegistration()`
- `email_confirmed_at` is available on `supabase.auth.getUser()` response object
- Values stored in sessionStorage use camelCase keys matching existing demographic data format
- Commit after each task or logical group
