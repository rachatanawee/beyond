const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupOrphanedUsers() {
  try {
    console.log('🔍 Finding orphaned users...')
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      throw authError
    }
    
    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
    
    if (profileError) {
      throw profileError
    }
    
    const profileUserIds = new Set(profiles.map(p => p.user_id))
    const orphanedUsers = authUsers.users.filter(user => !profileUserIds.has(user.id))
    
    console.log(`📊 Found ${orphanedUsers.length} orphaned users`)
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found')
      return
    }
    
    // List orphaned users
    console.log('\n🗑️ Orphaned users:')
    orphanedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`)
    })
    
    // Delete orphaned users
    console.log('\n🧹 Cleaning up orphaned users...')
    for (const user of orphanedUsers) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.error(`❌ Failed to delete ${user.email}:`, error.message)
        } else {
          console.log(`✅ Deleted ${user.email}`)
        }
      } catch (err) {
        console.error(`❌ Error deleting ${user.email}:`, err.message)
      }
    }
    
    console.log('\n✅ Cleanup completed!')
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message)
    process.exit(1)
  }
}

cleanupOrphanedUsers()