import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('smartqueue_supabase_url') : null
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('smartqueue_supabase_key') : null

export const supabaseUrl = storedUrl || envUrl || ''
export const supabaseKey = storedKey || envKey || ''

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('YOUR-PROJECT-REF') &&
    !supabaseKey.includes('YOUR-PUBLISHABLE')
  )
}

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://dummy.supabase.co',
  isSupabaseConfigured() ? supabaseKey : 'dummy-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('smartqueue_supabase_url', url.trim())
    localStorage.setItem('smartqueue_supabase_key', key.trim())
    window.location.reload()
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smartqueue_supabase_url')
    localStorage.removeItem('smartqueue_supabase_key')
    window.location.reload()
  }
}
