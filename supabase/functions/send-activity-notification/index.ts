// supabase/functions/send-activity-notification/index.ts
// Edge Function for sending activity received notifications via Laravel endpoint
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const LARAVEL_NOTIFICATION_URL = Deno.env.get('LARAVEL_ACTIVITY_NOTIFICATION_URL') ?? 'https://epavillonclimatique.francophonie.org/send_activites_recu_email';
const LARAVEL_KEY = Deno.env.get('SUPABASE_CUSTOM_AUTH_LARAVEL_KEY') ?? '';
console.info('send-activity-notification function started');
Deno.serve(async (req)=>{
  // Configuration CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    const payload = await req.json();
    console.log('Activity notification payload received:', JSON.stringify(payload, null, 2));
    // Extraire les données de l'activité
    const { activity_id, activity_title, coordinator_email, coordinator_name, organization_name, event_title, event_logo, event_city, event_country, proposed_start_date, proposed_end_date, timezone = 'UTC' } = payload;
    // Validation des données requises
    if (!activity_id || !activity_title || !coordinator_email) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: activity_id, activity_title, coordinator_email'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    console.log('Sending activity received notification:', {
      activity_id,
      activity_title,
      coordinator_email,
      organization_name,
      event_title
    });

    // Incrémenter le compteur d'emails dans Supabase AVANT l'envoi
    try {
      const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      // D'abord récupérer le compteur actuel
      const { data: currentActivity, error: fetchError } = await supabaseClient.from('activities').select('send_activites_recu_email_count').eq('id', activity_id).single();
      if (!fetchError && currentActivity) {
        const newCount = (currentActivity.send_activites_recu_email_count || 0) + 1;
        const { error: updateError } = await supabaseClient.from('activities').update({
          send_activites_recu_email_count: newCount
        }).eq('id', activity_id);
        if (updateError) {
          console.error('Failed to increment email count:', updateError);
        } else {
          console.info('Email count incremented successfully for activity:', activity_id, 'New count:', newCount);
        }
      } else if (fetchError) {
        console.error('Failed to fetch current email count:', fetchError);
      }
    } catch (updateErr) {
      console.error('Error incrementing email count:', updateErr);
    }

    try {
      // Créer un AbortController pour timeout de 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(()=>controller.abort(), 10000);
      const response = await fetch(LARAVEL_NOTIFICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...LARAVEL_KEY ? {
            'Authorization': `Bearer ${LARAVEL_KEY}`
          } : {}
        },
        body: JSON.stringify({
          activity_id,
          activity_title,
          coordinator_email,
          coordinator_name,
          organization_name,
          event_title,
          event_logo,
          event_city,
          event_country,
          proposed_start_date,
          proposed_end_date,
          timezone,
          notification_type: 'activity_received'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const text = await response.text().catch(()=>'');
        console.error('Laravel API returned error', response.status, text);
        return new Response(JSON.stringify({
          error: 'Failed to send activity received notification via Laravel',
          details: text
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      const responseData = await response.json().catch(()=>({}));
      console.info('Activity received notification sent successfully via Laravel', responseData);
      return new Response(JSON.stringify({
        message: 'Activity received notification sent successfully',
        data: responseData
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (err) {
      console.error('Error sending activity notification:', err);
      // Si c'est un timeout, retourner un succès pour éviter l'erreur côté client
      if (err.name === 'AbortError') {
        console.warn('Laravel API timeout, but notification might still be sent');
        return new Response(JSON.stringify({
          message: 'Activity notification processing initiated (timeout occurred)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      // Pour les autres erreurs
      return new Response(JSON.stringify({
        error: String(err)
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (err) {
    console.error('Unhandled error in send-activity-notification function:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
