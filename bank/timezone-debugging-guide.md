# Guide de débogage : Problème de fuseau horaire Zoom

Ce document explique comment diagnostiquer et résoudre les problèmes de fuseau horaire lors de la création de réunions Zoom.

## Comprendre le flux des dates

### 1. Saisie par l'utilisateur (Create.vue)

L'utilisateur saisit :
- **Date** : `2025-11-15`
- **Heure de début** : `14:00`
- **Heure de fin** : `16:00`

L'événement a un fuseau horaire : `Europe/Paris` (UTC+1 en hiver, UTC+2 en été)

### 2. Conversion et stockage (buildDateTime function)

La fonction `buildDateTime` dans Create.vue :

```javascript
// Input
date = "2025-11-15"
time = "14:00"
timezone = "Europe/Paris"

// Process
// 1. Crée une date "naïve" : 2025-11-15T14:00:00
// 2. Calcule l'offset pour Europe/Paris à cette date
// 3. Ajuste pour obtenir l'heure UTC équivalente
// 4. Stocke en base : "2025-11-15T13:00:00.000Z" (UTC)
```

**Résultat stocké en PostgreSQL** : `2025-11-15 13:00:00+00` (TIMESTAMPTZ en UTC)

### 3. Récupération depuis la base de données

Quand l'Edge Function récupère la date :

```javascript
activity.final_start_date = "2025-11-15T13:00:00.000Z"
activity.event.timezone = "Europe/Paris"
```

### 4. Conversion pour Zoom (formatDateForZoom)

La fonction `formatDateForZoom` doit convertir :

```javascript
// Input
dateString = "2025-11-15T13:00:00.000Z"  // UTC
timezone = "Europe/Paris"

// Process
const date = new Date("2025-11-15T13:00:00.000Z")
// date représente : 15 Nov 2025, 13:00 UTC

// Utilise Intl.DateTimeFormat pour obtenir les composants dans le timezone
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',  // Convertir vers ce timezone
  // ... autres options
})

// Output attendu
formattedDate = "2025-11-15T14:00:00"  // Heure locale de Paris
```

### 5. Requête vers l'API Zoom

```json
{
  "topic": "Mon activité - COP30 2025",
  "type": 2,
  "start_time": "2025-11-15T14:00:00",
  "timezone": "Europe/Paris",
  "duration": 120
}
```

**Important** : L'API Zoom interprète `start_time` comme étant dans le `timezone` spécifié.

## Diagnostic du problème

### Étape 1 : Vérifier les logs de l'Edge Function

Après avoir tenté de créer une réunion, consultez les logs :

```bash
# Via CLI
npx supabase functions logs create-zoom-meeting

# Cherchez les émojis pour identifier les étapes
```

Exemples de logs à vérifier :

```
🕐 Formatting date for Zoom: {
  input_date: "2025-11-15T13:00:00.000Z",
  input_date_utc: "2025-11-15T13:00:00.000Z",
  target_timezone: "Europe/Paris",
  timestamp_ms: 1731675600000
}

✅ Formatted date for Zoom: {
  output_date: "2025-11-15T14:00:00",
  timezone: "Europe/Paris",
  components: { year: "2025", month: "11", day: "15", hour: "14", minute: "00", second: "00" }
}

📊 Meeting details: {
  title: "Mon activité",
  event_title: "COP30",
  event_year: "2025",
  timezone: "Europe/Paris",
  start_date_utc: "2025-11-15T13:00:00.000Z",
  end_date_utc: "2025-11-15T15:00:00.000Z",
  duration_minutes: 120
}

📤 Zoom API Request: {
  endpoint: "https://api.zoom.us/v2/users/me/meetings",
  topic: "Mon activité - COP30 2025",
  start_time: "2025-11-15T14:00:00",
  duration: 120,
  timezone: "Europe/Paris",
  agenda_length: 150
}
```

### Étape 2 : Vérifier la création dans Zoom

1. Connectez-vous à [zoom.us](https://zoom.us)
2. Allez dans **Meetings** > **Scheduled**
3. Trouvez la réunion créée
4. Vérifiez l'heure affichée

**Si l'heure est incorrecte**, notez :
- L'heure affichée dans Zoom
- Votre fuseau horaire personnel dans Zoom
- Le timezone configuré pour la réunion

### Étape 3 : Vérifier les données dans Supabase

```sql
-- Requête pour vérifier les données
SELECT
  a.id,
  a.title,
  a.proposed_start_date,
  a.final_start_date,
  e.timezone as event_timezone,
  zm.meeting_id,
  zm.join_url
FROM activities a
LEFT JOIN events e ON a.event_id = e.id
LEFT JOIN zoom_meetings zm ON a.zoom_meeting_id = zm.id
WHERE a.id = 'votre-activity-id';
```

Vérifiez que :
- `event_timezone` contient un timezone valide (ex: `Europe/Paris`)
- Les dates sont bien en UTC (avec `+00` ou `Z`)

## Problèmes courants et solutions

### Problème 1 : Timezone invalide

**Symptôme** : L'API Zoom retourne une erreur 400

**Cause** : Le timezone n'est pas reconnu par Zoom

**Solution** : Vérifier que le timezone est dans la liste des timezones supportés par Zoom

Timezones valides communs :
- `Europe/Paris`
- `America/New_York`
- `America/Montreal`
- `Asia/Tokyo`
- `Africa/Nairobi`
- `Pacific/Auckland`

**Ne pas utiliser** :
- Abréviations (CET, EST, PST)
- Offsets (+01:00, UTC+1)

### Problème 2 : Date stockée sans timezone

**Symptôme** : Les dates dans la base sont sans timezone

**Cause** : Mauvaise configuration de PostgreSQL ou mauvaise utilisation du type

**Solution** :
1. Vérifier que la colonne est `TIMESTAMPTZ` et non `TIMESTAMP`
2. Toujours stocker en UTC avec `toISOString()`

### Problème 3 : Conversion incorrecte dans buildDateTime

**Symptôme** : La date stockée ne correspond pas à l'heure saisie

**Test rapide** :
```javascript
// Dans la console du navigateur sur Create.vue
const testDate = "2025-11-15"
const testTime = "14:00"
const testTimezone = "Europe/Paris"

// Créer une date UTC
const naive = `${testDate}T${testTime}:00`
const utcDate = new Date(naive + 'Z')

// Voir l'heure dans le timezone
console.log('Heure saisie:', testTime)
console.log('UTC stocké:', utcDate.toISOString())
console.log('Heure dans timezone:', utcDate.toLocaleString('fr-FR', {
  timeZone: testTimezone,
  hour: '2-digit',
  minute: '2-digit'
}))
```

### Problème 4 : Réunion créée en GMT/UTC

**Symptôme** : La réunion Zoom affiche l'heure GMT au lieu de l'heure locale

**Diagnostic** :
1. Vérifier les logs de `formatDateForZoom`
2. Vérifier que le `timezone` est bien passé à l'API Zoom
3. Vérifier la requête envoyée (`📝 Full request body`)

**Solution possible** :

Le problème peut venir de Zoom qui n'accepte pas le timezone. Vérifiez la réponse d'erreur de l'API.

Ou l'utilisateur Zoom (ZOOM_USER_ID) a un timezone personnel qui override le timezone de la réunion.

## Script de test manuel

Pour tester la conversion de timezone sans créer de réunion :

```javascript
// Dans Deno (ou Node.js)

// Test function
function formatDateForZoom(dateString, timezone) {
  const date = new Date(dateString);

  console.log('Input:', {
    dateString,
    timezone,
    utc: date.toISOString()
  });

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const second = parts.find(p => p.type === 'second')?.value;

  const result = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

  console.log('Output:', result);
  console.log('Expected: Should match the local time in', timezone);

  return result;
}

// Test cases
console.log('\n=== Test 1: Paris (UTC+1 in winter) ===');
formatDateForZoom("2025-11-15T13:00:00.000Z", "Europe/Paris");
// Expected: 2025-11-15T14:00:00

console.log('\n=== Test 2: Paris (UTC+2 in summer) ===');
formatDateForZoom("2025-06-15T12:00:00.000Z", "Europe/Paris");
// Expected: 2025-06-15T14:00:00

console.log('\n=== Test 3: New York (UTC-5 in winter) ===');
formatDateForZoom("2025-11-15T19:00:00.000Z", "America/New_York");
// Expected: 2025-11-15T14:00:00

console.log('\n=== Test 4: Tokyo (UTC+9) ===');
formatDateForZoom("2025-11-15T05:00:00.000Z", "Asia/Tokyo");
// Expected: 2025-11-15T14:00:00
```

## Déployer les corrections

Après avoir modifié l'Edge Function :

```bash
# 1. Déployer
npx supabase functions deploy create-zoom-meeting

# 2. Tester avec une activité
# - Approuver une activité depuis l'interface
# - Consulter les logs
npx supabase functions logs create-zoom-meeting --tail

# 3. Vérifier dans Zoom
# - Vérifier l'heure de la réunion créée
```

## Contact et support

Si le problème persiste après ces vérifications :

1. Capturez les logs complets de l'Edge Function
2. Notez les valeurs suivantes :
   - Timezone de l'événement
   - Heure saisie par l'utilisateur
   - Heure stockée en base (UTC)
   - Heure envoyée à Zoom
   - Heure affichée dans Zoom
3. Vérifiez la documentation Zoom sur les timezones : https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate

---

**Dernière mise à jour** : 2025-10-24
