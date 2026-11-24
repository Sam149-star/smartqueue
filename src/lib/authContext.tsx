import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

export type UserRole = 'donor' | 'receiver' | 'verifier'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  city?: string
  roles: UserRole[]
  onboardingStep: string
  isAnonymous: boolean
}

export type AuthSheetMode = 'signin' | 'signup' | 'magic' | 'forgot'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isDonor: boolean
  isReceiver: boolean
  isVerifier: boolean
  // In-place auth gating
  authSheetOpen: boolean
  authSheetMode: AuthSheetMode
  authReason: string
  openAuthSheet: (mode?: AuthSheetMode, reason?: string, onComplete?: () => void) => void
  closeAuthSheet: () => void
  requireAuth: (action: () => void, reason?: string) => void
  // Auth operations
  signIn: (email: string, pass: string) => Promise<void>
  signUp: (data: {
    email: string
    pass: string
    fullName: string
    phone?: string
    city?: string
    roles: UserRole[]
  }) => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  setMyRoles: (roles: UserRole[]) => Promise<void>
  updateProfile: (data: { fullName?: string; city?: string; phone?: string; onboardingStep?: string }) => Promise<void>
  quickDemoLogin: (roleOrDemo: UserRole | 'both' | any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_USER_KEY = 'raktify_auth_user'
const PENDING_INTENT_KEY = 'raktify_pending_intent'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // AuthSheet state
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [authSheetMode, setAuthSheetMode] = useState<AuthSheetMode>('signup')
  const [authReason, setAuthReason] = useState<string>('')
  const pendingActionRef = useRef<(() => void) | null>(null)

  // Fetch full profile including roles and private phone from Supabase
  const loadProfile = async (sessionUser: any): Promise<UserProfile> => {
    const meta = sessionUser.user_metadata || {}
    let roles: UserRole[] = []
    let city = meta.city || ''
    let onboardingStep = 'initial'
    let phone = meta.phone || sessionUser.phone || ''

    if (isSupabaseConfigured() && !sessionUser.is_anonymous) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, roles, city, onboarding_step')
          .eq('id', sessionUser.id)
          .single()

        if (prof) {
          if (Array.isArray(prof.roles)) roles = prof.roles as UserRole[]
          if (prof.city) city = prof.city
          if (prof.onboarding_step) onboardingStep = prof.onboarding_step
        }

        const { data: contact } = await supabase
          .from('private_contacts')
          .select('phone')
          .eq('user_id', sessionUser.id)
          .single()

        if (contact?.phone) {
          phone = contact.phone
        }
      } catch (err) {
        console.warn('Could not fetch server profile, using session metadata:', err)
      }
    }

    if (roles.length === 0 && meta.roles && Array.isArray(meta.roles)) {
      roles = meta.roles as UserRole[]
    }

    return {
      id: sessionUser.id,
      email: sessionUser.email || (sessionUser.is_anonymous ? 'anonymous@raktify.org' : ''),
      fullName: meta.full_name || sessionUser.email?.split('@')[0] || (sessionUser.is_anonymous ? 'Guest User' : 'User'),
      phone,
      city,
      roles,
      onboardingStep,
      isAnonymous: sessionUser.is_anonymous || false
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const prof = await loadProfile(data.session.user)
        setUser(prof)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(prof))
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const prof = await loadProfile(session.user)
        setUser(prof)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(prof))

        // Check if there was an interrupted action to resume
        if (pendingActionRef.current) {
          const action = pendingActionRef.current
          pendingActionRef.current = null
          sessionStorage.removeItem(PENDING_INTENT_KEY)
          setTimeout(() => {
            try {
              action()
            } catch (err) {
              console.error('Failed to resume pending action:', err)
            }
          }, 150)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem(STORAGE_USER_KEY)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const executePendingAction = () => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current
      pendingActionRef.current = null
      sessionStorage.removeItem(PENDING_INTENT_KEY)
      setTimeout(() => {
        try {
          action()
        } catch (err) {
          console.error('Failed to resume pending action:', err)
        }
      }, 150)
    }
  }

  const openAuthSheet = useCallback((
    mode: AuthSheetMode = 'signin',
    reason: string = '',
    onComplete?: () => void
  ) => {
    setAuthSheetMode(mode)
    setAuthReason(reason)
    if (onComplete) {
      pendingActionRef.current = onComplete
      sessionStorage.setItem(PENDING_INTENT_KEY, 'active')
    }
    setAuthSheetOpen(true)
  }, [])

  const closeAuthSheet = useCallback(() => {
    setAuthSheetOpen(false)
    setAuthReason('')
  }, [])

  const requireAuth = useCallback((action: () => void, reason: string = 'Please sign in to continue') => {
    if (user && !user.isAnonymous) {
      action()
    } else {
      openAuthSheet('signin', reason, action)
    }
  }, [user, openAuthSheet])

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      const demoRoles: UserRole[] = email.includes('verifier') ? ['verifier'] : email.includes('donor') ? ['donor'] : ['receiver']
      const profile: UserProfile = {
        id: 'mock_' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: email.split('@')[0].replace('.', ' '),
        phone: '+91 98765 43210',
        city: 'Mumbai',
        roles: demoRoles,
        onboardingStep: 'complete',
        isAnonymous: false
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      closeAuthSheet()
      executePendingAction()
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw error
    if (data.user) {
      const prof = await loadProfile(data.user)
      setUser(prof)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(prof))
      closeAuthSheet()
      executePendingAction()
    }
  }

  const signUp = async (data: {
    email: string
    pass: string
    fullName: string
    phone?: string
    city?: string
    roles: UserRole[]
  }) => {
    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: 'mock_' + Math.random().toString(36).substring(2, 9),
        email: data.email,
        fullName: data.fullName,
        phone: data.phone || '',
        city: data.city || 'Delhi',
        roles: data.roles.length > 0 ? data.roles : ['donor'],
        onboardingStep: 'initial',
        isAnonymous: false
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      closeAuthSheet()
      executePendingAction()
      return
    }

    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.pass,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone || '',
          city: data.city || '',
          roles: data.roles
        }
      }
    })

    if (error) throw error

    if (res.user) {
      // Set roles using RPC set_my_roles
      if (data.roles.length > 0) {
        try {
          await supabase.rpc('set_my_roles', { p_roles: data.roles })
        } catch (rpcErr) {
          console.warn('set_my_roles notice:', rpcErr)
        }
      }

      const prof = await loadProfile(res.user)
      setUser(prof)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(prof))
      closeAuthSheet()
      executePendingAction()
    }
  }

  const sendMagicLink = async (email: string) => {
    if (!isSupabaseConfigured()) {
      // Demo fallback: simulate instant sign in
      await signIn(email, 'demo-pass')
      return
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) throw error
  }

  const signInAnonymously = async () => {
    if (!isSupabaseConfigured()) {
      const guest: UserProfile = {
        id: 'anon_' + Math.random().toString(36).substring(2, 9),
        email: 'guest@raktify.org',
        fullName: 'Family Guest',
        roles: [],
        onboardingStep: 'initial',
        isAnonymous: true
      }
      setUser(guest)
      return
    }
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    if (data.user) {
      const prof = await loadProfile(data.user)
      setUser(prof)
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem(STORAGE_USER_KEY)
    sessionStorage.removeItem(PENDING_INTENT_KEY)
  }

  const setMyRoles = async (roles: UserRole[]) => {
    if (!user) return
    if (isSupabaseConfigured() && !user.isAnonymous) {
      const { data, error } = await supabase.rpc('set_my_roles', { p_roles: roles })
      if (error) throw error
      const updated = { ...user, roles: data as UserRole[] }
      setUser(updated)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated))
    } else {
      const updated = { ...user, roles }
      setUser(updated)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated))
    }
  }

  const updateProfile = async (data: {
    fullName?: string
    city?: string
    phone?: string
    onboardingStep?: string
  }) => {
    if (!user) return
    if (isSupabaseConfigured() && !user.isAnonymous) {
      const { data: prof, error } = await supabase.rpc('update_my_profile', {
        p_full_name: data.fullName || null,
        p_city: data.city || null,
        p_phone: data.phone || null,
        p_onboarding_step: data.onboardingStep || null
      })
      if (error) throw error
      const updated: UserProfile = {
        ...user,
        fullName: prof.full_name || user.fullName,
        city: prof.city || user.city,
        phone: data.phone || user.phone,
        onboardingStep: prof.onboarding_step || user.onboardingStep
      }
      setUser(updated)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated))
    } else {
      const updated: UserProfile = {
        ...user,
        fullName: data.fullName || user.fullName,
        city: data.city || user.city,
        phone: data.phone || user.phone,
        onboardingStep: data.onboardingStep || user.onboardingStep
      }
      setUser(updated)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated))
    }
  }

  const quickDemoLogin = async (roleOrDemo: UserRole | 'both' | any) => {
    let profile: UserProfile
    if (typeof roleOrDemo === 'object' && roleOrDemo !== null && 'fullName' in roleOrDemo) {
      profile = {
        id: roleOrDemo.id || 'demo_' + Date.now(),
        email: roleOrDemo.email,
        fullName: roleOrDemo.fullName,
        phone: roleOrDemo.phone || '+91 98200 12345',
        city: roleOrDemo.city || 'Mumbai',
        roles: roleOrDemo.roles || ['donor'],
        onboardingStep: 'complete',
        isAnonymous: false
      }
    } else {
      const role = roleOrDemo as UserRole | 'both'
      const roles: UserRole[] = role === 'both' ? ['donor', 'receiver'] : [role]
      profile = {
        id: 'demo_' + (role === 'verifier' ? 'verifier' : role === 'donor' ? 'donor' : 'receiver'),
        email: `${role}@raktify.internal`,
        fullName: role === 'verifier' ? 'Dr. Priya Sen (Verifier)' : role === 'donor' ? 'Rahul Varma (O+ Donor)' : 'Aakash Sharma (Requester)',
        phone: '+91 98200 12345',
        city: 'Mumbai',
        roles,
        onboardingStep: 'complete',
        isAnonymous: false
      }
    }
    setUser(profile)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
    closeAuthSheet()
    executePendingAction()
  }

  const isDonor = !!user?.roles.includes('donor')
  const isReceiver = !!user?.roles.includes('receiver')
  const isVerifier = !!user?.roles.includes('verifier')

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDonor,
        isReceiver,
        isVerifier,
        authSheetOpen,
        authSheetMode,
        authReason,
        openAuthSheet,
        closeAuthSheet,
        requireAuth,
        signIn,
        signUp,
        sendMagicLink,
        resetPassword,
        signInAnonymously,
        signOut,
        setMyRoles,
        updateProfile,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
