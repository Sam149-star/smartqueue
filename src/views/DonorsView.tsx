import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Filter, Heart, ArrowRight, MapPin, CheckCircle, ShieldCheck, Search, Sparkles, ClipboardList, BellRing, Phone, Send, Clock, Check } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useBloodRequests } from '../lib/bloodRequestContext'
import { BoondMascot } from '../components/mascots/BoondMascot'
import { BloodGroup } from '../lib/types'

export const DonorsView: React.FC = () => {
  const { user, requireAuth, isDonor } = useAuth()
  const { requests, revertAsDonor } = useBloodRequests()
  const [selectedGroup, setSelectedGroup] = useState<string>('All')
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [donorAvailable, setDonorAvailable] = useState<boolean>(true)
  const [revertedMap, setRevertedMap] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sample verified voluntary donors directory (conforms to privacy rules: no phones exposed)
  const mockDonors = [
    {
      id: 'd1',
      name: 'Rahul Varma',
      bloodGroup: 'O+',
      city: 'Mumbai',
      area: 'Andheri West',
      donations: 8,
      lastDonated: '4 months ago',
      available: true,
      eligible: true
    },
    {
      id: 'd2',
      name: 'Dr. Sneha Patel',
      bloodGroup: 'B+',
      city: 'Mumbai',
      area: 'Bandra',
      donations: 12,
      lastDonated: '6 months ago',
      available: true,
      eligible: true
    },
    {
      id: 'd3',
      name: 'Amit Deshmukh',
      bloodGroup: 'A+',
      city: 'Pune',
      area: 'Shivaji Nagar',
      donations: 5,
      lastDonated: '3 months ago',
      available: true,
      eligible: true
    },
    {
      id: 'd4',
      name: 'Kavita Rao',
      bloodGroup: 'AB+',
      city: 'Delhi',
      area: 'Saket',
      donations: 4,
      lastDonated: '5 months ago',
      available: true,
      eligible: true
    },
    {
      id: 'd5',
      name: 'Vikram Sethi',
      bloodGroup: 'O-',
      city: 'Bengaluru',
      area: 'Indiranagar',
      donations: 15,
      lastDonated: '7 months ago',
      available: true,
      eligible: true
    }
  ]

  const bloodGroups = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const cities = ['All', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune']

  const filteredDonors = mockDonors.filter((d) => {
    if (selectedGroup !== 'All' && d.bloodGroup !== selectedGroup) return false
    if (selectedCity !== 'All' && d.city !== selectedCity) return false
    return true
  })

  // Urgent active requests suitable for donor alert feed
  const activeMatchingRequests = requests.filter(
    (r) => r.status === 'matching' || r.status === 'pending_verification'
  )

  const handleRevert = (reqId: string, patientName: string, reqBlood: BloodGroup) => {
    requireAuth(() => {
      const donorName = user?.fullName || 'Anonymous Lifesaver'
      revertAsDonor(reqId, {
        name: donorName,
        bloodGroup: reqBlood,
        city: 'Mumbai',
        area: 'Nearby Donor Location',
        phone: '+91 98201 44892',
        distanceKm: 3.2,
        etaMinutes: 20,
        message: 'I am available and will proceed to the hospital blood bank.'
      })
      setRevertedMap((prev) => ({ ...prev, [reqId]: true }))
      setToastMessage(`Thank you! You have reverted to help ${patientName}. The requester has been notified.`)
      setTimeout(() => setToastMessage(null), 5000)
    }, 'Sign in as a voluntary donor to respond to this urgent request')
  }

  return (
    <div className="space-y-6">
      {/* ══════════════ PROMINENT HERO STAGE (Big Boond Mascot - Meditating Hopeful) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Voluntary Donor Network</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Consenting Donor Directory & Urgent Alerts
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Voluntary donors can check their health eligibility, confirm consent, declare accurate information, and revert directly to urgent hospital blood requests in their city.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/questionnaire"
                className="px-5 py-2.5 rounded-2xl bg-secondary-container border border-secondary/40 text-secondary-fixed text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-sm"
              >
                <ClipboardList className="w-4 h-4 text-secondary" />
                <span>Fill Donor Medical Questionnaire & Consent</span>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container-high border border-outline/25">
                <span className="text-xs font-semibold text-on-surface">Urgent Availability:</span>
                <button
                  onClick={() => setDonorAvailable(!donorAvailable)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    donorAvailable
                      ? 'bg-secondary text-surface shadow-sm'
                      : 'bg-surface-container border border-outline/30 text-on-surface-variant'
                  }`}
                >
                  {donorAvailable ? '🟢 Available' : '⚪ Resting'}
                </button>
              </div>
            </div>
          </div>

          {/* Prominent Mascot Stage (Size 220, Meditating Hopeful) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-secondary/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  <span>"Looking for compatible lifesavers nearby!"</span>
                </p>
              </div>
              <BoondMascot
                size={220}
                stage="hopeful"
                variant="meditating"
                alt="Boond meditating hopeful mascot"
                interactive={false}
              />
              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Hopeful Donor Finder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/50 text-secondary-fixed text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-secondary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════ INCOMING URGENT REQUESTS ALERT FEED (FOR DONORS) ══════════════ */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container/30 border border-primary/40 flex items-center justify-center text-primary-fixed">
              <BellRing className="w-4 h-4 text-primary animate-bounce-soft" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-white">
                Urgent Matching Requests in Your City
              </h2>
              <p className="text-xs text-on-surface-variant">
                Verified hospital procedures needing blood now. Review details and tap "I Can Donate" to revert back to the requester.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-primary-fixed px-2.5 py-1 rounded-full bg-primary-container/30 border border-primary/40">
            {activeMatchingRequests.length} Active Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {activeMatchingRequests.map((req) => {
            const hasReverted = revertedMap[req.id] || req.reverted_donors.some((d) => d.donorName === user?.fullName)
            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-surface-container-high/60 border border-outline/25 space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-extrabold text-base font-headline shadow-md">
                      {req.blood_group}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-headline">{req.patient_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container/40 text-primary-fixed text-[9px] font-bold uppercase">
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {req.units_needed} Units {req.component.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant/80 font-mono">
                    {req.code}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container border border-outline/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>{req.hospital_name}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {req.hospital_city} • {req.hospital_room} • Attending: {req.doctor_name}
                  </p>
                  <p className="text-[11px] text-secondary-fixed font-medium">
                    {req.verified_by ? `✓ Verified by: ${req.verified_by}` : '⏳ Medical verifier reviewing slip'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-on-surface-variant">
                    {req.reverted_donors.length} donors responded
                  </span>

                  {hasReverted ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold flex items-center gap-1.5 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5 text-secondary" />
                      <span>Reverted & Contact Shared</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRevert(req.id, req.patient_name, req.blood_group)}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>I Can Donate (Revert)</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════ DONOR DIRECTORY SEARCH & COMPATIBILITY ══════════════ */}
      <div className="p-4 rounded-2xl bg-surface-container border border-outline/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Filter className="w-4 h-4 text-primary" />
            <span>Search All Voluntary Donors</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">
            {filteredDonors.length} Consenting Donors Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
              Filter by Blood Group
            </label>
            <div className="flex flex-wrap gap-1.5">
              {bloodGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedGroup === g
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high border border-outline/20 text-on-surface-variant hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
              Filter by City Proximity
            </label>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCity === c
                      ? 'bg-secondary text-surface shadow-sm'
                      : 'bg-surface-container-high border border-outline/20 text-on-surface-variant hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Donor Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.map((donor) => (
          <div
            key={donor.id}
            className="p-5 rounded-3xl bg-surface-container border border-outline/25 space-y-4 hover:border-secondary/40 transition-all shadow-md group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 border border-secondary/50 text-secondary flex items-center justify-center font-extrabold text-base font-headline group-hover:scale-105 transition-transform">
                  {donor.bloodGroup}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-white">{donor.name}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-secondary" />
                    <span>{donor.area}, {donor.city}</span>
                  </p>
                </div>
              </div>

              {donor.available && (
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary-fixed text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-2xl bg-surface-container-high/60 border border-outline/15">
              <div>
                <span className="text-on-surface-variant block text-[10px]">Total Donations</span>
                <strong className="text-white font-bold">{donor.donations} times</strong>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px]">Last Donated</span>
                <strong className="text-white font-bold">{donor.lastDonated}</strong>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs border-t border-outline/15">
              <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Consenting Donor</span>
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Phone Encrypted 🔒
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
