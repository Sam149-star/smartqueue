import type { Queue, Token, TurnState } from './types'

/** People ahead of `my` (the one being served counts as 1). Pure + instant: no network. */
export const aheadOf = (
  my: number,
  q: Pick<Queue, 'now_serving' | 'void_numbers'>
) => {
  const voidArr = Array.isArray(q.void_numbers) ? q.void_numbers : []
  return Math.max(
    0,
    my - q.now_serving - voidArr.filter(n => n > q.now_serving && n < my).length
  )
}

/** Seconds until my turn: remaining time of the current service + full slots for the rest. */
export const etaSecs = (
  ahead: number,
  q: Pick<Queue, 'avg_service_secs' | 'serving_since'>,
  nowMs: number = Date.now()
) => {
  if (ahead === 0) return 0
  const avg = q.avg_service_secs || 300
  const elapsed = q.serving_since ? (nowMs - +new Date(q.serving_since)) / 1000 : 0
  return Math.round(Math.max(0, avg - elapsed) + (ahead - 1) * avg)
}

export const fmtEta = (secs: number) => {
  if (secs <= 0) return 'Now'
  if (secs < 60) return '< 1 min'
  const m = Math.round(secs / 60)
  return m < 60 ? `~${m} min` : `~${Math.floor(m / 60)}h ${m % 60}m`
}

/** A-042 style label */
export const label = (prefix: string, n: number) => `${prefix || 'A'}-${String(n).padStart(3, '0')}`

/** 0..1 progress for the progress bar (matches the "89% match" bar in design). */
export const progressOf = (ahead: number, aheadAtJoin: number) =>
  aheadAtJoin <= 0 ? (ahead === 0 ? 1 : 0) : Math.min(1, Math.max(0, 1 - ahead / aheadAtJoin))

/**
 * Discrete states (not a continuous value) so running animations never jump.
 */
export const turnState = (t: Pick<Token, 'status'> | null, ahead: number, notifyAt = 3): TurnState => {
  if (!t) return 'waiting'
  if (t.status === 'done' || t.status === 'skipped' || t.status === 'cancelled') return 'finished'
  if (t.status === 'serving' || ahead === 0) return 'now'
  return ahead <= notifyAt ? 'near' : 'waiting'
}
