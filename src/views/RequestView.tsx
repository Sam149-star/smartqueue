import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, ShieldAlert, Heart, Hospital, MapPin, CheckCircle, AlertCircle, Sparkles, ClipboardList, Phone, MessageSquare, Clock, ShieldCheck, Lock, Unlock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useBloodRequests } from '../lib/bloodRequestContext'
import { BoondMascot } from '../components/mascots/BoondMascot'
import { BloodGroup, BloodComponent, UrgencyLevel } from '../lib/types'

export const RequestView: React.FC = () => {
  const { user, requireAuth } = useAuth()
  const navigate = useNavigate()
  const { requests, activeRequest, submitNewRequest, setActiveRequestId } = useBloodRequests()

  const [patientName, setPatientName] = useState('')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+')
  const [component, setComponent] = useState<BloodComponent>('packed_rbc')
  const [units, setUnits] = useState(2)
  const [urgency, setUrgency] = useState<UrgencyLevel>('critical')
  const [hospitalName, setHospitalName] = useState('Lilavati Hospital & Research Centre')
  const [hospitalRoom, setHospitalRoom] = useState('ICU Ward 3, Bed 12')
  const [doctorName, setDoctorName] = useState('Dr. Ramesh Kulkarni, MS')
  const [city, setCity] = useState('Mumbai')
  const [requisitionAttached, setRequisitionAttached] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null)

  const bloodGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const components: { value: BloodComponent; label: string }[] = [
    { value: 'packed_rbc', label: 'Packed Red Blood Cells (PRBC)' },
    { value: 'whole_blood', label: 'Whole Blood' },
    { value: 'platelets', label: 'Platelets (Single / Random Donor)' },
    { value: 'fresh_frozen_plasma', label: 'Fresh Frozen Plasma (FFP)' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requireAuth(() => {
      const newReq = submitNewRequest({
        patient_name: patientName,
        blood_group: bloodGroup,
        component: component,
        units_needed: units,
        urgency: urgency,
        hospital_name: hospitalName,
        hospital_city: city,
        hospital_room: hospitalRoom,
        doctor_name: doctorName,
        requisition_attached: requisitionAttached,
        requester_name: user?.fullName || 'Family Caregiver',
        requester_phone: '+91 98200 11223'
      })
      setShowNewForm(false)
      setSubmittedAlert(`Request ${newReq.code} submitted to verifier queue!`)
      setTimeout(() => setSubmittedAlert(null), 5000)
    }, 'Sign in to submit an urgent blood request')
  }

  const currentDisplayReq = activeRequest || requests[0]
  const isReqVerified = currentDisplayReq && (currentDisplayReq.status === 'matching' || currentDisplayReq.status === 'verified' || currentDisplayReq.status === 'fulfilled')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ══════════════ PROMINENT HERO STAGE (Big Boond Mascot - Meditating Calm) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 border border-primary/40 text-primary-fixed text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Requester & Patient Portal</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Urgent Blood Requisitions
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Submit patient details, request required blood units, and track real-time voluntary donors who have reverted back. For safety, donor phone numbers are unlocked once your requisition is verified by a medical verifier.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/questionnaire"
                className="px-5 py-2.5 rounded-2xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-primary transition-all flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4 text-primary" />
                <span>My Patient & Hospital Questionnaire</span>
              </Link>
              <Link
                to="/verifier"
                className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Switch to Medical Verifier View</span>
              </Link>
            </div>
          </div>

          {/* Prominent Mascot Stage (Size 220, Meditating Calm) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>"Stay calm. We're prioritizing your request."</span>
                </p>
              </div>
              <BoondMascot
                size={220}
                stage="calm"
                variant="meditating"
                alt="Boond meditating calm mascot"
                interactive={false}
              />
              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Calm Reassurance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submitted Alert Toast */}
      {submittedAlert && (
        <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/50 text-secondary-fixed text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-secondary" />
          <span>{submittedAlert}</span>
        </div>
      )}

      {/* ══════════════ SECTION 1: REQUESTER ACTIVE DETAILS & LIVE TRACKER ══════════════ */}
      {currentDisplayReq && !showNewForm && (
        <div className="space-y-6">
          {/* Active Request Overview Card */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline/15 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider font-headline">
                    Active Request #{currentDisplayReq.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isReqVerified
                        ? 'bg-secondary-container text-secondary-fixed border border-secondary/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isReqVerified ? 'Verified by Medical Officer' : 'Awaiting Medical Verification'}
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-white mt-1">
                  {currentDisplayReq.patient_name} • {currentDisplayReq.blood_group} ({currentDisplayReq.units_needed} Units {currentDisplayReq.component.replace('_', ' ').toUpperCase()})
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {currentDisplayReq.hospital_name}, {currentDisplayReq.hospital_city} • {currentDisplayReq.hospital_room}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewForm(true)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-primary transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-primary" />
                  <span>New Request</span>
                </button>
                <Link
                  to={`/r/${currentDisplayReq.share_token}`}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:brightness-105 transition-all flex items-center gap-1.5"
                >
                  <span>Open Live Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                isReqVerified
                  ? 'bg-secondary-container/20 border-secondary/40 text-secondary-fixed'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  {isReqVerified ? (
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">
                    {isReqVerified
                      ? `Verified by: ${currentDisplayReq.verified_by}`
                      : 'Hospital Requisition Under Review'}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {isReqVerified
                      ? 'Requisition verified authentic. Voluntary donor contact details are now unlocked below!'
                      : 'An authorized medical verifier is cross-checking hospital records. Donor contact details will unlock immediately upon verification.'}
                  </p>
                </div>
              </div>
              <Link
                to="/verifier"
                className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline/25 text-[11px] font-bold text-white hover:border-amber-400 shrink-0"
              >
                Verifier Portal →
              </Link>
            </div>

            {/* ══════════════ WHO ALL REVERTED BACK TO YOU ══════════════ */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Donors Who Reverted Back to You ({currentDisplayReq.reverted_donors.length})</span>
                </h3>
                <span className="text-[11px] text-on-surface-variant">
                  {isReqVerified ? '🔓 Contacts Unlocked' : '🔒 Contacts Protected'}
                </span>
              </div>

              {currentDisplayReq.reverted_donors.length === 0 ? (
                <div className="p-6 rounded-2xl bg-surface-container-high/40 border border-outline/20 text-center space-y-2">
                  <p className="text-xs text-on-surface-variant">
                    No donors have reverted yet. Nearby {currentDisplayReq.blood_group} donors are receiving notifications.
                  </p>
                  <Link
                    to="/donors"
                    className="inline-block text-xs text-primary font-bold hover:underline"
                  >
                    View compatible donors in directory →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDisplayReq.reverted_donors.map((donor) => (
                    <div
                      key={donor.id}
                      className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/25 space-y-3 hover:border-outline/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 border border-secondary/40 text-secondary flex items-center justify-center font-extrabold text-sm font-headline">
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
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary-fixed text-[10px] font-bold">
                          ETA {donor.etaMinutes} mins
                        </span>
                      </div>

                      {donor.message && (
                        <p className="text-xs text-white/90 bg-surface-container p-2.5 rounded-xl border border-outline/15 italic">
                          "{donor.message}"
                        </p>
                      )}

                      {/* Contact Info: Locked vs Unlocked based on Verifier */}
                      <div className="pt-1">
                        {isReqVerified ? (
                          <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary/40 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-secondary-fixed font-bold flex items-center gap-1">
                                <Unlock className="w-3.5 h-3.5 text-secondary" />
                                <span>Verified Contact Details</span>
                              </span>
                              <span className="font-mono font-bold text-white">{donor.phone}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <a
                                href={`tel:${donor.phone}`}
                                className="py-2 px-3 rounded-lg bg-secondary text-surface text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Donor</span>
                              </a>
                              <a
                                href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(donor.donorName)},%20thank%20you%20for%20reverting%20on%20Raktify%20for%20patient%20${encodeURIComponent(currentDisplayReq.patient_name)}.`}
                                target="_blank"
                                rel="noreferrer"
                                className="py-2 px-3 rounded-lg bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-surface-container border border-outline/20 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-on-surface-variant">
                              <span className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Phone Number Locked</span>
                              </span>
                              <span className="font-mono text-[11px] text-on-surface-variant/60">
                                +91 98201 •••••
                              </span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant/80 leading-relaxed">
                              🔒 In adherence with donor privacy protocols, direct phone numbers are unlocked once on-duty verifiers validate your hospital slip.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SECTION 2: CREATE NEW URGENT REQUEST FORM ══════════════ */}
      {(showNewForm || !currentDisplayReq) && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              <span>Create New Urgent Blood Request</span>
            </h2>
            {currentDisplayReq && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-xs text-on-surface-variant hover:text-white"
              >
                Cancel & Back to Current Request
              </button>
            )}
          </div>

          {/* Patient Card */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
            <h3 className="font-headline text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>1. Patient & Blood Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Meera Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Units Needed *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Required Blood Group *</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-xl font-headline font-bold text-sm transition-all ${
                      bloodGroup === bg
                        ? 'bg-primary text-on-primary ring-2 ring-primary shadow-md'
                        : 'bg-surface-container-high border border-outline/20 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Blood Component *</label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value as BloodComponent)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-xs text-white focus:outline-none"
                >
                  {components.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Urgency Level *</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-xs text-white focus:outline-none"
                >
                  <option value="critical">Critical (Immediate / Within 4 Hours)</option>
                  <option value="high">High (Within 12 Hours)</option>
                  <option value="standard">Standard (Scheduled Procedure / 24 Hours)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hospital Card */}
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
            <h3 className="font-headline text-sm font-bold text-white flex items-center gap-2">
              <Hospital className="w-4 h-4 text-secondary" />
              <span>2. Hospital & Attending Physician</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Lilavati Hospital & Research Centre"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Ward / Room / Bed Details</label>
                <input
                  type="text"
                  value={hospitalRoom}
                  onChange={(e) => setHospitalRoom(e.target.value)}
                  placeholder="e.g. ICU Bed 12 / 3rd Floor"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Attending Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kulkarni, MS"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Requisition Slip Attachment */}
            <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span>Hospital Blood Requisition Slip</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRequisitionAttached(!requisitionAttached)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    requisitionAttached
                      ? 'bg-secondary text-surface'
                      : 'bg-surface-container-high border border-outline/30 text-on-surface-variant'
                  }`}
                >
                  {requisitionAttached ? '✓ Requisition Attached' : '+ Attach Slip'}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/80">
                Required for clinical verification. Verifiers cross-check this slip before dispatching donor alerts to prevent spam and protect donor time.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit to Verifier Queue</span>
          </button>
        </form>
      )}
    </div>
  )
}
