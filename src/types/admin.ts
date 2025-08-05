export type UserRole = 'user' | 'admin' | 'moderator'
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending'

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_user_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface UserWithAdmin {
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
  role: UserRole
  status: UserStatus
  last_login_at?: string | null
  login_count: number
  suspended_until?: string | null
  suspension_reason?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at: string
  updated_at: string
}

export interface UserStatistics {
  date: string
  new_users: number
  active_users: number
  suspended_users: number
  banned_users: number
}

export interface SuspendUserData {
  userId: string
  suspendUntil: string
  reason: string
}

export interface NewUserData {
  email: string
  password: string
  full_name: string
  role?: 'user' | 'admin' | 'moderator'
}