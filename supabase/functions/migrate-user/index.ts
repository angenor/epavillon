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

    const {
      email,
      first_name,
      last_name,
      phone,
      biography,
      profile_photo_url,
      laravel_user_id,
      created_at,
      updated_at,
      is_migrate
    } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let userId: string
    let isNewAuthUser = false

    const { data: authUser, error: authError } = await supabaseAdminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        is_migrated: true,
        laravel_user_id
      }
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        const { data: existingProfile } = await supabaseAdminClient
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (existingProfile) {
          userId = existingProfile.id
          console.log(`Auth and profile user already exists: ${email} (${userId})`)
        } else {
          throw new Error(`User exists in auth but profile not found: ${email}`)
        }
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }
    } else {
      userId = authUser.user.id
      isNewAuthUser = true
      console.log(`New auth user created: ${email} (${userId})`)
    }

    const { data: existingUser, error: checkError } = await supabaseAdminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check user profile: ${checkError.message}`)
    }

    if (existingUser) {
      const { error: updateError } = await supabaseAdminClient
        .from('users')
        .update({
          laravel_user_id,
          is_migrate: is_migrate ?? true,
          created_at: created_at || new Date().toISOString(),
          updated_at: updated_at || new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Failed to update user profile: ${updateError.message}`)
      }

      console.log(`User profile updated: ${email}`)
    } else {
      const { error: userError } = await supabaseAdminClient
        .from('users')
        .insert({
          id: userId,
          email,
          first_name: first_name || 'Prénom',
          last_name: last_name || 'Nom',
          phone,
          biography,
          profile_photo_url,
          laravel_user_id,
          is_migrate: is_migrate ?? true,
          created_at: created_at || new Date().toISOString(),
          updated_at: updated_at || new Date().toISOString()
        })

      if (userError) {
        if (isNewAuthUser) {
          await supabaseAdminClient.auth.admin.deleteUser(userId)
        }
        throw new Error(`Failed to create user profile: ${userError.message}`)
      }

      console.log(`User profile created: ${email}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser.user.id,
        email: authUser.user.email
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