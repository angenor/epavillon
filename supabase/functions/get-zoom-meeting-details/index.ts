// supabase/functions/get-zoom-meeting-details/index.ts
// Edge Function pour récupérer les détails complets d'une réunion Zoom

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('get-zoom-meeting-details function started');
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
 * Récupère les détails de la réunion depuis l'API Zoom
 */
async function getZoomMeetingInfo(
  accessToken: string,
  meetingId: string
) {
  try {
    console.log('📥 Fetching meeting info from Zoom:', meetingId);

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get meeting info:', response.status, errorText);

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found');
      }

      throw new Error(`Failed to get meeting info: ${response.status}`);
    }

    const meetingData = await response.json();

    console.log('✅ Meeting info retrieved:', {
      id: meetingData.id,
      topic: meetingData.topic,
      status: meetingData.status
    });

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
    };
  } catch (error) {
    console.error('Error getting meeting info:', error);
    throw error;
  }
}

/**
 * Récupère la liste des inscrits à la réunion
 */
async function getZoomMeetingRegistrants(
  accessToken: string,
  meetingId: string,
  maxRegistrants: number = 100
) {
  try {
    console.log('📥 Fetching meeting registrants from Zoom:', meetingId);

    const pageSize = Math.min(maxRegistrants, 300); // Zoom limit: 300 per page

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants?page_size=${pageSize}&page_number=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get registrants:', response.status, errorText);

      // Si les inscriptions ne sont pas activées (400)
      if (response.status === 400) {
        console.log('⚠️ Registration not enabled for this meeting');
        return {
          total_records: 0,
          registrants: []
        };
      }

      // Si la réunion n'existe pas (404)
      if (response.status === 404) {
        throw new Error('Zoom meeting not found');
      }

      throw new Error(`Failed to get registrants: ${response.status}`);
    }

    const registrantsData = await response.json();

    console.log('✅ Registrants retrieved:', {
      total: registrantsData.total_records || 0,
      returned: registrantsData.registrants?.length || 0
    });

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
    };
  } catch (error) {
    console.error('Error getting registrants:', error);
    // Ne pas faire échouer la requête si les registrants ne sont pas disponibles
    return {
      total_records: 0,
      registrants: []
    };
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

    const {
      activity_id,
      include_registrants = false,  // Par défaut false pour économiser les tokens
      max_registrants = 100
    } = payload;

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

    // Valider max_registrants
    if (max_registrants < 1 || max_registrants > 300) {
      return new Response(
        JSON.stringify({ error: 'max_registrants must be between 1 and 300' }),
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

    // Récupérer l'activité (sans jointure car la relation n'existe pas dans le schéma)
    console.log('Fetching activity data...');
    const { data: activity, error: activityError } = await supabaseClient
      .from('activities')
      .select('id, title, zoom_meeting_id')
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

    // Vérifier qu'une réunion Zoom est associée
    if (!activity.zoom_meeting_id) {
      console.error('No Zoom meeting associated with this activity');
      return new Response(
        JSON.stringify({ error: 'No Zoom meeting associated with this activity' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Récupérer le zoom_meeting séparément
    console.log('Fetching Zoom meeting record from database...');
    const { data: zoomMeetingRecord, error: zoomMeetingError } = await supabaseClient
      .from('zoom_meetings')
      .select('id, meeting_id, join_url')
      .eq('id', activity.zoom_meeting_id)
      .single();

    if (zoomMeetingError || !zoomMeetingRecord) {
      console.error('Failed to fetch Zoom meeting record:', zoomMeetingError);
      return new Response(
        JSON.stringify({
          error: 'Zoom meeting record not found',
          details: zoomMeetingError?.message
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const zoomMeetingId = zoomMeetingRecord.meeting_id;

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Récupérer les détails de la réunion
    console.log('📥 Fetching meeting details from Zoom...');
    const meetingInfo = await getZoomMeetingInfo(accessToken, zoomMeetingId);

    // Récupérer la liste des inscrits si demandé
    let registrantsInfo = { total_records: 0, registrants: [] };

    if (include_registrants) {
      registrantsInfo = await getZoomMeetingRegistrants(
        accessToken,
        zoomMeetingId,
        max_registrants
      );
    }

    // Construire la réponse complète
    const responseData = {
      ...meetingInfo,
      registrants_count: registrantsInfo.total_records,
      registrants: include_registrants ? registrantsInfo.registrants : undefined
    };

    console.log('🎉 Meeting details retrieved successfully');

    return new Response(
      JSON.stringify({
        message: 'Meeting details retrieved successfully',
        ...responseData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in get-zoom-meeting-details function:', err);

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
