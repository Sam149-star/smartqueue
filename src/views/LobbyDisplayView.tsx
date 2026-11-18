import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useQueue, useQueues } from '../hooks/useQueue'
import { useProviderTokens } from '../hooks/useProviderTokens'
import { label } from '../lib/eta'
import { playChime } from '../hooks/useNotify'
import { JoeyAndRachelDuo } from '../components/Mascots'
import { Tv, QrCode, Sparkles, Maximize, HeartHandshake } from 'lucide-react'

export const LobbyDisplayView: React.FC = () => {
  const { queueId: paramQueueId } = useParams<{ queueId?: string }>()
  const navigate = useNavigate()
  const allQueues = useQueues()

  const activeQueueId = paramQueueId || allQueues[0]?.id || 'demo-clinic-1'
  const { queue } = useQueue(activeQueueId)
  const tokens = useProviderTokens(activeQueueId)

  const servingToken = tokens.find(t => t.status === 'serving')
  const waitingTokens = tokens.filter(t => t.status === 'waiting').slice(0, 4)

  const prevServingRef = useRef<number | null>(null)

  useEffect(() => {
    if (queue && prevServingRef.current !== null && queue.now_serving !== prevServingRef.current) {
      playChime('turn')
    }
    if (queue) {
      prevServingRef.current = queue.now_serving
    }
  }, [queue?.now_serving])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const joinUrl = `${window.location.origin}/ticket/${activeQueueId}`

  if (!queue) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading lobby display...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-outline/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-secondary border border-outline/20">
              Public Lobby TV
            </span>
            <h1 className="text-3xl font-extrabold text-white font-headline mt-0.5">{queue.name}</h1>
            <p className="text-xs text-on-surface-variant">{queue.location || 'Central Floor'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeQueueId}
            onChange={e => navigate(`/display/${e.target.value}`)}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 text-xs text-white focus:outline-none"
          >
            {allQueues.map(q => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center flex-1 my-4">
        {/* Left 2 Cols: Giant Now Serving Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-surface-container to-surface-container-low border-2 border-primary/40 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Mascot in TV header */}
            <div className="w-48 mb-2">
              <JoeyAndRachelDuo state={servingToken ? 'now' : 'waiting'} size="compact" showStatusBadge={false} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-bold uppercase tracking-wider mb-2 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Now Serving at Counter</span>
            </div>

            <div className="my-4">
              <h2 className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-white drop-shadow-xl">
                {servingToken ? label(queue.prefix, servingToken.number) : 'IDLE'}
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-secondary mt-2">
                {servingToken ? servingToken.display_name || 'Counter Ready' : 'Waiting for next ticket'}
              </p>
            </div>

            <div className="pt-6 border-t border-outline/20 flex items-center justify-around w-full text-xs text-on-surface-variant">
              <span>Status: <strong className="text-emerald-400 capitalize">{queue.status}</strong></span>
              <span>•</span>
              <span>Avg Turn: <strong className="text-white">{Math.round(queue.avg_service_secs / 60)} min</strong></span>
              <span>•</span>
              <span>Counter: <strong className="text-primary font-mono">{queue.prefix}-1</strong></span>
            </div>
          </div>

          {/* Next Up Row */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Next in Line (Please Be Nearby)
            </h3>

            {waitingTokens.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No one waiting currently.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {waitingTokens.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-surface-container-high/70 border border-outline/20 text-center"
                  >
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                      #{idx + 1} Next
                    </span>
                    <p className="text-2xl font-extrabold font-mono text-white mt-0.5">
                      {label(queue.prefix, t.number)}
                    </p>
                    <p className="text-[11px] text-secondary truncate mt-0.5">
                      {t.display_name || 'Guest'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Giant Mobile Join QR Code */}
        <div className="p-8 rounded-3xl bg-surface-container border border-outline/20 text-center space-y-5 flex flex-col items-center justify-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-headline">Join Without Waiting</h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Scan with your phone camera. You will get a live digital ticket and an alert when it's your turn.
            </p>
          </div>

          {/* High-contrast QR code */}
          <div className="p-5 bg-white rounded-3xl shadow-xl inline-block">
            <QRCodeSVG value={joinUrl} size={210} level="M" />
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-high w-full border border-outline/20 text-xs font-mono text-on-surface-variant truncate">
            {joinUrl}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-outline/15 flex items-center justify-between text-xs text-on-surface-variant">
        <span>SmartQueue Virtual Dispatch System</span>
        <span>Audio chime enabled for every new call</span>
      </div>
    </div>
  )
}
