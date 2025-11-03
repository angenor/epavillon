# Plan d'implémentation - Page de détail d'activité

## Vue d'ensemble
Cette page permettra aux utilisateurs de visualiser les détails complets d'une activité et de s'inscrire à la réunion Zoom associée **sans nécessiter d'authentification**.

---

## 1. Modifications de la base de données

### 1.1 Modification de la table `activity_registrations`

**Objectif**: Permettre les inscriptions sans compte utilisateur

**Modifications à apporter**:
```sql
-- Rendre user_id nullable et ajouter des champs pour les utilisateurs non authentifiés
ALTER TABLE public.activity_registrations
  ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter des champs pour les informations des participants non authentifiés
ALTER TABLE public.activity_registrations
  ADD COLUMN guest_email TEXT,
  ADD COLUMN guest_first_name TEXT,
  ADD COLUMN guest_last_name TEXT,
  ADD COLUMN guest_organization TEXT,
  ADD COLUMN guest_country_id UUID REFERENCES public.countries(id),
  ADD COLUMN zoom_registrant_id TEXT, -- ID du participant retourné par l'API Zoom
  ADD COLUMN zoom_join_url TEXT, -- URL personnalisée pour rejoindre la réunion
  ADD COLUMN registration_type TEXT DEFAULT 'guest', -- 'user' ou 'guest'
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

-- Modifier la contrainte UNIQUE pour permettre plusieurs inscriptions guest avec le même email
ALTER TABLE public.activity_registrations
  DROP CONSTRAINT IF EXISTS activity_registrations_activity_id_user_id_key;

-- Ajouter une contrainte UNIQUE conditionnelle
-- Un utilisateur authentifié ne peut s'inscrire qu'une fois
-- Un guest avec le même email peut s'inscrire plusieurs fois (différentes activités)
CREATE UNIQUE INDEX activity_registrations_user_unique
  ON public.activity_registrations(activity_id, user_id)
  WHERE user_id IS NOT NULL;

-- Contrainte pour empêcher les doublons d'email pour la même activité
CREATE UNIQUE INDEX activity_registrations_guest_email_unique
  ON public.activity_registrations(activity_id, LOWER(guest_email))
  WHERE user_id IS NULL AND guest_email IS NOT NULL;

-- Ajouter une contrainte CHECK pour valider les données
ALTER TABLE public.activity_registrations
  ADD CONSTRAINT valid_registration_data CHECK (
    (user_id IS NOT NULL) OR
    (guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL)
  );

-- Ajouter des index pour les recherches
CREATE INDEX idx_activity_registrations_guest_email
  ON public.activity_registrations(guest_email);
CREATE INDEX idx_activity_registrations_registration_type
  ON public.activity_registrations(registration_type);
```

**Fichier à créer**: `bank/shema_et_requettes/migrations/activity_registrations_guest_support.sql`

**Action**: Mettre à jour `bank/shema_et_requettes/database_complete.sql` avec ces modifications

---

## 2. Edge Function - Inscription Zoom

### 2.1 Nouvelle Edge Function `register-to-zoom-meeting`

**Chemin**: `supabase/functions/register-to-zoom-meeting/index.ts`

**Objectif**: Inscrire un participant (authentifié ou non) à une réunion Zoom

**Fonctionnalités**:
- Accepter les inscriptions avec ou sans authentification
- Valider les données du formulaire
- Inscrire le participant via l'API Zoom
- Enregistrer l'inscription dans `activity_registrations`
- Envoyer un email de confirmation avec le lien Zoom

**Inspiré de**: `supabase/functions/create-zoom-meeting/index.ts`

**API Zoom à utiliser**:
```
POST https://api.zoom.us/v2/meetings/{meetingId}/registrants
```

**Payload attendu**:
```typescript
{
  activity_id: string,
  // Pour utilisateur authentifié
  user_id?: string,
  // Pour guest
  guest_email?: string,
  guest_first_name?: string,
  guest_last_name?: string,
  guest_organization?: string,
  guest_country_id?: string
}
```

**Réponse API Zoom**:
```typescript
{
  registrant_id: string,
  join_url: string, // URL personnalisée pour ce participant
  topic: string,
  start_time: string
}
```

**Flux de traitement**:
1. Valider les données reçues
2. Vérifier que l'activité existe et a un `zoom_meeting_id`
3. Récupérer les informations de la réunion Zoom depuis la table `zoom_meetings`
4. Vérifier que le participant n'est pas déjà inscrit
5. Appeler l'API Zoom pour enregistrer le participant
6. Sauvegarder l'inscription dans `activity_registrations`
7. (Optionnel) Envoyer un email de confirmation
8. Retourner les informations d'inscription

**Gestion des erreurs**:
- Activité non trouvée
- Pas de réunion Zoom associée
- Participant déjà inscrit
- Erreur API Zoom
- Erreur de sauvegarde en base

---

## 3. Structure des fichiers Vue

### 3.1 Page principale

**Fichier**: `src/views/activities/Detail.vue`

**Sections**:
1. **Hero Section** (Image de couverture + Titre)
2. **Badges d'information** (Format, Statut, Thèmes)
3. **Section principale** (2 colonnes)
   - Colonne gauche (2/3):
     - Description détaillée
     - Objectifs
     - Documents
     - Intervenants (speakers)
     - Questions aux panélistes
     - Questions temps réel
   - Colonne droite (1/3):
     - Carte d'information (Date, Heure, Organisation)
     - Bouton d'inscription Zoom
     - Logo organisation
4. **Navigation latérale** (Liste des autres activités)

### 3.2 Composants enfants

**Fichiers à créer**:

1. **`src/components/activities/ActivityHero.vue`**
   - Image de couverture
   - Titre
   - Badges (format, statut, catégories, thèmes)

2. **`src/components/activities/ActivityInfo.vue`**
   - Dates/heures dans les 2 fuseaux horaires
   - Organisation (cliquable)
   - Pays
   - Dernière mise à jour

3. **`src/components/activities/ActivitySpeakers.vue`**
   - Liste des intervenants
   - Photos, noms, positions
   - Indicateur de disponibilité pour questions

4. **`src/components/activities/ActivityDocuments.vue`**
   - Liste des documents
   - Téléchargement
   - Filtrage par type

5. **`src/components/activities/ActivityQuestionsPanel.vue`**
   - Formulaire de question (nécessite authentification)
   - Liste des questions existantes
   - Filtrage par intervenant

6. **`src/components/activities/ActivityRegistrationCard.vue`**
   - Formulaire d'inscription
   - Affichage conditionnel selon l'existence de la réunion Zoom
   - Support guest et utilisateur authentifié

7. **`src/components/activities/ActivitySidebar.vue`**
   - Liste des autres activités du même événement
   - Navigation rapide

8. **`src/components/activities/ActivityTimezoneDisplay.vue`**
   - Affichage des heures dans 2 fuseaux horaires
   - Fuseau horaire de l'événement
   - Fuseau horaire local de l'utilisateur

---

## 4. Composables

### 4.1 `src/composables/useActivityDetail.js`

**Responsabilité**: Gérer la logique métier de la page de détail

**Fonctions**:
```javascript
{
  // Chargement des données
  loadActivity(activityId),
  loadSpeakers(activityId),
  loadDocuments(activityId),
  loadQuestions(activityId),
  loadRelatedActivities(eventId),

  // Données réactives
  activity,
  speakers,
  documents,
  questions,
  relatedActivities,
  isLoading,
  error,

  // Informations calculées
  hasZoomMeeting,
  isRegistrationOpen,
  eventTimezone,
  userTimezone
}
```

### 4.2 `src/composables/useActivityRegistration.js`

**Responsabilité**: Gérer les inscriptions Zoom

**Fonctions**:
```javascript
{
  // Inscription
  registerToActivity(activityId, registrationData),
  checkIfAlreadyRegistered(activityId),

  // États
  isRegistering,
  isRegistered,
  registrationError,
  registrationData, // Données de l'inscription réussie

  // Validation
  validateRegistrationForm(formData)
}
```

### 4.3 `src/composables/useActivityQuestions.js`

**Responsabilité**: Gérer les questions

**Fonctions**:
```javascript
{
  // CRUD questions
  submitQuestion(activityId, questionData),
  loadQuestions(activityId),

  // États
  questions,
  isSubmitting,
  error,

  // Filtrage
  filterQuestionsBySpeaker(speakerId)
}
```

---

## 5. Utils

### 5.1 `src/utils/timezone/timezoneFormatter.js`

**Fonctions**:
```javascript
/**
 * Formate une date dans le fuseau horaire de l'événement
 */
export function formatDateInEventTimezone(date, eventTimezone, locale = 'fr')

/**
 * Formate une date dans le fuseau horaire local de l'utilisateur
 */
export function formatDateInUserTimezone(date, locale = 'fr')

/**
 * Obtient le fuseau horaire de l'utilisateur
 */
export function getUserTimezone()

/**
 * Affiche les deux fuseaux horaires côte à côte
 */
export function formatDualTimezone(date, eventTimezone, locale = 'fr')
```

### 5.2 `src/utils/activities/activityHelpers.js`

**Fonctions**:
```javascript
/**
 * Obtient l'image de couverture ou l'image par défaut
 */
export function getActivityCoverImage(activity)

/**
 * Vérifie si une activité a une réunion Zoom
 */
export function hasZoomMeeting(activity)

/**
 * Formate le statut de l'activité
 */
export function formatActivityStatus(status, locale)
```

---

## 6. Routing

### 6.1 Ajout de la route

**Fichier**: `src/router/index.js`

```javascript
{
  path: '/activities/:id',
  name: 'activity-detail',
  component: () => import('@/views/activities/Detail.vue'),
  meta: {
    requiresAuth: false, // Accessible sans authentification
    title: 'Activity Detail'
  }
}
```

---

## 7. Internationalisation (i18n)

### 7.1 Traductions françaises

**Fichier**: `src/locales/fr/index.js`

```javascript
activity: {
  detail: {
    title: 'Détails de l\'activité',
    description: 'Description',
    objectives: 'Objectifs',
    format: 'Format',
    status: 'Statut',
    themes: 'Thèmes',
    categories: 'Catégories',
    documents: 'Documents',
    speakers: 'Intervenants',
    lastUpdate: 'Dernière mise à jour',
    organization: 'Organisation',
    country: 'Pays',

    // Dates et heures
    eventTime: 'Heure de l\'événement',
    yourLocalTime: 'Votre heure locale',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    duration: 'Durée',

    // Inscription
    register: 'S\'inscrire',
    alreadyRegistered: 'Vous êtes déjà inscrit',
    registrationSuccess: 'Inscription réussie',
    registrationError: 'Erreur lors de l\'inscription',
    noZoomMeeting: 'Aucune réunion Zoom associée',

    // Formulaire d'inscription
    registrationForm: {
      title: 'Inscription à l\'activité',
      email: 'Email',
      firstName: 'Prénom',
      lastName: 'Nom',
      organization: 'Organisation',
      country: 'Pays',
      submit: 'S\'inscrire',
      cancel: 'Annuler'
    },

    // Questions
    questions: {
      title: 'Questions aux panélistes',
      askQuestion: 'Poser une question',
      loginRequired: 'Vous devez être connecté pour poser une question',
      submit: 'Envoyer',
      noQuestions: 'Aucune question pour le moment',
      targetSpeaker: 'Intervenant ciblé',
      allSpeakers: 'Tous les intervenants'
    },

    // Navigation
    relatedActivities: 'Autres activités',
    viewAll: 'Voir toutes les activités',

    // Statuts
    statuses: {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      cancelled: 'Annulée'
    },

    // Formats
    formats: {
      online: 'En ligne',
      in_person: 'En présentiel',
      hybrid: 'Hybride'
    }
  }
}
```

### 7.2 Traductions anglaises

**Fichier**: `src/locales/en/index.js`

```javascript
activity: {
  detail: {
    title: 'Activity Details',
    description: 'Description',
    objectives: 'Objectives',
    format: 'Format',
    status: 'Status',
    themes: 'Themes',
    categories: 'Categories',
    documents: 'Documents',
    speakers: 'Speakers',
    lastUpdate: 'Last updated',
    organization: 'Organization',
    country: 'Country',

    // Dates and times
    eventTime: 'Event time',
    yourLocalTime: 'Your local time',
    startDate: 'Start date',
    endDate: 'End date',
    duration: 'Duration',

    // Registration
    register: 'Register',
    alreadyRegistered: 'You are already registered',
    registrationSuccess: 'Registration successful',
    registrationError: 'Registration error',
    noZoomMeeting: 'No Zoom meeting associated',

    // Registration form
    registrationForm: {
      title: 'Activity Registration',
      email: 'Email',
      firstName: 'First name',
      lastName: 'Last name',
      organization: 'Organization',
      country: 'Country',
      submit: 'Register',
      cancel: 'Cancel'
    },

    // Questions
    questions: {
      title: 'Questions to panelists',
      askQuestion: 'Ask a question',
      loginRequired: 'You must be logged in to ask a question',
      submit: 'Submit',
      noQuestions: 'No questions yet',
      targetSpeaker: 'Target speaker',
      allSpeakers: 'All speakers'
    },

    // Navigation
    relatedActivities: 'Other activities',
    viewAll: 'View all activities',

    // Statuses
    statuses: {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    },

    // Formats
    formats: {
      online: 'Online',
      in_person: 'In-person',
      hybrid: 'Hybrid'
    }
  }
}
```

---

## 8. Gestion des fuseaux horaires

### 8.1 Logique d'affichage

**Principe**: Afficher l'heure dans 2 fuseaux horaires côte à côte
1. **Fuseau horaire de l'événement**: Obtenu depuis `events.timezone`
2. **Fuseau horaire local**: Détecté automatiquement via `Intl.DateTimeFormat().resolvedOptions().timeZone`

**Exemple d'affichage**:
```
🌍 Heure de l'événement: 14:00 (UTC+1 - Paris)
🕐 Votre heure locale: 08:00 (EST - New York)
```

### 8.2 Bibliothèque recommandée

**Option 1**: Utiliser l'API native JavaScript `Intl`
- Avantage: Pas de dépendance externe
- Inconvénient: Moins flexible

**Option 2**: Utiliser `date-fns-tz`
- Avantage: Plus flexible et puissant
- Installation: `npm install date-fns date-fns-tz`

---

## 9. UI/UX Design

### 9.1 Layout général

```
┌─────────────────────────────────────────────────────┐
│           IMAGE DE COUVERTURE (16:9)                │
│                                                     │
│   [Titre de l'activité]                            │
│   [Badges: Format | Statut | Thèmes]              │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────┬────────────────────┐
│  DESCRIPTION                 │   CARTE INFO       │
│  ─────────────────          │   ──────────       │
│  [Texte description]        │   📅 Date          │
│                             │   🕐 Heure         │
│  OBJECTIFS                  │   🏢 Org.          │
│  ─────────────────          │   🌍 Pays          │
│  [Texte objectifs]          │                    │
│                             │   [BOUTON          │
│  DOCUMENTS                  │    INSCRIPTION]    │
│  ─────────────────          │                    │
│  📄 Document 1              │   ──────────       │
│  📄 Document 2              │   ACTIVITÉS        │
│                             │   ──────────       │
│  INTERVENANTS               │   • Activité 1     │
│  ─────────────────          │   • Activité 2     │
│  👤 Speaker 1               │   • Activité 3     │
│  👤 Speaker 2               │                    │
│                             │                    │
│  QUESTIONS PANÉLISTES       │                    │
│  ─────────────────          │                    │
│  [Formulaire]               │                    │
│                             │                    │
│  QUESTIONS TEMPS RÉEL       │                    │
│  ─────────────────          │                    │
│  🔒 Connexion requise       │                    │
│                             │                    │
└──────────────────────────────┴────────────────────┘
```

### 9.2 Thèmes (Dark/Light)

**Important**: Tous les composants doivent supporter les modes Dark et Light

**Classes Tailwind à utiliser**:
- Fond: `bg-white dark:bg-gray-800`
- Texte: `text-gray-900 dark:text-white`
- Bordures: `border-gray-200 dark:border-gray-700`
- Hover: `hover:bg-gray-50 dark:hover:bg-gray-700`

### 9.3 Skeleton Loaders

Ajouter des skeleton loaders pour toutes les sections pendant le chargement:
- Hero section
- Carte d'information
- Liste des speakers
- Documents
- Questions

---

## 10. Flux utilisateur

### 10.1 Utilisateur non authentifié

1. Arrive sur `/activities/:id`
2. Voit tous les détails de l'activité
3. Peut télécharger les documents
4. **Si réunion Zoom existe**: Voit le bouton "S'inscrire"
5. Clique sur "S'inscrire" → Modal avec formulaire
6. Remplit: Email, Prénom, Nom, Organisation (optionnel), Pays (optionnel)
7. Soumet le formulaire
8. Reçoit confirmation avec lien Zoom personnalisé
9. **Ne peut PAS** poser de questions temps réel

### 10.2 Utilisateur authentifié

1. Arrive sur `/activities/:id`
2. Voit tous les détails de l'activité
3. Peut télécharger les documents
4. **Si réunion Zoom existe**: Voit le bouton "S'inscrire"
5. Clique sur "S'inscrire" → Formulaire pré-rempli avec ses infos
6. Soumet le formulaire (peut modifier ses infos)
7. Reçoit confirmation avec lien Zoom personnalisé
8. **PEUT** poser des questions temps réel dans la section dédiée

---

## 11. Sécurité et validation

### 11.1 Validation côté client (Vue)

**Formulaire d'inscription**:
- Email: Format valide, requis
- Prénom: Requis, min 2 caractères
- Nom: Requis, min 2 caractères
- Organisation: Optionnel
- Pays: Optionnel

**Formulaire de question**:
- Question: Requise, min 10 caractères, max 500 caractères
- Intervenant ciblé: Optionnel

### 11.2 Validation côté serveur (Edge Function)

**Edge Function `register-to-zoom-meeting`**:
- Valider tous les champs requis
- Valider le format email
- Vérifier que l'activité existe
- Vérifier que la réunion Zoom existe
- Vérifier qu'il n'y a pas de doublon (même email pour la même activité)
- Sanitiser les entrées pour éviter les injections

### 11.3 Row Level Security (RLS)

**Politique pour `activity_registrations`**:
```sql
-- Tout le monde peut s'inscrire (INSERT)
CREATE POLICY "Anyone can register to activities"
  ON public.activity_registrations
  FOR INSERT
  WITH CHECK (true);

-- Les utilisateurs peuvent voir leurs propres inscriptions
CREATE POLICY "Users can view their registrations"
  ON public.activity_registrations
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- Seuls les admins peuvent modifier/supprimer
CREATE POLICY "Only admins can update/delete registrations"
  ON public.activity_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

**Politique pour `activity_questions`**:
```sql
-- Seuls les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Authenticated users can create questions"
  ON public.activity_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tout le monde peut voir les questions visibles
CREATE POLICY "Anyone can view visible questions"
  ON public.activity_questions
  FOR SELECT
  USING (is_visible = true AND is_disabled = false);
```

---

## 12. Performance et optimisation

### 12.1 Requêtes Supabase optimisées

**Chargement de l'activité**:
```javascript
const { data: activity } = await supabase
  .from('activities')
  .select(`
    *,
    event:events (
      id,
      title,
      year,
      timezone
    ),
    organization:organizations (
      id,
      name,
      logo_url,
      country:countries (
        id,
        name_fr,
        name_en
      )
    ),
    country:countries (
      id,
      name_fr,
      name_en
    ),
    zoom_meeting:zoom_meetings (
      id,
      meeting_id,
      registration_url,
      join_url,
      start_time,
      duration,
      timezone
    )
  `)
  .eq('id', activityId)
  .single()
```

**Chargement des speakers**:
```javascript
const { data: speakers } = await supabase
  .from('activity_speakers')
  .select('*')
  .eq('activity_id', activityId)
  .order('created_at', { ascending: true })
```

**Chargement des documents**:
```javascript
const { data: documents } = await supabase
  .from('activity_documents')
  .select('*')
  .eq('activity_id', activityId)
  .order('uploaded_at', { ascending: false })
```

**Chargement des questions**:
```javascript
const { data: questions } = await supabase
  .from('activity_questions')
  .select(`
    *,
    user:users (
      id,
      first_name,
      last_name,
      photo_url
    )
  `)
  .eq('activity_id', activityId)
  .eq('is_visible', true)
  .eq('is_disabled', false)
  .order('created_at', { ascending: false })
```

### 12.2 Lazy loading et code splitting

**Composants chargés à la demande**:
- Modal d'inscription
- Formulaire de question
- Galerie de photos

---

## 13. Tests

### 13.1 Tests unitaires (Vitest)

**Tests à créer**:
1. `useActivityDetail.test.js`
2. `useActivityRegistration.test.js`
3. `timezoneFormatter.test.js`
4. `activityHelpers.test.js`

### 13.2 Tests d'intégration

**Scénarios à tester**:
1. Inscription utilisateur non authentifié
2. Inscription utilisateur authentifié
3. Tentative d'inscription multiple
4. Soumission de question (authentifié)
5. Affichage des fuseaux horaires
6. Navigation entre activités

---

## 14. Documentation

### 14.1 Fichiers à documenter

1. **README de la fonctionnalité**: `bank/a_faire/plan_page_detail/README.md`
2. **Documentation API**: `bank/a_faire/plan_page_detail/API.md`
3. **Guide utilisateur**: `bank/a_faire/plan_page_detail/USER_GUIDE.md`

### 14.2 Commentaires dans le code

Tous les composables, fonctions et composants doivent avoir:
- Description de la fonction
- Paramètres attendus
- Valeur de retour
- Exemple d'utilisation

---

## 15. Ordre d'implémentation recommandé

### Phase 1: Base de données et Backend
1. ✅ Modifier la table `activity_registrations`
2. ✅ Mettre à jour les politiques RLS
3. ✅ Créer l'edge function `register-to-zoom-meeting`
4. ✅ Tester l'edge function

### Phase 2: Utils et Composables
5. ✅ Créer `timezoneFormatter.js`
6. ✅ Créer `activityHelpers.js`
7. ✅ Créer `useActivityDetail.js`
8. ✅ Créer `useActivityRegistration.js`
9. ✅ Créer `useActivityQuestions.js`

### Phase 3: Composants Vue
10. ✅ Créer les composants enfants réutilisables:
    - `ActivityHero.vue`
    - `ActivityInfo.vue`
    - `ActivityTimezoneDisplay.vue`
    - `ActivitySpeakers.vue`
    - `ActivityDocuments.vue`
    - `ActivityRegistrationCard.vue`
    - `ActivityQuestionsPanel.vue`
    - `ActivitySidebar.vue`

11. ✅ Créer la page principale `Detail.vue`

### Phase 4: Routing et i18n
12. ✅ Ajouter la route dans le router
13. ✅ Ajouter les traductions FR/EN

### Phase 5: Tests et Documentation
14. ✅ Écrire les tests unitaires
15. ✅ Écrire les tests d'intégration
16. ✅ Documenter l'API et le guide utilisateur

### Phase 6: Optimisation et Déploiement
17. ✅ Optimiser les requêtes
18. ✅ Ajouter les skeleton loaders
19. ✅ Tester sur mobile/tablette
20. ✅ Déployer l'edge function
21. ✅ Tester en production

---

## 16. Points d'attention

### 16.1 Gestion des erreurs

**Scénarios à gérer**:
- Activité non trouvée (404)
- Réunion Zoom non trouvée
- Erreur réseau lors de l'inscription
- Email déjà inscrit
- Questions vides ou trop courtes
- Timeout API Zoom

### 16.2 Accessibilité (A11y)

**Standards à respecter**:
- Labels ARIA pour tous les formulaires
- Navigation au clavier
- Contraste de couleurs suffisant
- Textes alternatifs pour images
- Messages d'erreur clairs et accessibles

### 16.3 Performance

**Objectifs**:
- Temps de chargement initial < 2s
- Time to Interactive < 3s
- Skeleton loaders pour améliorer la perception
- Lazy loading des images
- Code splitting pour réduire le bundle

---

## 17. Améliorations futures (v2)

1. **Notifications en temps réel**:
   - Notifier les participants d'une nouvelle question
   - Notifier quand un intervenant répond

2. **Chat en direct**:
   - Intégration avec le chat Zoom
   - Chat intégré dans la page

3. **Sondages et votes**:
   - Permettre aux organisateurs de créer des sondages
   - Afficher les résultats en temps réel

4. **Rappels automatiques**:
   - Email/notification 24h avant l'événement
   - Email/notification 1h avant l'événement

5. **Traduction automatique**:
   - Traduire automatiquement les questions
   - Sous-titres en temps réel

6. **Export de calendrier**:
   - Bouton "Ajouter à mon calendrier"
   - Support iCal, Google Calendar, Outlook

---

## Conclusion

Ce plan couvre tous les aspects de l'implémentation de la page de détail d'activité, de la base de données à l'interface utilisateur, en passant par les API et la sécurité. L'implémentation doit être progressive et testée à chaque étape.

**Estimation de temps**:
- Phase 1 (BD + Backend): 2-3 jours
- Phase 2 (Utils + Composables): 2-3 jours
- Phase 3 (Composants Vue): 3-4 jours
- Phase 4 (Routing + i18n): 1 jour
- Phase 5 (Tests + Doc): 2-3 jours
- Phase 6 (Optimisation + Déploiement): 1-2 jours

**Total estimé**: 11-16 jours de développement
