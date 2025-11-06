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
 * Formate une date UTC pour l'API Zoom (YYYY-MM-DDTHH:mm:ss)
 *
 * IMPORTANT: Les dates en base sont en UTC et représentent le moment exact.
 * On les envoie directement à Zoom en UTC sans conversion.
 * Zoom affichera l'heure dans le fuseau horaire local de chaque participant.
 *
 * Exemple: Si l'activité doit avoir lieu à 14:00 heure de Paris
 * - Stocké en base: "2025-11-15T13:00:00.000Z" (13:00 UTC = 14:00 Paris)
 * - Envoyé à Zoom: "2025-11-15T13:00:00" avec timezone="UTC"
 * - Zoom affiche: 13:00 UTC = 14:00 Paris = 08:00 New York
 */
function formatDateForZoomUTC(dateString: string): string {
  const date = new Date(dateString);

  console.log('🕐 Formatting date for Zoom (UTC):', {
    input_utc: dateString,
    timestamp_ms: date.getTime()
  });

  // Extraire les composants UTC directement
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

  console.log('✅ Formatted date for Zoom (UTC):', {
    output_utc: formattedDate,
    timezone: 'UTC'
  });

  return formattedDate;
}

/**
 * Crée une réunion Zoom via l'API en UTC
 */
async function createZoomMeeting(
  accessToken: string,
  title: string,
  startDate: string,
  duration: number,
  description?: string
) {
  try {
    const formattedStartTime = formatDateForZoomUTC(startDate);

    const requestBody = {
      topic: title,
      type: 2, // Réunion planifiée
      start_time: formattedStartTime,
      duration: duration,
      timezone: 'UTC', // Utiliser UTC car les dates en base sont déjà en UTC
      agenda: description || '',
      password: 'nego2025', // Mot de passe par défaut pour toutes les réunions
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        // auto_recording: 'cloud', // Enregistrement automatique dans le cloud
        allow_multiple_devices: true,
        approval_type: 0, // 0 = Inscription requise avec approbation automatique
        registration_type: 2, // 2 = Les participants doivent s'inscrire pour rejoindre
        audio: 'both', // Téléphone et VoIP
        enforce_login: false
      }
    };

    console.log('📤 Zoom API Request:', {
      endpoint: `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      topic: title,
      start_time: formattedStartTime,
      duration: duration,
      timezone: 'UTC',
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

    // Récupérer l'utilisateur authentifié
    const authHeader = req.headers.get('Authorization');
    let currentUserId = null;

    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: { user }, error: userError } = await supabaseAuthClient.auth.getUser(jwt);

      if (!userError && user) {
        currentUserId = user.id;
        console.log('User authenticated:', currentUserId);
      } else {
        console.warn('Failed to authenticate user:', userError);
      }
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
        validation_status,
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

    // Vérifier que l'activité est validée (approuvée)
    if (activity.validation_status !== 'approved') {
      console.log('Activity is not approved. Current status:', activity.validation_status);
      return new Response(
        JSON.stringify({
          error: 'Activity not approved',
          message: `Impossible de créer une réunion Zoom pour cette activité. L'activité doit être approuvée (statut actuel : ${activity.validation_status})`,
          validation_status: activity.validation_status
        }),
        {
          status: 400,
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

    // IMPORTANT: Les réunions Zoom doivent TOUJOURS utiliser les dates finales (final_start_date/final_end_date)
    // Si ces dates n'existent pas, c'est que l'activité n'est pas encore validée
    const finalStartDate = activity.final_start_date;
    const finalEndDate = activity.final_end_date;
    const timezone = activity.event.timezone;

    if (!finalStartDate || !finalEndDate) {
      console.error('Missing final dates - activity must be approved first');
      return new Response(
        JSON.stringify({
          error: 'Cannot create Zoom meeting: Activity does not have final dates (final_start_date/final_end_date)',
          message: 'L\'activité doit être approuvée avec des dates finales avant de créer une réunion Zoom',
          validation_status: activity.validation_status
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (!timezone) {
      console.error('Missing timezone information');
      return new Response(
        JSON.stringify({
          error: 'Missing timezone information for the event'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Calculer la durée de la réunion en minutes
    const duration = calculateDurationInMinutes(finalStartDate, finalEndDate);

    console.log('📊 Meeting details:', {
      title: activity.title,
      event_title: activity.event.title,
      event_year: activity.event.year,
      event_timezone: timezone,
      final_start_date_utc: finalStartDate,
      final_end_date_utc: finalEndDate,
      duration_minutes: duration,
      note: 'Using final dates with event timezone for Zoom meeting'
    });

    // Créer une description pour la réunion
    const description = activity.objectives || activity.detailed_presentation || '';
    const meetingTitle = `${activity.title}`;

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Créer la réunion Zoom en UTC
    console.log('🎥 Creating Zoom meeting in UTC (dates are already in UTC)');
    const zoomMeeting = await createZoomMeeting(
      accessToken,
      meetingTitle,
      finalStartDate,
      duration,
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
        topic: meetingTitle,
        start_time: finalStartDate, // Utiliser final_start_date (en UTC)
        duration: duration,
        timezone: 'UTC', // Les réunions Zoom sont créées en UTC
        created_by: currentUserId // ID de l'utilisateur qui crée la réunion (null si système)
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
