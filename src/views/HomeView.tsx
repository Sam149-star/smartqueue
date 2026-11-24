import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, PlusCircle, Users, Activity, ShieldCheck, CheckCircle2, ArrowRight, Bell, Sparkles } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { BoondMascot } from '../components/mascots/BoondMascot'

export const HomeView: React.FC = () => {
  const { user, isDonor, isReceiver, isVerifier } = useAuth()
  const [donorAvailable, setDonorAvailable] = useState(true)

  return (
    <div className="space-y-6 pb-6">
      {/* ══════════════ HERO SECTION (Boond with Chosen Celebrating Waving Sign) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 -z-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Hero Left Content */}
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 border border-primary/40 text-primary-fixed text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Location- & Blood-Group-Based Matching</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Urgent blood matching when every minute counts.
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              During urgent medical procedures, families waste critical hours searching scattered WhatsApp groups and spreadsheets. Raktify connects verified urgent blood requests with consenting voluntary donors nearby.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/request"
                className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>I Need Blood (Request)</span>
              </Link>
              <Link
                to="/donors"
                className="px-5 py-3 rounded-2xl bg-secondary-container border border-secondary/40 text-secondary-fixed font-bold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current text-secondary" />
                <span>I Want to Donate</span>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] text-on-surface-variant/80 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Hospital Verified Requisitions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Voluntary Consenting Donors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Encrypted Private Contacts
              </span>
            </div>
          </div>

          {/* Hero Right: Mascot Stage with Chosen Celebrating Waving Sign */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              {/* Mascot Dialogue Banner */}
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>"We Help! Ready to connect donors & hospitals"</span>
                </p>
              </div>

              {/* Chosen Expression: Waving Sign + Celebrating Joyful Crescent Expression */}
              <div className="relative py-1 flex items-center justify-center">
                <BoondMascot
                  size={240}
                  variant="sign"
                  stage="celebrating"
                  alt="Boond waving lifesaving sign mascot"
                  interactive={false}
                />
              </div>

              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Welcoming Lifesavers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ ROLE-AWARE DASHBOARD ══════════════ */}
      {user && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-white flex items-center gap-2">
              <span>Your Raktify Dashboard</span>
              <span className="text-xs font-normal text-on-surface-variant">({user.fullName})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Donor Card */}
            {isDonor && (
              <div className="p-5 rounded-2xl bg-surface-container border border-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-secondary fill-current" />
                    <span className="font-bold text-sm text-white">Donor Availability</span>
                  </div>
                  <button
                    onClick={() => setDonorAvailable(!donorAvailable)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      donorAvailable
                        ? 'bg-secondary text-surface'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {donorAvailable ? '🟢 Available' : '⚪ Paused'}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {donorAvailable
                    ? 'You are active for urgent matching alerts in your city.'
                    : 'Alerts paused. Tap to reactivate when ready.'}
                </p>
                <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline/15 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Eligibility Status</span>
                  <span className="font-semibold text-secondary-fixed flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Ready to donate
                  </span>
                </div>
                <Link
                  to="/donors"
                  className="block text-center py-2 rounded-xl bg-secondary-container/40 text-secondary-fixed text-xs font-semibold hover:brightness-110"
                >
                  Manage Donor Profile
                </Link>
              </div>
            )}

            {/* Requester Card */}
            {isReceiver && (
              <div className="p-5 rounded-2xl bg-surface-container border border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span className="font-bold text-sm text-white">Patient / Requester</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-container text-white font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Create and track verified urgent blood requests with real-time match notifications.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/request"
                    className="flex-1 py-2 text-center rounded-xl bg-primary text-on-primary text-xs font-bold hover:brightness-105"
                  >
                    New Request
                  </Link>
                  <Link
                    to="/tracker"
                    className="flex-1 py-2 text-center rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:text-white"
                  >
                    Live Tracker
                  </Link>
                </div>
              </div>
            )}

            {/* Verifier Card */}
            {isVerifier && (
              <div className="p-5 rounded-2xl bg-surface-container border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Medical Verifier</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                    Authorized
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Verify hospital blood requisition slips and review AI flags before dispatching match calls.
                </p>
                <Link
                  to="/tracker"
                  className="block text-center py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30"
                >
                  Open Verifier Queue
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════ 3-CARD ONBOARDING & TRUST ══════════════ */}
      <section className="space-y-3">
        <h2 className="font-headline text-lg font-bold text-white">How Raktify Protects & Matches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container border border-outline/20 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/30 border border-primary/40 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <h3 className="font-bold text-sm text-white">Strict Medical Verification</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every request requires a hospital requisition slip, cross-checked by authorized verifiers before donor alerts are triggered.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container border border-outline/20 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/30 border border-secondary/40 flex items-center justify-center text-secondary font-bold">
              2
            </div>
            <h3 className="font-bold text-sm text-white">Voluntary Consent & Privacy</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Donor contact info is never public. Phone numbers are stored privately and only revealed after a donor voluntarily accepts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container border border-outline/20 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
              3
            </div>
            <h3 className="font-bold text-sm text-white">Live Status Tracker</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Families share a single live status link without endless group calls, watching matched and accepted units update in real time.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
