import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export async function enableNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  try {
    const res = await Notification.requestPermission()
    return res === 'granted'
  } catch {
    return false
  }
}

export function playChime(type: 'turn' | 'near' | 'join' = 'turn') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    if (type === 'turn') {
      // Pleasant double chime: 659.25Hz (E5) -> 880Hz (A5)
      const now = ctx.currentTime
      const o1 = ctx.createOscillator()
      const g1 = ctx.createGain()
      o1.type = 'sine'
      o1.frequency.setValueAtTime(659.25, now)
      g1.gain.setValueAtTime(0.12, now)
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      o1.connect(g1)
      g1.connect(ctx.destination)
      o1.start(now)
      o1.stop(now + 0.35)

      const o2 = ctx.createOscillator()
      const g2 = ctx.createGain()
      o2.type = 'sine'
      o2.frequency.setValueAtTime(880, now + 0.2)
      g2.gain.setValueAtTime(0.15, now + 0.2)
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
      o2.connect(g2)
      g2.connect(ctx.destination)
      o2.start(now + 0.2)
      o2.stop(now + 0.7)
    } else if (type === 'near') {
      const now = ctx.currentTime
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(587.33, now) // D5
      g.gain.setValueAtTime(0.1, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(now)
      o.stop(now + 0.3)
    } else {
      const now = ctx.currentTime
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(523.25, now) // C5
      g.gain.setValueAtTime(0.08, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(now)
      o.stop(now + 0.25)
    }
  } catch {
    // Autoplay policy or unsupported
  }
}

export function fireCelebration() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb4a6', '#ee654c', '#b3ccbd', '#f6c343']
    })
  } catch {
    // Ignore
  }
}

export function fire(title: string, body: string, isNow = false) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/logo-icon.png',
        badge: '/logo-icon.png',
      })
    } catch {
      // Ignored
    }
  }

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(isNow ? [200, 100, 200, 100, 300] : [150, 100, 150])
    } catch {
      // Ignored
    }
  }

  playChime(isNow ? 'turn' : 'near')
  if (isNow) {
    fireCelebration()
  }
}

export function useNotifyOnTurn(opts: {
  enabled: boolean
  tokenId?: string
  ahead: number
  threshold: number
  isNow: boolean
  label: string
}) {
  const sent = useRef<{ near?: boolean; now?: boolean; id?: string }>({})

  useEffect(() => {
    if (sent.current.id !== opts.tokenId) {
      sent.current = { id: opts.tokenId }
    }
    if (!opts.enabled || !opts.tokenId) return

    if (opts.isNow && !sent.current.now) {
      sent.current.now = true
      fire(`It's your turn — ${opts.label}!`, 'Please proceed to the service counter immediately.', true)
    } else if (!opts.isNow && opts.ahead <= opts.threshold && opts.ahead > 0 && !sent.current.near) {
      sent.current.near = true
      fire('Almost your turn!', `Only ${opts.ahead} person(s) ahead of you (${opts.label}). Get ready.`, false)
    }
  }, [opts.enabled, opts.tokenId, opts.ahead, opts.threshold, opts.isNow, opts.label])
}
