import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ensureSession, myActiveToken } from '../lib/api'
import { mockStore } from '../lib/mockEngine'
import type { TokenWithQueue } from '../lib/types'

export function useMyToken(queueId?: string) {
  const [token, setToken] = useState<TokenWithQueue | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const t = await myActiveToken(queueId)
      setToken(t)
    } catch (e) {
      console.warn('Error fetching active token', e)
    } finally {
      setLoading(false)
    }
  }, [queueId])

  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | undefined
    let cancelled = false

    if (!isSupabaseConfigured()) {
      refresh()
      const unsub = mockStore.subscribe(() => {
        refresh()
      })
      return () => {
        unsub()
      }
    }

    ;(async () => {
      try {
        const s = await ensureSession()
        if (cancelled) return
        await refresh()
        ch = supabase
          .channel(`my-token:${s.user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tokens', filter: `user_id=eq.${s.user.id}` },
            () => refresh()
          )
          .subscribe()
      } catch (err) {
        console.warn(err)
      }
    })()

    return () => {
      cancelled = true
      if (ch) supabase.removeChannel(ch)
    }
  }, [refresh])

  return { token, loading, refresh }
}
