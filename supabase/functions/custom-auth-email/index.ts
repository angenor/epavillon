// supabase/functions/custom-auth-email/index.ts
// Custom Auth Hook Edge Function for Supabase
// Uses Deno.serve (recommended) and forwards signup confirmation emails to a Laravel API.
const LARAVEL_URL = Deno.env.get('SUPABASE_CUSTOM_AUTH_LARAVEL_URL') ?? 'https://epavillonclimatique.francophonie.org/send_email';
const LARAVEL_KEY = Deno.env.get('SUPABASE_CUSTOM_AUTH_LARAVEL_KEY') ?? '';
console.info('custom-auth-email function started');
Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const payload = await req.json();

    // Log complet pour déboguer
    console.log('Full payload received:', JSON.stringify(payload, null, 2));

    const user = payload.user ?? null;
    const email_data = payload.email_data ?? {};
    const token = email_data.token;
    const token_hash = email_data.token_hash;
    const redirect_to = email_data.redirect_to;
    const email_action_type = email_data.email_action_type;

    console.log('Extracted data:', {
      token_full: token,
      token_hash_full: token_hash,
      redirect_to: redirect_to,
      email_action_type: email_action_type
    });
    if (!user || !user.email) {
      return new Response(JSON.stringify({
        error: 'Invalid payload: missing user.email'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Handle signup confirmation
    if (email_action_type === 'signup') {
      console.log('Processing signup confirmation:', {
        email: user.email,
        has_token: !!token,
        has_token_hash: !!token_hash,
        token_length: token?.length,
        token_hash_length: token_hash?.length,
        token_preview: token?.substring(0, 10) + '...',
        token_hash_preview: token_hash?.substring(0, 10) + '...',
        redirect_to: redirect_to
      });

      try {
        // Créer un AbortController pour timeout de 2 secondes (plus court)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(LARAVEL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...LARAVEL_KEY ? {
              'Authorization': `Bearer ${LARAVEL_KEY}`
            } : {}
          },
          body: JSON.stringify({
            email: user.email,
            token: token,
            token_hash: token_hash,
            redirect_to: redirect_to,
            user_id: user.id,
            action: 'signup_confirmation',
            // Construire le lien de confirmation correct
            // Utiliser le token le plus long disponible
            confirmation_url: `https://jzkuvulxfhtcelpvrxgf.supabase.co/auth/v1/verify?token=${token_hash || token}&type=signup&redirect_to=${encodeURIComponent('https://epavillonclimatique.francophonie.org/login')}`,
            // Données supplémentaires pour Laravel
            supabase_url: 'https://jzkuvulxfhtcelpvrxgf.supabase.co',
            project_ref: 'jzkuvulxfhtcelpvrxgf'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) {
          const text = await response.text().catch(()=>'');
          console.error('Laravel API returned error', response.status, text);
          // Return an error so Supabase will use its fallback email provider
          return new Response(JSON.stringify({
            error: 'Failed to send email via Laravel'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        console.info('Email sent successfully via Laravel');
        return new Response(JSON.stringify({
          message: 'Email sent successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Error sending email:', err);

        // Si c'est un timeout, retourner un succès pour éviter l'erreur côté client
        if (err.name === 'AbortError') {
          console.warn('Laravel API timeout, but email might still be sent');
          return new Response(JSON.stringify({
            message: 'Email processing initiated (timeout occurred)'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        // Pour les autres erreurs, laisser Supabase gérer l'envoi
        return new Response(JSON.stringify({
          error: String(err)
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Not handled: let Supabase use default behavior
    return new Response(JSON.stringify({
      message: 'Not handled by custom hook'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Unhandled error in function:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
