import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useQueue } from '../hooks/useQueue'
import { useMyToken } from '../hooks/useMyToken'
import { useNow } from '../hooks/useNow'
import { useNotifyOnTurn, enableNotifications, playChime } from '../hooks/useNotify'
import { aheadOf, etaSecs, fmtEta, label, progressOf, turnState } from '../lib/eta'
import { cancelToken } from '../lib/api'
import { JoeyAndRachelDuo } from '../components/Mascots'
import {
  Bell,
  BellOff,
  Clock,
  Users,
  ShieldCheck,
  ChevronLeft,
  XCircle,
  QrCode,
  HeartHandshake,
  AlertCircle,
  Volume2,
  Star,
  Accessibility
} from 'lucide-react'

export const TicketView: React.FC = () => {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()
  const { queue, live } = useQueue(queueId)
  const { token, refresh } = useMyToken(queueId)
  const now = useNow(1000)

  const [notifyOn, setNotifyOn] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const NOTIFY_AT = 3
  const ahead = token && queue ? aheadOf(token.number, queue) : 0
  const eta = queue ? etaSecs(ahead, queue, now) : 0
  const turn = turnState(token, ahead, NOTIFY_AT)
  const progress = progressOf(ahead, token?.ahead_at_join ?? Math.max(1, ahead))
  const ticketLabel = queue && token ? label(queue.prefix, token.number) : '—'

  useNotifyOnTurn({
    enabled: notifyOn,
    tokenId: token?.id,
    ahead,
    threshold: NOTIFY_AT,
    isNow: turn === 'now',
    label: ticketLabel,
  })

  const handleToggleNotify = async () => {
    if (!notifyOn) {
      const granted = await enableNotifications()
      setNotifyOn(granted)
      playChime('join')
    } else {
      setNotifyOn(false)
    }
  }

  const handleCancel = async () => {
    if (!token) return
    if (confirm('Are you sure you want to cancel this ticket and release your spot?')) {
      setCancelling(true)
      try {
        await cancelToken(token.id)
        await refresh()
      } catch (err: unknown) {
        alert((err as Error).message)
      } finally {
        setCancelling(false)
      }
    }
  }

  // Parse details from display_name
  const rawName = token?.display_name || 'Guest'
  const isSenior = rawName.includes('Senior Citizen') || rawName.includes('⭐')
  const hasWheelchair = rawName.includes('Wheelchair') || rawName.includes('♿')
  const isDelegated = rawName.includes('Booked by')

  // Extract clean primary beneficiary name
  let displayName = rawName
  let bookedByNote = ''
  if (rawName.includes(' • ')) {
    const segments = rawName.split(' • ')
    displayName = segments[0]
    const bookerSeg = segments.find(s => s.startsWith('Booked by'))
    if (bookerSeg) bookedByNote = bookerSeg
  } else if (rawName.includes(' (Booked by ')) {
    const parts = rawName.split(' (Booked by ')
    displayName = parts[0]
    bookedByNote = 'Booked by ' + parts[1].replace(')', '')
  }

  if (!queue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading queue details...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-headline text-white">No Active Ticket Found</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            You don't currently have a ticket for "{queue.name}".
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-primary-container text-white text-xs font-bold shadow-md hover:brightness-110"
        >
          Browse Queues & Join
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-5" data-turn={turn}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container-high text-on-surface-variant flex items-center gap-1 text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Queues</span>
        </button>

        {/* Live Realtime Radar Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline/20">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                live ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {live && (
              <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/40 animate-ping" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-on-surface">
            {live ? 'Real-time Linked' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Queue Info Card */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-primary border border-outline/20 font-mono">
            {queue.prefix} Desk
          </span>
          <h1 className="text-xl font-bold text-white font-headline mt-1">{queue.name}</h1>
          {queue.location && (
            <p className="text-xs text-on-surface-variant">{queue.location}</p>
          )}
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="p-2.5 rounded-2xl bg-surface-container border border-outline/20 hover:border-secondary transition-colors text-on-surface"
          title="Show Ticket QR"
        >
          <QrCode className="w-5 h-5 text-secondary" />
        </button>
      </div>

      {/* Hero Ticket & Mascot Duo Display */}
      <div
        className={`relative rounded-3xl p-6 text-center border transition-all duration-500 overflow-hidden shadow-2xl ${
          turn === 'now'
            ? 'bg-gradient-to-b from-primary-container/40 via-surface-container to-surface-container border-primary shadow-primary/20 ring-2 ring-primary/40'
            : turn === 'near'
            ? 'bg-gradient-to-b from-amber-500/20 via-surface-container to-surface-container border-amber-400/50'
            : 'bg-surface-container border-outline/20'
        }`}
      >
        {/* Joey and Rachel Live Duo with state-based animation */}
        <div className="w-full max-w-[270px] mx-auto my-1">
          <JoeyAndRachelDuo state={turn} size="medium" showStatusBadge={true} />
        </div>

        {/* Priority Badges (Senior Citizen / Accessibility) */}
        {(isSenior || hasWheelchair) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 animate-fade-in">
            {isSenior && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[11px] shadow-md flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>Senior Citizen Priority (60+)</span>
              </span>
            )}
            {hasWheelchair && (
              <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary font-bold text-[11px] border border-secondary/40 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5" />
                <span>Wheelchair / Mobility Assistance</span>
              </span>
            )}
          </div>
        )}

        {/* Perfectly Centered Boarding Pass Ticket Board */}
        <div className="my-4 mx-auto max-w-[290px] p-5 rounded-3xl bg-surface-container-high/90 border border-outline/25 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
            <span>Verified Token</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Counter {queue.prefix}-1</span>
          </div>

          {/* Symmetrically Centered Ticket Number */}
          <div className="w-full flex items-center justify-center my-2">
            <span className="text-6xl font-black font-mono tracking-widest text-white select-all text-center leading-none">
              {ticketLabel}
            </span>
          </div>

          {/* Beneficiary / Name Callout */}
          <div className="w-full flex flex-col items-center justify-center mt-1 text-center">
            <p className="text-base font-bold text-white max-w-[260px] truncate text-center">
              {displayName}
            </p>
            {isDelegated && (
              <span className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-secondary-fixed bg-secondary-container/80 px-2.5 py-0.5 rounded-full mt-1.5 border border-secondary/40 text-center">
                <HeartHandshake className="w-3 h-3 text-secondary shrink-0" />
                <span className="truncate max-w-[220px]">{bookedByNote}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Countdown / Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-outline/15 text-left">
          <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15">
            <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Ahead of you</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {ahead === 0 ? '0 (Now)' : ahead}
            </p>
            <p className="text-[10px] text-on-surface-variant">
              Now serving: {queue.now_serving > 0 ? label(queue.prefix, queue.now_serving) : 'None'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Wait</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {fmtEta(eta)}
            </p>
            <p className="text-[10px] text-on-surface-variant">
              Dynamic pacing algorithm
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
            <span>Queue Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                turn === 'now' ? 'bg-primary-container' : 'bg-secondary'
              }`}
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* QR Code Reveal Modal/Drawer */}
      {showQR && (
        <div className="p-5 rounded-3xl bg-surface-container border border-outline/30 text-center animate-fade-in space-y-3 shadow-xl">
          <p className="text-xs font-semibold text-white">Show this QR to the Counter Specialist</p>
          <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
            <QRCodeSVG value={`${window.location.origin}/ticket/${queue.id}?token=${token.id}`} size={160} />
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant">Token ID: {token.id}</p>
        </div>
      )}

      {/* Audio & Notification Controls */}
      <div className="p-4 rounded-2xl bg-surface-container border border-outline/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => playChime('turn')}
            className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface hover:text-white"
            title="Test Chime Sound"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <div>
            <h4 className="text-xs font-bold text-white">Chime & Vibration Alerts</h4>
            <p className="text-[11px] text-on-surface-variant">
              {notifyOn ? 'Active: Alerts at 3 ahead & on your turn' : 'Muted'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotify}
          className={`p-2.5 rounded-full border transition-all ${
            notifyOn
              ? 'bg-secondary-container text-secondary border-secondary/50'
              : 'bg-surface-container-high text-on-surface-variant border-outline/20'
          }`}
        >
          {notifyOn ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Senior Citizen Priority Notice (if applicable) */}
      {isSenior && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-surface-container-low border border-amber-400/40 flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 fill-amber-300" />
          <div className="text-xs">
            <p className="font-bold text-amber-200">Senior Citizen Care Protocol Active</p>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">
              Counter specialists are notified to prepare ground-floor assistance, clear seating, and expedite service.
            </p>
          </div>
        </div>
      )}

      {/* Reassurance Guard Card from Stitch UI */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline/20 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary-container/80 flex items-center justify-center text-secondary shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-on-surface">Zero Lobby Crowding Guaranteed</p>
          <p className="text-on-surface-variant mt-0.5 leading-relaxed">
            Feel free to step outside, visit the cafeteria or take a call. Joey & Rachel hold your spot and this page will alert you before you're up.
          </p>
        </div>
      </div>

      {/* Cancel Ticket Action */}
      {token.status === 'waiting' && (
        <div className="text-center pt-2">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs text-red-400/80 hover:text-red-300 flex items-center justify-center gap-1.5 mx-auto py-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Leave Queue & Release Spot</span>
          </button>
        </div>
      )}
    </div>
  )
}
