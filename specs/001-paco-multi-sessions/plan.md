# Implementation Plan: PACO Webinar Multi-Sessions avec Navigation par Onglets

**Branch**: `001-paco-multi-sessions` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)

---

## Summary

Refactoriser les pages PACO Webinar pour supporter plusieurs sessions via une navigation par onglets. La session 1 (terminée) affiche un replay vidéo YouTube embarqué en autoplay muet. La session 2 (à venir — 30 avril 2026) affiche le formulaire d'inscription enrichi d'un badge session en lecture seule. Chaque session est un composant Vue distinct. L'administration affiche et filtre les inscrits par session.

---

## Technical Context

**Language/Version**: JavaScript (Vue 3.5+)  
**Primary Dependencies**: Vue 3, Vue i18n, Supabase JS, TailwindCSS v4, Font Awesome  
**Storage**: PostgreSQL via Supabase — table `activity_registrations` (ajout colonne `session_edition`), RPC `register_paco_quick` (mise à jour)  
**Testing**: Vitest (unitaire), Playwright (E2E)  
**Target Platform**: Web SPA, Firebase Hosting  
**Project Type**: Web application (SPA Vue 3)  
**Performance Goals**: Navigation entre onglets < 1 seconde (état interne, pas de requête réseau)  
**Constraints**: Fichiers < 400 lignes, i18n obligatoire (fr + en), pas de paramètre URL pour l'onglet actif

---

## Constitution Check

| Principe | Statut | Notes |
|----------|--------|-------|
| I. Architecture modulaire | ✅ Conforme | Nouveaux composants dans `src/components/paco/`, composables dans `src/composables/paco/` |
| II. i18n First (NON-NEGOTIABLE) | ✅ Conforme | Toutes les nouvelles clés dans `fr/paco.json` + `en/paco.json` |
| III. Theme Support (NON-NEGOTIABLE) | ✅ Conforme | Composants existants déjà en dark mode sur fond `bg-gray-900` |
| IV. Clean Code (DRY/KISS/YAGNI) | ✅ Conforme | `PacoPresentation.vue` réutilisé via props, pas de duplication |
| V. DB Schema Source of Truth | ✅ Conforme | Migration SQL dans `bank/shema_et_requettes/`, `database_complete.sql` mis à jour |

---

## Project Structure

### Documentation (cette feature)

```
specs/001-paco-multi-sessions/
├── plan.md              ← Ce fichier
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   ├── rpc-register-paco-quick.md
│   └── composable-usePacoWebinarData.md
└── tasks.md             ← Généré par /speckit.tasks
```

### Source Code (fichiers touchés)

```
src/
├── components/paco/
│   ├── PacoSessionTabs.vue          [NOUVEAU] Navigation par onglets
│   ├── PacoSession1.vue             [NOUVEAU] Session 1: infos + iframe replay
│   ├── PacoSession2.vue             [NOUVEAU] Session 2: infos + inscription
│   ├── PacoQuickRegister.vue        [MODIFIÉ] + prop sessionEdition, badge session
│   └── PacoPresentation.vue         [MODIFIÉ] + prop sessionData
├── composables/paco/
│   ├── usePacoWebinarData.js        [REFACTORISÉ] SESSIONS_DATA[], currentSession
│   ├── usePacoRegistration.js       [MODIFIÉ] localStorage par session
│   └── usePacoStats.js              [MODIFIÉ] filtre session dans admin
├── views/paco/
│   ├── PacoWebinar.vue              [REFACTORISÉ] Orchestrateur + PacoSessionTabs
│   └── PacoAdmin.vue                [MODIFIÉ] colonne session + filtre
└── locales/
    ├── fr/paco.json                 [MODIFIÉ] nouvelles clés
    └── en/paco.json                 [MODIFIÉ] nouvelles clés

bank/shema_et_requettes/
├── migration_001_add_session_edition.sql   [NOUVEAU]
├── rpc_register_paco_quick.sql             [MODIFIÉ]
└── database_complete.sql                   [MODIFIÉ]
```

---

## Phases d'implémentation

### Phase A — Base de données (prérequis de tout le reste)

**A1. Créer la migration SQL**

Fichier: `bank/shema_et_requettes/migration_001_add_session_edition.sql`

```sql
-- 1. Ajouter la colonne
ALTER TABLE public.activity_registrations
  ADD COLUMN IF NOT EXISTS session_edition INTEGER NOT NULL DEFAULT 1;

-- 2. Migration rétroactive (inscrits session 1)
UPDATE public.activity_registrations
  SET session_edition = 1
  WHERE activity_id = '00000000-0000-4000-a000-00000000a002';

-- 3. Recréer les index d'unicité (inclure session_edition)
DROP INDEX IF EXISTS activity_registrations_guest_unique;
DROP INDEX IF EXISTS activity_registrations_user_unique;

CREATE UNIQUE INDEX activity_registrations_guest_session_unique
  ON public.activity_registrations(activity_id, guest_email, session_edition)
  WHERE guest_email IS NOT NULL AND user_id IS NULL;

CREATE UNIQUE INDEX activity_registrations_user_session_unique
  ON public.activity_registrations(activity_id, user_id, session_edition)
  WHERE user_id IS NOT NULL;
```

**A2. Mettre à jour `rpc_register_paco_quick.sql`**

Ajouter `p_session_edition INTEGER DEFAULT 2` et l'intégrer dans la vérification d'unicité et l'INSERT.

**A3. Mettre à jour `database_complete.sql`**

Refléter la nouvelle colonne `session_edition` et les nouveaux index.

> ⚠️ Déploiement manuel requis — exécuter via Supabase Dashboard SQL Editor

---

### Phase B — Composables (logique métier)

**B1. Refactoriser `usePacoWebinarData.js`**

- Remplacer `WEBINAR_DATA` (objet unique) par `SESSIONS_DATA` (tableau de 2 sessions)
- Session 1: `edition:1`, `date:'2026-03-26'`, `completed:true`, `replayUrl:'https://www.youtube.com/embed/482HTq49tlQ?autoplay=1&mute=1'`, `coverImage:'/images/banniere_paco.jpg'`, `i18nPrefix:'paco.session1'`, panelists session 1
- Session 2: `edition:2`, `date:'2026-04-30'`, `completed:false`, `replayUrl:null`, `coverImage:'/images/image_paco_session_2.jpg'`, `i18nPrefix:'paco.session2'`, panelists session 2 (Kiri, Baglhi, Ka)
- Exposer: `sessions` (tableau), `currentSession` (computed: dernière session non terminée), `getSessionStatus(session)`, `getStatusLabel(status)`, `getStatusColor(status)`

**B2. Modifier `usePacoRegistration.js`**

- `markPacoRegistered(sessionEdition)` → `localStorage.setItem('paco_registered_session_' + sessionEdition, '1')`
- `isPacoRegisteredLocally(sessionEdition)` → lit la clé par session
- Migration automatique au premier appel: si `paco_registration_complete === '1'` → écrire `paco_registered_session_1` et supprimer l'ancienne clé
- `checkPacoRegistration(userId, sessionEdition)` → ajouter `.eq('session_edition', sessionEdition)` à la requête Supabase

**B3. Modifier `usePacoStats.js`**

- Ajouter `sessionFilter` ref (null = toutes, 1 = session 1, 2 = session 2)
- `fetchPacoRegistrants` : appliquer `.eq('session_edition', sessionFilter.value)` si filtre actif
- Mapper `r.sessionEdition = row.session_edition` dans la liste des inscrits
- Exposer `sessionFilter` et `setSessionFilter(edition)`

---

### Phase C — Composants

**C1. Créer `PacoSessionTabs.vue`**

- Props: `sessions: Array` (liste SessionData), `modelValue: Number` (edition active)
- Emits: `update:modelValue`
- Affiche un onglet par session: numéro, titre court (i18n via `session.i18nPrefix + '.title'`), badge statut
- Onglet actif stylé différemment (fond vert, texte blanc)
- Pas de modification URL (FR-001)

**C2. Créer `PacoSession1.vue`**

- Props: `sessionData: Object`
- Panneau gauche: `PacoPresentation` avec `sessionData`
- Panneau droit: `PacoCountdown` + iframe YouTube (`sessionData.replayUrl`) avec loading/error state + `PacoJoinSection`
- L'iframe utilise `allow="autoplay"` + `?autoplay=1&mute=1` dans l'URL

**C3. Créer `PacoSession2.vue`**

- Props: `sessionData: Object`, `step: String`, `pageLoading: Boolean`
- Emits: `registration-complete`
- Panneau gauche: `PacoPresentation` avec `sessionData`
- Panneau droit: countdown + `PacoQuickRegister` (`:session-edition="sessionData.edition"`) ou `PacoJoinSection`

**C4. Modifier `PacoPresentation.vue`**

- Ajouter prop `sessionData: Object` (optionnelle, default null)
- Si `sessionData` fourni: utiliser `t(sessionData.i18nPrefix + '.title')`, `sessionData.panelists`, `sessionData.coverImage`
- Si `sessionData` absent: comportement actuel (rétrocompatibilité)
- Bannière: afficher `sessionData.coverImage` ou `sessionData.bannerUrl`

**C5. Modifier `PacoQuickRegister.vue`**

- Ajouter prop `sessionEdition: Number`
- Afficher badge en lecture seule après le titre: `paco.register.sessionBadge` interpolé
- Passer `p_session_edition: props.sessionEdition` au RPC `register_paco_quick`
- Appeler `markPacoRegistered(props.sessionEdition)` après inscription réussie

---

### Phase D — Vue orchestratrice et Admin

**D1. Refactoriser `PacoWebinar.vue`**

- Importer `usePacoWebinarData` (refactorisé), `PacoSessionTabs`, `PacoSession1`, `PacoSession2`
- État: `activeEdition` ref = `currentSession.value.edition`
- Migration localStorage au `onMounted` avant `checkInitialState`
- `checkInitialState(edition)` vérifie `isPacoRegisteredLocally(edition)` par session
- Pas de v-if complexe: déléguer tout aux composants session
- Objectif: < 100 lignes combinées template + script

**D2. Modifier `PacoAdmin.vue`**

- Ajouter filtre session: boutons radio "Toutes | Session 1 | Session 2" dans la barre outils
- Lier à `setSessionFilter(edition)` de `usePacoStats`
- Ajouter colonne "Session" dans le tableau (entre email et genre)
- Inclure `r.sessionEdition` dans l'export CSV (`usePacoCsvExport`)

---

### Phase E — i18n

Ajouter dans `src/locales/fr/paco.json` et `src/locales/en/paco.json` — voir tableau complet dans [data-model.md](./data-model.md).

Clés principales:
- `paco.tabs.*` — navigation onglets
- `paco.session1.*` — textes session 1
- `paco.session2.*` — textes session 2
- `paco.register.sessionLabel`, `paco.register.sessionBadge`
- `paco.admin.session`, `paco.admin.filterAllSessions`

---

## Ordre d'exécution recommandé

```
A (DB)     → Déploiement manuel Supabase
     ↓
B1 + B2 + B3 + E  (en parallèle — pas de dépendances entre eux)
     ↓
C4 → C5    (modifier composants existants)
C1 → C2 → C3  (créer nouveaux composants)
     ↓
D1 → D2    (vue + admin)
```

---

## Points d'attention critiques

1. **Migration DB — index DROP + CREATE**: Les anciens index `activity_registrations_guest_unique` et `activity_registrations_user_unique` doivent être supprimés AVANT de créer les nouveaux. Les recréer avec `IF NOT EXISTS` n'est pas possible pour les index, utiliser `DROP INDEX IF EXISTS`.

2. **YouTube autoplay**: Requiert `?autoplay=1&mute=1` ET l'attribut `allow="autoplay"` sur l'iframe. Sans `mute=1`, Chrome 66+ bloque l'autoplay silencieusement.

3. **localStorage migration**: Doit se déclencher au `onMounted` de `PacoWebinar.vue` AVANT l'appel à `checkInitialState` pour éviter que les anciens inscrits voient à nouveau le formulaire.

4. **`PacoPresentation.vue` rétrocompatibilité**: La prop `sessionData` est optionnelle. Les autres usages potentiels ne doivent pas casser.

5. **Unique constraint et inscrits existants**: Après la migration, les inscrits existants ont `session_edition = 1`. L'index `(activity_id, guest_email, session_edition)` remplace l'ancien. Un email peut s'inscrire à session 2 sans conflit.
