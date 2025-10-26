// supabase/functions/approve-activity/index.ts
// Edge Function pour approuver une activité et créer automatiquement une réunion Zoom

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const ZOOM_USER_ID = Deno.env.get('ZOOM_USER_ID') ?? 'me';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('approve-activity function started');
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
  return Math.ceil(durationMs / (1000 * 60));
}

/**
 * Formate une date au format ISO 8601 requis par Zoom (YYYY-MM-DDTHH:mm:ss)
 */
function formatDateForZoomUTC(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/**
 * Crée une réunion Zoom via l'API
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
      timezone: 'UTC',
      agenda: description || '',
      password: 'nego2025', // Mot de passe par défaut pour toutes les réunions
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
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
      duration: duration
    });

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

    // Vérifier les credentials
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

    const { activity_id, approved_by } = payload;

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

    // Récupérer l'activité avec toutes ses informations
    console.log('Fetching activity data...');
    const { data: activity, error: activityError } = await supabaseClient
      .from('activities')
      .select(`
        id,
        title,
        objectives,
        detailed_presentation,
        proposed_start_date,
        proposed_end_date,
        final_start_date,
        final_end_date,
        validation_status,
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

    // Vérifier que l'activité n'est pas déjà approuvée
    if (activity.validation_status === 'approved') {
      console.log('Activity is already approved');

      // Si déjà approuvée ET a déjà une réunion Zoom
      if (activity.zoom_meeting_id) {
        return new Response(
          JSON.stringify({
            message: 'Activity already approved with Zoom meeting',
            already_approved: true,
            validation_status: 'approved',
            zoom_meeting_id: activity.zoom_meeting_id
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

    console.log('📝 Approving activity and creating Zoom meeting...');

    // ÉTAPE 1: Approuver l'activité (changer le statut et copier les dates)
    const updateData: any = {
      validation_status: 'approved',
      final_start_date: activity.proposed_start_date,
      final_end_date: activity.proposed_end_date,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseClient
      .from('activities')
      .update(updateData)
      .eq('id', activity_id);

    if (updateError) {
      console.error('Failed to approve activity:', updateError);
      return new Response(
        JSON.stringify({
          error: 'Failed to approve activity',
          details: updateError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('✅ Activity approved successfully');

    // Enregistrer dans l'historique des modifications
    if (approved_by) {
      await supabaseClient
        .from('activity_modifications')
        .insert({
          activity_id: activity_id,
          field_name: 'validation_status',
          old_value: activity.validation_status,
          new_value: 'approved',
          old_value_type: 'string',
          new_value_type: 'string',
          modified_by: approved_by,
          modified_at: new Date().toISOString()
        });
    }

    // ÉTAPE 2: Créer la réunion Zoom (si elle n'existe pas déjà)
    if (activity.zoom_meeting_id) {
      console.log('Activity already has a Zoom meeting');
      return new Response(
        JSON.stringify({
          message: 'Activity approved successfully (Zoom meeting already exists)',
          validation_status: 'approved',
          zoom_meeting_id: activity.zoom_meeting_id,
          activity_id: activity_id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier qu'on a les dates nécessaires
    const startDate = activity.proposed_start_date;
    const endDate = activity.proposed_end_date;
    const timezone = activity.event.timezone;

    if (!startDate || !endDate || !timezone) {
      console.error('Missing required date or timezone information');
      return new Response(
        JSON.stringify({
          message: 'Activity approved but cannot create Zoom meeting: missing dates',
          validation_status: 'approved',
          activity_id: activity_id,
          error: 'Missing required date or timezone information'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Calculer la durée et préparer les infos
    const duration = calculateDurationInMinutes(startDate, endDate);
    const description = activity.objectives || activity.detailed_presentation || '';
    const meetingTitle = activity.title;

    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    console.log('🎥 Creating Zoom meeting...');
    const zoomMeeting = await createZoomMeeting(
      accessToken,
      meetingTitle,
      startDate,
      duration,
      description
    );

    // Sauvegarder la réunion Zoom dans la base de données
    console.log('Saving Zoom meeting to database...');
    const { data: savedMeeting, error: saveMeetingError } = await supabaseClient
      .from('zoom_meetings')
      .insert({
        meeting_id: zoomMeeting.meeting_id,
        join_url: zoomMeeting.join_url,
        start_url: zoomMeeting.start_url,
        password: zoomMeeting.password,
        registration_url: zoomMeeting.registration_url,
        created_by: approved_by || null
      })
      .select()
      .single();

    if (saveMeetingError || !savedMeeting) {
      console.error('Failed to save Zoom meeting to database:', saveMeetingError);
      return new Response(
        JSON.stringify({
          message: 'Activity approved and Zoom meeting created but failed to save to database',
          validation_status: 'approved',
          activity_id: activity_id,
          zoom_meeting_data: zoomMeeting,
          error: saveMeetingError?.message
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Lier la réunion Zoom à l'activité
    console.log('Linking Zoom meeting to activity...');
    const { error: linkError } = await supabaseClient
      .from('activities')
      .update({ zoom_meeting_id: savedMeeting.id })
      .eq('id', activity_id);

    if (linkError) {
      console.error('Failed to link Zoom meeting to activity:', linkError);
      return new Response(
        JSON.stringify({
          message: 'Activity approved and Zoom meeting created but failed to link',
          validation_status: 'approved',
          activity_id: activity_id,
          zoom_meeting_id: savedMeeting.id,
          meeting_id: zoomMeeting.meeting_id,
          join_url: zoomMeeting.join_url,
          warning: 'Failed to link Zoom meeting to activity'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('🎉 Activity approved and Zoom meeting created successfully');

    // Retourner le succès complet
    return new Response(
      JSON.stringify({
        message: 'Activity approved and Zoom meeting created successfully',
        validation_status: 'approved',
        activity_id: activity_id,
        activity_title: activity.title,
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
    console.error('Unhandled error in approve-activity function:', err);
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
