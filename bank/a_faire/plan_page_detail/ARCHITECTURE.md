# Architecture de la page de détail d'activité

## Vue d'ensemble du flux de données

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                               │
│                     (Authentifié ou Non)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /activities/:id                               │
│                    (Detail.vue)                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Composables                                             │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  • useActivityDetail()                                   │  │
│  │  • useActivityRegistration()                             │  │
│  │  • useActivityQuestions()                                │  │
│  │  • useTimezone()                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Composants enfants                                      │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  • ActivityHero                                          │  │
│  │  • ActivityInfo                                          │  │
│  │  • ActivitySpeakers                                      │  │
│  │  • ActivityDocuments                                     │  │
│  │  • ActivityRegistrationCard                              │  │
│  │  • ActivityQuestionsPanel                                │  │
│  │  • ActivitySidebar                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables PostgreSQL                                       │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  • activities          (lecture)                         │  │
│  │  • activity_speakers   (lecture)                         │  │
│  │  • activity_documents  (lecture)                         │  │
│  │  • activity_questions  (lecture/écriture)                │  │
│  │  • activity_registrations (écriture via edge function)   │  │
│  │  • zoom_meetings       (lecture)                         │  │
│  │  • organizations       (lecture)                         │  │
│  │  • countries           (lecture)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Edge Functions                                          │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  • register-to-zoom-meeting                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ZOOM API                                  │
│                                                                  │
│  • POST /meetings/{meetingId}/registrants                       │
│  • Retourne: registrant_id, join_url personnalisé               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flux d'inscription détaillé

### Utilisateur non authentifié

```
1. Utilisateur clique sur "S'inscrire"
   │
   ▼
2. Modal s'ouvre avec formulaire vide
   │
   ▼
3. Utilisateur remplit:
   - Email *
   - Prénom *
   - Nom *
   - Organisation (optionnel)
   - Pays (optionnel)
   │
   ▼
4. Validation côté client (Vue)
   │
   ▼
5. Appel à useActivityRegistration.registerToActivity()
   │
   ▼
6. POST vers /functions/v1/register-to-zoom-meeting
   Payload: {
     activity_id,
     guest_email,
     guest_first_name,
     guest_last_name,
     guest_organization,
     guest_country_id
   }
   │
   ▼
7. Edge Function traite la requête:
   a. Validation des données
   b. Vérification activité + zoom_meeting
   c. Vérification pas de doublon
   d. Appel API Zoom
   e. Sauvegarde dans activity_registrations
   │
   ▼
8. Retour à l'utilisateur:
   - Message de succès
   - Affichage du lien Zoom personnalisé
   - Email de confirmation (optionnel)
```

### Utilisateur authentifié

```
1. Utilisateur clique sur "S'inscrire"
   │
   ▼
2. Modal s'ouvre avec formulaire pré-rempli
   - Email (depuis user.email)
   - Prénom (depuis user.first_name)
   - Nom (depuis user.last_name)
   - Organisation (depuis user.organization_id)
   │
   ▼
3. Utilisateur peut modifier les données
   │
   ▼
4. Validation côté client
   │
   ▼
5. POST vers /functions/v1/register-to-zoom-meeting
   Payload: {
     activity_id,
     user_id,  // Présent car authentifié
     guest_email,  // Peut différer de user.email
     guest_first_name,
     guest_last_name,
     guest_organization,
     guest_country_id
   }
   │
   ▼
6. Edge Function traite (même flux)
   │
   ▼
7. Enregistrement avec user_id lié
   registration_type = 'user'
```

---

## Structure des données

### Table activity_registrations (après modification)

```typescript
interface ActivityRegistration {
  id: string;                    // UUID
  activity_id: string;           // UUID NOT NULL
  user_id?: string | null;       // UUID NULLABLE

  // Champs pour guests
  guest_email?: string | null;
  guest_first_name?: string | null;
  guest_last_name?: string | null;
  guest_organization?: string | null;
  guest_country_id?: string | null;

  // Données Zoom
  zoom_registrant_id?: string | null;  // ID retourné par Zoom
  zoom_join_url?: string | null;       // URL personnalisée
  personal_join_url?: string | null;   // Alias (legacy)

  // Métadonnées
  registration_type: 'user' | 'guest';
  registration_date: Date;
  attended: boolean;
  attendance_duration?: number | null;  // en minutes
  created_at: Date;
}
```

### Payload Edge Function

```typescript
interface RegistrationPayload {
  activity_id: string;

  // Pour utilisateur authentifié
  user_id?: string;

  // Pour tous (guest ou user)
  guest_email: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_organization?: string;
  guest_country_id?: string;
}
```

### Réponse Zoom API

```typescript
interface ZoomRegistrantResponse {
  id: string;                    // registrant_id
  join_url: string;              // URL personnalisée
  topic: string;                 // Titre de la réunion
  start_time: string;            // ISO 8601
  registrant_id: string;
}
```

### Réponse Edge Function

```typescript
interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    registration_id: string;
    zoom_join_url: string;
    zoom_registrant_id: string;
    meeting_topic: string;
    meeting_start_time: string;
  };
  error?: string;
}
```

---

## Composables - API détaillée

### useActivityDetail

```typescript
interface UseActivityDetail {
  // État
  activity: Ref<Activity | null>;
  speakers: Ref<ActivitySpeaker[]>;
  documents: Ref<ActivityDocument[]>;
  relatedActivities: Ref<Activity[]>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;

  // Computed
  hasZoomMeeting: ComputedRef<boolean>;
  isRegistrationOpen: ComputedRef<boolean>;
  eventTimezone: ComputedRef<string>;
  coverImage: ComputedRef<string>;

  // Méthodes
  loadActivity: (activityId: string) => Promise<void>;
  loadSpeakers: (activityId: string) => Promise<void>;
  loadDocuments: (activityId: string) => Promise<void>;
  loadRelatedActivities: (eventId: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useActivityRegistration

```typescript
interface UseActivityRegistration {
  // État
  isRegistering: Ref<boolean>;
  isRegistered: Ref<boolean>;
  registrationData: Ref<RegistrationResponse | null>;
  error: Ref<Error | null>;

  // Méthodes
  registerToActivity: (
    activityId: string,
    data: RegistrationPayload
  ) => Promise<RegistrationResponse>;

  checkIfAlreadyRegistered: (
    activityId: string,
    email?: string
  ) => Promise<boolean>;

  validateForm: (data: RegistrationPayload) => {
    valid: boolean;
    errors: Record<string, string>;
  };
}
```

### useActivityQuestions

```typescript
interface UseActivityQuestions {
  // État
  questions: Ref<ActivityQuestion[]>;
  isSubmitting: Ref<boolean>;
  error: Ref<Error | null>;

  // Méthodes
  loadQuestions: (activityId: string) => Promise<void>;
  submitQuestion: (
    activityId: string,
    questionData: {
      question: string;
      target_speakers?: string[];
    }
  ) => Promise<void>;

  filterBySpeaker: (speakerId: string) => ActivityQuestion[];
}
```

---

## Sécurité - Matrice des permissions

| Action                          | Guest | User | Admin | Edge Function |
|---------------------------------|-------|------|-------|---------------|
| Voir activité                   | ✅     | ✅    | ✅     | ✅             |
| Voir speakers                   | ✅     | ✅    | ✅     | ✅             |
| Voir documents                  | ✅     | ✅    | ✅     | ✅             |
| Télécharger documents           | ✅     | ✅    | ✅     | ✅             |
| Voir questions                  | ✅     | ✅    | ✅     | ✅             |
| S'inscrire (guest)              | ✅     | ✅    | ✅     | ✅             |
| S'inscrire (user)               | ❌     | ✅    | ✅     | ✅             |
| Poser une question              | ❌     | ✅    | ✅     | ❌             |
| Voir ses inscriptions           | ❌     | ✅    | ✅     | ❌             |
| Modifier inscription            | ❌     | ❌    | ✅     | ❌             |
| Supprimer inscription           | ❌     | ❌    | ✅     | ❌             |
| Modérer questions               | ❌     | ❌    | ✅     | ❌             |

---

## Performance - Stratégie de cache

### 1. Cache navigateur

**Données statiques** (6 heures):
- Documents (URLs)
- Images de couverture
- Logos organisations

**Données dynamiques** (5 minutes):
- Activité
- Speakers
- Questions

### 2. Prefetching

Au chargement de la page:
1. Charger activité (priorité haute)
2. Charger speakers (priorité moyenne)
3. Charger documents (priorité basse)
4. Charger questions (priorité basse)
5. Charger activités liées (lazy)

### 3. Lazy loading

**Images**:
- Hero image: eager
- Speaker photos: lazy
- Document thumbnails: lazy
- Related activities images: lazy

**Composants**:
- Modal inscription: lazy
- Formulaire question: lazy
- Sidebar activités: lazy

---

## Monitoring et analytics

### Événements à tracker

1. **Page views**:
   - `activity_detail_viewed`
   - Métadonnées: activity_id, user_id?, source

2. **Inscriptions**:
   - `registration_started`
   - `registration_completed`
   - `registration_failed`
   - Métadonnées: activity_id, user_type (guest/user)

3. **Questions**:
   - `question_submitted`
   - `question_viewed`
   - Métadonnées: activity_id, user_id

4. **Documents**:
   - `document_downloaded`
   - Métadonnées: activity_id, document_id

5. **Navigation**:
   - `related_activity_clicked`
   - Métadonnées: from_activity_id, to_activity_id

### Métriques de performance

- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

**Objectifs**:
- TTFB < 600ms
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s
- TBT < 300ms

---

## Diagramme de séquence - Inscription

```
Utilisateur          Detail.vue          useActivityRegistration          Edge Function          Zoom API          Supabase
    |                    |                        |                            |                    |                |
    |  Clique "S'inscrire"                       |                            |                    |                |
    |------------------>|                        |                            |                    |                |
    |                   |                        |                            |                    |                |
    |                   | Ouvre modal            |                            |                    |                |
    |                   |----------------------->|                            |                    |                |
    |                   |                        |                            |                    |                |
    | Remplit formulaire |                       |                            |                    |                |
    |------------------>|                        |                            |                    |                |
    |                   |                        |                            |                    |                |
    | Soumet             |                       |                            |                    |                |
    |------------------>|                        |                            |                    |                |
    |                   | registerToActivity()   |                            |                    |                |
    |                   |----------------------->|                            |                    |                |
    |                   |                        | POST /register-to-zoom-meeting                  |                |
    |                   |                        |--------------------------->|                    |                |
    |                   |                        |                            | Valide données    |                |
    |                   |                        |                            |                    |                |
    |                   |                        |                            | Vérifie activité  |                |
    |                   |                        |                            |---------------------------------------->|
    |                   |                        |                            |                    |                |
    |                   |                        |                            | POST /meetings/:id/registrants     |
    |                   |                        |                            |------------------->|                |
    |                   |                        |                            |                    | Crée registrant|
    |                   |                        |                            |                    |                |
    |                   |                        |                            | {registrant_id,    |                |
    |                   |                        |                            |  join_url}         |                |
    |                   |                        |                            |<-------------------|                |
    |                   |                        |                            |                    |                |
    |                   |                        |                            | INSERT activity_registrations       |
    |                   |                        |                            |---------------------------------------->|
    |                   |                        |                            |                    |                |
    |                   |                        | {success, data}            |                    |                |
    |                   |                        |<---------------------------|                    |                |
    |                   |                        |                            |                    |                |
    |                   | Mise à jour UI         |                            |                    |                |
    |                   |<-----------------------|                            |                    |                |
    |                   |                        |                            |                    |                |
    | Affiche succès +  |                        |                            |                    |                |
    | lien Zoom         |                        |                            |                    |                |
    |<------------------|                        |                            |                    |                |
```

---

## Gestion des erreurs - Arbre de décision

```
Inscription échoue
    |
    ├─ Erreur réseau?
    │   └─> Afficher: "Problème de connexion. Vérifiez votre réseau et réessayez."
    │       Bouton: "Réessayer"
    │
    ├─ Activité non trouvée?
    │   └─> Afficher: "Cette activité n'existe plus."
    │       Bouton: "Retour aux activités"
    │
    ├─ Pas de réunion Zoom?
    │   └─> Afficher: "Aucune réunion Zoom n'est associée à cette activité."
    │       Masquer bouton inscription
    │
    ├─ Email déjà inscrit?
    │   └─> Afficher: "Vous êtes déjà inscrit à cette activité."
    │       Afficher lien Zoom si disponible
    │
    ├─ Erreur API Zoom?
    │   └─> Afficher: "Erreur lors de l'inscription. Contactez l'organisateur."
    │       Email de contact affiché
    │
    └─ Erreur inconnue?
        └─> Afficher: "Une erreur inattendue s'est produite. Réessayez plus tard."
            Log l'erreur pour debugging
```

---

## Responsive Design - Breakpoints

```css
/* Mobile First Approach */

/* Mobile: < 640px */
- Une seule colonne
- Sidebar en bas
- Hero image ratio 16:9 (au lieu de 32:9)
- Bouton inscription full-width

/* Tablet: 640px - 1024px */
- Deux colonnes pour contenu + sidebar
- Hero image ratio 32:9
- Navigation sticky

/* Desktop: > 1024px */
- Layout 3 colonnes (contenu 2/3, sidebar 1/3)
- Hero image full 32:9
- Navigation fixe
```

---

Cette architecture permet une séparation claire des responsabilités, une scalabilité optimale et une maintenance facilitée.
