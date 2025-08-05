import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Debug environment
    const envCheck = {
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      url: Deno.env.get('SUPABASE_URL'),
    }

    console.log('Environment check:', envCheck)

    return new Response(
      JSON.stringify({
        message: 'Debug info',
        environment: envCheck,
        headers: Object.fromEntries(req.headers.entries()),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Debug error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})