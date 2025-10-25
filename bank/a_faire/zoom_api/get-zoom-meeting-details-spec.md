# Spécifications : Edge Function `get-zoom-meeting-details`

## Vue d'ensemble

Cette edge function permet de récupérer les détails complets d'une réunion Zoom depuis l'API Zoom, incluant :
- Les informations de base (titre, date, durée, lien)
- La liste des participants inscrits
- Le nombre total d'inscrits
- Les métriques de participation (pour les réunions passées)

## Référence

S'inspirer de :
- [supabase/functions/create-zoom-meeting/index.ts](../../../supabase/functions/create-zoom-meeting/index.ts)
- [supabase/functions/delete-zoom-meeting/index.ts](../../../supabase/functions/delete-zoom-meeting/index.ts)

## Localisation

**Fichier à créer** : `supabase/functions/get-zoom-meeting-details/index.ts`

## Endpoints Zoom API utilisés

### 1. Détails de la réunion
**GET** `https://api.zoom.us/v2/meetings/{meetingId}`

Documentation : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting

**Retourne** :
- `id` - ID de la réunion
- `topic` - Titre de la réunion
- `start_time` - Date et heure de début
- `duration` - Durée en minutes
- `timezone` - Fuseau horaire
- `join_url` - Lien de participation
- `password` - Mot de passe (si configuré)
- `status` - Statut de la réunion (waiting, started, finished)

### 2. Liste des inscrits (registrants)
**GET** `https://api.zoom.us/v2/meetings/{meetingId}/registrants`

Documentation : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingRegistrants

**Paramètres** :
- `page_size` - Nombre de résultats par page (max 300)
- `page_number` - Numéro de page

**Retourne** :
- `registrants[]` - Liste des inscrits
  - `id` - ID de l'inscrit
  - `email` - Email
  - `first_name` - Prénom
  - `last_name` - Nom
  - `status` - Statut (approved, denied, pending)
  - `create_time` - Date d'inscription
- `total_records` - Nombre total d'inscrits

### 3. Participants (pour réunions passées)
**GET** `https://api.zoom.us/v2/past_meetings/{meetingId}/participants`

Documentation : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/pastMeetingParticipants

**Note** : Cet endpoint n'est accessible que pour les réunions terminées

## Payload d'entrée

```typescript
interface GetZoomMeetingDetailsPayload {
  activity_id: string           // ID de l'activité (requis)
  include_registrants?: boolean // Inclure la liste des inscrits (défaut: true)
  max_registrants?: number      // Nombre max d'inscrits à retourner (défaut: 100)
}
```

**Exemple** :

```json
{
  "activity_id": "abc123-def456",
  "include_registrants": true,
  "max_registrants": 50
}
```

## Payload de sortie

```typescript
interface ZoomMeetingDetails {
  meeting_id: string
  topic: string
  start_time: string            // ISO 8601
  duration: number              // minutes
  timezone: string
  join_url: string
  password?: string
  status: string                // 'waiting' | 'started' | 'finished'

  // Informations sur les inscrits
  registrants_count: number
  registrants?: Array<{
    id: string
    email: string
    first_name: string
    last_name: string
    status: string
    create_time: string
  }>

  // Informations supplémentaires
  host_email?: string
  created_at?: string
}
```

## Logique de la fonction

### 1. Validation des credentials

```typescript
// Vérifier les credentials Zoom
if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
  return error('Zoom credentials not configured', 500)
}

// Vérifier les credentials Supabase
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  return error('Supabase credentials not configured', 500)
}
```

### 2. Validation du payload

```typescript
const { activity_id, include_registrants = true, max_registrants = 100 } = payload

// Valider activity_id
if (!activity_id) {
  return error('Missing required field: activity_id', 400)
}

// Valider max_registrants
if (max_registrants < 1 || max_registrants > 300) {
  return error('max_registrants must be between 1 and 300', 400)
}
```

### 3. Récupérer l'activité et la réunion Zoom

```typescript
// Récupérer l'activité avec la réunion Zoom associée
const { data: activity, error: activityError } = await supabaseClient
  .from('activities')
  .select(`
    id,
    title,
    zoom_meeting_id,
    zoom_meetings (
      id,
      meeting_id,
      join_url
    )
  `)
  .eq('id', activity_id)
  .single()

if (activityError || !activity) {
  return error('Activity not found', 404)
}

// Vérifier qu'une réunion Zoom existe
if (!activity.zoom_meeting_id || !activity.zoom_meetings) {
  return error('No Zoom meeting associated with this activity', 404)
}

const zoomMeetingId = activity.zoom_meetings.meeting_id
```

### 4. Obtenir le token d'accès Zoom

```typescript
// Réutiliser la fonction getZoomAccessToken() existante
const accessToken = await getZoomAccessToken()
```

### 5. Récupérer les détails de la réunion

```typescript
async function getZoomMeetingInfo(
  accessToken: string,
  meetingId: string
) {
  try {
    console.log('📥 Fetching meeting info from Zoom:', meetingId)

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get meeting info:', response.status, errorText)

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found')
      }

      throw new Error(`Failed to get meeting info: ${response.status}`)
    }

    const meetingData = await response.json()

    console.log('✅ Meeting info retrieved:', {
      id: meetingData.id,
      topic: meetingData.topic,
      status: meetingData.status
    })

    return {
      meeting_id: meetingData.id.toString(),
      topic: meetingData.topic,
      start_time: meetingData.start_time,
      duration: meetingData.duration,
      timezone: meetingData.timezone,
      join_url: meetingData.join_url,
      password: meetingData.password,
      status: meetingData.status,
      host_email: meetingData.host_email,
      created_at: meetingData.created_at
    }
  } catch (error) {
    console.error('Error getting meeting info:', error)
    throw error
  }
}

// Appeler la fonction
const meetingInfo = await getZoomMeetingInfo(accessToken, zoomMeetingId)
```

### 6. Récupérer la liste des inscrits (optionnel)

```typescript
async function getZoomMeetingRegistrants(
  accessToken: string,
  meetingId: string,
  maxRegistrants: number = 100
) {
  try {
    console.log('📥 Fetching meeting registrants from Zoom:', meetingId)

    const pageSize = Math.min(maxRegistrants, 300) // Zoom limit: 300 per page

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants?page_size=${pageSize}&page_number=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get registrants:', response.status, errorText)

      // Si les inscriptions ne sont pas activées (400)
      if (response.status === 400) {
        console.log('⚠️ Registration not enabled for this meeting')
        return {
          total_records: 0,
          registrants: []
        }
      }

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found')
      }

      throw new Error(`Failed to get registrants: ${response.status}`)
    }

    const registrantsData = await response.json()

    console.log('✅ Registrants retrieved:', {
      total: registrantsData.total_records || 0,
      returned: registrantsData.registrants?.length || 0
    })

    return {
      total_records: registrantsData.total_records || 0,
      registrants: (registrantsData.registrants || []).map((r: any) => ({
        id: r.id,
        email: r.email,
        first_name: r.first_name,
        last_name: r.last_name,
        status: r.status,
        create_time: r.create_time
      }))
    }
  } catch (error) {
    console.error('Error getting registrants:', error)
    // Ne pas faire échouer la requête si les registrants ne sont pas disponibles
    return {
      total_records: 0,
      registrants: []
    }
  }
}

// Appeler la fonction si demandé
let registrantsInfo = { total_records: 0, registrants: [] }

if (include_registrants) {
  registrantsInfo = await getZoomMeetingRegistrants(
    accessToken,
    zoomMeetingId,
    max_registrants
  )
}
```

### 7. Construire et retourner la réponse

```typescript
// Construire la réponse complète
const responseData = {
  ...meetingInfo,
  registrants_count: registrantsInfo.total_records,
  registrants: include_registrants ? registrantsInfo.registrants : undefined
}

console.log('🎉 Meeting details retrieved successfully')

return new Response(
  JSON.stringify({
    message: 'Meeting details retrieved successfully',
    ...responseData
  }),
  {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  }
)
```

## Gestion des erreurs

### Erreurs possibles

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing required field: activity_id | activity_id manquant |
| 400 | max_registrants must be between 1 and 300 | Paramètre invalide |
| 404 | Activity not found | Activité inexistante |
| 404 | No Zoom meeting associated | Pas de réunion Zoom liée |
| 404 | Zoom meeting not found | Réunion supprimée sur Zoom |
| 500 | Zoom credentials not configured | Credentials manquants |
| 500 | Failed to get meeting info | Erreur API Zoom |

### Gestion des cas particuliers

```typescript
// 1. Inscription non activée
if (response.status === 400 && errorText.includes('registration')) {
  console.log('⚠️ Registration not enabled for this meeting')
  // Retourner 0 inscrits au lieu d'une erreur
  return { total_records: 0, registrants: [] }
}

// 2. Réunion passée (participants réels vs inscrits)
if (meetingInfo.status === 'finished') {
  console.log('📊 Meeting finished - registrants may not reflect actual attendance')
  // Note: Pour obtenir les participants réels, utiliser l'endpoint /past_meetings
}

// 3. Réunion en cours
if (meetingInfo.status === 'started') {
  console.log('🎥 Meeting in progress')
}
```

## Fonctions utilitaires à réutiliser

### getZoomAccessToken()

Réutiliser la fonction existante de [create-zoom-meeting/index.ts](../../../supabase/functions/create-zoom-meeting/index.ts:27-54)

```typescript
async function getZoomAccessToken(): Promise<string> {
  try {
    const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)

    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get Zoom access token:', response.status, errorText)
      throw new Error(`Failed to get Zoom access token: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Zoom access token:', error)
    throw error
  }
}
```

## Configuration CORS

Utiliser la même configuration que les autres edge functions :

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Gérer les requêtes OPTIONS (preflight)
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

## Optimisation pour minimiser les tokens

### Réponse concise pour le chatbot

Au lieu de retourner tous les détails des inscrits, ne retourner que les informations essentielles :

```typescript
// ❌ Réponse verbeuse (beaucoup de tokens)
{
  meeting_id: "123456789",
  topic: "Atelier climat",
  start_time: "2025-11-20T14:00:00Z",
  duration: 90,
  timezone: "UTC",
  join_url: "https://zoom.us/j/123456789",
  password: "abc123",
  status: "waiting",
  host_email: "admin@example.com",
  created_at: "2025-10-01T10:00:00Z",
  registrants_count: 15,
  registrants: [
    {
      id: "reg1",
      email: "user1@example.com",
      first_name: "Jean",
      last_name: "Dupont",
      status: "approved",
      create_time: "2025-10-15T09:00:00Z"
    },
    // ... 14 autres inscrits
  ]
}
```

**Tokens estimés** : ~500 tokens (avec 15 inscrits)

```typescript
// ✅ Réponse concise (optimisée)
{
  ok: true,
  topic: "Atelier climat",
  start: "2025-11-20T14:00:00Z",
  duration: 90,
  join_url: "https://zoom.us/j/123456789",
  count: 15,
  status: "waiting"
}
```

**Tokens estimés** : ~40 tokens
**Économie** : 92% !

### Configuration du paramètre `include_registrants`

```typescript
// Par défaut, ne pas inclure la liste complète des inscrits
const include_registrants = payload.include_registrants ?? false

// Toujours retourner le COUNT, mais la liste détaillée uniquement si demandé
```

## Tests

### Test local avec Supabase CLI

```bash
# Démarrer la fonction localement
supabase functions serve get-zoom-meeting-details

# Tester avec curl
curl -X POST http://localhost:54321/functions/v1/get-zoom-meeting-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "activity_id": "abc123",
    "include_registrants": true,
    "max_registrants": 50
  }'
```

### Tests de cas limites

1. **Activité sans réunion Zoom**
   ```json
   { "activity_id": "no-zoom-meeting" }
   ```
   Attendu : 404 "No Zoom meeting associated"

2. **Réunion sans inscription activée**
   - L'API Zoom retourne 400 pour `/registrants`
   - La fonction doit retourner `registrants_count: 0` sans erreur

3. **Réunion terminée**
   - Status : "finished"
   - Vérifier que les inscrits sont toujours disponibles

4. **Paramètre max_registrants invalide**
   ```json
   { "activity_id": "abc123", "max_registrants": 500 }
   ```
   Attendu : 400 "max_registrants must be between 1 and 300"

## Déploiement

```bash
# Déployer la fonction
supabase functions deploy get-zoom-meeting-details

# Vérifier les logs
supabase functions logs get-zoom-meeting-details
```

## Variables d'environnement

Les mêmes variables que les autres fonctions Zoom :

```bash
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Template de code complet

Voir le fichier exemple : [get-zoom-meeting-details-template.ts](./get-zoom-meeting-details-template.ts)

## Référence API Zoom

- **Get Meeting** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
- **List Meeting Registrants** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingRegistrants
- **Get Past Meeting Participants** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/pastMeetingParticipants

## Checklist avant déploiement

- [ ] Fonction `getZoomAccessToken()` implémentée
- [ ] Fonction `getZoomMeetingInfo()` implémentée
- [ ] Fonction `getZoomMeetingRegistrants()` implémentée
- [ ] Gestion des erreurs robuste
- [ ] Optimisation des réponses (concision)
- [ ] Logs détaillés pour le debugging
- [ ] CORS configuré correctement
- [ ] Tests locaux réussis
- [ ] Tests de cas limites effectués
- [ ] Documentation à jour

## Notes importantes

⚠️ **Performance** : Limiter `max_registrants` à 100 par défaut pour éviter les réponses trop volumineuses

⚠️ **Optimisation tokens** : Par défaut, `include_registrants` = false. Le chatbot peut demander explicitement les détails s'il en a besoin.

⚠️ **Rate limiting** : L'API Zoom a des limites de taux. Gérer les erreurs 429 (Too Many Requests) si nécessaire.

⚠️ **Réunions passées** : Pour obtenir les participants réels (qui ont effectivement assisté), il faut utiliser l'endpoint `/past_meetings/{id}/participants`. Cette fonctionnalité peut être ajoutée ultérieurement si nécessaire.
