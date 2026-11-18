import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueues } from '../hooks/useQueue'
import { useMyToken } from '../hooks/useMyToken'
import { useAuth } from '../lib/authContext'
import { joinQueue, createQueue } from '../lib/api'
import { JoeyAndRachelDuo } from '../components/Mascots'
import { label, fmtEta } from '../lib/eta'
import {
  Users,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  Camera,
  User,
  HeartHandshake,
  Star,
  Accessibility,
  HeartPulse,
  Smartphone
} from 'lucide-react'
import { QRScannerModal } from '../components/QRScannerModal'
import { MobileConnectModal } from '../components/MobileConnectModal'

export const QueueListView: React.FC = () => {
  const navigate = useNavigate()
  const queues = useQueues()
  const { token: myToken } = useMyToken()
  const { user } = useAuth()

  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
  const [bookingType, setBookingType] = useState<'self' | 'other'>('self')

  // Booking for someone else fields
  const [recipientName, setRecipientName] = useState('')
  const [recipientAge, setRecipientAge] = useState<number | ''>('')
  const [recipientDisability, setRecipientDisability] = useState('None')
  const [recipientCondition, setRecipientCondition] = useState('None')
  const [relationship, setRelationship] = useState('Elderly Parent')

  // Guest booking
  const [guestName, setGuestName] = useState('')

  const [joinState, setJoinState] = useState<'idle' | 'joining' | 'done'>('idle')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)

  // New queue modal
  const [showCreate, setShowCreate] = useState(false)
  const [newQueueName, setNewQueueName] = useState('')
  const [newQueueLocation, setNewQueueLocation] = useState('')
  const [newQueuePrefix, setNewQueuePrefix] = useState('A')

  const isRecipientSenior = typeof recipientAge === 'number' && recipientAge >= 60

  const handleJoin = async (qId: string) => {
    setJoinState('joining')
    setJoinError(null)

    let finalName = ''
    if (bookingType === 'self') {
      if (user) {
        let tag = user.fullName
        if (user.isSenior) tag += ' (Age ' + user.age + ' • ⭐ Senior Citizen)'
        if (user.disability && user.disability !== 'None') tag += ` • ♿ ${user.disability}`
        finalName = tag
      } else {
        finalName = guestName.trim() || 'Guest'
      }
    } else {
      if (!recipientName.trim()) {
        setJoinError('Please enter the recipient person name')
        setJoinState('idle')
        return
      }

      const booker = user ? user.fullName : 'Guest'
      const parts = [recipientName.trim()]

      if (recipientAge) {
        parts.push(`Age ${recipientAge}`)
      }
      if (isRecipientSenior) {
        parts.push('⭐ Senior Citizen')
      }
      if (recipientDisability && recipientDisability !== 'None') {
        parts.push(`♿ ${recipientDisability}`)
      }
      if (recipientCondition && recipientCondition !== 'None') {
        parts.push(`🩺 ${recipientCondition}`)
      }
      parts.push(`Booked by ${booker} [${relationship}]`)

      finalName = parts.join(' • ')
    }

    try {
      await joinQueue(qId, finalName)
      setJoinState('done')
      setTimeout(() => {
        navigate(`/ticket/${qId}`)
      }, 900)
    } catch (err: unknown) {
      setJoinError((err as Error).message)
      setJoinState('idle')
    }
  }

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQueueName.trim()) return
    try {
      const q = await createQueue(newQueueName, newQueueLocation, newQueuePrefix)
      setShowCreate(false)
      setNewQueueName('')
      navigate(`/provider/${q.id}`)
    } catch (e: unknown) {
      alert((e as Error).message)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Active Token Callout Banner (if user already in a queue) */}
      {myToken && (
        <div
          onClick={() => navigate(`/ticket/${myToken.queue_id}`)}
          className="p-4 rounded-2xl bg-gradient-to-r from-secondary-container/90 to-surface-container border border-secondary/40 shadow-lg cursor-pointer hover:border-secondary transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-secondary absolute -top-0.5 -right-0.5 animate-ping" />
              <div className="min-w-[64px] px-2.5 h-11 rounded-xl bg-surface-container-high flex items-center justify-center font-mono font-extrabold text-secondary text-sm border border-secondary/30 text-center tracking-wide">
                {label(myToken.queues?.prefix || 'A', myToken.number)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-fixed flex items-center gap-1.5">
                <span>Active Live Ticket</span>
                {myToken.display_name?.includes('Senior Citizen') && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-bold">
                    ⭐ Senior
                  </span>
                )}
                {myToken.display_name?.includes('Booked by') && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary/30 font-mono">
                    Delegated
                  </span>
                )}
              </p>
              <h4 className="text-sm font-bold text-white">{myToken.queues?.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary font-semibold group-hover:translate-x-1 transition-transform">
            <span>View Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Hero Welcome Card with Joey & Rachel Animated Mascots */}
      <div className="relative bg-gradient-to-br from-surface-container to-surface-container-low border border-outline/20 rounded-3xl p-6 overflow-hidden shadow-xl text-center flex flex-col items-center">
        {/* Joey and Rachel Live Duo */}
        <div className="w-full max-w-[280px] my-1">
          <JoeyAndRachelDuo state="waiting" size="medium" showStatusBadge={true} />
        </div>

        <div className="mt-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 border border-primary/30 text-primary text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Wait Smart Queue Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-white">
            Skip Physical Lines.
            <br />
            <span className="text-primary italic">Live Virtual Pacing.</span>
          </h1>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Joey & Rachel guard your place in line. Walk freely until your phone chimes. Special priority pacing for 60+ senior citizens.
          </p>
        </div>

        {/* Quick action bar */}
        <div className="mt-5 w-full pt-4 border-t border-outline/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high border border-outline/25 text-secondary text-xs font-semibold hover:border-secondary transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Counter QR</span>
            </button>

            <button
              onClick={() => setMobileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-semibold hover:brightness-110 transition-colors"
              title="Open on your phone"
            >
              <Smartphone className="w-4 h-4 text-secondary" />
              <span>📱 Demo on Phone</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high border border-outline/25 text-white text-xs font-semibold hover:border-primary transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>New Counter</span>
          </button>
        </div>
      </div>

      {/* Queue Directory List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Available Counters & Desks ({queues.length})
          </h2>
          {user && (
            <span className="text-[11px] text-secondary font-medium">
              Signed in: <strong className="text-white">{user.fullName.split(' ')[0]}</strong>
              {user.isSenior && ' ⭐'}
            </span>
          )}
        </div>

        {queues.map((q) => {
          const waitingCount = Math.max(0, q.last_issued - q.now_serving)
          const estSecs = waitingCount * (q.avg_service_secs || 180)
          const isSelected = selectedQueue === q.id

          return (
            <div
              key={q.id}
              className={`p-4 rounded-3xl bg-surface-container border transition-all ${
                isSelected ? 'border-primary ring-1 ring-primary/40 shadow-lg' : 'border-outline/20 hover:border-outline/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-surface-container-high border border-outline/30 flex items-center justify-center font-bold text-xs text-primary font-mono">
                      {q.prefix}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white">{q.name}</h3>
                      {q.location && (
                        <p className="text-[11px] text-on-surface-variant">{q.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Users className="w-3.5 h-3.5 text-secondary" />
                      <span>{waitingCount} waiting</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{fmtEta(estSecs)}</span>
                    </div>
                    <div className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono">
                      Now: {q.now_serving > 0 ? label(q.prefix, q.now_serving) : 'None'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedQueue(isSelected ? null : q.id)
                      setJoinError(null)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-sm ${
                      isSelected
                        ? 'bg-surface-container-high border border-outline/30 text-on-surface'
                        : 'bg-on-surface text-surface hover:bg-white'
                    }`}
                  >
                    {isSelected ? 'Close' : 'Get Ticket'}
                  </button>
                  <button
                    onClick={() => navigate(`/display/${q.id}`)}
                    className="text-[11px] text-on-surface-variant hover:text-white flex items-center gap-1"
                  >
                    <span>Lobby TV</span>
                  </button>
                </div>
              </div>

              {/* Expandable Join Drawer with "Book for Me" vs "Book for Someone Else" */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-outline/20 animate-fade-in space-y-4">
                  {/* Segmented Switcher */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container-high border border-outline/15 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBookingType('self')}
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        bookingType === 'self'
                          ? 'bg-on-surface text-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Book for Myself</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingType('other')}
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        bookingType === 'other'
                          ? 'bg-on-surface text-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-white'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-primary" />
                      <span>For Someone Else</span>
                    </button>
                  </div>

                  {/* Mode A: Book for Myself */}
                  {bookingType === 'self' && (
                    <div className="space-y-2">
                      {user ? (
                        <div className="p-3.5 rounded-2xl bg-secondary-container/30 border border-secondary/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName}
                                  className="w-9 h-9 rounded-xl object-cover border border-secondary/40"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {user.isSenior && (
                                <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-white">{user.fullName}</p>
                                {user.isSenior && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold">
                                    Senior (60+)
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-on-surface-variant font-mono">
                                Auto-filling profile ({user.phone || user.email})
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-secondary font-semibold bg-secondary/20 px-2 py-0.5 rounded-full">
                            1-Tap
                          </span>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Your Name (or leave blank for Guest)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Alex"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-primary focus:outline-none"
                          />
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            💡 Tip:{' '}
                            <button
                              type="button"
                              onClick={() => navigate('/auth')}
                              className="text-secondary underline hover:text-white"
                            >
                              Sign in
                            </button>{' '}
                            to enable 1-tap auto-booking.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode B: Book for Someone Else (with Age & 60+ Senior Citizen detection) */}
                  {bookingType === 'other' && (
                    <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/20 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-primary">
                          <HeartHandshake className="w-4 h-4" />
                          <span>Beneficiary Information</span>
                        </span>
                        {isRecipientSenior && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-400/40 animate-pulse">
                            <Star className="w-3 h-3 fill-amber-300" />
                            <span>60+ Senior Citizen Priority</span>
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                          Beneficiary Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Smt. Kamala Devi or Baby Aarav"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs focus:border-primary focus:outline-none"
                          autoFocus
                        />
                      </div>

                      {/* Age with Live Senior Citizen Notice */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Age (Years)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={120}
                            placeholder="e.g. 68"
                            value={recipientAge}
                            onChange={(e) => setRecipientAge(e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Relationship
                          </label>
                          <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none"
                          >
                            <option value="Elderly Parent">Elderly Parent</option>
                            <option value="Child / Dependent">Child / Dependent</option>
                            <option value="Emergency Patient">Emergency Patient</option>
                            <option value="Client / Customer">Client / Customer</option>
                            <option value="Friend / Relative">Friend / Relative</option>
                          </select>
                        </div>
                      </div>

                      {/* Disability / Mobility Assistance */}
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-1">
                          Mobility / Disability Needs
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {['None', 'Wheelchair', 'Walking Stick', 'Visual', 'Hearing'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setRecipientDisability(d)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                                recipientDisability === d
                                  ? 'bg-secondary-container text-secondary border-secondary/50'
                                  : 'bg-surface-container text-on-surface-variant border-outline/20 hover:text-white'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Medical Condition */}
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-1">
                          Medical Condition / Disease (if any)
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {['None', 'Diabetes', 'Cardiac / BP', 'Asthma', 'Pregnancy', 'Other'].map((med) => (
                            <button
                              key={med}
                              type="button"
                              onClick={() => setRecipientCondition(med)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                                recipientCondition === med
                                  ? 'bg-primary-container text-white border-primary'
                                  : 'bg-surface-container text-on-surface-variant border-outline/20 hover:text-white'
                              }`}
                            >
                              {med}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live preview badge */}
                      {isRecipientSenior && (
                        <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-[11px] text-amber-300 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 fill-amber-300 shrink-0" />
                          <span>Age 60+ detected: Ticket will be marked with Senior Citizen Priority seating.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {joinError && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-500/30">
                      {joinError}
                    </p>
                  )}

                  <button
                    onClick={() => handleJoin(q.id)}
                    disabled={joinState !== 'idle'}
                    className="w-full py-3 rounded-2xl bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-md"
                  >
                    {joinState === 'idle' && (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {bookingType === 'other'
                            ? `Confirm Ticket for ${recipientName || 'Beneficiary'}${isRecipientSenior ? ' (⭐ Senior Priority)' : ''}`
                            : 'Confirm & Take Digital Spot'}
                        </span>
                      </>
                    )}
                    {joinState === 'joining' && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Assigning Ticket Number...</span>
                      </>
                    )}
                    {joinState === 'done' && (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Spot Confirmed! Entering...</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create Queue Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container border border-outline/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-headline mb-1 text-white">Create New Queue Counter</h3>
            <p className="text-xs text-on-surface-variant">Set up a service desk for hospital, bank or event booth.</p>

            <form onSubmit={handleCreateQueue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Queue / Counter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatric Clinic Room 3"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location Details</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Floor · Wing B"
                  value={newQueueLocation}
                  onChange={(e) => setNewQueueLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Ticket Prefix Letter</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="e.g. C, B, A"
                  value={newQueuePrefix}
                  onChange={(e) => setNewQueuePrefix(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline/30 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold shadow-md hover:brightness-110"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <MobileConnectModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </div>
  )
}
