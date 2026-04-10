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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: caller }, error: authError } = await adminClient.auth.getUser(token)
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: callerRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('is_active', true)
      .in('role', ['admin', 'super_admin'])

    if (rolesError || !callerRoles || callerRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent self-deletion
    if (user_id === caller.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await adminClient
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', user_id)
      .single()

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Nullify non-cascading foreign key references to this user
    // These columns reference users(id) without ON DELETE CASCADE
    const nullifyQueries = [
      adminClient.from('users').update({ blocked_by: null, suspended_by: null }).eq('blocked_by', user_id),
      adminClient.from('users').update({ suspended_by: null }).eq('suspended_by', user_id),
      adminClient.from('user_roles').update({ assigned_by: null }).eq('assigned_by', user_id),
      adminClient.from('organizations').update({ verified_by: null }).eq('verified_by', user_id),
      adminClient.from('organizations').update({ created_by: null }).eq('created_by', user_id),
    ]

    await Promise.allSettled(nullifyQueries)

    // Delete user profile from public.users (cascades to ON DELETE CASCADE tables)
    const { error: deleteUserError } = await adminClient
      .from('users')
      .delete()
      .eq('id', user_id)

    if (deleteUserError) {
      throw new Error(`Failed to delete user profile: ${deleteUserError.message}`)
    }

    // Delete from auth.users
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user_id)

    if (deleteAuthError) {
      console.error(`Warning: Failed to delete auth user: ${deleteAuthError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        deleted_user: `${targetUser.first_name} ${targetUser.last_name} (${targetUser.email})`
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
