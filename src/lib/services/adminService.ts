import { createClient } from '@/lib/supabase/client'
import { UserWithAdmin, AdminLog, UserStatistics, SuspendUserData, NewUserData } from '@/types/admin'
import { ProfileService } from './profileService'
import { UserProfile } from '@/types/profile'

export class AdminService {
  private supabase = createClient()
  private profileService = new ProfileService()

  async isAdmin(): Promise<boolean> {
    try {
      // First try the RPC function
      const { data, error } = await this.supabase.rpc('is_admin')
      if (!error && data !== null) {
        return data || false
      }

      // Fallback: check profile directly
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('role, status')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) return false

      return profile.role === 'admin' && profile.status === 'active'
    } catch {
      return false
    }
  }

  async getAllUsers(page = 1, limit = 20): Promise<{ data: UserWithAdmin[] | null; error: unknown; count?: number }> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { data: null, error }
      }

      return { data, error: null, count: count || 0 }
    } catch (error) {
      return { data: null, error }
    }
  }

  async searchUsers(query: string, limit = 20): Promise<{ data: UserWithAdmin[] | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserById(userId: string): Promise<{ data: UserWithAdmin | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createUser(userData: NewUserData): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      // Get current session token
      const { data: { session } } = await this.supabase.auth.getSession()

      if (!session?.access_token) {
        return { data: null, error: 'Not authenticated' }
      }

      // Call the API route to create user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          role: userData.role || 'user'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to create user' }
      }

      return { data: result.data, error: null }
    } catch (error) {
      console.error('Create user error:', error)
      return { data: null, error }
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<{ error: unknown }> {
    try {
      const currentUser = (await this.supabase.auth.getUser()).data.user
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      const { error } = await this.profileService.updateRole(userId, role, currentUser.id)

      if (!error) {
        await this.logAdminAction('update_user_role', userId, { new_role: role })
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async suspendUser(suspendData: SuspendUserData): Promise<{ error: unknown }> {
    try {
      const currentUser = (await this.supabase.auth.getUser()).data.user
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      const { error } = await this.profileService.suspendProfile(
        suspendData.userId,
        suspendData.suspendUntil,
        suspendData.reason,
        currentUser.id
      )

      if (!error) {
        await this.logAdminAction('suspend_user', suspendData.userId, {
          suspend_until: suspendData.suspendUntil,
          reason: suspendData.reason
        })
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async unsuspendUser(userId: string): Promise<{ error: unknown }> {
    try {
      const currentUser = (await this.supabase.auth.getUser()).data.user
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      const { error } = await this.profileService.unsuspendProfile(userId, currentUser.id)

      if (!error) {
        await this.logAdminAction('unsuspend_user', userId)
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async banUser(userId: string, reason: string): Promise<{ error: unknown }> {
    try {
      const currentUser = (await this.supabase.auth.getUser()).data.user
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({
          status: 'banned',
          suspension_reason: reason,
          updated_by: currentUser.id
        })
        .eq('user_id', userId)

      if (!error) {
        await this.logAdminAction('ban_user', userId, { reason })
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async unbanUser(userId: string): Promise<{ error: unknown }> {
    try {
      const currentUser = (await this.supabase.auth.getUser()).data.user
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({
          status: 'active',
          suspension_reason: null,
          updated_by: currentUser.id
        })
        .eq('user_id', userId)

      if (!error) {
        await this.logAdminAction('unban_user', userId)
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async deleteUser(userId: string): Promise<{ error: unknown }> {
    try {
      // Log before deletion
      await this.logAdminAction('delete_user', userId)

      // Delete from auth.users (this will cascade to profiles)
      // Note: This would need another API route for proper admin deletion
      const { error } = await this.supabase.auth.admin.deleteUser(userId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async getAdminLogs(page = 1, limit = 50): Promise<{ data: AdminLog[] | null; error: unknown; count?: number }> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('admin_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { data: null, error }
      }

      return { data, error: null, count: count || 0 }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserStatistics(): Promise<{ data: UserStatistics[] | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_statistics')

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  private async logAdminAction(action: string, targetUserId?: string, details?: Record<string, unknown>): Promise<void> {
    try {
      await this.supabase.rpc('log_admin_action', {
        action_type: action,
        target_user: targetUserId,
        action_details: details
      })
    } catch (error) {
      console.error('Failed to log admin action:', error)
    }
  }

  async exportUsers(format: 'csv' | 'json' = 'csv'): Promise<{ data: string | null; error: unknown }> {
    try {
      const { data: users, error } = await this.getAllUsers(1, 10000) // Get all users

      if (error || !users) {
        return { data: null, error }
      }

      if (format === 'json') {
        return { data: JSON.stringify(users, null, 2), error: null }
      }

      // CSV format
      const headers = ['ID', 'Email', 'Full Name', 'Role', 'Status', 'Created At', 'Last Login', 'Login Count']
      const csvRows = [
        headers.join(','),
        ...users.map(user => [
          user.user_id,
          user.email,
          user.full_name || '',
          user.role,
          user.status,
          user.created_at,
          user.last_login_at || '',
          user.login_count
        ].map(field => `"${field}"`).join(','))
      ]

      return { data: csvRows.join('\n'), error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}