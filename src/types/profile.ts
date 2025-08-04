export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
  phone?: string | null
  date_of_birth?: string | null
  preferred_language: 'en' | 'th'
  created_at: string
  updated_at: string
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'suspended' | 'banned' | 'pending'
  last_login_at?: string | null
  login_count: number
  suspended_until?: string | null
  suspension_reason?: string | null
  created_by?: string | null
  updated_by?: string | null
}

export interface ProfileUpdateData {
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
  phone?: string | null
  date_of_birth?: string | null
  preferred_language?: 'en' | 'th'
}

export interface ProfileCreateData {
  user_id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
  phone?: string | null
  date_of_birth?: string | null
  preferred_language?: 'en' | 'th'
  role?: 'user' | 'admin' | 'moderator'
  status?: 'active' | 'suspended' | 'banned' | 'pending'
  created_by?: string | null
}