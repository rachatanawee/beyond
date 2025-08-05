import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

// Translation helper
const getTranslations = (locale: string = 'en') => {
  try {
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`)
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
    return messages.Admin.createUser
  } catch {
    // Fallback to English if locale not found
    try {
      const messagesPath = path.join(process.cwd(), 'messages', 'en.json')
      const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
      return messages.Admin.createUser
    } catch {
      // Ultimate fallback - hardcoded English messages
      return {
        emailExists: "This email is already in use. Please use a different email.",
        profileExists: "User profile already exists in the system.",
        missingFields: "Please fill in email, password, and full name completely.",
        invalidContentType: "Invalid data format.",
        invalidJson: "Invalid data sent.",
        unauthorized: "Access denied. Please log in again.",
        userVerificationFailed: "Unable to verify identity. Please log in again.",
        profileVerificationFailed: "Unable to verify user profile.",
        adminRequired: "Admin privileges required to create users.",
        userCreationFailed: "Unable to create user: {error}",
        profileCreationFailed: "Unable to create user profile.",
        internalError: "System error occurred. Please try again."
      }
    }
  }
}

// Admin client with service role key
const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Regular client to verify user
const createUserClient = (accessToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('🚀 Create user API called')
  console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()))

  // Get locale from header or URL
  const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] ||
    request.nextUrl.pathname.split('/')[1] || 'en'
  console.log('🌐 Detected locale:', locale)

  const t = getTranslations(locale)

  try {
    // Check if request has body
    const contentType = request.headers.get('content-type')
    console.log('📄 Content-Type:', contentType)

    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ Invalid content type')
      return NextResponse.json(
        { error: t.invalidContentType },
        { status: 400 }
      )
    }

    let body
    try {
      body = await request.json()
      console.log('📝 Request body parsed successfully')
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError)
      return NextResponse.json(
        { error: t.invalidJson },
        { status: 400 }
      )
    }

    const { email, password, full_name, role = 'user' } = body
    console.log('📝 Request data:', { email, full_name, role, hasPassword: !!password })

    if (!email || !password || !full_name) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: t.missingFields },
        { status: 400 }
      )
    }

    // Get authorization header
    const authorization = request.headers.get('authorization')
    console.log('🔑 Authorization header:', authorization ? 'Present' : 'Missing')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('❌ Invalid authorization header')
      return NextResponse.json(
        { error: t.unauthorized },
        { status: 401 }
      )
    }

    const accessToken = authorization.replace('Bearer ', '')
    console.log('🎫 Access token length:', accessToken.length)

    // Verify the requesting user is an admin
    console.log('👤 Verifying user...')
    const userClient = createUserClient(accessToken)
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      console.log('❌ User verification failed:', userError)
      return NextResponse.json(
        { error: t.userVerificationFailed },
        { status: 401 }
      )
    }

    console.log('✅ User verified:', user.id)

    // Check if user is admin
    console.log('🔍 Checking user profile...')
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    console.log('👤 Profile data:', profile)
    console.log('❌ Profile error:', profileError)

    if (profileError) {
      console.log('💥 Profile query failed:', profileError)
      return NextResponse.json(
        { error: t.profileVerificationFailed },
        { status: 500 }
      )
    }

    if (profile?.role !== 'admin' || profile?.status !== 'active') {
      console.log('🚫 Access denied - Role:', profile?.role, 'Status:', profile?.status)
      return NextResponse.json(
        { error: t.adminRequired },
        { status: 403 }
      )
    }

    console.log('✅ Admin privileges verified')

    // Create admin client for user creation
    console.log('🔧 Creating admin client...')
    const adminClient = createAdminClient()

    // Check if user already exists
    console.log('🔍 Checking if user already exists...')
    const { data: existingUser } = await adminClient.auth.admin.listUsers()
    const userExists = existingUser.users.find(u => u.email === email)

    if (userExists) {
      console.log('⚠️ User already exists:', userExists.id)
      return NextResponse.json(
        { error: t.emailExists },
        { status: 409 }
      )
    }

    // Create the new user
    console.log('👤 Creating new user with email:', email)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    console.log('🔐 Auth creation result:', {
      success: !!authData.user,
      userId: authData.user?.id,
      error: authError?.message
    })

    if (authError || !authData.user) {
      console.log('❌ User creation failed:', authError)
      return NextResponse.json(
        { error: t.userCreationFailed.replace('{error}', authError?.message || 'Unknown error') },
        { status: 400 }
      )
    }

    // Wait a moment for trigger to create profile
    console.log('⏳ Waiting for profile creation trigger...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update profile with additional data (trigger creates basic profile)
    console.log('📝 Updating profile with additional data...')
    const { data: profileData, error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({
        full_name,
        role,
        created_by: user.id
      })
      .eq('user_id', authData.user.id)
      .select()
      .single()

    console.log('👤 Profile update result:', {
      success: !!profileData,
      error: profileUpdateError?.message
    })

    if (profileUpdateError) {
      console.log('❌ Profile update failed:', profileUpdateError)
      // If profile update fails, clean up the auth user
      console.log('🧹 Cleaning up auth user...')
      await adminClient.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: t.profileCreationFailed },
        { status: 500 }
      )
    }

    // Log admin action
    await adminClient.from('admin_logs').insert({
      admin_id: user.id,
      action: 'create_user',
      target_user_id: authData.user.id,
      details: {
        email,
        role,
        full_name
      }
    })

    return NextResponse.json({
      data: profileData,
      error: null
    })

  } catch (error) {
    console.error('💥 Create user API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: t.internalError },
      { status: 500 }
    )
  }
}