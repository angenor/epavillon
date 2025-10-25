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
 * Utilise UTC car les dates en base sont déjà en UTC
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
    timezone: 'UTC'
  });

  return formattedDate;
}

/**
 * Modifie une réunion Zoom via l'API
 */
async function updateZoomMeeting(
  accessToken: string,
  meetingId: string,
  updates: {
    topic?: string;
    start_time?: string;
    duration?: number;
    agenda?: string;
  }
): Promise<boolean> {
  try {
    console.log('📤 Zoom API Update Request:', {
      endpoint: `https://api.zoom.us/v2/meetings/${meetingId}`,
      meeting_id: meetingId,
      updates: updates
    });

    console.log('📝 Full update body:', JSON.stringify(updates, null, 2));

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

      // Si la réunion n'existe plus (404)
      if (response.status === 404) {
        console.log('⚠️ Meeting not found on Zoom');
        throw new Error('Zoom meeting not found');
      }

      throw new Error(`Failed to update Zoom meeting: ${response.status} - ${errorText}`);
    }

    console.log('✅ Zoom meeting updated successfully:', meetingId);
    return true;
  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une réunion Zoom
 */
async function getZoomMeetingDetails(
  accessToken: string,
  meetingId: string
) {
  try {
    console.log('📥 Fetching Zoom meeting details:', meetingId);

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
      console.error('Failed to get meeting details:', response.status, errorText);
      throw new Error(`Failed to get meeting details: ${response.status}`);
    }

    const meetingData = await response.json();

    console.log('✅ Meeting details retrieved:', {
      id: meetingData.id,
      topic: meetingData.topic,
      start_time: meetingData.start_time
    });

    return {
      meeting_id: meetingData.id.toString(),
      join_url: meetingData.join_url,
      start_url: meetingData.start_url,
      topic: meetingData.topic,
      start_time: meetingData.start_time,
      duration: meetingData.duration
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

    const { activity_id, updates } = payload;

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

    if (!updates || Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: updates' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier qu'au moins un champ valide est présent
    const validFields = ['title', 'start_time', 'duration', 'description'];
    const hasValidUpdate = Object.keys(updates).some(key => validFields.includes(key));

    if (!hasValidUpdate) {
      return new Response(
        JSON.stringify({
          error: 'No valid fields to update',
          valid_fields: validFields
        }),
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

    // Récupérer les informations de l'activité et de la réunion Zoom
    console.log('Fetching activity and Zoom meeting data...');
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
      console.log('Activity has no Zoom meeting');
      return new Response(
        JSON.stringify({
          error: 'No Zoom meeting associated with this activity'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const zoomMeetingId = activity.zoom_meetings.meeting_id;

    console.log('📊 Update details:', {
      activity_id: activity.id,
      activity_title: activity.title,
      zoom_meeting_db_id: activity.zoom_meeting_id,
      zoom_meeting_id: zoomMeetingId,
      updates: updates
    });

    // Construire le payload de mise à jour pour Zoom
    const zoomUpdates: {
      topic?: string;
      start_time?: string;
      duration?: number;
      agenda?: string;
    } = {};

    if (updates.title) {
      zoomUpdates.topic = updates.title;
    }

    if (updates.start_time) {
      zoomUpdates.start_time = formatDateForZoomUTC(updates.start_time);
    }

    if (updates.duration) {
      zoomUpdates.duration = updates.duration;
    }

    if (updates.description) {
      zoomUpdates.agenda = updates.description;
    }

    console.log('📝 Zoom update payload:', zoomUpdates);

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();
    console.log('✅ Zoom access token obtained successfully');

    // Modifier la réunion Zoom
    console.log('✏️ Updating Zoom meeting...');
    await updateZoomMeeting(accessToken, zoomMeetingId, zoomUpdates);

    // Récupérer les informations mises à jour
    console.log('📥 Fetching updated meeting details...');
    const updatedMeeting = await getZoomMeetingDetails(accessToken, zoomMeetingId);

    // Optionnel: Mettre à jour la base de données si les URLs ont changé
    console.log('💾 Updating database with latest meeting info...');
    const { error: updateDbError } = await supabaseClient
      .from('zoom_meetings')
      .update({
        join_url: updatedMeeting.join_url,
        start_url: updatedMeeting.start_url
      })
      .eq('id', activity.zoom_meeting_id);

    if (updateDbError) {
      console.warn('Failed to update database:', updateDbError);
      // Ne pas bloquer si la mise à jour DB échoue
    } else {
      console.log('✅ Database updated successfully');
    }

    console.log('🎉 Zoom meeting update completed successfully');

    // Retourner la réponse
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
    );

  } catch (err) {
    console.error('Unhandled error in edit-zoom-meeting function:', err);

    // Déterminer le code d'erreur approprié
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    const errorString = String(err);

    if (errorString.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Zoom meeting not found';
    } else if (errorString.includes('credentials')) {
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
