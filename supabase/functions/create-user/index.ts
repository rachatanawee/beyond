import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  role?: 'user' | 'admin' | 'moderator'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Simple test first
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        message: 'Function is working',
        timestamp: new Date().toISOString(),
        env: {
          hasUrl: !!Deno.env.get('SUPABASE_URL'),
          hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
          hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }

  try {

    // 1. Create a Supabase client to verify the caller's identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )

    // 2. Get the user object of the person making the request
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    console.log('User check:', { hasUser: !!user, userError })

    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Create the Admin client using the SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Check if the authenticated user has an 'admin' role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    console.log('Profile check:', { profile, profileError, userId: user.id })

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: `Profile lookup failed: ${profileError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (profile?.role !== 'admin' || profile?.status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'Forbidden: Admin privileges required',
          debug: { role: profile?.role, status: profile?.status }
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Parse request body
    let requestData: CreateUserRequest
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { email, password, full_name, role = 'user' } = requestData
    console.log('Request data:', { email, hasPassword: !!password, full_name, role })

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 6. Create the new user
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
      },
    })

    if (createError || !newUserData.user) {
      return new Response(
        JSON.stringify({ error: createError?.message || 'Failed to create user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 7. Create profile for the new user
    const { data: profileData, error: profileCreateError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUserData.user.id,
        email: email,
        full_name: full_name,
        role: role,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single()

    if (profileCreateError) {
      // If profile creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserData.user.id)

      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 8. Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: user.id,
      action: 'create_user',
      target_user_id: newUserData.user.id,
      details: {
        email: email,
        role: role,
        full_name: full_name,
      },
    })

    // 9. Return the created profile
    return new Response(
      JSON.stringify({
        data: profileData,
        error: null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})