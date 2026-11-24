import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, PlusCircle, Users, Activity, ShieldCheck, CheckCircle2, ArrowRight, Bell, Sparkles, Stethoscope, LogIn, Clock, MapPin, Send, Check, Phone, Lock, Unlock, FileText } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useBloodRequests } from '../lib/bloodRequestContext'
import { BoondMascot } from '../components/mascots/BoondMascot'

export const HomeView: React.FC = () => {
  const { user, isDonor, isReceiver, isVerifier, quickDemoLogin, openAuthSheet } = useAuth()
  const { requests, activeRequest, revertAsDonor } = useBloodRequests()
  const [donorAvailable, setDonorAvailable] = useState(true)
  const [revertedAlertMap, setRevertedAlertMap] = useState<Record<string, boolean>>({})

  const isAuth = user && !user.isAnonymous
  const currentReq = activeRequest || requests[0]
  const isReqVerified = currentReq && (currentReq.status === 'matching' || currentReq.status === 'verified' || currentReq.status === 'fulfilled')

  const handleQuickRevert = (reqId: string, reqBlood: any) => {
    revertAsDonor(reqId, {
      name: user?.fullName || 'Rahul Varma',
      bloodGroup: reqBlood,
      city: 'Mumbai',
      area: 'Andheri West',
      phone: '+91 98201 44892',
      distanceKm: 3.5,
      etaMinutes: 20,
      message: 'I am on my way to the hospital blood bank.'
    })
    setRevertedAlertMap((prev) => ({ ...prev, [reqId]: true }))
  }

  return (
    <div className="space-y-8 pb-8">
      {/* ══════════════ HERO SECTION (Boond with Chosen Celebrating Waving Sign) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-10 shadow-xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 -z-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 w-72 h-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Hero Left Content */}
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/30 border border-primary/40 text-primary-fixed text-xs font-bold">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Location- & Blood-Group-Based Matching</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Urgent blood matching when every minute counts.
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              During urgent medical procedures, families waste critical hours searching scattered WhatsApp groups and spreadsheets. Raktify connects verified urgent hospital blood requests with consenting voluntary donors nearby.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-on-surface-variant/90 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Hospital Verified Requisitions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Voluntary Consenting Donors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Encrypted Private Contacts
              </span>
            </div>
          </div>

          {/* Hero Right: Mascot Stage with Chosen Celebrating Waving Sign */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-4 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
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
                  size={250}
                  variant="sign"
                  stage="celebrating"
                  alt="Boond waving lifesaving sign mascot"
                  interactive={false}
                />
              </div>

              <div className="mt-1 px-3.5 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-xs text-on-surface-variant font-medium">
                Boond • Welcoming Lifesavers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 1. NOT SIGNED IN: CLEAN PERSONA ONBOARDING (JUDGES DEMO) ══════════════ */}
      {!isAuth && (
        <section className="space-y-5 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Interactive Persona Showcase</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-white">
              Choose a Role to Explore Raktify
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              To keep the platform focused and secure, navigation tabs are strictly filtered by your signed-in role. Tap any persona below to enter as a judge or test user.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Persona 1: Voluntary Donor */}
            <div className="p-6 rounded-3xl bg-surface-container border border-secondary/40 space-y-4 hover:border-secondary transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 text-secondary flex items-center justify-center font-extrabold text-lg">
                  🩸
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">Voluntary Donor</h3>
                  <p className="text-xs text-secondary-fixed font-semibold mt-0.5">Rahul Varma • O+ Positive</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Review health eligibility screening, provide voluntary donation consent, set urgent availability, and revert to matching patients nearby.
                </p>
              </div>

              <button
                onClick={() => quickDemoLogin('donor')}
                className="w-full py-3 rounded-2xl bg-secondary text-surface font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter as Voluntary Donor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Persona 2: Urgent Requester */}
            <div className="p-6 rounded-3xl bg-surface-container border border-primary/40 space-y-4 hover:border-primary transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/40 text-primary-fixed flex items-center justify-center font-extrabold text-lg">
                  🏥
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">Urgent Requester</h3>
                  <p className="text-xs text-primary-fixed font-semibold mt-0.5">Aakash Sharma • Lilavati Hospital</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Submit patient blood requisition slip, track verifier review, monitor live donor reverts, and access contact details once verified.
                </p>
              </div>

              <button
                onClick={() => quickDemoLogin('receiver')}
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter as Requester</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Persona 3: Medical Verifier */}
            <div className="p-6 rounded-3xl bg-surface-container border border-amber-500/40 space-y-4 hover:border-amber-400 transition-all shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold text-lg">
                  🩺
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">Medical Verifier</h3>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">Dr. Priya Sen • MMC-2018-09124</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Authorized blood bank officer. Onboards with clinical council qualifications (no health form) to verify hospital requisitions before dispatch.
                </p>
              </div>

              <button
                onClick={() => quickDemoLogin('verifier')}
                className="w-full py-3 rounded-2xl bg-amber-500 text-surface font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter as Medical Verifier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Or Sign In with Custom Email */}
          <div className="text-center pt-2">
            <button
              onClick={() => openAuthSheet('signin')}
              className="text-xs text-on-surface-variant hover:text-white underline font-semibold"
            >
              Have a custom account? Click here to Sign In with Email
            </button>
          </div>
        </section>
      )}

      {/* ══════════════ 2. SIGNED IN AS DONOR: ONLY DONOR HUB ══════════════ */}
      {isAuth && isDonor && !isReceiver && !isVerifier && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Voluntary Donor Portal
              </span>
              <h2 className="font-headline text-2xl font-bold text-white mt-0.5">
                Welcome back, {user.fullName}!
              </h2>
              <p className="text-xs text-on-surface-variant">
                Your voluntary consent is on record. Compatible patients in your city are matched below.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white">Availability:</span>
              <button
                onClick={() => setDonorAvailable(!donorAvailable)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  donorAvailable
                    ? 'bg-secondary text-surface'
                    : 'bg-surface-container border border-outline/30 text-on-surface-variant'
                }`}
              >
                {donorAvailable ? '🟢 Available for Urgent Alerts' : '⚪ Paused'}
              </button>
            </div>
          </div>

          {/* Incoming Urgent Alerts Matching Donor */}
          <div className="p-6 rounded-3xl bg-surface-container border border-secondary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4 animate-bounce-soft" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-white">
                    Urgent Compatible Alerts in Mumbai
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Verified hospital cases requiring O+ blood within your vicinity.
                  </p>
                </div>
              </div>
              <Link
                to="/donors"
                className="text-xs text-secondary-fixed font-bold hover:underline"
              >
                View all in directory →
              </Link>
            </div>

            {requests
              .filter((r) => r.status === 'matching' || r.status === 'pending_verification')
              .slice(0, 2)
              .map((req) => {
                const hasReverted = revertedAlertMap[req.id]
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary text-white font-extrabold flex items-center justify-center text-sm font-headline shrink-0">
                        {req.blood_group}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{req.patient_name}</strong>
                          <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary-fixed text-[9px] font-bold uppercase">
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {req.hospital_name} • {req.units_needed} units {req.component}
                        </p>
                        <p className="text-[11px] text-secondary-fixed mt-0.5">
                          {req.verified_by ? `✓ Verified by: ${req.verified_by}` : '⏳ Medical verifier reviewing slip'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {hasReverted ? (
                        <span className="px-4 py-2 rounded-xl bg-secondary-container/50 border border-secondary/40 text-secondary-fixed text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-secondary" />
                          <span>Reverted & Contact Shared</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickRevert(req.id, req.blood_group)}
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

          {/* Donor Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/donors"
              className="p-5 rounded-2xl bg-surface-container border border-outline/25 hover:border-secondary transition-all space-y-2 block"
            >
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>Search Voluntary Donor Directory</span>
              </h4>
              <p className="text-xs text-on-surface-variant">
                Browse ABO/Rh compatibility filters and locate nearby consenting blood donors.
              </p>
            </Link>

            <Link
              to="/questionnaire"
              className="p-5 rounded-2xl bg-surface-container border border-outline/25 hover:border-secondary transition-all space-y-2 block"
            >
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-secondary" />
                <span>Health Screening & Consent Declaration</span>
              </h4>
              <p className="text-xs text-on-surface-variant">
                Update your 15 NBTC health questions and truthful voluntary donation pledge.
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════ 3. SIGNED IN AS REQUESTER: ONLY REQUESTER HUB ══════════════ */}
      {isAuth && isReceiver && !isVerifier && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Patient & Requester Portal
              </span>
              <h2 className="font-headline text-2xl font-bold text-white mt-0.5">
                Active Requisitions for {user.fullName}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Manage hospital blood requisitions and monitor live donors who have reverted back.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/request"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:brightness-105 flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Request</span>
              </Link>
              <Link
                to="/tracker"
                className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline/30 text-white font-semibold text-xs hover:border-primary flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4 text-primary" />
                <span>Live Tracker</span>
              </Link>
            </div>
          </div>

          {/* Active Request Overview Card */}
          {currentReq && (
            <div className="p-6 rounded-3xl bg-surface-container border border-primary/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase font-headline">
                      Request #{currentReq.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isReqVerified
                          ? 'bg-secondary-container text-secondary-fixed'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isReqVerified ? 'Verified by Medical Officer' : 'Awaiting Medical Verification'}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-white mt-1">
                    {currentReq.patient_name} • {currentReq.blood_group} ({currentReq.units_needed} Units {currentReq.component.replace('_', ' ').toUpperCase()})
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {currentReq.hospital_name} • {currentReq.hospital_room}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white block">
                    {currentReq.reverted_donors.length} Donors Reverted
                  </span>
                  <span className="text-[11px] text-secondary-fixed">
                    {isReqVerified ? '🔓 Contacts Unlocked' : '🔒 Contacts Protected'}
                  </span>
                </div>
              </div>

              {/* Reverted Donors Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                  <span>Donors Who Responded:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentReq.reverted_donors.slice(0, 2).map((donor) => (
                    <div
                      key={donor.id}
                      className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/20 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{donor.donorName} ({donor.bloodGroup})</span>
                        <span className="text-[10px] text-secondary-fixed font-bold">ETA {donor.etaMinutes}m</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {donor.area}, {donor.city} ({donor.distanceKm} km away)
                      </p>

                      {isReqVerified ? (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-white">{donor.phone}</span>
                          <a
                            href={`tel:${donor.phone}`}
                            className="px-2.5 py-1 rounded-lg bg-secondary text-surface text-[10px] font-bold"
                          >
                            Call
                          </a>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-300">🔒 Phone locked until verified</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ══════════════ 4. SIGNED IN AS VERIFIER: ONLY VERIFIER HUB ══════════════ */}
      {isAuth && isVerifier && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Medical Verifier Console</span>
              </span>
              <h2 className="font-headline text-2xl font-bold text-white mt-0.5">
                Dr. {user.fullName} (Registered Medical Officer)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Authorized clinical gatekeeper for Lilavati & affiliated blood centres.
              </p>
            </div>

            <Link
              to="/verifier"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-surface font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-2"
            >
              <span>Open Verifier Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pending Hospital Requisitions Queue */}
          <div className="p-6 rounded-3xl bg-surface-container border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-amber-400" />
                <span>Pending Clinical Verification Queue</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                {requests.filter((r) => r.status === 'pending_verification').length} Requisitions Awaiting Approval
              </span>
            </div>

            {requests
              .filter((r) => r.status === 'pending_verification')
              .map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold flex items-center justify-center text-sm font-headline">
                      {req.blood_group}
                    </div>
                    <div>
                      <strong className="text-white text-sm">{req.code} • {req.patient_name}</strong>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {req.hospital_name} ({req.hospital_city}) • {req.units_needed} Units {req.component}
                      </p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>Attending: {req.doctor_name} • Requisition Slip Attached</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/verifier"
                    className="px-4 py-2 rounded-xl bg-secondary text-surface text-xs font-extrabold hover:brightness-110 shadow-sm text-center"
                  >
                    Inspect & Verify Slip
                  </Link>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
