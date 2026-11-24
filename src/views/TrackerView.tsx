import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Activity, Clock, CheckCircle, Share2, ShieldCheck, Heart, MapPin, Users, Copy, Check, Sparkles, Phone, MessageSquare, Lock, Unlock, ArrowRight } from 'lucide-react'
import { BoondMascot, MascotStage } from '../components/mascots/BoondMascot'
import { useBloodRequests } from '../lib/bloodRequestContext'

export const TrackerView: React.FC = () => {
  const { shareToken } = useParams<{ shareToken?: string }>()
  const { requests, activeRequest } = useBloodRequests()
  const [copied, setCopied] = useState(false)

  // Find targeted request
  const currentReq =
    (shareToken ? requests.find((r) => r.share_token === shareToken || r.code === shareToken) : null) ||
    activeRequest ||
    requests[0]

  const isVerified = currentReq && (currentReq.status === 'matching' || currentReq.status === 'verified' || currentReq.status === 'fulfilled')

  const currentStep =
    currentReq.status === 'pending_verification'
      ? 0
      : currentReq.status === 'rejected'
      ? -1
      : currentReq.reverted_donors.length >= currentReq.units_needed
      ? 3
      : currentReq.reverted_donors.length > 0
      ? 2
      : 1

  const steps = [
    { label: 'Submitted', time: currentReq.created_at || '10:45 AM', desc: 'Requisition received' },
    {
      label: 'Verified',
      time: currentReq.verified_at || 'Pending',
      desc: isVerified ? (currentReq.verified_by || 'Dr. Priya Sen') : 'Clinical review'
    },
    {
      label: 'Matching Donors',
      time: isVerified ? 'In progress' : 'Awaiting',
      desc: `${currentReq.reverted_donors.length} donors responded`
    },
    {
      label: 'Units Confirmed',
      time: currentReq.reverted_donors.length >= currentReq.units_needed ? 'Completed' : 'Pending',
      desc: `${Math.min(currentReq.reverted_donors.length, currentReq.units_needed)} of ${currentReq.units_needed} units`
    }
  ]

  const boondStage: MascotStage =
    currentStep >= 3 ? 'celebrating' : currentStep >= 2 ? 'hopeful' : 'calm'

  const copyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ══════════════ PROMINENT HERO STAGE (Big Boond Mascot - Waving Hopeful) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span>Real-Time Requisition Tracker</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Request #{currentReq.code} Live Status
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Patient: <strong>{currentReq.patient_name}</strong> • <strong>{currentReq.blood_group} ({currentReq.units_needed} Units {currentReq.component.replace('_', ' ').toUpperCase()})</strong> at <strong>{currentReq.hospital_name}</strong>. Family members can monitor matching and confirmations without phone calls.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={copyShareLink}
                className="px-5 py-2.5 rounded-2xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-primary transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
                <span>{copied ? 'Tracker Link Copied!' : 'Share Live Tracker with Family'}</span>
              </button>
              <Link
                to="/request"
                className="px-4 py-2.5 rounded-2xl bg-surface-container border border-outline/25 text-on-surface text-xs font-semibold hover:text-white"
              >
                Back to Requester Portal
              </Link>
            </div>
          </div>

          {/* Prominent Mascot Stage (Size 220, Waving Sign Hopeful) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>"Tracking nearby donors in real-time!"</span>
                </p>
              </div>
              <BoondMascot
                size={220}
                stage={boondStage}
                variant="sign"
                alt="Boond waving tracker mascot"
                interactive={false}
              />
              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Live Match Watcher
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracker Status Card */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Current Pipeline</span>
          <h2 className="font-headline text-2xl font-bold text-white">
            {currentStep === 0 && '1. Awaiting Medical Verification'}
            {currentStep === 1 && `2. Requisition Slip Verified by ${currentReq.verified_by || 'Hospital Verifier'}`}
            {currentStep === 2 && `3. Voluntary Donors Alerted (${currentReq.reverted_donors.length} Reverted)`}
            {currentStep === 3 && '4. Lifesaving Units Confirmed & Arranged!'}
          </h2>
          <p className="text-xs text-on-surface-variant max-w-xl">
            {currentStep === 0 &&
              'Our on-duty medical verifier is reviewing the attached hospital requisition slip. Verified requests are immediately dispatched to nearby donors.'}
            {currentStep === 1 &&
              'Clinical verification complete. Nearby compatible donors are being notified with location proximity.'}
            {currentStep === 2 &&
              `${currentReq.reverted_donors.length} voluntary donors have responded and indicated their availability to donate.`}
            {currentStep === 3 &&
              'Sufficient voluntary donors have confirmed arrival at the blood bank counter. Thank you!'}
          </p>
        </div>

        {/* Live Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {steps.map((st, i) => {
            const isCompleted = i <= currentStep
            const isCurrent = i === currentStep
            return (
              <div
                key={st.label}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-primary-container/30 border-primary text-white ring-1 ring-primary shadow-md'
                    : isCompleted
                    ? 'bg-secondary-container/20 border-secondary/40 text-on-surface'
                    : 'bg-surface-container-high/40 border-outline/15 text-on-surface-variant/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase">{st.time}</span>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-secondary" />}
                </div>
                <p className="text-xs font-bold text-white">{st.label}</p>
                <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{st.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════ REVERTED DONORS DIRECTORY & VERIFIED CONTACT SHARING ══════════════ */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>Voluntary Donors Reverting to Request ({currentReq.reverted_donors.length})</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Donors who consented and agreed to share their contact information.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isVerified
                ? 'bg-secondary-container text-secondary-fixed'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {isVerified ? '🔓 Contacts Verified & Accessible' : '🔒 Protected until Clinical Verification'}
          </span>
        </div>

        {currentReq.reverted_donors.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-container-high/40 border border-outline/20 text-center text-xs text-on-surface-variant">
            Awaiting first donor response. Compatible voluntary donors in {currentReq.hospital_city} are reviewing the request.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentReq.reverted_donors.map((donor) => (
              <div
                key={donor.id}
                className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/25 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold text-sm">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{donor.donorName}</h4>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-secondary" />
                        <span>{donor.area}, {donor.city} ({donor.distanceKm} km away)</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary-fixed text-[10px] font-bold">
                    ETA {donor.etaMinutes}m
                  </span>
                </div>

                {donor.message && (
                  <p className="text-xs text-white/90 bg-surface-container p-2.5 rounded-xl border border-outline/15 italic">
                    "{donor.message}"
                  </p>
                )}

                {/* Privacy-gated Contact */}
                {isVerified ? (
                  <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-fixed font-bold flex items-center gap-1 text-[11px]">
                        <Unlock className="w-3 h-3 text-secondary" />
                        <span>Phone Accessible</span>
                      </span>
                      <span className="font-mono font-bold text-white">{donor.phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${donor.phone}`}
                        className="py-1.5 px-3 rounded-lg bg-secondary text-surface text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-lg bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-container border border-outline/20 text-xs text-on-surface-variant space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Phone Locked</span>
                      </span>
                      <span className="font-mono text-on-surface-variant/50">+91 98201 •••••</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/70">
                      Unlocks upon medical verification of hospital requisition.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Location Card */}
      <div className="p-5 rounded-2xl bg-surface-container border border-outline/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">{currentReq.hospital_name}</p>
            <p className="text-on-surface-variant">{currentReq.hospital_city} • {currentReq.hospital_room}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-secondary-fixed">Verified Hospital Counter</span>
      </div>
    </div>
  )
}
