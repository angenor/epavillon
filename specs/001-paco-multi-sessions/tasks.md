# Tasks: PACO Webinar Multi-Sessions avec Navigation par Onglets

**Input**: Design documents from `/specs/001-paco-multi-sessions/`  
**Branch**: `001-paco-multi-sessions`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Peut s'exécuter en parallèle avec d'autres tâches [P] (fichiers différents, pas de dépendance)
- **[Story]**: User story associée (US1–US4)
- Chemins de fichiers absolus depuis la racine du dépôt

---

## Phase 2: Fondations (Prérequis bloquants)

**But**: Base de données et données de configuration — MUST être complets avant toute user story

**⚠️ CRITIQUE**: Les tâches T001–T003 nécessitent un déploiement manuel Supabase. T004–T005 sont purement côté code.

- [X] T001 Créer `bank/shema_et_requettes/migration_001_add_session_edition.sql` : ADD COLUMN `session_edition INTEGER NOT NULL DEFAULT 1` sur `activity_registrations`, UPDATE existants à 1, DROP anciens index `activity_registrations_guest_unique` et `activity_registrations_user_unique`, CREATE nouveaux index `activity_registrations_guest_session_unique(activity_id, guest_email, session_edition)` et `activity_registrations_user_session_unique(activity_id, user_id, session_edition)`
- [X] T002 [P] Mettre à jour `bank/shema_et_requettes/rpc_register_paco_quick.sql` : ajouter paramètre `p_session_edition INTEGER DEFAULT 2`, mettre à jour la vérification d'unicité (`WHERE session_edition = p_session_edition`) et l'INSERT (`session_edition`) dans la fonction `register_paco_quick`
- [X] T003 [P] Mettre à jour `bank/shema_et_requettes/database_complete.sql` : ajouter la colonne `session_edition INTEGER NOT NULL DEFAULT 1` dans la définition de `activity_registrations`, remplacer les deux anciens index par les deux nouveaux incluant `session_edition`
- [X] T004 [P] Refactoriser `src/composables/paco/usePacoWebinarData.js` : remplacer `WEBINAR_DATA` (objet unique) par `SESSIONS_DATA` (tableau de 2 sessions) — session 1 avec `edition:1`, `date:'2026-03-26'`, `completed:true`, `replayUrl:'https://www.youtube.com/embed/482HTq49tlQ?autoplay=1&mute=1'`, `coverImage:'/images/banniere_paco.jpg'`, `i18nPrefix:'paco.session1'`, panelists session 1 (MARTIN-PHIPPS, HOUDANON, VALLIER, LAZARE, AYI NKAMGNA, BETCHEM, SALL) ; session 2 avec `edition:2`, `date:'2026-04-30'`, `completed:false`, `replayUrl:null`, `coverImage:'/images/image_paco_session_2.jpg'`, `i18nPrefix:'paco.session2'`, panelists session 2 (Tounao KIRI/PACO, Abdallah BAGLHI/PACO Bénin, Sokhna Dié KA/Natural Justice) ; exposer `sessions` (ref tableau), `currentSession` (computed: dernière session non terminée), `getSessionStatus(session)`, `getStatusLabel(status)`, `getStatusColor(status)` — supprimer `webinar` de l'export
- [X] T005 [P] Ajouter les clés i18n des onglets dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` : section `paco.tabs` avec `session1:"Session 1"`, `session2:"Session 2"`, `status.ended:"Terminée"/"Ended"`, `status.upcoming:"À venir"/"Upcoming"`, `status.live:"En direct"/"Live"`

**Checkpoint**: Fondations prêtes — les phases US1–US4 peuvent démarrer

---

## Phase 3: US1 — Navigation par onglets (Priority: P1) 🎯 MVP

**Goal**: L'utilisateur voit deux onglets Session 1 / Session 2 sur `/paco`, Session 2 active par défaut, et peut basculer sans rechargement.

**Independent Test**: Visiter `/paco` → 2 onglets visibles, onglet Session 2 actif, clic sur Session 1 affiche un contenu différent (même si PacoSession1/PacoSession2 ne sont pas encore créés — on peut afficher un placeholder).

- [X] T006 [US1] Créer `src/components/paco/PacoSessionTabs.vue` : props `sessions:Array` (tableau SessionData) et `modelValue:Number` (edition active), emit `update:modelValue` ; afficher un bouton-onglet par session avec `t(session.i18nPrefix + '.title')` tronqué + badge statut (`t('paco.tabs.status.' + getSessionStatus(session))`) coloré (green=upcoming, amber=live, gray=ended) ; style actif (fond vert/blanc, texte contrasté) vs inactif (fond transparent, texte estompé) — TailwindCSS v4, cursor-pointer obligatoire
- [X] T007 [P] [US1] Modifier `src/components/paco/PacoPresentation.vue` : ajouter prop `sessionData:Object` (optionnelle, default null) ; si `sessionData` fourni → utiliser `sessionData.coverImage` pour la bannière, `t(sessionData.i18nPrefix + '.title')` pour le titre, `t(sessionData.i18nPrefix + '.subtitle')` pour le sous-titre, `sessionData.panelists` pour les intervenants, `sessionData.i18nPrefix + '.dateLabel'` et `.timeLabel'` pour les badges date/heure ; si `sessionData` absent → comportement actuel inchangé (rétrocompatibilité avec `usePacoWebinarData()` direct)
- [X] T008 [US1] Refactoriser `src/views/paco/PacoWebinar.vue` : importer `usePacoWebinarData` (refactorisé), `PacoSessionTabs`, et `ref` `activeEdition` initialisé à `currentSession.value.edition` ; template : `PacoSessionTabs` avec `v-model:active-edition="activeEdition"` + `v-if="activeEdition === 1"` / `v-else-if="activeEdition === 2"` pour des blocs de contenu (placeholder texte OK à ce stade — PacoSession1/2 créés dans US2/US3) ; supprimer les anciens imports liés à `webinar` de `usePacoWebinarData` ; le fichier doit rester < 100 lignes combinées template + script

---

## Phase 4: US2 — Replay vidéo Session 1 (Priority: P2)

**Goal**: L'utilisateur sur l'onglet Session 1 voit un lecteur vidéo YouTube (autoplay muet) à la place de l'image de couverture, ainsi que les infos de la session 1.

**Independent Test**: Cliquer sur l'onglet Session 1 → un iframe YouTube avec la vidéo 482HTq49tlQ s'affiche et démarre en muet ; les infos de la session 1 (titre, date, intervenants) sont visibles.

- [X] T009 [P] [US2] Ajouter les clés i18n session 1 dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` : section `paco.session1` avec `title`, `subtitle`, `dateLabel:"Jeudi 26 mars 2026"/"Thursday, March 26, 2026"`, `timeLabel:"14h00 – 15h30 GMT"/"2:00 PM – 3:30 PM GMT"`, `replay:"Voir l'enregistrement"/"Watch recording"`, `replayLoading:"Chargement de la vidéo..."/"Loading video..."`, `replayError:"Vidéo temporairement indisponible"/"Video temporarily unavailable"` — également ajouter dans `paco.session1` les clés de présentation (contextTitle, context, objectivesTitle, objectives, panelistsTitle, etc.) copiées/adaptées depuis les clés `paco.presentation.*` existantes pour la session 1
- [X] T010 [US2] Créer `src/components/paco/PacoSession1.vue` : prop `sessionData:Object` ; structure en grille lg:5 colonnes identique à `PacoWebinar.vue` actuel ; panneau gauche (lg:col-span-3) → `PacoPresentation` avec `:session-data="sessionData"` ; panneau droit sticky (lg:col-span-2) → `PacoCountdown` + iframe YouTube (`<iframe :src="sessionData.replayUrl" allow="autoplay; fullscreen" allowfullscreen class="w-full aspect-video rounded-2xl ...">`) avec état loading (skeleton) et état error (fallback texte `paco.session1.replayError`) si `sessionData.replayUrl` est null ou si l'iframe émet une erreur + `PacoJoinSection` en dessous ; mettre à jour `src/views/paco/PacoWebinar.vue` pour remplacer le placeholder US1 de `activeEdition === 1` par `<PacoSession1 :session-data="sessions[0]" />`

---

## Phase 5: US3 — Inscription Session 2 avec sélection de session (Priority: P2)

**Goal**: L'utilisateur sur l'onglet Session 2 voit le formulaire d'inscription avec un badge session en lecture seule. L'inscription sauvegarde `session_edition=2`. Un inscrit de session 1 voit bien le formulaire pour la session 2.

**Independent Test**: Vider localStorage, visiter `/paco` onglet Session 2 → formulaire visible avec badge "Session 2 — Jeudi 30 avril 2026" en lecture seule ; soumettre le formulaire → inscription créée en DB avec `session_edition=2` ; rafraîchir → bouton Rejoindre visible sur Session 2 seulement ; visiter Session 1 → bouton Rejoindre visible (inscription session 1 en localStorage legacy).

- [X] T011 [US3] Modifier `src/composables/paco/usePacoRegistration.js` : (1) migration localStorage au démarrage — ajouter fonction `migrateLegacyLocalStorage()` qui si `localStorage.getItem('paco_registration_complete') === '1'` → écrit `paco_registered_session_1` = '1' et supprime l'ancienne clé ; (2) modifier `markPacoRegistered(sessionEdition)` pour écrire `paco_registered_session_${sessionEdition}` ; (3) modifier `isPacoRegisteredLocally(sessionEdition)` pour lire `paco_registered_session_${sessionEdition}` ; (4) modifier `checkPacoRegistration(userId, sessionEdition)` — ajouter `.eq('session_edition', sessionEdition)` à la requête Supabase ; exporter `migrateLegacyLocalStorage`
- [X] T012 [P] [US3] Ajouter les clés i18n session 2 et formulaire dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` : section `paco.session2` avec `title`, `subtitle`, `dateLabel:"Jeudi 30 avril 2026"`, `timeLabel:"14h00 – 15h30 GMT"`, plus les clés de présentation session 2 (context, objectives, etc. depuis `bank/Justice_climatique.md`) ; section `paco.register` ajouter `sessionLabel:"Session"/"Session"` et `sessionBadge:"Session {edition} — {date}"/"Session {edition} — {date}"`
- [X] T013 [US3] Modifier `src/components/paco/PacoQuickRegister.vue` : (1) ajouter prop `sessionEdition:Number` ; (2) afficher un badge lecture seule sous le titre (avant le formulaire) : `<div class="...badge styles...">{{ t('paco.register.sessionLabel') }} : {{ t('paco.register.sessionBadge', { edition: sessionEdition, date: sessionDateLabel }) }}</div>` — `sessionDateLabel` calculé depuis les données session ; (3) passer `p_session_edition: props.sessionEdition` dans l'appel RPC `register_paco_quick` ; (4) appeler `markPacoRegistered(props.sessionEdition)` au lieu de `markPacoRegistered()` sans argument
- [X] T014 [US3] Créer `src/components/paco/PacoSession2.vue` : props `sessionData:Object`, `step:String`, `pageLoading:Boolean` ; emits `registration-complete` ; structure en grille lg:5 colonnes identique à `PacoSession1.vue` ; panneau gauche → `PacoPresentation` avec `:session-data="sessionData"` + timeline horizontale des sessions (sessions 1 + 2, session 2 marquée active) ; panneau droit → `PacoCountdown` + état loading + `PacoQuickRegister` avec `:session-edition="sessionData.edition"` si `step==='form'` + `PacoJoinSection` si `step==='join'`
- [X] T015 [US3] Compléter `src/views/paco/PacoWebinar.vue` : (1) importer `migrateLegacyLocalStorage` et l'appeler en début de `onMounted` avant `checkInitialState` ; (2) `checkInitialState(edition)` prend `activeEdition.value` en paramètre, utilise `isPacoRegisteredLocally(edition)` et `checkPacoRegistration(userId, edition)` ; (3) `step` et `pageLoading` deviennent des objets indexés par edition ou des refs recalculées lors du changement d'onglet ; (4) remplacer le placeholder `activeEdition === 2` par `<PacoSession2 :session-data="sessions[1]" :step="step" :page-loading="pageLoading" @registration-complete="handleRegistrationComplete" />`

---

## Phase 6: US4 — Admin filtre par session (Priority: P3)

**Goal**: L'administrateur peut filtrer la liste des inscrits par session, voit la colonne Session dans le tableau, et l'export CSV inclut cette colonne.

**Independent Test**: Accéder à `/admin/paco` → tableau avec colonne "Session" visible pour chaque inscrit ; utiliser le filtre "Session 1" → seuls les inscrits session 1 affichés ; export CSV → colonne session présente.

- [X] T016 [US4] Modifier `src/composables/paco/usePacoStats.js` : (1) ajouter `sessionFilter` ref (default null) et `setSessionFilter(edition)` setter ; (2) dans `fetchPacoRegistrants`, appliquer `.eq('session_edition', sessionFilter.value)` si `sessionFilter.value !== null` ; (3) dans le mapping des registrants, ajouter `sessionEdition: row.session_edition` à l'objet `r` ; (4) exposer `sessionFilter` et `setSessionFilter` dans le return
- [X] T017 [P] [US4] Ajouter les clés i18n admin dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` : `paco.admin.session:"Session"/"Session"`, `paco.admin.filterAllSessions:"Toutes les sessions"/"All sessions"`, `paco.admin.filterSession:"Session {n}"/"Session {n}"`
- [X] T018 [US4] Modifier `src/views/paco/PacoAdmin.vue` : (1) ajouter dans la barre d'outils (à côté de la recherche) un groupe de boutons filtre session : "Toutes | Session 1 | Session 2" lié à `setSessionFilter(null/1/2)` — style actif/inactif TailwindCSS, cursor-pointer ; (2) ajouter colonne "Session" dans le `<thead>` et `<tbody>` du tableau (entre Email et Genre/Âge) : affiche `r.sessionEdition` ; (3) inclure `sessionEdition` dans `usePacoCsvExport` — ajouter la colonne "Session" dans les headers CSV et dans le mapping des lignes ; (4) le filtre doit déclencher un rechargement via `fetchPacoRegistrants(1)` lors du changement

---

## Phase finale: Polish & Vérification

- [X] T019 Vérifier que aucun fichier modifié ou créé ne dépasse 400 lignes : `PacoWebinar.vue`, `PacoAdmin.vue`, `PacoSession1.vue`, `PacoSession2.vue`, `PacoSessionTabs.vue`, `PacoPresentation.vue`, `PacoQuickRegister.vue`, `usePacoWebinarData.js`, `usePacoRegistration.js`, `usePacoStats.js` — si un fichier dépasse, extraire la logique excédentaire dans un composable ou sous-composant dédié
- [X] T020 [P] Vérifier la cohérence des clés i18n : s'assurer que toutes les clés ajoutées dans `src/locales/fr/paco.json` ont leur équivalent dans `src/locales/en/paco.json` — aucune clé `paco.session1.*`, `paco.session2.*`, `paco.tabs.*`, `paco.register.sessionBadge`, `paco.admin.session*` ne doit manquer dans l'une ou l'autre langue

---

## Dépendances entre User Stories

```
T001 (migration SQL)
T002 (RPC update)    ← DÉPLOIEMENT SUPABASE MANUEL requis avant de tester US3
T003 (database.sql)
T004 (usePacoWebinarData)
T005 (i18n tabs)
        ↓
    [US1] T006, T007, T008  ← MVP — testable sans DB
        ↓
    [US2] T009, T010        ← testable sans DB
    [US3] T011–T015         ← nécessite T001+T002 déployés pour test DB
        ↓
    [US4] T016–T018         ← nécessite T001 déployé pour colonne session
        ↓
    Polish T019, T020
```

---

## Exécution parallèle par phase

### Phase 2 (Fondations)
Parallèles : `T002 ‖ T003 ‖ T004 ‖ T005` (après T001 créé)

### Phase 3 (US1)
Parallèles : `T006 ‖ T007` → puis T008

### Phase 4 (US2)
Parallèles : `T009 ‖ T010` (T009 ne bloque pas T010, les clés peuvent être ajoutées ensemble)

### Phase 5 (US3)
Séquentiel : `T011 → T013`, `T012 ‖ T011`, puis `T014 → T015`

### Phase 6 (US4)
Parallèles : `T016 ‖ T017` → puis T018

---

## Stratégie d'implémentation

**MVP (US1 seul)** : Tâches T001–T008 → Navigation par onglets fonctionnelle avec placeholder dans chaque onglet. Livrable immédiatement testable sans déploiement DB.

**Incrément 2** : Ajouter US2 (T009–T010) → Replay vidéo session 1 visible. Toujours sans DB.

**Incrément 3** : Déployer DB (T001–T003 via Supabase Dashboard) puis implémenter US3 (T011–T015) → Inscription session 2 opérationnelle end-to-end.

**Incrément 4** : US4 (T016–T018) → Administration multi-sessions.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Total tâches | 20 |
| Phase Fondations | 5 tâches (T001–T005) |
| US1 (P1 — MVP) | 3 tâches (T006–T008) |
| US2 (P2) | 2 tâches (T009–T010) |
| US3 (P2) | 5 tâches (T011–T015) |
| US4 (P3) | 3 tâches (T016–T018) |
| Polish | 2 tâches (T019–T020) |
| Tâches parallélisables | 11 tâches [P] |
| Déploiement manuel requis | T001–T003 (Supabase SQL Editor) |
