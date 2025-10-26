// supabase/functions/edit-zoom-meeting/index.ts
// Edge Function pour modifier une réunion Zoom existante

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('edit-zoom-meeting function started');
console.info('Environment check:', {
  hasZoomAccountId: !!ZOOM_ACCOUNT_ID,
  hasZoomClientId: !!ZOOM_CLIENT_ID,
  hasZoomClientSecret: !!ZOOM_CLIENT_SECRET,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
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
 * Formate une date au format ISO 8601 requis par Zoom (YYYY-MM-DDTHH:mm:ss)
 * Les dates en base de données sont déjà en UTC
 */
function formatDateForZoomUTC(dateString: string): string {
  const date = new Date(dateString);

  console.log('🕐 Formatting date for Zoom (UTC):', {
    input_date: dateString,
    input_date_utc: date.toISOString(),
    timestamp_ms: date.getTime()
  });

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

  console.log('✅ Formatted date for Zoom (UTC):', {
    output_date: formattedDate,
    timezone: 'UTC',
    components: { year, month, day, hour, minute, second }
  });

  return formattedDate;
}

/**
 * Met à jour une réunion Zoom via l'API
 */
async function updateZoomMeeting(
  accessToken: string,
  meetingId: string,
  updates: any
) {
  try {
    console.log('📤 Zoom API Update Request:', {
      endpoint: `https://api.zoom.us/v2/meetings/${meetingId}`,
      meeting_id: meetingId,
      updates: updates
    });

    console.log('📝 Full request body:', JSON.stringify(updates, null, 2));

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
    );

    // L'API Zoom retourne 204 No Content en cas de succès
    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error('Failed to update Zoom meeting:', response.status, errorText);

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found');
      }

      throw new Error(`Failed to update Zoom meeting: ${response.status} - ${errorText}`);
    }

    console.log('✅ Zoom meeting updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une réunion Zoom après mise à jour
 */
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
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get meeting details: ${response.status} - ${errorText}`);
    }

    const meetingData = await response.json();
    return {
      meeting_id: meetingData.id.toString(),
      join_url: meetingData.join_url,
      start_url: meetingData.start_url,
      registration_url: meetingData.registration_url,
      topic: meetingData.topic,
      start_time: meetingData.start_time,
      duration: meetingData.duration,
      timezone: meetingData.timezone,
      password: meetingData.password,
      host_email: meetingData.host_email
    };
  } catch (error) {
    console.error('Error getting meeting details:', error);
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

    const { activity_id, meeting_id, updates } = payload;

    // Validation du payload - au moins l'un des deux doit être fourni
    if (!activity_id && !meeting_id) {
      return new Response(
        JSON.stringify({
          error: 'Missing required field: either activity_id or meeting_id must be provided',
          message: 'Vous devez fournir soit activity_id (pour réunion liée à une activité) soit meeting_id (pour réunion standalone)'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: updates' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Valider que au moins un champ à modifier est présent
    const validFields = ['title', 'start_time', 'duration', 'timezone', 'password', 'host_email', 'description'];
    const hasValidUpdate = Object.keys(updates).some(key => validFields.includes(key));

    if (!hasValidUpdate) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
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

    let zoomMeetingId: string;
    let zoomMeetingDbId: string | null = null;

    // CAS 1: meeting_id fourni directement (réunion standalone ou connue)
    if (meeting_id) {
      console.log('Using provided meeting_id:', meeting_id);
      zoomMeetingId = meeting_id;

      // Chercher dans la base pour récupérer l'ID de la table zoom_meetings (pour mise à jour DB)
      const { data: zoomMeeting, error: zoomError } = await supabaseClient
        .from('zoom_meetings')
        .select('id')
        .eq('meeting_id', meeting_id)
        .single();

      if (!zoomError && zoomMeeting) {
        zoomMeetingDbId = zoomMeeting.id;
      }
    }
    // CAS 2: activity_id fourni (réunion liée à une activité)
    else if (activity_id) {
      console.log('Fetching meeting_id from activity...');
      const { data: activity, error: activityError } = await supabaseClient
        .from('activities')
        .select(`
          id,
          title,
          zoom_meeting_id,
          zoom_meetings (
            id,
            meeting_id,
            join_url,
            start_url
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

      // Vérifier qu'une réunion Zoom existe
      if (!activity.zoom_meeting_id || !activity.zoom_meetings) {
        console.error('No Zoom meeting associated with this activity');
        return new Response(
          JSON.stringify({ error: 'No Zoom meeting associated with this activity' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      zoomMeetingId = activity.zoom_meetings.meeting_id;
      zoomMeetingDbId = activity.zoom_meeting_id;
    }

    // Construire le payload de mise à jour pour Zoom
    const zoomUpdates: any = {};

    // Mapper les champs du payload vers le format Zoom
    if (updates.title) {
      zoomUpdates.topic = updates.title;
    }

    if (updates.start_time) {
      // Formater la date pour Zoom
      zoomUpdates.start_time = formatDateForZoomUTC(updates.start_time);
      // Si un timezone est fourni, l'utiliser, sinon garder UTC
      zoomUpdates.timezone = updates.timezone || 'UTC';
    } else if (updates.timezone) {
      // Si seulement le timezone change (sans changer start_time)
      zoomUpdates.timezone = updates.timezone;
    }

    if (updates.duration) {
      zoomUpdates.duration = updates.duration;
    }

    if (updates.password) {
      zoomUpdates.password = updates.password;
    }

    if (updates.host_email) {
      // L'API Zoom ne supporte pas directement le changement de host_email
      // Il faudrait utiliser l'endpoint /users/{userId}/meetings/{meetingId}/transfer
      console.warn('⚠️ host_email modification not supported via PATCH endpoint');
    }

    if (updates.description) {
      zoomUpdates.agenda = updates.description;
    }

    console.log('📝 Zoom update payload:', zoomUpdates);

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Modifier la réunion sur Zoom
    console.log('🎥 Updating Zoom meeting...');
    await updateZoomMeeting(accessToken, zoomMeetingId, zoomUpdates);

    // Récupérer les informations mises à jour
    console.log('📥 Fetching updated meeting details...');
    const updatedMeeting = await getZoomMeetingDetails(accessToken, zoomMeetingId);

    // Mettre à jour la base de données si possible
    if (zoomMeetingDbId) {
      // Construire l'objet de mise à jour dynamiquement
      const dbUpdates: any = {
        join_url: updatedMeeting.join_url,
        start_url: updatedMeeting.start_url,
        registration_url: updatedMeeting.registration_url
      };

      // Ajouter les champs modifiables si présents
      if (updatedMeeting.topic) dbUpdates.topic = updatedMeeting.topic;
      if (updatedMeeting.start_time) dbUpdates.start_time = updatedMeeting.start_time;
      if (updatedMeeting.duration) dbUpdates.duration = updatedMeeting.duration;
      if (updatedMeeting.timezone) dbUpdates.timezone = updatedMeeting.timezone;
      if (updatedMeeting.password) dbUpdates.password = updatedMeeting.password;
      if (updatedMeeting.host_email) dbUpdates.host_email = updatedMeeting.host_email;

      const { error: updateDbError } = await supabaseClient
        .from('zoom_meetings')
        .update(dbUpdates)
        .eq('id', zoomMeetingDbId);

      if (updateDbError) {
        console.warn('Failed to update database:', updateDbError);
        // Ne pas bloquer si la mise à jour DB échoue
      } else {
        console.log('✅ Database updated successfully with:', dbUpdates);
      }
    } else {
      console.log('⚠️ No database record found for this meeting_id, skipping DB update');
    }

    console.log('🎉 Zoom meeting updated successfully');

    // Retourner les informations de la réunion mise à jour
    return new Response(
      JSON.stringify({
        message: 'Zoom meeting updated successfully',
        activity_id: activity_id || null,
        meeting_id: updatedMeeting.meeting_id,
        join_url: updatedMeeting.join_url,
        start_url: updatedMeeting.start_url,
        updated_fields: Object.keys(zoomUpdates)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in edit-zoom-meeting function:', err);

    // Déterminer le code d'erreur approprié
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (String(err).includes('not found')) {
      statusCode = 404;
      errorMessage = String(err);
    } else if (String(err).includes('credentials')) {
      statusCode = 500;
      errorMessage = 'Zoom credentials not configured';
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
    );
  }
});
