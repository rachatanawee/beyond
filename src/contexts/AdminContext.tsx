'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { AdminService } from '@/lib/services/adminService'
import { UserWithAdmin, AdminLog, UserStatistics } from '@/types/admin'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
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
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithAdmin[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  const [userStats, setUserStats] = useState<UserStatistics[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  
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

  const refreshAdminStatus = useCallback(async () => {
    if (user && profile) {
      console.log('Manually refreshing admin status...')
      const adminStatus = await adminService.isAdmin()
      const isAdminByRole = profile.role === 'admin' && profile.status === 'active'
      const finalAdminStatus = adminStatus || isAdminByRole
      console.log('Manual refresh result:', { adminStatus, isAdminByRole, finalAdminStatus })
      setIsAdmin(finalAdminStatus)
    }
  }, [user, profile, adminService])

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('AdminContext user:', user)
      console.log('AdminContext profile:', profile)
      
      if (user && profile) {
        console.log('AdminContext - Checking admin status for user:', user.id, 'profile role:', profile.role)
        
        // Check admin status via service
        const adminStatus = await adminService.isAdmin()
        console.log('AdminContext - Admin status result:', adminStatus)
        
        // Fallback: check profile role directly
        const isAdminByRole = profile.role === 'admin' && profile.status === 'active'
        console.log('AdminContext - Admin by role:', isAdminByRole)
        
        const finalAdminStatus = adminStatus || isAdminByRole
        console.log('AdminContext - Final admin status:', finalAdminStatus)
        
        setIsAdmin(finalAdminStatus)
        
        if (finalAdminStatus) {
          await Promise.all([
            refreshUsers(),
            refreshLogs(),
            refreshStats()
          ])
        }
      } else {
        console.log('AdminContext - No user or profile:', { user: !!user, profile: !!profile })
        setIsAdmin(false)
      }
      setLoading(false)
    }

    checkAdminStatus()
  }, [user, profile, adminService, refreshUsers, refreshLogs, refreshStats])

  const value = {
    isAdmin,
    loading,
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