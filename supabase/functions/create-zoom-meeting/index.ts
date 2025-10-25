// supabase/functions/create-zoom-meeting/index.ts
// Edge Function pour créer automatiquement une réunion Zoom lors de la validation d'une activité

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const ZOOM_USER_ID = Deno.env.get('ZOOM_USER_ID') ?? 'me'; // ID de l'utilisateur Zoom qui créera les réunions
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('create-zoom-meeting function started');
console.info('Environment check:', {
  hasZoomAccountId: !!ZOOM_ACCOUNT_ID,
  hasZoomClientId: !!ZOOM_CLIENT_ID,
  hasZoomClientSecret: !!ZOOM_CLIENT_SECRET,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
  zoomUserId: ZOOM_USER_ID
});

/**
 * Génère un token d'accès OAuth pour l'API Zoom
 */
async function getZoomAccessToken(): Promise<string> {
  try {
    const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);

    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get Zoom access token:', response.status, errorText);
      throw new Error(`Failed to get Zoom access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    throw error;
  }
}

/**
 * Calcule la durée en minutes entre deux dates
 */
function calculateDurationInMinutes(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  return Math.ceil(durationMs / (1000 * 60)); // Convertir en minutes
}

/**
 * Formate une date au format ISO 8601 requis par Zoom (YYYY-MM-DDTHH:mm:ss)
 * Important: L'API Zoom attend la date/heure LOCALE du timezone spécifié, sans indicateur de timezone
 *
 * Exemple: Si l'événement est à 14:00 à Paris (Europe/Paris)
 * - Input: "2025-11-15T13:00:00.000Z" (UTC)
 * - Output: "2025-11-15T14:00:00" (heure locale de Paris)
 * - Timezone param: "Europe/Paris"
 */
function formatDateForZoom(dateString: string, timezone: string): string {
  // Créer un objet Date à partir de la chaîne ISO (qui est en UTC)
  const date = new Date(dateString);

  console.log('🕐 Formatting date for Zoom:', {
    input_date: dateString,
    input_date_utc: date.toISOString(),
    target_timezone: timezone,
    timestamp_ms: date.getTime()
  });

  // Utiliser Intl.DateTimeFormat pour obtenir les composants de la date dans le timezone cible
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

  const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

  console.log('✅ Formatted date for Zoom:', {
    output_date: formattedDate,
    timezone: timezone,
    components: { year, month, day, hour, minute, second }
  });

  return formattedDate;
}

/**
 * Crée une réunion Zoom via l'API
 */
async function createZoomMeeting(
  accessToken: string,
  title: string,
  startDate: string,
  duration: number,
  timezone: string,
  description?: string
) {
  try {
    const formattedStartTime = formatDateForZoom(startDate, timezone);

    const requestBody = {
      topic: title,
      type: 2, // Réunion planifiée
      start_time: formattedStartTime,
      duration: duration,
      timezone: timezone,
      agenda: description || '',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: 'cloud', // Enregistrement automatique dans le cloud
        allow_multiple_devices: true,
        approval_type: 0, // Approbation automatique
        registration_type: 2, // Les participants peuvent s'inscrire et rejoindre
        audio: 'both', // Téléphone et VoIP
        enforce_login: false
      }
    };

    console.log('📤 Zoom API Request:', {
      endpoint: `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      topic: title,
      start_time: formattedStartTime,
      duration: duration,
      timezone: timezone,
      agenda_length: description?.length || 0
    });

    console.log('📝 Full request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Zoom meeting:', response.status, errorText);
      throw new Error(`Failed to create Zoom meeting: ${response.status} - ${errorText}`);
    }

    const meetingData = await response.json();
    console.log('Zoom meeting created successfully:', meetingData.id);

    return {
      meeting_id: meetingData.id.toString(),
      join_url: meetingData.join_url,
      start_url: meetingData.start_url,
      password: meetingData.password,
      registration_url: meetingData.registration_url
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Configuration CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Request method:', req.method);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier les credentials Zoom
    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      console.error('Missing Zoom credentials');
      return new Response(
        JSON.stringify({ error: 'Zoom credentials not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier les credentials Supabase
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Parser le payload
    let payload;
    try {
      payload = await req.json();
      console.log('Payload received:', JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error('Error parsing JSON payload:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const { activity_id } = payload;

    // Validation du payload
    if (!activity_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: activity_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Créer le client Supabase
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Récupérer les informations de l'activité et de l'événement associé
    console.log('Fetching activity and event data...');
    const { data: activity, error: activityError } = await supabaseClient
      .from('activities')
      .select(`
        id,
        title,
        objectives,
        detailed_presentation,
        final_start_date,
        final_end_date,
        proposed_start_date,
        proposed_end_date,
        zoom_meeting_id,
        event:events (
          timezone,
          title,
          year
        )
      `)
      .eq('id', activity_id)
      .single();

    if (activityError || !activity) {
      console.error('Failed to fetch activity:', activityError);
      return new Response(
        JSON.stringify({
          error: 'Activity not found',
          details: activityError?.message
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier si une réunion Zoom existe déjà
    if (activity.zoom_meeting_id) {
      console.log('Activity already has a Zoom meeting:', activity.zoom_meeting_id);
      return new Response(
        JSON.stringify({
          message: 'Activity already has a Zoom meeting',
          zoom_meeting_id: activity.zoom_meeting_id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Utiliser les dates finales si disponibles, sinon les dates proposées
    const startDate = activity.final_start_date || activity.proposed_start_date;
    const endDate = activity.final_end_date || activity.proposed_end_date;
    const timezone = activity.event.timezone;

    if (!startDate || !endDate || !timezone) {
      console.error('Missing required date or timezone information');
      return new Response(
        JSON.stringify({
          error: 'Missing required date or timezone information for the activity'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Calculer la durée de la réunion en minutes
    const duration = calculateDurationInMinutes(startDate, endDate);

    console.log('📊 Meeting details:', {
      title: activity.title,
      event_title: activity.event.title,
      event_year: activity.event.year,
      timezone: timezone,
      start_date_utc: startDate,
      end_date_utc: endDate,
      duration_minutes: duration
    });

    // Créer une description pour la réunion
    const description = activity.objectives || activity.detailed_presentation || '';
    const meetingTitle = `${activity.title} - ${activity.event.title} ${activity.event.year}`;

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Créer la réunion Zoom
    console.log('🎥 Creating Zoom meeting...');
    const zoomMeeting = await createZoomMeeting(
      accessToken,
      meetingTitle,
      startDate,
      duration,
      timezone,
      description
    );

    // Insérer les informations de la réunion Zoom dans la base de données
    console.log('Saving Zoom meeting to database...');
    const { data: savedMeeting, error: saveMeetingError } = await supabaseClient
      .from('zoom_meetings')
      .insert({
        meeting_id: zoomMeeting.meeting_id,
        join_url: zoomMeeting.join_url,
        start_url: zoomMeeting.start_url,
        password: zoomMeeting.password,
        registration_url: zoomMeeting.registration_url,
        created_by: null // Créé automatiquement par le système
      })
      .select()
      .single();

    if (saveMeetingError || !savedMeeting) {
      console.error('Failed to save Zoom meeting to database:', saveMeetingError);
      return new Response(
        JSON.stringify({
          error: 'Failed to save Zoom meeting to database',
          details: saveMeetingError?.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Mettre à jour l'activité avec l'ID de la réunion Zoom
    console.log('Updating activity with Zoom meeting ID...');
    const { error: updateActivityError } = await supabaseClient
      .from('activities')
      .update({ zoom_meeting_id: savedMeeting.id })
      .eq('id', activity_id);

    if (updateActivityError) {
      console.error('Failed to update activity with Zoom meeting ID:', updateActivityError);
      // Note: La réunion Zoom a été créée, mais la liaison avec l'activité a échoué
      // On retourne quand même un succès partiel
      return new Response(
        JSON.stringify({
          warning: 'Zoom meeting created but failed to link to activity',
          zoom_meeting_id: savedMeeting.id,
          meeting_id: zoomMeeting.meeting_id,
          join_url: zoomMeeting.join_url,
          details: updateActivityError?.message
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Zoom meeting created and linked successfully');

    // Retourner les informations de la réunion
    return new Response(
      JSON.stringify({
        message: 'Zoom meeting created and linked successfully',
        zoom_meeting_id: savedMeeting.id,
        meeting_id: zoomMeeting.meeting_id,
        join_url: zoomMeeting.join_url,
        start_url: zoomMeeting.start_url,
        password: zoomMeeting.password,
        registration_url: zoomMeeting.registration_url
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in create-zoom-meeting function:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: String(err)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
