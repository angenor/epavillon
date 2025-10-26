// supabase/functions/delete-zoom-meeting/index.ts
// Edge Function pour supprimer une réunion Zoom lors de l'annulation d'une activité

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

// Configuration des variables d'environnement
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID') ?? '';
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID') ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('delete-zoom-meeting function started');
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
 * Supprime une réunion Zoom via l'API
 */
async function deleteZoomMeeting(
  accessToken: string,
  meetingId: string
): Promise<boolean> {
  try {
    console.log('📤 Zoom API Delete Request:', {
      endpoint: `https://api.zoom.us/v2/meetings/${meetingId}`,
      meeting_id: meetingId
    });

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    // L'API Zoom retourne 204 No Content en cas de succès
    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error('Failed to delete Zoom meeting:', response.status, errorText);

      // Si la réunion n'existe plus (404), on considère que c'est un succès
      if (response.status === 404) {
        console.log('⚠️ Meeting already deleted or not found on Zoom');
        return true; // Considéré comme un succès
      }

      throw new Error(`Failed to delete Zoom meeting: ${response.status} - ${errorText}`);
    }

    console.log('✅ Zoom meeting deleted successfully:', meetingId);
    return true;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
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

    const { activity_id, meeting_id } = payload;

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
    let isLinkedToActivity = false;

    // CAS 1: meeting_id fourni directement (réunion standalone ou connue)
    if (meeting_id) {
      console.log('Using provided meeting_id:', meeting_id);
      zoomMeetingId = meeting_id;

      // Chercher dans la base pour récupérer l'ID de la table zoom_meetings
      const { data: zoomMeeting, error: zoomError } = await supabaseClient
        .from('zoom_meetings')
        .select('id, meeting_id')
        .eq('meeting_id', meeting_id)
        .single();

      if (zoomError || !zoomMeeting) {
        console.warn('⚠️ Meeting not found in database, will try to delete from Zoom only');
      } else {
        zoomMeetingDbId = zoomMeeting.id;
      }
    }
    // CAS 2: activity_id fourni (réunion liée à une activité)
    else if (activity_id) {
      console.log('Fetching meeting_id from activity...');
      isLinkedToActivity = true;

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

      // Vérifier si l'activité a une réunion Zoom
      if (!activity.zoom_meeting_id) {
        console.log('Activity has no Zoom meeting to delete');
        return new Response(
          JSON.stringify({
            message: 'Activity has no Zoom meeting to delete'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Récupérer les informations de la réunion Zoom
      console.log('Fetching Zoom meeting data...');
      const { data: zoomMeeting, error: zoomMeetingError } = await supabaseClient
        .from('zoom_meetings')
        .select('id, meeting_id')
        .eq('id', activity.zoom_meeting_id)
        .single();

      if (zoomMeetingError || !zoomMeeting) {
        console.error('Failed to fetch Zoom meeting:', zoomMeetingError);
        return new Response(
          JSON.stringify({
            error: 'Zoom meeting not found in database',
            details: zoomMeetingError?.message
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      zoomMeetingId = zoomMeeting.meeting_id;
      zoomMeetingDbId = activity.zoom_meeting_id;

      console.log('📊 Meeting deletion details:', {
        activity_id: activity.id,
        activity_title: activity.title,
        zoom_meeting_db_id: activity.zoom_meeting_id,
        zoom_meeting_id: zoomMeetingId
      });
    }

    // Obtenir le token d'accès Zoom
    console.log('🔑 Getting Zoom access token...');
    const accessToken = await getZoomAccessToken();
    console.log('✅ Zoom access token obtained successfully');

    // Supprimer la réunion Zoom
    console.log('🗑️ Deleting Zoom meeting...');
    const deleted = await deleteZoomMeeting(accessToken, zoomMeetingId);

    if (!deleted) {
      console.error('Failed to delete Zoom meeting');
      throw new Error('Zoom meeting deletion failed');
    }

    // Supprimer la réunion de la base de données si on a trouvé un enregistrement
    if (zoomMeetingDbId) {
      console.log('💾 Deleting Zoom meeting from database...');
      const { error: deleteDbError } = await supabaseClient
        .from('zoom_meetings')
        .delete()
        .eq('id', zoomMeetingDbId);

      if (deleteDbError) {
        console.error('Failed to delete Zoom meeting from database:', deleteDbError);
        // On continue quand même car la réunion a été supprimée sur Zoom
      } else {
        console.log('✅ Zoom meeting deleted from database');
      }
    } else {
      console.log('⚠️ No database record to delete (meeting not in database)');
    }

    // Mettre à jour l'activité pour retirer la référence si c'est une réunion liée
    if (isLinkedToActivity && activity_id) {
      console.log('📝 Updating activity to remove Zoom meeting reference...');
      const { error: updateActivityError } = await supabaseClient
        .from('activities')
        .update({ zoom_meeting_id: null })
        .eq('id', activity_id);

      if (updateActivityError) {
        console.error('Failed to update activity:', updateActivityError);
        return new Response(
          JSON.stringify({
            warning: 'Zoom meeting deleted but failed to update activity',
            details: updateActivityError?.message
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('✅ Activity updated successfully');
    }

    console.log('🎉 Zoom meeting deletion completed successfully');

    // Retourner le résultat
    return new Response(
      JSON.stringify({
        message: 'Zoom meeting deleted successfully',
        activity_id: activity_id || null,
        meeting_id: zoomMeetingId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in delete-zoom-meeting function:', err);
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
