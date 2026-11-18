import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore } from '../lib/mockEngine'
import type { Queue } from '../lib/types'

/**
 * Live view of ONE queue row. `live` is true while the realtime socket is SUBSCRIBED or mock connected.
 */
export function useQueue(queueId: string | undefined) {
  const [queue, setQueue] = useState<Queue | null>(null)
  const [live, setLive] = useState(false)

  const load = useCallback(() => {
    if (!queueId) return
    if (!isSupabaseConfigured()) {
      const q = mockStore.getQueue(queueId)
      setQueue(q)
      setLive(true)
      return
    }

    supabase
      .from('queues')
      .select('*')
      .eq('id', queueId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setQueue(data as Queue)
          setLive(true)
        } else {
          // fallback to mock if queue exists there
          const mq = mockStore.getQueue(queueId)
          if (mq) setQueue(mq)
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

    const ch = supabase
      .channel(`queue:${queueId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queueId}` },
        p => setQueue(p.new as Queue)
      )
      .subscribe(status => {
        setLive(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') load()
      })

    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    load()

    return () => {
      supabase.removeChannel(ch)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [queueId, load])

  return { queue, live }
}

/** Directory of all queues — updates live on any change. */
export function useQueues() {
  const [queues, setQueues] = useState<Queue[]>([])

  const load = useCallback(() => {
    if (!isSupabaseConfigured()) {
      setQueues(mockStore.getQueues())
      return
    }

    supabase
      .from('queues')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (!error && data) {
          setQueues(data as Queue[])
        } else {
          setQueues(mockStore.getQueues())
        }
      })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      load()
      const unsub = mockStore.subscribe(() => {
        load()
      })
      return () => unsub()
    }

    const ch = supabase
      .channel('queues:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, load)
      .subscribe()
    load()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [load])

  return queues
}
