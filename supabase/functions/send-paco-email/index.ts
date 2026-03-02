// supabase/functions/send-paco-email/index.ts
// Edge Function dédiée à l'envoi de l'email de confirmation PACO avec le lien Teams.
// Isolée pour suppression facile après l'événement.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5'

const LARAVEL_EMAIL_URL = Deno.env.get('LARAVEL_POLIVALENT_EMAIL_URL') ?? 'https://epavillonclimatique.francophonie.org/send_polivalent_email'
const LARAVEL_KEY = Deno.env.get('SUPABASE_CUSTOM_AUTH_LARAVEL_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// PACO constants — hardcoded in edge function for security
const PACO_ACTIVITY_ID = '00000000-0000-4000-a000-00000000a002'
const PACO_TEAMS_LINK = Deno.env.get('PACO_TEAMS_LINK') ?? ''
const PACO_WEBINAR_TITLE = 'Webinaire PACO — Priorités d\'Adaptation en Afrique Centrale et de l\'Ouest'
const PACO_WEBINAR_DATE = 'Date à confirmer' // À mettre à jour avec la date réelle

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

function buildPacoEmailHtml(recipientName: string, teamsLink: string, webinarTitle: string, webinarDate: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a5632; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${webinarTitle}</h1>
  </div>
  <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
    <p>Bonjour <strong>${recipientName}</strong>,</p>
    <p>Votre inscription au webinaire PACO est confirmée ! Voici les informations pour rejoindre l'événement :</p>
    <div style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Événement :</strong> ${webinarTitle}</p>
      <p style="margin: 5px 0;"><strong>Date :</strong> ${webinarDate}</p>
      <p style="margin: 5px 0;"><strong>Format :</strong> En ligne via Microsoft Teams</p>
    </div>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${teamsLink}" style="display: inline-block; background-color: #5b5fc7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">Rejoindre le webinaire Teams</a>
    </div>
    <p style="font-size: 13px; color: #666;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
      <a href="${teamsLink}" style="color: #5b5fc7; word-break: break-all;">${teamsLink}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Cet email a été envoyé automatiquement par la plateforme ePavilion de l'IFDD.<br>
      Institut de la Francophonie pour le Développement Durable
    </p>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    // 1. Check authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return jsonResponse({ error: 'Non authentifié' }, 401)
    }

    // 2. Create Supabase client with service role
    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 3. Verify the caller's JWT token
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return jsonResponse({ error: 'Non authentifié' }, 401)
    }

    // 4. Verify the caller is registered for the PACO webinar
    const { data: registration, error: regError } = await supabaseClient
      .from('activity_registrations')
      .select('id')
      .eq('activity_id', PACO_ACTIVITY_ID)
      .eq('user_id', user.id)
      .maybeSingle()

    if (regError) {
      console.error('Error checking PACO registration:', regError)
      return jsonResponse({ error: 'Erreur lors de la vérification d\'inscription' }, 500)
    }

    if (!registration) {
      return jsonResponse({ error: 'Utilisateur non inscrit au webinaire PACO' }, 403)
    }

    // 5. Parse and validate payload
    let payload
    try {
      payload = await req.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400)
    }

    const { recipient_email, recipient_name } = payload

    if (!recipient_email || !recipient_name) {
      return jsonResponse({ error: 'Missing required fields: recipient_email, recipient_name' }, 400)
    }

    // 6. Build the PACO email
    const teamsLink = PACO_TEAMS_LINK || 'https://teams.microsoft.com'
    const emailHtml = buildPacoEmailHtml(recipient_name, teamsLink, PACO_WEBINAR_TITLE, PACO_WEBINAR_DATE)

    // 7. Send via Laravel endpoint
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(LARAVEL_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LARAVEL_KEY ? { 'Authorization': `Bearer ${LARAVEL_KEY}` } : {})
      },
      body: JSON.stringify({
        email_type: 'simple',
        subject: `Confirmation d'inscription — ${PACO_WEBINAR_TITLE}`,
        content: emailHtml,
        recipients: {
          to: [recipient_email]
        },
        variables: {
          '{recipient_name}': recipient_name,
          '{recipient_email}': recipient_email
        },
        template: 'simple_email'
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('Laravel API error:', response.status, text)
      return jsonResponse({ error: 'Erreur lors de l\'envoi de l\'email', details: text }, 500)
    }

    const responseData = await response.json().catch(() => ({}))
    console.info('PACO email sent successfully to', recipient_email)

    return jsonResponse({ success: true, message: 'Email envoyé avec succès', data: responseData }, 200)
  } catch (err) {
    console.error('Unhandled error in send-paco-email:', err)

    if (err.name === 'AbortError') {
      return jsonResponse({ success: true, message: 'Email en cours de traitement (timeout)' }, 200)
    }

    return jsonResponse({ error: 'Erreur interne du serveur' }, 500)
  }
})
