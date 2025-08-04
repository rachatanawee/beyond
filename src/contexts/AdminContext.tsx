'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
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

  // Refs to prevent infinite loops
  const lastUserIdRef = useRef<string | null>(null)
  const isCheckingRef = useRef(false)

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        setProfile(null)
        return null
      }

      if (!data) {
        setProfile(null)
        return null
      }

      setProfile(data)
      return data
    } catch {
      setProfile(null)
      return null
    }
  }, [supabase])

  const checkAdminStatus = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return isAdmin
    }

    // Wait for AuthContext to finish loading
    if (authLoading) {
      return false
    }

    if (!user) {
      lastUserIdRef.current = null
      setProfile(null)
      setIsAdmin(false)
      return false
    }

    // Skip if same user and we already have profile data
    if (user.id === lastUserIdRef.current && profile && profile.user_id === user.id) {
      const isAdminByRole = profile.role === 'admin' && profile.status === 'active'
      if (isAdmin !== isAdminByRole) {
        setIsAdmin(isAdminByRole)
      }
      return isAdminByRole
    }

    isCheckingRef.current = true
    lastUserIdRef.current = user.id

    try {
      // Load fresh profile data from Supabase
      let profileData = await loadProfile(user.id)

      // Fallback to AuthContext profile if Supabase load fails
      if (!profileData && authProfile) {
        profileData = authProfile
        setProfile(authProfile)
      }

      if (!profileData) {
        setIsAdmin(false)
        return false
      }

      // Check admin status via service
      const adminStatus = await adminService.isAdmin()
      const isAdminByRole = profileData.role === 'admin' && profileData.status === 'active'
      const finalAdminStatus = adminStatus || isAdminByRole

      setIsAdmin(finalAdminStatus)
      return finalAdminStatus
    } finally {
      isCheckingRef.current = false
    }
  }, [authLoading, user, profile, isAdmin, loadProfile, authProfile, adminService])

  const refreshAdminStatus = useCallback(async () => {
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

  // Watch for changes in user from AuthContext (only when user ID changes)
  useEffect(() => {
    if (mounted && !authLoading && user?.id !== lastUserIdRef.current) {
      checkAdminStatus()
    }
  }, [mounted, authLoading, user?.id, checkAdminStatus])

  // Listen for auth state changes to clear profile when user logs out
  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null
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