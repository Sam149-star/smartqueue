import { supabase, isSupabaseConfigured } from './supabase'
import { mockStore, getMockUserId } from './mockEngine'
import type { Queue, Token, TokenWithQueue } from './types'

function friendly(e: { message: string }): Error {
  const m = e.message
  if (m.includes('queue_unavailable')) return new Error('This queue is closed, paused or full.')
  if (m.includes('one_active_token')) return new Error('You already have an active token in this queue.')
  if (m.includes('not_authorized')) return new Error('Only the queue owner can do that.')
  if (m.includes('provider_login_required')) return new Error('Sign in as a provider to create queues.')
  if (m.includes('cannot_cancel')) return new Error('This token can no longer be cancelled.')
  return new Error(m)
}

export async function ensureSession() {
  if (!isSupabaseConfigured()) {
    return { user: { id: getMockUserId() } }
  }
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session
  const { data: d2, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn('Anonymous sign-in failed, using fallback session', error)
    return { user: { id: getMockUserId() } }
  }
  return d2.session!
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw friendly(error)
  return data as T
}

// ---------- Customer Methods ----------
export async function listQueues(): Promise<Queue[]> {
  if (!isSupabaseConfigured()) {
    return mockStore.getQueues()
  }
  try {
    const { data, error } = await supabase.from('queues').select('*').order('created_at')
    if (error) throw error
    return data as Queue[]
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local store', err)
    return mockStore.getQueues()
  }
}

export async function getQueue(queueId: string): Promise<Queue | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.getQueue(queueId)
  }
  try {
    const { data, error } = await supabase.from('queues').select('*').eq('id', queueId).single()
    if (error) throw error
    return data as Queue
  } catch (err) {
    return mockStore.getQueue(queueId)
  }
}

export async function getToken(tokenId: string): Promise<TokenWithQueue | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.getTokenById(tokenId)
  }
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*, queues(name, prefix, location)')
      .eq('id', tokenId)
      .single()
    if (error) throw error
    return data as TokenWithQueue
  } catch {
    return mockStore.getTokenById(tokenId)
  }
}

export async function joinQueue(queueId: string, name?: string): Promise<Token> {
  if (!isSupabaseConfigured()) {
    return mockStore.joinQueue(queueId, name)
  }
  try {
    await ensureSession()
    return await rpc<Token>('join_queue', { p_queue: queueId, p_name: name ?? null })
  } catch (err) {
    console.warn('Supabase join failed, attempting local store fallback', err)
    return mockStore.joinQueue(queueId, name)
  }
}

export async function cancelToken(tokenId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return mockStore.cancelToken(tokenId)
  }
  try {
    await rpc<void>('cancel_token', { p_token: tokenId })
  } catch (err) {
    mockStore.cancelToken(tokenId)
  }
}

export async function myActiveToken(queueId?: string): Promise<TokenWithQueue | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.getMyActiveToken(queueId)
  }
  try {
    const s = await ensureSession()
    let q = supabase
      .from('tokens')
      .select('*, queues(name, prefix, location)')
      .eq('user_id', s.user.id)
      .in('status', ['waiting', 'serving'])
      .order('created_at', { ascending: false })
      .limit(1)
    if (queueId) q = q.eq('queue_id', queueId)
    const { data, error } = await q
    if (error) throw error
    return (data?.[0] as TokenWithQueue) ?? null
  } catch (err) {
    return mockStore.getMyActiveToken(queueId)
  }
}

export async function myHistory(limit = 20): Promise<TokenWithQueue[]> {
  if (!isSupabaseConfigured()) {
    return mockStore.getMyHistory(limit)
  }
  try {
    const s = await ensureSession()
    const { data, error } = await supabase
      .from('tokens')
      .select('*, queues(name, prefix, location)')
      .eq('user_id', s.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as TokenWithQueue[]) ?? []
  } catch (err) {
    return mockStore.getMyHistory(limit)
  }
}

// ---------- Provider Methods ----------
export async function createQueue(name: string, location?: string, prefix = 'A', capacity?: number): Promise<Queue> {
  if (!isSupabaseConfigured()) {
    return mockStore.createQueue(name, location, prefix, capacity)
  }
  try {
    return await rpc<Queue>('create_queue', {
      p_name: name,
      p_location: location ?? null,
      p_prefix: prefix,
      p_capacity: capacity ?? null,
    })
  } catch (err) {
    return mockStore.createQueue(name, location, prefix, capacity)
  }
}

export async function callNext(queueId: string): Promise<Token | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.callNext(queueId)
  }
  try {
    const t = await rpc<Token | null>('call_next', { p_queue: queueId })
    return t && t.id ? t : null
  } catch (err) {
    return mockStore.callNext(queueId)
  }
}

export async function skipCurrent(queueId: string): Promise<Token | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.skipCurrent(queueId)
  }
  try {
    const t = await rpc<Token | null>('skip_current', { p_queue: queueId })
    return t && t.id ? t : null
  } catch (err) {
    return mockStore.skipCurrent(queueId)
  }
}

export async function issueWalkin(queueId: string, name?: string): Promise<Token> {
  if (!isSupabaseConfigured()) {
    return mockStore.issueWalkin(queueId, name)
  }
  try {
    return await rpc<Token>('issue_walkin', { p_queue: queueId, p_name: name ?? null })
  } catch (err) {
    return mockStore.issueWalkin(queueId, name)
  }
}

export async function setQueueStatus(queueId: string, status: 'open' | 'paused' | 'closed'): Promise<void> {
  if (!isSupabaseConfigured()) {
    return mockStore.setQueueStatus(queueId, status)
  }
  try {
    await rpc<void>('set_queue_status', { p_queue: queueId, p_status: status })
  } catch (err) {
    mockStore.setQueueStatus(queueId, status)
  }
}

export async function simulateCrowd(queueId: string, n = 20): Promise<number> {
  if (!isSupabaseConfigured()) {
    return mockStore.simulateCrowd(queueId, n)
  }
  try {
    return await rpc<number>('simulate_crowd', { p_queue: queueId, p_n: n })
  } catch (err) {
    return mockStore.simulateCrowd(queueId, n)
  }
}

export async function resetQueue(queueId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return mockStore.resetQueue(queueId)
  }
  try {
    await rpc<void>('reset_queue', { p_queue: queueId })
  } catch (err) {
    mockStore.resetQueue(queueId)
  }
}

export async function signInProvider(email: string, password: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpProvider(email: string, password: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}
