'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, ProfileUpdateData } from '@/types/profile'
import { ProfileService } from '@/lib/services/profileService'

interface AuthResult {
    data: unknown
    error: AuthError | null
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    profileLoading: boolean
    signIn: (email: string, password: string) => Promise<AuthResult>
    signUp: (email: string, password: string) => Promise<AuthResult>
    signOut: () => Promise<void>
    signInWithProvider: (provider: 'google' | 'github') => Promise<AuthResult>
    updateProfile: (updates: ProfileUpdateData) => Promise<{ data: UserProfile | null; error: unknown }>
    uploadAvatar: (file: File) => Promise<{ data: string | null; error: unknown }>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(false)
    const supabase = createClient()
    const profileService = useMemo(() => new ProfileService(), [])

    const loadProfile = useCallback(async (userId: string, isNewLogin = false) => {
        setProfileLoading(true)
        const { data: existingProfile } = await profileService.getProfile(userId)

        if (!existingProfile && user?.email) {
            // Create profile if it doesn't exist
            const { data: newProfile } = await profileService.createProfile(userId, user.email)
            setProfile(newProfile)
        } else {
            setProfile(existingProfile)
            // Update login stats if this is a new login
            if (isNewLogin && existingProfile) {
                await profileService.updateLoginStats(userId)
                // Refresh profile to get updated stats
                const { data: updatedProfile } = await profileService.getProfile(userId)
                setProfile(updatedProfile)
            }
        }
        setProfileLoading(false)
    }, [profileService, user?.email])

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                loadProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                // Check if this is a sign in event to update login stats
                const isNewLogin = event === 'SIGNED_IN'
                loadProfile(session.user.id, isNewLogin)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [loadProfile, supabase.auth])

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
    }

    const signInWithProvider = async (provider: 'google' | 'github') => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        return { data, error }
    }

    const updateProfile = async (updates: ProfileUpdateData) => {
        if (!user) return { data: null, error: 'No user logged in' }

        const result = await profileService.updateProfile(user.id, updates)
        if (result.data) {
            setProfile(result.data)
        }
        return result
    }

    const uploadAvatar = async (file: File) => {
        if (!user) return { data: null, error: 'No user logged in' }

        const result = await profileService.uploadAvatar(user.id, file)
        if (result.data) {
            // Update profile with new avatar URL
            await updateProfile({ avatar_url: result.data })
        }
        return result
    }

    const refreshProfile = async () => {
        if (!user) return
        await loadProfile(user.id)
    }

    const value = {
        user,
        profile,
        loading,
        profileLoading,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        updateProfile,
        uploadAvatar,
        refreshProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}