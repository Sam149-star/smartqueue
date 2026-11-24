import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Stethoscope, CheckCircle, XCircle, AlertTriangle, Hospital, FileText, Phone, Clock, ArrowRight, UserCheck, Sparkles, ClipboardList } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useBloodRequests } from '../lib/bloodRequestContext'
import { BoondMascot } from '../components/mascots/BoondMascot'

export const VerifierView: React.FC = () => {
  const { user, isVerifier, requireAuth } = useAuth()
  const { requests, verifyRequest, rejectRequest } = useBloodRequests()
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Default verifier identity
  const verifierIdentity = user?.fullName
    ? `Dr. ${user.fullName} (Registered Medical Officer)`
    : 'Dr. Priya Sen (MMC-2018-09124, Lilavati Blood Bank)'

  const pendingRequests = requests.filter((r) => r.status === 'pending_verification')
  const verifiedRequests = requests.filter((r) => r.status === 'matching' || r.status === 'verified' || r.status === 'fulfilled')
  const rejectedRequests = requests.filter((r) => r.status === 'rejected')

  const handleVerify = (id: string, code: string) => {
    requireAuth(() => {
      verifyRequest(id, verifierIdentity, 'Requisition cross-checked with hospital ward & blood bank.')
      setSuccessToast(`Request ${code} successfully verified! Donor alerts dispatched & contacts unlocked.`)
      setTimeout(() => setSuccessToast(null), 4000)
    }, 'Sign in with a medical verifier account to approve requests')
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return
    rejectRequest(id, rejectReason)
    setRejectingId(null)
    setRejectReason('')
    setSuccessToast(`Request marked as rejected with reason.`)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ══════════════ PROMINENT HERO STAGE (Big Boond Mascot - Meditating Calm) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Medical Verifier Console</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Hospital Requisition Verification
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Verify urgent hospital blood requests before alerts are dispatched to voluntary donors. As an authorized medical verifier, your clinical approval unlocks donor contact sharing for anxious families.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/questionnaire"
                className="px-5 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:brightness-110 flex items-center gap-2 transition-all shadow-sm"
              >
                <Stethoscope className="w-4 h-4 text-amber-400" />
                <span>Verifier Clinical Credentials Onboarding</span>
              </Link>
            </div>
          </div>

          {/* Prominent Mascot Stage (Size 220, Meditating Calm) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-amber-500/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>"Clinical verification guards donor trust!"</span>
                </p>
              </div>
              <BoondMascot
                size={220}
                stage="calm"
                variant="meditating"
                alt="Boond medical verifier mascot"
                interactive={false}
              />
              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Clinical Gatekeeper
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verifier Role Notice Banner */}
      <div className="p-4 rounded-2xl bg-surface-container border border-outline/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white">Separate Clinical Onboarding Policy</p>
            <p className="text-[11px] text-on-surface-variant">
              Medical verifiers submit professional qualifications (MBBS/MD/DNB), State Medical Council registration, and hospital badge ID. <strong>No personal health questions are asked to verifiers.</strong>
            </p>
          </div>
        </div>
        <Link
          to="/questionnaire"
          className="px-3.5 py-1.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-[11px] font-semibold hover:text-white shrink-0"
        >
          View Qualification Form
        </Link>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/50 text-secondary-fixed text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-secondary" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline/20 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <span>Pending Clinical Review</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px]">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'verified'
              ? 'bg-secondary-container text-secondary-fixed border border-secondary/40'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <span>Verified & Dispatched</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary-container-high text-[10px]">
            {verifiedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'rejected'
              ? 'bg-primary-container text-primary-fixed border border-primary/40'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <span>Rejected</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary-container/40 text-[10px]">
            {rejectedRequests.length}
          </span>
        </button>
      </div>

      {/* Queue Stream */}
      <div className="space-y-4">
        {activeTab === 'pending' && pendingRequests.length === 0 && (
          <div className="p-8 rounded-3xl bg-surface-container border border-outline/20 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-secondary mx-auto" />
            <h3 className="font-bold text-white text-base">All Caught Up!</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              No pending hospital blood requisitions in the verification queue. Newly submitted requests from families will appear here immediately.
            </p>
          </div>
        )}

        {activeTab === 'pending' &&
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-extrabold text-base">
                    {req.blood_group}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-headline">{req.code}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        Awaiting Verification
                      </span>
                      {req.urgency === 'critical' && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary-fixed text-[10px] font-bold">
                          Critical Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Submitted: {req.created_at} • Requester: {req.requester_name} ({req.requester_phone})
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-xs font-bold text-white block">
                    {req.units_needed} Units • {req.component.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-[11px] text-amber-300 font-medium">Requisition Slip Uploaded</span>
                </div>
              </div>

              {/* Patient & Hospital Clinical Dossier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface-container-high border border-outline/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Patient Name</span>
                  <strong className="text-white font-headline text-sm">{req.patient_name}</strong>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">{req.hospital_room}</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-high border border-outline/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Hospital & City</span>
                  <strong className="text-white block truncate">{req.hospital_name}</strong>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">{req.hospital_city}</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-high border border-outline/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Attending Doctor</span>
                  <strong className="text-white block truncate">{req.doctor_name}</strong>
                  <span className="text-[10px] text-secondary-fixed block mt-0.5">Registered In-Charge</span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-high border border-outline/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block font-medium">Requisition Status</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Hospital Slip Attached</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">Stamp & Signature Present</span>
                </div>
              </div>

              {/* Rejecting Form if open */}
              {rejectingId === req.id && (
                <div className="p-4 rounded-2xl bg-primary-container/20 border border-primary/40 space-y-3">
                  <label className="block text-xs font-bold text-primary-fixed">
                    Reason for Rejection / Clarification:
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Hospital blood requisition slip stamp unreadable; please re-upload clear image with MRN."
                    className="w-full p-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-on-surface-variant">
                  🔒 Approving dispatches priority alerts to {req.blood_group} voluntary donors and unlocks direct phone communication.
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setRejectingId(req.id)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs font-bold text-on-surface hover:text-white hover:border-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-primary" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify(req.id, req.code)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary-container to-secondary text-surface font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <CheckCircle className="w-4 h-4 text-surface" />
                    <span>Verify & Dispatch Donor Alerts</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

        {activeTab === 'verified' && (
          <div className="space-y-4">
            {verifiedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-surface-container border border-secondary/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold text-sm">
                      {req.blood_group}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm font-headline">{req.code} • {req.patient_name}</strong>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary-fixed text-[10px] font-bold">
                          Verified & Matching
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {req.hospital_name}, {req.hospital_city} • {req.units_needed} units {req.component}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-secondary-fixed">
                    {req.reverted_donors.length} Reverted Donors
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/20 text-xs text-on-surface-variant space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Verified By: {req.verified_by}</span>
                    <span className="text-on-surface-variant">{req.verified_at}</span>
                  </div>
                  <p className="text-[11px]">{req.verification_notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rejected' && (
          <div className="space-y-4">
            {rejectedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-surface-container border border-primary/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-white text-sm font-headline">{req.code} • {req.patient_name}</strong>
                    <p className="text-[11px] text-on-surface-variant">
                      {req.hospital_name} • {req.blood_group}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary-fixed text-[10px] font-bold">
                    Rejected
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high border border-outline/20 text-xs text-primary-fixed">
                  <strong>Reason:</strong> {req.verification_notes || 'Verification failed.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
