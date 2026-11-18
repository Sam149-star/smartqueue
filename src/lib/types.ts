export type QueueStatus = 'open' | 'paused' | 'closed'
export type TokenStatus = 'waiting' | 'serving' | 'done' | 'skipped' | 'cancelled'

export interface Queue {
  id: string
  owner_id: string
  name: string
  location: string | null
  prefix: string
  status: QueueStatus
  last_issued: number
  now_serving: number
  void_numbers: number[]
  avg_service_secs: number
  serving_since: string | null
  max_capacity: number | null
  created_at: string
}

export interface Token {
  id: string
  queue_id: string
  user_id: string | null
  number: number
  display_name: string | null
  status: TokenStatus
  ahead_at_join: number
  created_at: string
  called_at: string | null
  completed_at: string | null
}

export type TokenWithQueue = Token & {
  queues: Pick<Queue, 'name' | 'prefix' | 'location'>
}

export type TurnState = 'waiting' | 'near' | 'now' | 'finished'
