import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore } from '../lib/mockEngine'
import type { Token } from '../lib/types'

export function useProviderTokens(queueId: string | undefined) {
  const [tokens, setTokens] = useState<Token[]>([])

  const load = useCallback(() => {
    if (!queueId) return
    if (!isSupabaseConfigured()) {
      const all = mockStore.getTokens(queueId)
      setTokens(all.filter(t => t.status === 'waiting' || t.status === 'serving').sort((a, b) => a.number - b.number))
      return
    }

    supabase
      .from('tokens')
      .select('*')
      .eq('queue_id', queueId)
      .in('status', ['waiting', 'serving'])
      .order('number')
      .then(({ data, error }) => {
        if (!error && data) {
          setTokens(data as Token[])
        } else {
          const all = mockStore.getTokens(queueId)
          setTokens(all.filter(t => t.status === 'waiting' || t.status === 'serving').sort((a, b) => a.number - b.number))
        }
      })
  }, [queueId])

  useEffect(() => {
    if (!queueId) return

    if (!isSupabaseConfigured()) {
      load()
      const unsub = mockStore.subscribe(() => {
        load()
      })
      return () => unsub()
    }

    let t: ReturnType<typeof setTimeout>
    const debounced = () => {
      clearTimeout(t)
      t = setTimeout(load, 150)
    }

    const ch = supabase
      .channel(`provider:${queueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tokens', filter: `queue_id=eq.${queueId}` },
        debounced
      )
      .subscribe()

    load()
    return () => {
      clearTimeout(t)
      supabase.removeChannel(ch)
    }
  }, [queueId, load])

  return tokens
}
