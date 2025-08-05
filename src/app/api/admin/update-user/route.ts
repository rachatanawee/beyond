import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

// Translation helper
const getTranslations = (locale: string = 'en') => {
  try {
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`)
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
    return messages.Admin.updateUser || {
      unauthorized: "Access denied. Please log in again.",
      userVerificationFailed: "Unable to verify identity. Please log in again.",
      profileVerificationFailed: "Unable to verify user profile.",
      adminRequired: "Admin privileges required to update users.",
      userNotFound: "User not found.",
      missingFields: "Please provide data to update.",
      invalidData: "Invalid data provided.",
      userUpdateFailed: "Unable to update user: {error}",
      internalError: "System error occurred. Please try again."
    }
  } catch {
    return {
      unauthorized: "Access denied. Please log in again.",
      userVerificationFailed: "Unable to verify identity. Please log in again.",
      profileVerificationFailed: "Unable to verify user profile.",
      adminRequired: "Admin privileges required to update users.",
      userNotFound: "User not found.",
      missingFields: "Please provide data to update.",
      invalidData: "Invalid data provided.",
      userUpdateFailed: "Unable to update user: {error}",
      internalError: "System error occurred. Please try again."
    }
  }
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

export async function PUT(request: NextRequest) {
  console.log('✏️ Update user API called')
  
  // Get locale from header or URL
  const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
                 request.nextUrl.pathname.split('/')[1] || 'en'
  console.log('🌐 Detected locale:', locale)
  
  const t = getTranslations(locale)
  
  try {
    // Parse request body
    const body = await request.json()
    const { userId, updateData } = body

    if (!userId) {
      console.log('❌ Missing user ID')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('❌ Missing update data')
      return NextResponse.json(
        { error: t.missingFields },
        { status: 400 }
      )
    }

    console.log('🎯 Target user ID:', userId)
    console.log('📝 Update data:', Object.keys(updateData))

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

    // Check if target user exists
    console.log('🔍 Checking target user...')
    const { data: targetProfile, error: targetError } = await userClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (targetError || !targetProfile) {
      console.log('❌ Target user not found:', targetError)
      return NextResponse.json(
        { error: t.userNotFound },
        { status: 404 }
      )
    }

    console.log('👤 Target user found:', targetProfile.email)

    // Validate and sanitize update data
    const allowedFields = [
      'full_name', 'bio', 'website', 'location', 'phone', 
      'date_of_birth', 'preferred_language', 'role', 'status'
    ]
    
    const sanitizedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = value
      }
    }

    // Add metadata
    sanitizedData.updated_by = user.id
    sanitizedData.updated_at = new Date().toISOString()

    console.log('🧹 Sanitized update data:', Object.keys(sanitizedData))

    // Update the profile
    console.log('✏️ Updating user profile...')
    const { data: updatedProfile, error: updateError } = await userClient
      .from('profiles')
      .update(sanitizedData)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.log('❌ Profile update failed:', updateError)
      return NextResponse.json(
        { error: t.userUpdateFailed.replace('{error}', updateError.message) },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully')

    // Log admin action
    console.log('📝 Logging admin action...')
    await userClient.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_user_profile',
      target_user_id: userId,
      details: {
        target_email: targetProfile.email,
        updated_fields: Object.keys(sanitizedData).filter(key => !['updated_by', 'updated_at'].includes(key)),
        changes: sanitizedData
      }
    })

    return NextResponse.json({
      data: updatedProfile,
      error: null
    })

  } catch (error) {
    console.error('💥 Update user API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: t.internalError },
      { status: 500 }
    )
  }
}