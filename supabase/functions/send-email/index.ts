// supabase/functions/send-email/index.ts
// Edge Function polyvalente pour l'envoi d'emails via Laravel endpoint
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';

const LARAVEL_EMAIL_URL = Deno.env.get('LARAVEL_POLIVALENT_EMAIL_URL') ?? 'https://epavillonclimatique.francophonie.org/send_polivalent_email';
const LARAVEL_KEY = Deno.env.get('SUPABASE_CUSTOM_AUTH_LARAVEL_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.info('send-email function started');
console.info('Environment check:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
  laravelUrl: LARAVEL_EMAIL_URL
});

/**
 * Enrichit les données d'un destinataire avec les informations de la base Supabase
 */
async function enrichRecipientData(email: string, supabaseClient: any): Promise<Record<string, string>> {
  try {
    // Récupérer les informations de l'utilisateur depuis Supabase
    const { data: userData, error } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        organization_id,
        country_id,
        countries (
          name_fr,
          name_en
        )
      `)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !userData) {
      console.warn(`User not found for email: ${email}`);
      return {
        '{recipient_email}': email,
        '{recipient_name}': email,
        '{recipient_first_name}': '',
        '{recipient_last_name}': '',
        '{organization_name}': 'IFDD'
      };
    }

    // Construire les variables du destinataire
    const recipientVariables: Record<string, string> = {
      '{recipient_email}': userData.email || email,
      '{recipient_name}': `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || email,
      '{recipient_first_name}': userData.first_name || '',
      '{recipient_last_name}': userData.last_name || '',
      '{organization_name}': 'IFDD' // TODO: Enrichir avec les données de l'organisation
    };

    console.log(`Enriched data for ${email}:`, recipientVariables);
    return recipientVariables;

  } catch (err) {
    console.error(`Error enriching recipient data for ${email}:`, err);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      '{recipient_email}': email,
      '{recipient_name}': email,
      '{recipient_first_name}': '',
      '{recipient_last_name}': '',
      '{organization_name}': 'IFDD'
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
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('Request method:', req.method);

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

    let payload;
    try {
      payload = await req.json();
      console.log('Email payload received:', JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error('Error parsing JSON payload:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Extraire les données de l'email
    const {
      email_type = 'simple',
      subject,
      content,
      recipients,
      variables = {},
      template = 'simple_email',
      event_id,
      activity_id,
      activity_status,
      recipient_roles
    } = payload;

    // Validation des données requises
    if (!subject || !content || !recipients) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: subject, content, recipients'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Validation des destinataires
    if (!recipients.to && !recipients.cc && !recipients.bcc) {
      return new Response(JSON.stringify({
        error: 'At least one recipient is required (to, cc, or bcc)'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Créer le client Supabase pour enrichir les données
    const supabaseClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        })
      : null;

    // Enrichir avec les données de l'événement et/ou de l'activité
    let enrichedVariables = { ...variables };

    // Récupérer les données de l'événement si event_id est fourni
    if (event_id && supabaseClient) {
      try {
        console.log('Fetching event data for event_id:', event_id);

        // Récupérer les données de l'événement
        const { data: eventData, error: eventError } = await supabaseClient
          .from('events')
          .select(`
            id,
            title,
            description,
            in_person_start_date,
            in_person_end_date,
            city,
            country,
            address
          `)
          .eq('id', event_id)
          .single();

        if (!eventError && eventData) {
          // Ajouter les variables de l'événement
          enrichedVariables['{event_name}'] = eventData.title || '';
          enrichedVariables['{event_title}'] = eventData.title || '';
          enrichedVariables['{event_description}'] = eventData.description || '';
          enrichedVariables['{event_start_date}'] = eventData.in_person_start_date
            ? new Date(eventData.in_person_start_date).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{event_end_date}'] = eventData.in_person_end_date
            ? new Date(eventData.in_person_end_date).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{event_date}'] = eventData.in_person_start_date
            ? new Date(eventData.in_person_start_date).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{event_time}'] = eventData.in_person_start_date
            ? new Date(eventData.in_person_start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : '';
          enrichedVariables['{event_city}'] = eventData.city || '';
          enrichedVariables['{event_country}'] = eventData.country || '';
          enrichedVariables['{event_address}'] = eventData.address || '';

          console.log('Event variables enriched:', enrichedVariables);
        } else {
          console.error('Failed to fetch event data:', eventError);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    }

    // Récupérer les données de l'activité si activity_id est fourni
    if (activity_id && supabaseClient) {
      try {
        console.log('Fetching activity data for activity_id:', activity_id);

        // Récupérer les données de l'activité
        const { data: activityData, error: activityError } = await supabaseClient
          .from('activities')
          .select(`
            id,
            title,
            detailed_presentation,
            proposed_start_date,
            proposed_end_date,
            final_start_date,
            final_end_date,
            activity_type
          `)
          .eq('id', activity_id)
          .single();

        if (!activityError && activityData) {
          // Ajouter les variables de l'activité
          enrichedVariables['{activity_name}'] = activityData.title || '';
          enrichedVariables['{activity_title}'] = activityData.title || '';
          enrichedVariables['{activity_description}'] = activityData.detailed_presentation || '';

          // Utiliser les dates finales si disponibles, sinon les dates proposées
          const startDate = activityData.final_start_date || activityData.proposed_start_date;
          const endDate = activityData.final_end_date || activityData.proposed_end_date;

          enrichedVariables['{activity_start_date}'] = startDate
            ? new Date(startDate).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{activity_end_date}'] = endDate
            ? new Date(endDate).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{activity_date}'] = startDate
            ? new Date(startDate).toLocaleDateString('fr-FR')
            : '';
          enrichedVariables['{activity_type}'] = activityData.activity_type || '';

          console.log('Activity variables enriched:', enrichedVariables);
        } else {
          console.error('Failed to fetch activity data:', activityError);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    }

    // Si c'est un email d'événement avec des critères spécifiques
    if (email_type === 'event' && event_id && supabaseClient) {
      try {

        // Si on a des critères de statut d'activité, récupérer les destinataires
        if (activity_status && recipient_roles && recipient_roles.length > 0) {
          console.log('Fetching recipients based on activity status and roles');

          // Récupérer les activités avec le statut spécifié
          const { data: activities, error: activitiesError } = await supabaseClient
            .from('activities')
            .select(`
              id,
              coordinator_email,
              coordinator_name,
              organization_name
            `)
            .eq('event_id', event_id)
            .eq('validation_status', activity_status);

          if (!activitiesError && activities) {
            // Collecter les emails selon les rôles demandés
            const emailList: string[] = [];

            if (recipient_roles.includes('coordinators')) {
              activities.forEach(activity => {
                if (activity.coordinator_email) {
                  emailList.push(activity.coordinator_email);
                }
              });
            }

            // Ajouter les emails collectés en BCC pour protéger la vie privée
            if (emailList.length > 0) {
              recipients.bcc = [...(recipients.bcc || []), ...emailList];
              console.log(`Added ${emailList.length} recipients from activity criteria`);
            }
          } else {
            console.error('Failed to fetch activities:', activitiesError);
          }
        }
      } catch (enrichError) {
        console.error('Error enriching event data:', enrichError);
        // Continuer même si l'enrichissement échoue
      }
    }

    console.log('Sending email via Laravel:', {
      email_type,
      subject,
      recipient_count: {
        to: recipients.to?.length || 0,
        cc: recipients.cc?.length || 0,
        bcc: recipients.bcc?.length || 0
      }
    });

    try {
      // Vérifier si on a besoin d'enrichir les données des destinataires
      const needsRecipientEnrichment = supabaseClient && (
        content.includes('{recipient_name}') ||
        content.includes('{recipient_first_name}') ||
        content.includes('{recipient_last_name}') ||
        subject.includes('{recipient_name}') ||
        subject.includes('{recipient_first_name}') ||
        subject.includes('{recipient_last_name}')
      );

      if (needsRecipientEnrichment && recipients.to && recipients.to.length > 0) {
        console.log('Sending personalized emails to each recipient...');

        // Envoyer un email personnalisé à chaque destinataire TO
        const sendPromises = recipients.to.map(async (recipientEmail: string, index: number) => {
          // Enrichir les données du destinataire
          const recipientVariables = await enrichRecipientData(recipientEmail, supabaseClient);

          // Fusionner avec les variables globales
          const personalizedVariables = {
            ...enrichedVariables,
            ...recipientVariables
          };

          // Créer un AbortController pour timeout de 15 secondes
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          try {
            const response = await fetch(LARAVEL_EMAIL_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...LARAVEL_KEY ? {
                  'Authorization': `Bearer ${LARAVEL_KEY}`
                } : {}
              },
              body: JSON.stringify({
                email_type,
                subject,
                content,
                recipients: {
                  to: [recipientEmail],
                  // Chaque destinataire TO reçoit son email sans CC/BCC des autres TO
                  // Les CC et BCC originaux sont ajoutés à tous les emails
                  cc: recipients.cc || [],
                  bcc: recipients.bcc || []
                },
                variables: personalizedVariables,
                template,
                event_id,
                activity_status,
                recipient_roles
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const text = await response.text().catch(() => '');
              console.error(`Failed to send email to ${recipientEmail}:`, response.status, text);
              return { success: false, email: recipientEmail, error: text };
            }

            const responseData = await response.json().catch(() => ({}));
            console.log(`Email sent successfully to ${recipientEmail}`);
            return { success: true, email: recipientEmail, data: responseData };
          } catch (err) {
            console.error(`Error sending email to ${recipientEmail}:`, err);
            return { success: false, email: recipientEmail, error: String(err) };
          }
        });

        // Attendre que tous les envois soient terminés
        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        console.info(`Personalized emails sent: ${successCount} succeeded, ${failureCount} failed`);

        return new Response(JSON.stringify({
          success: successCount > 0,
          message: `${successCount} email(s) envoyé(s) avec succès${failureCount > 0 ? `, ${failureCount} échec(s)` : ''}`,
          data: {
            total: results.length,
            succeeded: successCount,
            failed: failureCount,
            results: results
          }
        }), {
          status: successCount > 0 ? 200 : 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      } else {
        // Mode standard : envoyer un email groupé sans personnalisation
        console.log('Sending standard email (no personalization)...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(LARAVEL_EMAIL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...LARAVEL_KEY ? {
              'Authorization': `Bearer ${LARAVEL_KEY}`
            } : {}
          },
          body: JSON.stringify({
            email_type,
            subject,
            content,
            recipients,
            variables: enrichedVariables,
            template,
            event_id,
            activity_status,
            recipient_roles
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          console.error('Laravel API returned error', response.status, text);
          return new Response(JSON.stringify({
            error: 'Failed to send email via Laravel',
            details: text
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const responseData = await response.json().catch(() => ({}));
        console.info('Email sent successfully via Laravel', responseData);

        return new Response(JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          data: responseData
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

    } catch (err) {
      console.error('Error sending email:', err);

      // Si c'est un timeout, retourner un succès pour éviter l'erreur côté client
      if (err.name === 'AbortError') {
        console.warn('Laravel API timeout, but email might still be sent');
        return new Response(JSON.stringify({
          success: true,
          message: 'Email processing initiated (timeout occurred)'
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
    console.error('Unhandled error in send-email function:', err);
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
