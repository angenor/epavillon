// supabase/functions/create-standalone-zoom-meeting/index.ts
// Edge Function pour créer une réunion Zoom standalone (sans lien avec une activité)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const ZOOM_USER_ID = Deno.env.get('ZOOM_USER_ID') ?? 'me';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('create-standalone-zoom-meeting function started');

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
 * Crée une réunion Zoom via l'API
 */
async function createZoomMeeting(
  accessToken: string,
  meetingData: {
    topic: string;
    type: number;
    start_time?: string;
    duration: number;
    timezone?: string;
    agenda?: string;
    password?: string;
    settings?: {
      host_video?: boolean;
      participant_video?: boolean;
      join_before_host?: boolean;
      waiting_room?: boolean;
      mute_upon_entry?: boolean;
      approval_type?: number;
      auto_recording?: string;
      [key: string]: any;
    };
  }
) {
  try {
    console.log('Creating Zoom meeting with data:', JSON.stringify(meetingData, null, 2));

    const response = await fetch(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Zoom meeting:', response.status, errorText);
      throw new Error(`Failed to create Zoom meeting: ${response.status} - ${errorText}`);
    }

    const zoomMeeting = await response.json();

    console.log('✅ Zoom meeting created successfully:', {
      id: zoomMeeting.id,
      topic: zoomMeeting.topic,
      join_url: zoomMeeting.join_url,
      registration_url: zoomMeeting.registration_url
    });

    return {
      meeting_id: zoomMeeting.id.toString(),
      topic: zoomMeeting.topic,
      start_time: zoomMeeting.start_time,
      duration: zoomMeeting.duration,
      timezone: zoomMeeting.timezone,
      join_url: zoomMeeting.join_url,
      registration_url: zoomMeeting.registration_url, // URL d'inscription pour les participants
      password: zoomMeeting.password,
      start_url: zoomMeeting.start_url,
      host_email: zoomMeeting.host_email
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

    // Récupérer l'utilisateur authentifié
    const authHeader = req.headers.get('Authorization');
    let currentUserId = null;

    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
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

    const {
      topic,
      type = 2, // Par défaut: réunion planifiée
      start_time,
      duration,
      timezone = 'UTC',
      agenda,
      password,
      settings = {}
    } = payload;

    // Validation des champs obligatoires
    if (!topic || !topic.trim()) {
      return new Response(
        JSON.stringify({
          error: 'Missing required field: topic',
          message: 'Le sujet de la réunion est obligatoire'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (!duration || duration <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid field: duration',
          message: 'La durée de la réunion est obligatoire et doit être supérieure à 0'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Pour les réunions planifiées (type 2 ou 8), start_time est obligatoire
    if ((type === 2 || type === 8) && !start_time) {
      return new Response(
        JSON.stringify({
          error: 'Missing required field: start_time',
          message: 'La date/heure de début est obligatoire pour les réunions planifiées'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Construire les données de la réunion
    const meetingData: any = {
      topic: topic.trim(),
      type,
      duration,
      timezone,
      password: password && password.trim() ? password.trim() : 'nego2025', // Mot de passe par défaut
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: false,
        approval_type: 0, // 0 = Inscription requise avec approbation automatique
        registration_type: 2, // 2 = Les participants doivent s'inscrire pour rejoindre
        ...settings // Permet d'override les settings par défaut
      }
    };

    // Ajouter start_time si fourni
    if (start_time) {
      meetingData.start_time = start_time;
    }

    // Ajouter les champs optionnels si fournis
    if (agenda && agenda.trim()) {
      meetingData.agenda = agenda.trim();
    }

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Créer la réunion Zoom
    console.log('📅 Creating Zoom meeting...');
    const zoomMeeting = await createZoomMeeting(accessToken, meetingData);

    // Sauvegarder dans la table zoom_meetings (sans activity_id)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      console.log('💾 Saving Zoom meeting to database...');

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

      const { data: zoomMeetingRecord, error: insertError } = await supabaseClient
        .from('zoom_meetings')
        .insert({
          meeting_id: zoomMeeting.meeting_id,
          join_url: zoomMeeting.join_url,
          start_url: zoomMeeting.start_url,
          registration_url: zoomMeeting.registration_url,
          password: zoomMeeting.password,
          host_email: zoomMeeting.host_email,
          topic: zoomMeeting.topic,
          start_time: zoomMeeting.start_time,
          duration: zoomMeeting.duration,
          timezone: zoomMeeting.timezone,
          created_by: currentUserId
          // Note: Réunion standalone - aucune activité ne référence ce zoom_meetings.id
        })
        .select()
        .single();

      if (insertError) {
        console.error('⚠️ Failed to save Zoom meeting to database:', insertError);
        // Ne pas faire échouer la requête si le save échoue
        return new Response(
          JSON.stringify({
            success: true,
            warning: 'Réunion créée mais non sauvegardée en base de données',
            data: zoomMeeting
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('✅ Zoom meeting saved to database with ID:', zoomMeetingRecord.id);
    }

    console.log('🎉 Standalone Zoom meeting created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Réunion Zoom créée avec succès',
        data: zoomMeeting
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in create-standalone-zoom-meeting function:', err);

    return new Response(
      JSON.stringify({
        success: false,
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
