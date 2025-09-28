import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: user, error: getUserError } = await supabaseAdminClient
      .from('users')
      .select('is_migrate, laravel_user_id')
      .eq('id', user_id)
      .single()

    if (getUserError) {
      throw new Error(`User not found: ${getUserError.message}`)
    }

    if (!user.is_migrate) {
      return new Response(
        JSON.stringify({ error: 'User is not a migrated user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: deleteUserError } = await supabaseAdminClient
      .from('users')
      .delete()
      .eq('id', user_id)

    if (deleteUserError) {
      throw new Error(`Failed to delete user profile: ${deleteUserError.message}`)
    }

    const { error: deleteAuthError } = await supabaseAdminClient.auth.admin.deleteUser(user_id)

    if (deleteAuthError) {
      console.error(`Warning: Failed to delete auth user: ${deleteAuthError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        laravel_user_id: user.laravel_user_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})