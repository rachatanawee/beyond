'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { createClient } from '@/lib/supabase/client'
import { AdminService } from '@/lib/services/adminService'
import { UserWithAdmin, AdminLog, UserStatistics } from '@/types/admin'
import { UserProfile } from '@/types/profile'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  profile: UserProfile | null
  users: UserWithAdmin[]
  adminLogs: AdminLog[]
  userStats: UserStatistics[]
  totalUsers: number
  adminService: AdminService
  refreshUsers: () => Promise<void>
  refreshLogs: () => Promise<void>
  refreshStats: () => Promise<void>
  refreshAdminStatus: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, profile: authProfile, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithAdmin[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  const [userStats, setUserStats] = useState<UserStatistics[]>([])
  const [totalUsers, setTotalUsers] = useState(0)

  const supabase = useMemo(() => createClient(), [])
  const adminService = useMemo(() => new AdminService(), [])

  const refreshUsers = useCallback(async () => {
    try {
      const { data, count } = await adminService.getAllUsers(1, 50)
      if (data) {
        setUsers(data)
        setTotalUsers(count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [adminService])

  const refreshLogs = useCallback(async () => {
    try {
      const { data } = await adminService.getAdminLogs(1, 50)
      if (data) {
        setAdminLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin logs:', error)
    }
  }, [adminService])

  const refreshStats = useCallback(async () => {
    try {
      const { data } = await adminService.getUserStatistics()
      if (data) {
        setUserStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch user statistics:', error)
    }
  }, [adminService])

  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('AdminContext - Loading profile for user:', userId)

      // First check if profiles table exists and we can connect
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (testError) {
        console.error('AdminContext - Supabase connection or table access failed:', {
          error: testError,
          code: testError.code,
          message: testError.message
        })

        if (testError.code === '42P01') {
          console.error('AdminContext - profiles table does not exist. Please run migrations.')
        }

        return null
      }

      console.log('AdminContext - Supabase connection OK, loading profile...')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('AdminContext - Failed to load profile:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })

        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('AdminContext - Profile not found, this might be expected for new users')
        }

        setProfile(null)
        return null
      }

      if (!data) {
        console.log('AdminContext - No profile data returned')
        setProfile(null)
        return null
      }

      console.log('AdminContext - Profile loaded successfully:', {
        id: data.id,
        userId: data.user_id,
        email: data.email,
        role: data.role,
        status: data.status
      })

      setProfile(data)
      return data
    } catch (error) {
      console.error('AdminContext - Exception while loading profile:', error)
      setProfile(null)
      return null
    }
  }, [supabase])

  const checkAdminStatus = useCallback(async () => {
    console.log('AdminContext - checkAdminStatus called:', {
      authLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileStatus: profile?.status
    })

    // Wait for AuthContext to finish loading
    if (authLoading) {
      console.log('AdminContext - AuthContext still loading, waiting...')
      return false
    }

    if (!user) {
      console.log('AdminContext - No user from AuthContext')
      setProfile(null)
      setIsAdmin(false)
      return false
    }

    // Load fresh profile data from Supabase
    let profileData = await loadProfile(user.id)

    // Fallback to AuthContext profile if Supabase load fails
    if (!profileData && authProfile) {
      console.log('AdminContext - Using AuthContext profile as fallback')
      profileData = authProfile
      setProfile(authProfile)
    }

    if (!profileData) {
      console.log('AdminContext - No profile found in database or AuthContext')
      setIsAdmin(false)
      return false
    }

    console.log('AdminContext - Checking admin status for user:', user.id, 'profile role:', profileData.role)

    // Check admin status via service
    const adminStatus = await adminService.isAdmin()
    const isAdminByRole = profileData.role === 'admin' && profileData.status === 'active'
    const finalAdminStatus = adminStatus || isAdminByRole

    console.log('AdminContext - Admin check result:', {
      adminStatus,
      isAdminByRole,
      finalAdminStatus
    })

    setIsAdmin(finalAdminStatus)
    return finalAdminStatus
  }, [authLoading, user, profile, loadProfile, authProfile, adminService])

  const refreshAdminStatus = useCallback(async () => {
    console.log('Manually refreshing admin status...')
    await checkAdminStatus()
  }, [checkAdminStatus])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || authLoading) return

    const initializeAdmin = async () => {
      setLoading(true)

      const isAdminUser = await checkAdminStatus()

      if (isAdminUser) {
        await Promise.all([
          refreshUsers(),
          refreshLogs(),
          refreshStats()
        ])
      }

      setLoading(false)
    }

    initializeAdmin()
  }, [mounted, authLoading, checkAdminStatus, refreshUsers, refreshLogs, refreshStats])

  // Watch for changes in user from AuthContext
  useEffect(() => {
    if (mounted && !authLoading) {
      checkAdminStatus()
    }
  }, [mounted, authLoading, user, checkAdminStatus])

  // Listen for auth state changes to clear profile when user logs out
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setIsAdmin(false)
    }
  }, [user])

  const value = {
    isAdmin,
    loading,
    profile,
    users,
    adminLogs,
    userStats,
    totalUsers,
    adminService,
    refreshUsers,
    refreshLogs,
    refreshStats,
    refreshAdminStatus,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}