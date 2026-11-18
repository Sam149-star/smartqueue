import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useQueue, useQueues } from '../hooks/useQueue'
import { useProviderTokens } from '../hooks/useProviderTokens'
import { useNow } from '../hooks/useNow'
import { callNext, skipCurrent, issueWalkin, setQueueStatus, simulateCrowd, resetQueue } from '../lib/api'
import { label, fmtEta } from '../lib/eta'
import { playChime } from '../hooks/useNotify'
import { JoeyAndRachelDuo } from '../components/Mascots'
import {
  FastForward,
  UserX,
  UserPlus,
  Play,
  Pause,
  RotateCcw,
  Users,
  QrCode,
  Download,
  Clock,
  HeartHandshake
} from 'lucide-react'

export const ProviderConsoleView: React.FC = () => {
  const { queueId: paramQueueId } = useParams<{ queueId?: string }>()
  const navigate = useNavigate()
  const allQueues = useQueues()

  const activeQueueId = paramQueueId || allQueues[0]?.id || 'demo-clinic-1'
  const { queue } = useQueue(activeQueueId)
  const tokens = useProviderTokens(activeQueueId)
  const now = useNow(1000)

  const [walkinName, setWalkinName] = useState('')
  const [showWalkinModal, setShowWalkinModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const servingToken = tokens.find(t => t.status === 'serving')
  const waitingTokens = tokens.filter(t => t.status === 'waiting')

  const elapsedSecs = servingToken?.called_at
    ? Math.max(0, Math.floor((now - new Date(servingToken.called_at).getTime()) / 1000))
    : 0

  const fmtElapsed = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault()
        handleCallNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeQueueId])

  const handleCallNext = async () => {
    setActionLoading('next')
    try {
      await callNext(activeQueueId)
      playChime('turn')
    } catch (err: unknown) {
      alert((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSkip = async () => {
    if (confirm('Mark currently serving token as No-Show and advance?')) {
      setActionLoading('skip')
      try {
        await skipCurrent(activeQueueId)
        playChime('near')
      } catch (err: unknown) {
        alert((err as Error).message)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleWalkin = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading('walkin')
    try {
      await issueWalkin(activeQueueId, walkinName || undefined)
      setWalkinName('')
      setShowWalkinModal(false)
    } catch (err: unknown) {
      alert((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async () => {
    if (!queue) return
    const nextStatus = queue.status === 'open' ? 'paused' : 'open'
    await setQueueStatus(activeQueueId, nextStatus)
  }

  const handleSimulate = async (count: number) => {
    setActionLoading('sim')
    try {
      await simulateCrowd(activeQueueId, count)
    } catch (err: unknown) {
      alert((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReset = async () => {
    if (confirm('Reset this queue back to 0? All tokens will be cleared.')) {
      setActionLoading('reset')
      try {
        await resetQueue(activeQueueId)
      } catch (err: unknown) {
        alert((err as Error).message)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const shareUrl = `${window.location.origin}/ticket/${activeQueueId}`

  const downloadQR = () => {
    const svg = document.getElementById('provider-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width + 40
      canvas.height = img.height + 40
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 20, 20)
        const a = document.createElement('a')
        a.download = `SmartQueue-${queue?.name || 'Counter'}-QR.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (!queue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading operator console...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-container border border-outline/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-container text-white">
              Operator Console
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                queue.status === 'open'
                  ? 'bg-secondary-container/50 border-secondary/40 text-secondary-fixed'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              {queue.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-headline">{queue.name}</h1>
          <p className="text-xs text-on-surface-variant">{queue.location || 'Central Desk'}</p>
        </div>

        {/* Queue Selector & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeQueueId}
            onChange={e => navigate(`/provider/${e.target.value}`)}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 text-xs text-white focus:outline-none"
          >
            {allQueues.map(q => (
              <option key={q.id} value={q.id}>
                {q.prefix} — {q.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 hover:border-secondary text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-secondary" />
            <span>Counter QR</span>
          </button>

          <button
            onClick={handleToggleStatus}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              queue.status === 'open'
                ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/30'
                : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30'
            }`}
          >
            {queue.status === 'open' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{queue.status === 'open' ? 'Pause Queue' : 'Open Queue'}</span>
          </button>
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Currently Serving Hero Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Now Serving at Counter
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 px-2.5 py-1 rounded-full bg-surface-container-high">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed: {fmtElapsed(elapsedSecs)}</span>
              </div>
            </div>

            <div className="my-6 text-center">
              {servingToken ? (
                <>
                  <div className="inline-block px-4 py-1 rounded-full bg-primary-container/20 border border-primary/30 text-primary text-xs font-bold mb-2">
                    Active Customer
                  </div>
                  <h2 className="text-6xl font-extrabold text-white font-mono tracking-tight">
                    {label(queue.prefix, servingToken.number)}
                  </h2>
                  <p className="text-sm font-semibold text-secondary mt-1">
                    {servingToken.display_name || 'Walk-in'}
                  </p>
                </>
              ) : (
                <div className="py-6">
                  <h2 className="text-4xl font-extrabold text-on-surface-variant/60 font-mono">
                    IDLE
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    No customer currently serving. Click "Call Next" below.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-outline/15">
              <button
                onClick={handleCallNext}
                disabled={actionLoading === 'next' || waitingTokens.length === 0}
                className="py-4 px-6 rounded-2xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-primary-container/25 disabled:opacity-50"
              >
                <FastForward className="w-5 h-5" />
                <span>Call Next Customer</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 opacity-75 ml-1">
                  Space
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSkip}
                  disabled={!servingToken || actionLoading === 'skip'}
                  className="py-4 px-3 rounded-2xl bg-surface-container-high border border-outline/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors disabled:opacity-40"
                >
                  <UserX className="w-4 h-4" />
                  <span>No-Show / Skip</span>
                </button>

                <button
                  onClick={() => setShowWalkinModal(true)}
                  className="py-4 px-3 rounded-2xl bg-surface-container-high border border-outline/30 text-secondary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Walk-in</span>
                </button>
              </div>
            </div>
          </div>

          {/* Waiting Line Queue List */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <h3 className="font-bold text-sm text-white">Live Waiting Line</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container text-secondary font-mono">
                  {waitingTokens.length} waiting
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                Est. Clearing: {fmtEta(waitingTokens.length * queue.avg_service_secs)}
              </span>
            </div>

            {waitingTokens.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-xs">
                No customers in line. Ready for new arrivals or simulate crowd.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {waitingTokens.map((t, idx) => {
                  const isDelegated = t.display_name?.includes('Booked by')
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-mono text-on-surface-variant">
                          #{idx + 1}
                        </span>
                        <span className="font-mono font-bold text-sm text-white px-2.5 py-0.5 rounded-xl bg-surface-container border border-outline/20">
                          {label(queue.prefix, t.number)}
                        </span>
                        <div>
                          <p className="text-xs text-on-surface font-semibold">
                            {t.display_name || 'Walk-in'}
                          </p>
                          {isDelegated && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                              <HeartHandshake className="w-3 h-3" />
                              <span>Delegated Booking</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono">
                        <span>{fmtEta(idx * queue.avg_service_secs)}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                          Waiting
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Joey & Rachel Dispatch Companion & Simulator */}
        <div className="space-y-6">
          {/* Mascot Companion Card */}
          <div className="p-5 rounded-3xl bg-surface-container border border-outline/20 text-center flex flex-col items-center">
            <JoeyAndRachelDuo state="waiting" size="compact" showStatusBadge={true} />
            <p className="text-xs text-on-surface-variant mt-2 max-w-xs">
              Joey & Rachel are synchronizing counter transactions with connected mobile screens.
            </p>
          </div>

          {/* Quick Demo Simulator Widget */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <h3 className="font-bold text-sm text-white font-headline">Hackathon Demo Controls</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Simulate customer influx, test atomic locks, or wipe state for the next judge.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSimulate(5)}
                disabled={actionLoading === 'sim'}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-secondary text-xs font-semibold text-secondary flex items-center justify-center gap-2 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Simulate 5 Customers</span>
              </button>

              <button
                onClick={() => handleSimulate(20)}
                disabled={actionLoading === 'sim'}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-secondary text-xs font-semibold text-secondary flex items-center justify-center gap-2 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Simulate 20 Customers (Rush)</span>
              </button>

              <button
                onClick={handleReset}
                disabled={actionLoading === 'reset'}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-red-500/40 text-xs font-semibold text-red-400 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Queue to Zero</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Customer Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container border border-outline/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-headline text-white">Issue Walk-in Ticket</h3>
            <p className="text-xs text-on-surface-variant">
              Hand out a spot for a customer who walked up without a phone.
            </p>

            <form onSubmit={handleWalkin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer Name / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Gonzalez"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline/30 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-secondary-container text-secondary text-xs font-bold shadow-md"
                >
                  Issue Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shareable & Downloadable QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container border border-outline/20 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-headline text-white">Join Queue QR Code</h3>
            <p className="text-xs text-on-surface-variant">
              Ask judges or customers to scan this QR code with their mobile camera to join immediately.
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
              <QRCodeSVG id="provider-qr-svg" value={shareUrl} size={180} />
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-high text-xs font-mono truncate text-on-surface-variant">
              {shareUrl}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadQR}
                className="flex-1 py-2.5 rounded-xl bg-secondary-container text-secondary text-xs font-semibold flex items-center justify-center gap-1.5 hover:brightness-110"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="py-2.5 px-4 rounded-xl bg-surface-container-high border border-outline/20 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
