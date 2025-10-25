# Spécifications : Edge Function `edit-zoom-meeting`

## Vue d'ensemble

Cette edge function permet de modifier une réunion Zoom existante via l'API Zoom. Elle est appelée par le chatbot IA lorsqu'un utilisateur admin/super_admin demande de modifier une réunion.

## Référence

S'inspirer de :
- [supabase/functions/create-zoom-meeting/index.ts](../../../supabase/functions/create-zoom-meeting/index.ts)
- [supabase/functions/delete-zoom-meeting/index.ts](../../../supabase/functions/delete-zoom-meeting/index.ts)

## Localisation

**Fichier à créer** : `supabase/functions/edit-zoom-meeting/index.ts`

## Endpoint Zoom API

**PATCH** `https://api.zoom.us/v2/meetings/{meetingId}`

Documentation : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingUpdate

## Payload d'entrée

```typescript
interface EditZoomMeetingPayload {
  activity_id: string           // ID de l'activité (requis)
  updates: {
    title?: string              // Nouveau titre de la réunion
    start_time?: string         // Nouvelle date/heure de début (ISO 8601)
    duration?: number           // Nouvelle durée en minutes
    description?: string        // Nouvelle description/agenda
  }
}
```

**Exemple** :

```json
{
  "activity_id": "abc123-def456",
  "updates": {
    "title": "Réunion de coordination - Mise à jour",
    "start_time": "2025-11-20T14:00:00.000Z",
    "duration": 90
  }
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
const { activity_id, updates } = payload

// Valider activity_id
if (!activity_id) {
  return error('Missing required field: activity_id', 400)
}

// Valider updates
if (!updates || Object.keys(updates).length === 0) {
  return error('Missing required field: updates', 400)
}

// Valider que au moins un champ à modifier est présent
const validFields = ['title', 'start_time', 'duration', 'description']
const hasValidUpdate = Object.keys(updates).some(key => validFields.includes(key))

if (!hasValidUpdate) {
  return error('No valid fields to update', 400)
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
    final_start_date,
    final_end_date,
    proposed_start_date,
    proposed_end_date,
    zoom_meetings (
      id,
      meeting_id,
      join_url,
      start_url
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

### 4. Construire le payload de mise à jour pour Zoom

```typescript
interface ZoomUpdatePayload {
  topic?: string
  start_time?: string
  duration?: number
  agenda?: string
}

const zoomUpdates: ZoomUpdatePayload = {}

// Mapper les champs du payload vers le format Zoom
if (updates.title) {
  zoomUpdates.topic = updates.title
}

if (updates.start_time) {
  // Formater la date pour Zoom (UTC)
  zoomUpdates.start_time = formatDateForZoomUTC(updates.start_time)
}

if (updates.duration) {
  zoomUpdates.duration = updates.duration
}

if (updates.description) {
  zoomUpdates.agenda = updates.description
}

console.log('📝 Zoom update payload:', zoomUpdates)
```

### 5. Obtenir le token d'accès Zoom

```typescript
// Réutiliser la fonction getZoomAccessToken() existante
const accessToken = await getZoomAccessToken()
```

### 6. Modifier la réunion sur Zoom

```typescript
async function updateZoomMeeting(
  accessToken: string,
  meetingId: string,
  updates: ZoomUpdatePayload
) {
  try {
    console.log('📤 Zoom API Update Request:', {
      endpoint: `https://api.zoom.us/v2/meetings/${meetingId}`,
      meeting_id: meetingId,
      updates: updates
    })

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    )

    // L'API Zoom retourne 204 No Content en cas de succès
    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('Failed to update Zoom meeting:', response.status, errorText)

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found')
      }

      throw new Error(`Failed to update Zoom meeting: ${response.status} - ${errorText}`)
    }

    console.log('✅ Zoom meeting updated successfully')
    return true
  } catch (error) {
    console.error('Error updating Zoom meeting:', error)
    throw error
  }
}

// Appeler la fonction
await updateZoomMeeting(accessToken, zoomMeetingId, zoomUpdates)
```

### 7. Récupérer les informations mises à jour

Après la modification, récupérer les nouvelles informations de la réunion :

```typescript
async function getZoomMeetingDetails(
  accessToken: string,
  meetingId: string
) {
  try {
    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get meeting details: ${response.status} - ${errorText}`)
    }

    const meetingData = await response.json()
    return {
      meeting_id: meetingData.id.toString(),
      join_url: meetingData.join_url,
      start_url: meetingData.start_url,
      topic: meetingData.topic,
      start_time: meetingData.start_time,
      duration: meetingData.duration
    }
  } catch (error) {
    console.error('Error getting meeting details:', error)
    throw error
  }
}

const updatedMeeting = await getZoomMeetingDetails(accessToken, zoomMeetingId)
```

### 8. Mettre à jour la base de données (optionnel)

Si nécessaire, mettre à jour les informations en base :

```typescript
// Mettre à jour les URLs si elles ont changé (rare)
const { error: updateDbError } = await supabaseClient
  .from('zoom_meetings')
  .update({
    join_url: updatedMeeting.join_url,
    start_url: updatedMeeting.start_url
  })
  .eq('id', activity.zoom_meeting_id)

if (updateDbError) {
  console.warn('Failed to update database:', updateDbError)
  // Ne pas bloquer si la mise à jour DB échoue
}
```

### 9. Retourner la réponse

```typescript
return new Response(
  JSON.stringify({
    message: 'Zoom meeting updated successfully',
    activity_id: activity_id,
    meeting_id: updatedMeeting.meeting_id,
    join_url: updatedMeeting.join_url,
    start_url: updatedMeeting.start_url,
    updated_fields: Object.keys(zoomUpdates)
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
| 400 | Missing required field: updates | updates manquant ou vide |
| 400 | No valid fields to update | Aucun champ valide à modifier |
| 404 | Activity not found | Activité inexistante |
| 404 | No Zoom meeting associated | Pas de réunion Zoom liée |
| 404 | Zoom meeting not found | Réunion supprimée sur Zoom |
| 500 | Zoom credentials not configured | Credentials manquants |
| 500 | Failed to update Zoom meeting | Erreur API Zoom |

### Exemple de gestion d'erreur

```typescript
try {
  // ... logique de la fonction
} catch (err) {
  console.error('Unhandled error in edit-zoom-meeting function:', err)

  // Déterminer le code d'erreur approprié
  let statusCode = 500
  let errorMessage = 'Internal server error'

  if (err.message.includes('not found')) {
    statusCode = 404
    errorMessage = err.message
  } else if (err.message.includes('credentials')) {
    statusCode = 500
    errorMessage = 'Zoom credentials not configured'
  }

  return new Response(
    JSON.stringify({
      error: errorMessage,
      details: String(err)
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  )
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

### formatDateForZoomUTC()

Réutiliser la fonction existante de [create-zoom-meeting/index.ts](../../../supabase/functions/create-zoom-meeting/index.ts:77-104)

```typescript
function formatDateForZoomUTC(dateString: string): string {
  const date = new Date(dateString)

  console.log('🕐 Formatting date for Zoom (UTC):', {
    input_date: dateString,
    input_date_utc: date.toISOString(),
    timestamp_ms: date.getTime()
  })

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const minute = String(date.getUTCMinutes()).padStart(2, '0')
  const second = String(date.getUTCSeconds()).padStart(2, '0')

  const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`

  console.log('✅ Formatted date for Zoom (UTC):', {
    output_date: formattedDate,
    timezone: 'UTC'
  })

  return formattedDate
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

## Tests

### Test local avec Supabase CLI

```bash
# Démarrer la fonction localement
supabase functions serve edit-zoom-meeting

# Tester avec curl
curl -X POST http://localhost:54321/functions/v1/edit-zoom-meeting \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "activity_id": "abc123",
    "updates": {
      "title": "Nouveau titre",
      "duration": 90
    }
  }'
```

### Tests de cas limites

1. **Activité sans réunion Zoom**
   ```json
   { "activity_id": "no-zoom-meeting" }
   ```
   Attendu : 404 "No Zoom meeting associated"

2. **Réunion supprimée sur Zoom**
   ```json
   { "activity_id": "deleted-on-zoom" }
   ```
   Attendu : 404 "Zoom meeting not found"

3. **Updates vide**
   ```json
   { "activity_id": "abc123", "updates": {} }
   ```
   Attendu : 400 "No valid fields to update"

4. **Champs invalides**
   ```json
   {
     "activity_id": "abc123",
     "updates": { "invalid_field": "value" }
   }
   ```
   Attendu : 400 "No valid fields to update"

## Déploiement

```bash
# Déployer la fonction
supabase functions deploy edit-zoom-meeting

# Vérifier les logs
supabase functions logs edit-zoom-meeting
```

## Variables d'environnement

Les variables suivantes doivent être configurées dans Supabase (déjà configurées pour les autres fonctions) :

```bash
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_USER_ID=me
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Template de code complet

Voir le fichier exemple : [edit-zoom-meeting-template.ts](./edit-zoom-meeting-template.ts)

## Référence API Zoom

- **Update Meeting** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingUpdate
- **Get Meeting** : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting

## Checklist avant déploiement

- [ ] Fonction `getZoomAccessToken()` implémentée
- [ ] Fonction `formatDateForZoomUTC()` implémentée
- [ ] Validation du payload complète
- [ ] Gestion des erreurs robuste
- [ ] Logs détaillés pour le debugging
- [ ] CORS configuré correctement
- [ ] Tests locaux réussis
- [ ] Tests de cas limites effectués
- [ ] Documentation à jour

## Notes importantes

⚠️ **Attention** : L'API Zoom retourne **204 No Content** en cas de succès pour le PATCH. Il faut donc accepter les status codes 200 ET 204.

⚠️ **Timezone** : Toujours utiliser UTC pour les dates, comme dans les autres fonctions.

⚠️ **Rate limiting** : L'API Zoom a des limites de taux. Gérer les erreurs 429 (Too Many Requests) si nécessaire.

⚠️ **Sécurité** : Les credentials Zoom ne doivent JAMAIS être exposés au frontend. Toujours passer par l'edge function.
