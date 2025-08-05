import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

// Translation helper
const getTranslations = (locale: string = 'en') => {
  try {
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`)
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
    return messages.Admin.deleteUser || {
      unauthorized: "Access denied. Please log in again.",
      userVerificationFailed: "Unable to verify identity. Please log in again.",
      profileVerificationFailed: "Unable to verify user profile.",
      adminRequired: "Admin privileges required to delete users.",
      userNotFound: "User not found.",
      cannotDeleteSelf: "You cannot delete your own account.",
      cannotDeleteAdmin: "Cannot delete admin users. Change role first.",
      userDeleteFailed: "Unable to delete user: {error}",
      internalError: "System error occurred. Please try again."
    }
  } catch {
    // Ultimate fallback - hardcoded English messages
    return {
      unauthorized: "Access denied. Please log in again.",
      userVerificationFailed: "Unable to verify identity. Please log in again.",
      profileVerificationFailed: "Unable to verify user profile.",
      adminRequired: "Admin privileges required to delete users.",
      userNotFound: "User not found.",
      cannotDeleteSelf: "You cannot delete your own account.",
      cannotDeleteAdmin: "Cannot delete admin users. Change role first.",
      userDeleteFailed: "Unable to delete user: {error}",
      internalError: "System error occurred. Please try again."
    }
  }
}

// Admin client with service role key
const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log('🔧 Admin client config:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    serviceKeyPrefix: supabaseServiceKey?.substring(0, 20) + '...'
  })

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

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

export async function DELETE(request: NextRequest) {
  console.log('🗑️ Delete user API called')
  
  // Get locale from header or URL
  const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
                 request.nextUrl.pathname.split('/')[1] || 'en'
  console.log('🌐 Detected locale:', locale)
  
  const t = getTranslations(locale)
  
  try {
    // Get user ID from URL or request body
    const url = new URL(request.url)
    const userIdFromUrl = url.searchParams.get('userId')
    
    let userId = userIdFromUrl
    if (!userId) {
      const body = await request.json()
      userId = body.userId
    }

    if (!userId) {
      console.log('❌ Missing user ID')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🎯 Target user ID:', userId)

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
    console.log('👤 Verifying admin user...')
    const userClient = createUserClient(accessToken)
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      console.log('❌ User verification failed:', userError)
      return NextResponse.json(
        { error: t.userVerificationFailed },
        { status: 401 }
      )
    }
    
    console.log('✅ Admin user verified:', user.id)

    // Check if user is admin
    console.log('🔍 Checking admin privileges...')
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

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

    // Prevent self-deletion
    if (user.id === userId) {
      console.log('🚫 Attempted self-deletion')
      return NextResponse.json(
        { error: t.cannotDeleteSelf },
        { status: 400 }
      )
    }

    // Create admin client for user deletion
    console.log('🔧 Creating admin client...')
    const adminClient = createAdminClient()

    // Check if target user exists and get their role
    console.log('🔍 Checking target user...')
    const { data: targetProfile, error: targetError } = await adminClient
      .from('profiles')
      .select('role, full_name, email')
      .eq('user_id', userId)
      .single()

    if (targetError || !targetProfile) {
      console.log('❌ Target user not found:', targetError)
      return NextResponse.json(
        { error: t.userNotFound },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users (safety measure)
    if (targetProfile.role === 'admin') {
      console.log('🚫 Attempted to delete admin user')
      return NextResponse.json(
        { error: t.cannotDeleteAdmin },
        { status: 400 }
      )
    }

    console.log('👤 Target user:', targetProfile.email, 'Role:', targetProfile.role)

    // Log admin action before deletion
    console.log('📝 Logging admin action...')
    await adminClient.from('admin_logs').insert({
      admin_id: user.id,
      action: 'delete_user',
      target_user_id: userId,
      details: {
        target_email: targetProfile.email,
        target_name: targetProfile.full_name,
        target_role: targetProfile.role
      }
    })

    // Delete the user (this will cascade to profiles due to foreign key)
    console.log('🗑️ Deleting user from auth...')
    try {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

      if (deleteError) {
        console.log('❌ User deletion failed:', deleteError)
        console.log('❌ Delete error details:', {
          message: deleteError.message,
          status: deleteError.status,
          code: deleteError.code
        })
        return NextResponse.json(
          { error: t.userDeleteFailed.replace('{error}', deleteError.message) },
          { status: 500 }
        )
      }
    } catch (deleteError) {
      console.log('💥 Delete operation threw error:', deleteError)
      return NextResponse.json(
        { error: t.userDeleteFailed.replace('{error}', 'Delete operation failed') },
        { status: 500 }
      )
    }

    console.log('✅ User deleted successfully')

    return NextResponse.json({
      message: 'User deleted successfully',
      error: null
    })

  } catch (error) {
    console.error('💥 Delete user API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: t.internalError },
      { status: 500 }
    )
  }
}