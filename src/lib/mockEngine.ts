import type { Queue, Token, TokenWithQueue } from './types'

const BROADCAST_KEY = 'smartqueue_channel'
const STORAGE_QUEUES_KEY = 'smartqueue_mock_queues'
const STORAGE_TOKENS_KEY = 'smartqueue_mock_tokens'
const STORAGE_USER_ID_KEY = 'smartqueue_mock_user_id'

export function getMockUserId(): string {
  let uid = localStorage.getItem(STORAGE_USER_ID_KEY)
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem(STORAGE_USER_ID_KEY, uid)
  }
  return uid
}

const DEFAULT_QUEUES: Queue[] = [
  {
    id: 'demo-clinic-1',
    owner_id: 'provider-admin',
    name: 'City Care Clinic OPD',
    location: 'Tower A · Desk 04',
    prefix: 'C',
    status: 'open',
    last_issued: 8,
    now_serving: 3,
    void_numbers: [5],
    avg_service_secs: 180,
    serving_since: new Date(Date.now() - 45000).toISOString(),
    max_capacity: 100,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-bank-2',
    owner_id: 'provider-admin',
    name: 'Metro First Bank Express',
    location: 'Counter 2 · Cash & Forex',
    prefix: 'B',
    status: 'open',
    last_issued: 14,
    now_serving: 11,
    void_numbers: [],
    avg_service_secs: 120,
    serving_since: new Date(Date.now() - 60000).toISOString(),
    max_capacity: 50,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-food-3',
    owner_id: 'provider-admin',
    name: 'Campus Food Court & Cafe',
    location: 'Pickup Counter 1',
    prefix: 'F',
    status: 'open',
    last_issued: 25,
    now_serving: 21,
    void_numbers: [23],
    avg_service_secs: 90,
    serving_since: new Date(Date.now() - 30000).toISOString(),
    max_capacity: 200,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
]

const DEFAULT_TOKENS: Token[] = [
  {
    id: 't-1',
    queue_id: 'demo-clinic-1',
    user_id: null,
    number: 3,
    display_name: 'Elena Vance',
    status: 'serving',
    ahead_at_join: 0,
    created_at: new Date(Date.now() - 120000).toISOString(),
    called_at: new Date(Date.now() - 45000).toISOString(),
    completed_at: null,
  },
  {
    id: 't-2',
    queue_id: 'demo-clinic-1',
    user_id: null,
    number: 4,
    display_name: 'Rahul Sharma (Age 31)',
    status: 'waiting',
    ahead_at_join: 1,
    created_at: new Date(Date.now() - 100000).toISOString(),
    called_at: null,
    completed_at: null,
  },
  {
    id: 't-3',
    queue_id: 'demo-clinic-1',
    user_id: null,
    number: 6,
    display_name: 'Smt. Kamala Devi • Age 72 • ⭐ Senior Citizen • ♿ Wheelchair • Booked by Rahul [Elderly Parent]',
    status: 'waiting',
    ahead_at_join: 2,
    created_at: new Date(Date.now() - 80000).toISOString(),
    called_at: null,
    completed_at: null,
  },
  {
    id: 't-4',
    queue_id: 'demo-clinic-1',
    user_id: null,
    number: 7,
    display_name: 'David Miller',
    status: 'waiting',
    ahead_at_join: 3,
    created_at: new Date(Date.now() - 60000).toISOString(),
    called_at: null,
    completed_at: null,
  },
  {
    id: 't-5',
    queue_id: 'demo-clinic-1',
    user_id: null,
    number: 8,
    display_name: 'Priya Patel',
    status: 'waiting',
    ahead_at_join: 4,
    created_at: new Date(Date.now() - 40000).toISOString(),
    called_at: null,
    completed_at: null,
  }
]

class MockQueueStore {
  private queues: Queue[]
  private tokens: Token[]
  private channel: BroadcastChannel | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.queues = this.loadQueues()
    this.tokens = this.loadTokens()

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_KEY)
        this.channel.onmessage = () => {
          this.queues = this.loadQueues()
          this.tokens = this.loadTokens()
          this.notify()
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported', e)
      }
    }
  }

  private loadQueues(): Queue[] {
    try {
      const data = localStorage.getItem(STORAGE_QUEUES_KEY)
      return data ? JSON.parse(data) : [...DEFAULT_QUEUES]
    } catch {
      return [...DEFAULT_QUEUES]
    }
  }

  private loadTokens(): Token[] {
    try {
      const data = localStorage.getItem(STORAGE_TOKENS_KEY)
      return data ? JSON.parse(data) : [...DEFAULT_TOKENS]
    } catch {
      return [...DEFAULT_TOKENS]
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_QUEUES_KEY, JSON.stringify(this.queues))
      localStorage.setItem(STORAGE_TOKENS_KEY, JSON.stringify(this.tokens))
      this.channel?.postMessage({ time: Date.now() })
      this.notify()
    } catch (e) {
      console.error(e)
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb())
  }

  getQueues(): Queue[] {
    return [...this.queues]
  }

  getQueue(id: string): Queue | null {
    return this.queues.find(q => q.id === id) || null
  }

  getTokens(queueId: string): Token[] {
    return this.tokens.filter(t => t.queue_id === queueId)
  }

  getTokenById(tokenId: string): TokenWithQueue | null {
    const t = this.tokens.find(x => x.id === tokenId)
    if (!t) return null
    const q = this.getQueue(t.queue_id)
    return {
      ...t,
      queues: {
        name: q?.name || 'Virtual Queue',
        prefix: q?.prefix || 'A',
        location: q?.location || null
      }
    }
  }

  getMyActiveToken(queueId?: string): TokenWithQueue | null {
    const userId = getMockUserId()
    const active = this.tokens.find(
      t => (t.user_id === userId || (t.user_id && t.user_id.startsWith('user_'))) &&
        (t.status === 'waiting' || t.status === 'serving') &&
        (!queueId || t.queue_id === queueId)
    )
    if (!active) return null
    const q = this.getQueue(active.queue_id)
    return {
      ...active,
      queues: {
        name: q?.name || 'Virtual Queue',
        prefix: q?.prefix || 'A',
        location: q?.location || null
      }
    }
  }

  getMyHistory(limit = 20): TokenWithQueue[] {
    const userId = getMockUserId()
    return this.tokens
      .filter(t => t.user_id === userId)
      .slice(-limit)
      .reverse()
      .map(t => {
        const q = this.getQueue(t.queue_id)
        return {
          ...t,
          queues: {
            name: q?.name || 'Queue',
            prefix: q?.prefix || 'A',
            location: q?.location || null
          }
        }
      })
  }

  joinQueue(queueId: string, name?: string): Token {
    const q = this.getQueue(queueId)
    if (!q || q.status !== 'open') throw new Error('This queue is closed, paused or full.')

    const userId = getMockUserId()
    const existing = this.tokens.find(
      t => t.queue_id === queueId && t.user_id === userId && (t.status === 'waiting' || t.status === 'serving')
    )
    if (existing) throw new Error('You already have an active token in this queue.')

    q.last_issued += 1
    const vAhead = this.tokens.filter(t => t.queue_id === queueId && (t.status === 'waiting' || t.status === 'serving')).length

    const token: Token = {
      id: 'token_' + Math.random().toString(36).substring(2, 9),
      queue_id: queueId,
      user_id: userId,
      number: q.last_issued,
      display_name: name || 'Guest ' + q.last_issued,
      status: 'waiting',
      ahead_at_join: vAhead,
      created_at: new Date().toISOString(),
      called_at: null,
      completed_at: null,
    }
    this.tokens.push(token)
    this.persist()
    return token
  }

  cancelToken(tokenId: string): void {
    const t = this.tokens.find(x => x.id === tokenId)
    if (!t || t.status !== 'waiting') throw new Error('This token can no longer be cancelled.')
    t.status = 'cancelled'
    t.completed_at = new Date().toISOString()
    const q = this.getQueue(t.queue_id)
    if (q) {
      q.void_numbers = [...(q.void_numbers || []), t.number]
    }
    this.persist()
  }

  callNext(queueId: string): Token | null {
    const q = this.getQueue(queueId)
    if (!q) throw new Error('Queue not found')

    // Mark current serving as done
    const current = this.tokens.find(t => t.queue_id === queueId && t.status === 'serving')
    if (current) {
      current.status = 'done'
      current.completed_at = new Date().toISOString()
      if (current.called_at) {
        const elapsed = (Date.now() - new Date(current.called_at).getTime()) / 1000
        q.avg_service_secs = Math.max(30, Math.round(0.7 * q.avg_service_secs + 0.3 * elapsed))
      }
    }

    // Find next waiting
    const nextToken = this.tokens
      .filter(t => t.queue_id === queueId && t.status === 'waiting')
      .sort((a, b) => a.number - b.number)[0]

    if (nextToken) {
      nextToken.status = 'serving'
      nextToken.called_at = new Date().toISOString()
      q.now_serving = nextToken.number
      q.serving_since = new Date().toISOString()
    } else {
      q.serving_since = null
    }

    this.persist()
    return nextToken || null
  }

  skipCurrent(queueId: string): Token | null {
    const current = this.tokens.find(t => t.queue_id === queueId && t.status === 'serving')
    if (current) {
      current.status = 'skipped'
      current.completed_at = new Date().toISOString()
    }
    return this.callNext(queueId)
  }

  issueWalkin(queueId: string, name?: string): Token {
    const q = this.getQueue(queueId)
    if (!q) throw new Error('Queue not found')
    q.last_issued += 1
    const vAhead = this.tokens.filter(t => t.queue_id === queueId && (t.status === 'waiting' || t.status === 'serving')).length

    const token: Token = {
      id: 'token_walkin_' + Math.random().toString(36).substring(2, 9),
      queue_id: queueId,
      user_id: null,
      number: q.last_issued,
      display_name: name || `Walk-in #${q.last_issued}`,
      status: 'waiting',
      ahead_at_join: vAhead,
      created_at: new Date().toISOString(),
      called_at: null,
      completed_at: null,
    }
    this.tokens.push(token)
    this.persist()
    return token
  }

  setQueueStatus(queueId: string, status: 'open' | 'paused' | 'closed'): void {
    const q = this.getQueue(queueId)
    if (q) {
      q.status = status
      this.persist()
    }
  }

  simulateCrowd(queueId: string, n = 10): number {
    const q = this.getQueue(queueId)
    if (!q) throw new Error('Queue not found')

    const startNum = q.last_issued + 1
    q.last_issued += n
    const vAhead = this.tokens.filter(t => t.queue_id === queueId && (t.status === 'waiting' || t.status === 'serving')).length

    const names = ['Sam', 'Elena', 'Kavita', 'Leo', 'Maya', 'Chen', 'Zoe', 'Lucas', 'Tara', 'Arjun', 'Siddharth', 'Fatima', 'Oliver', 'Mia', 'Noah', 'Amara', 'Jay', 'Diya', 'Oscar', 'Emma']

    for (let i = 0; i < n; i++) {
      const num = startNum + i
      const name = names[i % names.length] + ' ' + (num % 99)
      this.tokens.push({
        id: 'sim_' + Math.random().toString(36).substring(2, 9),
        queue_id: queueId,
        user_id: null,
        number: num,
        display_name: name,
        status: 'waiting',
        ahead_at_join: vAhead + i,
        created_at: new Date(Date.now() - (n - i) * 15000).toISOString(),
        called_at: null,
        completed_at: null,
      })
    }
    this.persist()
    return n
  }

  resetQueue(queueId: string): void {
    const q = this.getQueue(queueId)
    if (q) {
      this.tokens = this.tokens.filter(t => t.queue_id !== queueId)
      q.last_issued = 0
      q.now_serving = 0
      q.void_numbers = []
      q.serving_since = null
      q.avg_service_secs = 180
      q.status = 'open'
      this.persist()
    }
  }

  createQueue(name: string, location?: string, prefix = 'A', capacity?: number): Queue {
    const q: Queue = {
      id: 'q_' + Math.random().toString(36).substring(2, 9),
      owner_id: 'provider-admin',
      name,
      location: location || null,
      prefix: prefix.toUpperCase().slice(0, 2),
      status: 'open',
      last_issued: 0,
      now_serving: 0,
      void_numbers: [],
      avg_service_secs: 180,
      serving_since: null,
      max_capacity: capacity || null,
      created_at: new Date().toISOString(),
    }
    this.queues.push(q)
    this.persist()
    return q
  }
}

export const mockStore = new MockQueueStore()
