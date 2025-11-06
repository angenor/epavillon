// supabase/functions/register-to-zoom-meeting/index.ts
// Edge Function pour inscrire un participant à une réunion Zoom
// Supporte les utilisateurs authentifiés ET les guests (sans compte)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('register-to-zoom-meeting function started');

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
 * Enregistre un participant à une réunion Zoom via l'API
 */
async function registerParticipantToZoomMeeting(
  accessToken: string,
  meetingId: string,
  participantData: {
    email: string;
    first_name: string;
    last_name: string;
    org?: string;
    country?: string;
  }
) {
  try {
    const requestBody = {
      email: participantData.email,
      first_name: participantData.first_name,
      last_name: participantData.last_name,
      org: participantData.org || '',
      country: participantData.country || ''
    };

    console.log('📤 Zoom API Registration Request:', {
      endpoint: `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
      ...requestBody
    });

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
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
      console.error('Failed to register participant to Zoom:', response.status, errorText);
      throw new Error(`Failed to register to Zoom: ${response.status} - ${errorText}`);
    }

    const registrantData = await response.json();
    console.log('✅ Zoom registration successful:', registrantData.id);

    return {
      registrant_id: registrantData.id || registrantData.registrant_id,
      join_url: registrantData.join_url,
      topic: registrantData.topic,
      start_time: registrantData.start_time
    };
  } catch (error) {
    console.error('Error registering participant to Zoom:', error);
    throw error;
  }
}

/**
 * Valide les données du formulaire d'inscription
 */
function validateRegistrationData(payload: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Vérifier activity_id
  if (!payload.activity_id) {
    errors.push('activity_id is required');
  }

  // Vérifier email
  if (!payload.guest_email || typeof payload.guest_email !== 'string') {
    errors.push('guest_email is required and must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.guest_email)) {
      errors.push('guest_email must be a valid email address');
    }
  }

  // Vérifier prénom
  if (!payload.guest_first_name || typeof payload.guest_first_name !== 'string') {
    errors.push('guest_first_name is required and must be a string');
  } else if (payload.guest_first_name.length < 2) {
    errors.push('guest_first_name must be at least 2 characters');
  }

  // Vérifier nom
  if (!payload.guest_last_name || typeof payload.guest_last_name !== 'string') {
    errors.push('guest_last_name is required and must be a string');
  } else if (payload.guest_last_name.length < 2) {
    errors.push('guest_last_name must be at least 2 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
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

    // Récupérer l'utilisateur authentifié (optionnel)
    const authHeader = req.headers.get('Authorization');
    let currentUserId: string | null = null;

    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: { user }, error: userError } = await supabaseAuthClient.auth.getUser(jwt);

      if (!userError && user) {
        currentUserId = user.id;
        console.log('User authenticated:', currentUserId);
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

    // Valider les données
    const validation = validateRegistrationData(payload);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const {
      activity_id,
      guest_email,
      guest_first_name,
      guest_last_name,
      guest_organization,
      guest_country_id
    } = payload;

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

    // Récupérer l'activité et la réunion Zoom associée
    console.log('Fetching activity and zoom meeting data...');
    const { data: activity, error: activityError } = await supabaseClient
      .from('activities')
      .select(`
        id,
        title,
        zoom_meeting_id,
        validation_status,
        zoom_meeting:zoom_meetings (
          id,
          meeting_id,
          registration_url,
          join_url,
          topic,
          start_time
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

    // Vérifier que l'activité a une réunion Zoom
    if (!activity.zoom_meeting_id || !activity.zoom_meeting) {
      console.log('Activity has no Zoom meeting associated');
      return new Response(
        JSON.stringify({
          error: 'No Zoom meeting associated',
          message: 'Cette activité n\'a pas de réunion Zoom associée'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Vérifier que le participant n'est pas déjà inscrit
    console.log('Checking for existing registration...');
    const { data: existingRegistration } = await supabaseClient
      .from('activity_registrations')
      .select('id, zoom_join_url, personal_join_url')
      .eq('activity_id', activity_id)
      .or(
        currentUserId
          ? `user_id.eq.${currentUserId}`
          : `guest_email.ilike.${guest_email}`
      )
      .maybeSingle();

    if (existingRegistration) {
      console.log('Participant already registered:', existingRegistration.id);
      return new Response(
        JSON.stringify({
          error: 'Already registered',
          message: 'Vous êtes déjà inscrit à cette activité',
          data: {
            registration_id: existingRegistration.id,
            zoom_join_url: existingRegistration.zoom_join_url || existingRegistration.personal_join_url
          }
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();

    // Récupérer le nom du pays si fourni
    let countryName = '';
    if (guest_country_id) {
      const { data: countryData } = await supabaseClient
        .from('countries')
        .select('name_en')
        .eq('id', guest_country_id)
        .single();

      if (countryData) {
        countryName = countryData.name_en;
      }
    }

    // Inscrire le participant à la réunion Zoom
    console.log('🎥 Registering participant to Zoom meeting...');
    const zoomRegistration = await registerParticipantToZoomMeeting(
      accessToken,
      activity.zoom_meeting.meeting_id,
      {
        email: guest_email,
        first_name: guest_first_name,
        last_name: guest_last_name,
        org: guest_organization,
        country: countryName
      }
    );

    // Enregistrer l'inscription dans la base de données
    console.log('💾 Saving registration to database...');
    const { data: savedRegistration, error: saveError} = await supabaseClient
      .from('activity_registrations')
      .insert({
        activity_id: activity_id,
        user_id: currentUserId, // null si guest
        guest_email: currentUserId ? null : guest_email,
        guest_first_name: currentUserId ? null : guest_first_name,
        guest_last_name: currentUserId ? null : guest_last_name,
        guest_organization: currentUserId ? null : guest_organization,
        guest_country_id: currentUserId ? null : guest_country_id,
        zoom_registrant_id: zoomRegistration.registrant_id,
        zoom_join_url: zoomRegistration.join_url,
        personal_join_url: zoomRegistration.join_url, // compatibility
        registration_type: currentUserId ? 'user' : 'guest',
        registration_date: new Date().toISOString(),
        attended: false
      })
      .select()
      .single();

    if (saveError || !savedRegistration) {
      console.error('Failed to save registration to database:', saveError);
      return new Response(
        JSON.stringify({
          error: 'Failed to save registration',
          details: saveError?.message,
          warning: 'You have been registered to Zoom but we could not save your registration in our database'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('✅ Registration completed successfully');

    // TODO: Envoyer un email de confirmation (optionnel)
    // Peut être fait via une autre edge function ou un webhook

    // Retourner les informations d'inscription
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful',
        data: {
          registration_id: savedRegistration.id,
          zoom_join_url: zoomRegistration.join_url,
          zoom_registrant_id: zoomRegistration.registrant_id,
          meeting_topic: activity.zoom_meeting.topic,
          meeting_start_time: activity.zoom_meeting.start_time,
          activity_title: activity.title
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in register-to-zoom-meeting function:', err);
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
