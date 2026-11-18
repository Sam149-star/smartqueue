import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  age?: number
  isSenior?: boolean
  disability?: string
  disease?: string
  isAnonymous: boolean
  role: 'customer' | 'provider'
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, pass: string) => Promise<void>
  signUp: (data: {
    email: string
    pass: string
    fullName: string
    phone?: string
    avatarUrl?: string
    age?: number
    disability?: string
    disease?: string
  }) => Promise<void>
  sendEmailOtp: (email: string) => Promise<{ simulatedOtp?: string }>
  sendPhoneOtp: (phone: string) => Promise<{ simulatedOtp?: string }>
  verifyOtp: (target: string, otp: string, type: 'email' | 'phone') => Promise<void>
  signInWithGoogle: () => Promise<void>
  quickDemoLogin: (role: 'customer' | 'provider' | 'senior') => void
  signOut: () => Promise<void>
  updateProfile: (updated: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_USER_KEY = 'smartqueue_auth_user'
const PENDING_OTP_KEY = 'smartqueue_pending_otp'

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

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        const meta = u.user_metadata || {}
        const ageNum = meta.age ? Number(meta.age) : undefined
        const profile: UserProfile = {
          id: u.id,
          email: u.email || 'customer@smartqueue.io',
          fullName: meta.full_name || u.email?.split('@')[0] || 'Registered User',
          phone: meta.phone || u.phone || '',
          avatarUrl: meta.avatar_url || '',
          age: ageNum,
          isSenior: ageNum !== undefined ? ageNum >= 60 : false,
          disability: meta.disability || 'None',
          disease: meta.disease || 'None',
          isAnonymous: u.is_anonymous || false,
          role: meta.role || (u.email?.includes('provider') ? 'provider' : 'customer')
        }
        setUser(profile)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const meta = u.user_metadata || {}
        const ageNum = meta.age ? Number(meta.age) : undefined
        const profile: UserProfile = {
          id: u.id,
          email: u.email || '',
          fullName: meta.full_name || u.email?.split('@')[0] || 'User',
          phone: meta.phone || u.phone || '',
          avatarUrl: meta.avatar_url || '',
          age: ageNum,
          isSenior: ageNum !== undefined ? ageNum >= 60 : false,
          disability: meta.disability || 'None',
          disease: meta.disease || 'None',
          isAnonymous: u.is_anonymous || false,
          role: meta.role || (u.email?.includes('provider') ? 'provider' : 'customer')
        }
        setUser(profile)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      } else {
        setUser(null)
        localStorage.removeItem(STORAGE_USER_KEY)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: email.split('@')[0].replace('.', ' '),
        phone: '+91 98765 43210',
        age: 32,
        isSenior: false,
        disability: 'None',
        disease: 'None',
        isAnonymous: false,
        role: email.includes('provider') ? 'provider' : 'customer'
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw error
    if (data.user) {
      const meta = data.user.user_metadata || {}
      const ageNum = meta.age ? Number(meta.age) : undefined
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: meta.full_name || email.split('@')[0],
        phone: meta.phone || data.user.phone,
        avatarUrl: meta.avatar_url,
        age: ageNum,
        isSenior: ageNum !== undefined ? ageNum >= 60 : false,
        disability: meta.disability || 'None',
        disease: meta.disease || 'None',
        isAnonymous: false,
        role: meta.role || (email.includes('provider') ? 'provider' : 'customer')
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
    }
  }

  const signUp = async (data: {
    email: string
    pass: string
    fullName: string
    phone?: string
    avatarUrl?: string
    age?: number
    disability?: string
    disease?: string
  }) => {
    const isSenior = data.age !== undefined && data.age >= 60

    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        age: data.age,
        isSenior,
        disability: data.disability || 'None',
        disease: data.disease || 'None',
        isAnonymous: false,
        role: 'customer'
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      return
    }

    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.pass,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone || '',
          avatar_url: data.avatarUrl || '',
          age: data.age,
          is_senior: isSenior,
          disability: data.disability || 'None',
          disease: data.disease || 'None',
          role: 'customer'
        }
      }
    })
    if (error) throw error
    if (res.user) {
      const profile: UserProfile = {
        id: res.user.id,
        email: res.user.email || data.email,
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        age: data.age,
        isSenior,
        disability: data.disability || 'None',
        disease: data.disease || 'None',
        isAnonymous: false,
        role: 'customer'
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
    }
  }

  // 100% Free Real Email OTP (Supabase native)
  const sendEmailOtp = async (email: string) => {
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify({ target: email.trim(), otp: genOtp, type: 'email' }))

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true }
      })
      if (error) {
        console.warn('Supabase email OTP error, using backup code:', error.message)
        return { simulatedOtp: genOtp }
      }
      return {} // Real code sent to user's email!
    }

    return { simulatedOtp: genOtp }
  }

  // Phone SMS OTP (via Twilio or simulated)
  const sendPhoneOtp = async (phone: string) => {
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : '+91' + phone.trim().replace(/^0+/, '')
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify({ target: formattedPhone, otp: genOtp, type: 'phone' }))

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signInWithOtp({ phone: formattedPhone })
      } catch (e) {
        console.warn('Supabase SMS gateway not configured, falling back to simulated OTP:', e)
      }
    }

    return { simulatedOtp: genOtp }
  }

  const verifyOtp = async (target: string, otp: string, type: 'email' | 'phone') => {
    const formatted = type === 'phone'
      ? (target.trim().startsWith('+') ? target.trim() : '+91' + target.trim().replace(/^0+/, ''))
      : target.trim()

    const stored = sessionStorage.getItem(PENDING_OTP_KEY)
    let valid = false

    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.otp === otp.trim() || otp.trim() === '123456') {
        valid = true
      }
    } else if (otp.trim() === '123456') {
      valid = true
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.verifyOtp(
          type === 'email'
            ? { email: formatted, token: otp.trim(), type: 'email' }
            : { phone: formatted, token: otp.trim(), type: 'sms' }
        )
        if (!error && data.user) {
          valid = true
        }
      } catch {
        // Fallback to simulated validation
      }
    }

    if (!valid) {
      throw new Error('Invalid OTP code. Please check the code or use demo code 123456.')
    }

    // Successfully verified! Create / login profile
    const profile: UserProfile = {
      id: 'user_otp_' + Math.random().toString(36).substring(2, 9),
      email: type === 'email' ? formatted : `${formatted.replace(/\D/g, '')}@phone.smartqueue.io`,
      fullName: type === 'email' ? formatted.split('@')[0] : `Customer (${formatted.slice(-4)})`,
      phone: type === 'phone' ? formatted : '',
      age: 35,
      isSenior: false,
      disability: 'None',
      disease: 'None',
      isAnonymous: false,
      role: 'customer'
    }
    setUser(profile)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
    sessionStorage.removeItem(PENDING_OTP_KEY)
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: 'google_user_' + Math.random().toString(36).substring(2, 9),
        email: 'alex.verma@gmail.com',
        fullName: 'Alex Verma (Google)',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        phone: '+91 98990 12345',
        age: 29,
        isSenior: false,
        disability: 'None',
        disease: 'None',
        isAnonymous: false,
        role: 'customer'
      }
      setUser(profile)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const quickDemoLogin = (role: 'customer' | 'provider' | 'senior') => {
    let profile: UserProfile
    if (role === 'senior') {
      profile = {
        id: 'demo-senior-789',
        email: 'kamala.devi@senior.demo',
        fullName: 'Smt. Kamala Devi',
        phone: '+91 98450 67890',
        age: 72,
        isSenior: true,
        disability: 'Mobility / Walking Stick',
        disease: 'Hypertension & Arthritis',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        isAnonymous: false,
        role: 'customer'
      }
    } else if (role === 'provider') {
      profile = {
        id: 'demo-provider-456',
        email: 'dr.anita@citycare.org',
        fullName: 'Dr. Anita Roy',
        phone: '+91 98111 22233',
        age: 44,
        isSenior: false,
        disability: 'None',
        disease: 'None',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
        isAnonymous: false,
        role: 'provider'
      }
    } else {
      profile = {
        id: 'demo-customer-123',
        email: 'rahul.sharma@demo.com',
        fullName: 'Rahul Sharma',
        phone: '+91 98200 12345',
        age: 31,
        isSenior: false,
        disability: 'None',
        disease: 'Asthma (Mild)',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        isAnonymous: false,
        role: 'customer'
      }
    }
    setUser(profile)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile))
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut().catch(() => {})
    }
    setUser(null)
    localStorage.removeItem(STORAGE_USER_KEY)
  }

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return
    const merged = { ...user, ...updated }
    if (merged.age !== undefined) {
      merged.isSenior = merged.age >= 60
    }
    setUser(merged)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        sendEmailOtp,
        sendPhoneOtp,
        verifyOtp,
        signInWithGoogle,
        quickDemoLogin,
        signOut,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
