// supabase/functions/search-activities/index.ts
// Edge Function pour rechercher des activités par titre

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('search-activities function started');

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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
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

    const { query, limit = 5 } = payload;

    // Validation du payload
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: query' }),
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

    // Rechercher les activités par titre (insensible à la casse)
    console.log('Searching activities with query:', query);
    const { data: activities, error: searchError } = await supabaseClient
      .from('activities')
      .select(`
        id,
        title,
        activity_status,
        validation_status,
        final_start_date,
        final_end_date,
        proposed_start_date,
        proposed_end_date,
        event:events (
          id,
          title,
          year
        )
      `)
      .ilike('title', `%${query}%`)
      .eq('is_deleted', false)
      .limit(limit);

    if (searchError) {
      console.error('Failed to search activities:', searchError);
      return new Response(
        JSON.stringify({
          error: 'Failed to search activities',
          details: searchError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Found activities:', activities?.length || 0);

    // Retourner les résultats (format optimisé pour minimiser les tokens)
    return new Response(
      JSON.stringify({
        success: true,
        count: activities?.length || 0,
        activities: activities || []
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (err) {
    console.error('Unhandled error in search-activities function:', err);
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
