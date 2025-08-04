import { createClient } from '@/lib/supabase/client'
import { UserProfile, ProfileUpdateData, ProfileCreateData } from '@/types/profile'

export class ProfileService {
  private supabase = createClient()

  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: unknown }> {
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

  async createProfile(userId: string, email: string, profileData?: Partial<ProfileCreateData>): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      const newProfile: ProfileCreateData = {
        user_id: userId,
        email,
        preferred_language: 'en' as const,
        role: 'user',
        status: 'active',
        ...profileData,
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdateData, updatedBy?: string): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      const updateData = {
        ...updates,
        updated_by: updatedBy || null,
        // updated_at is handled by the database trigger
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<{ data: string | null; error: unknown }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        return { data: null, error: uploadError }
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { data: publicUrl, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteAvatar(avatarUrl: string): Promise<{ error: unknown }> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      const { error } = await this.supabase.storage
        .from('avatars')
        .remove([filePath])

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async searchProfiles(query: string, limit = 10): Promise<{ data: UserProfile[] | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(limit)

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateLoginStats(userId: string): Promise<{ error: unknown }> {
    try {
      const { error } = await this.supabase.rpc('update_login_stats', {
        target_user_id: userId
      })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async suspendProfile(userId: string, suspendedUntil: string, reason: string, suspendedBy: string): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          status: 'suspended',
          suspended_until: suspendedUntil,
          suspension_reason: reason,
          updated_by: suspendedBy
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async unsuspendProfile(userId: string, unsuspendedBy: string): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          status: 'active',
          suspended_until: null,
          suspension_reason: null,
          updated_by: unsuspendedBy
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateRole(userId: string, role: 'user' | 'admin' | 'moderator', updatedBy: string): Promise<{ data: UserProfile | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          role,
          updated_by: updatedBy
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}