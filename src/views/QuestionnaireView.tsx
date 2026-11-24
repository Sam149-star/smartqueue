import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Heart,
  Shield,
  User,
  MapPin,
  Calendar,
  Phone,
  FileText,
  Hospital,
  AlertTriangle,
  ArrowRight,
  Save,
  Sparkles,
  Stethoscope,
  Award,
  Building2,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { BoondMascot } from '../components/mascots/BoondMascot'
import { BloodGroup, BloodComponent } from '../lib/types'

export const QuestionnaireView: React.FC = () => {
  const { user, requireAuth } = useAuth()

  // 3-way Profile Type selection: Donor, Recipient, Verifier
  const [profileType, setProfileType] = useState<'donor' | 'recipient' | 'verifier'>('donor')

  // Personal Info attributes
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [dob, setDob] = useState('')
  const [age, setAge] = useState<number>(28)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+')
  const [weightKg, setWeightKg] = useState<number>(68)
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState(user?.city || 'Mumbai')
  const [district, setDistrict] = useState('Mumbai Suburban')
  const [pincode, setPincode] = useState('400050')

  // Recipient specific
  const [hospitalName, setHospitalName] = useState('')
  const [treatingDoctor, setTreatingDoctor] = useState('')

  // Verifier specific qualifications (NO health questions!)
  const [medicalDegree, setMedicalDegree] = useState('MBBS')
  const [councilRegNumber, setCouncilRegNumber] = useState('')
  const [licensingAuthority, setLicensingAuthority] = useState('National Medical Commission / State Council')
  const [affiliatedHospital, setAffiliatedHospital] = useState('')
  const [designation, setDesignation] = useState('Medical Officer / Blood Transfusion Specialist')
  const [employeeBadgeId, setEmployeeBadgeId] = useState('')
  const [verifierAttestation, setVerifierAttestation] = useState(false)

  // Dynamic answers dictionary
  const [answers, setAnswers] = useState<Record<string, any>>({})

  // Status
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Derive category from age & gender (or medical_verifier)
  const category =
    profileType === 'verifier'
      ? 'medical_verifier'
      : age >= 60
      ? 'senior'
      : age < 18
      ? 'minor'
      : gender === 'female'
      ? 'adult_female'
      : 'adult_male'

  const isMinor = age < 18 && profileType !== 'verifier'

  // Calculate age from DOB
  const handleDobChange = (val: string) => {
    setDob(val)
    if (val) {
      const birth = new Date(val)
      const diff = Date.now() - birth.getTime()
      const calcAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
      if (!isNaN(calcAge) && calcAge >= 0 && calcAge <= 120) {
        setAge(calcAge)
      }
    }
  }

  // Load existing saved questionnaire from Supabase or localStorage
  useEffect(() => {
    const storageKey = `raktify_questionnaire_${profileType}_${user?.id || 'guest'}`
    const cached = localStorage.getItem(storageKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed.full_name) setFullName(parsed.full_name)
        if (parsed.dob) setDob(parsed.dob)
        if (parsed.age) setAge(parsed.age)
        if (parsed.gender) setGender(parsed.gender)
        if (parsed.blood_group) setBloodGroup(parsed.blood_group)
        if (parsed.weight_kg) setWeightKg(parsed.weight_kg)
        if (parsed.city) setCity(parsed.city)
        if (parsed.district) setDistrict(parsed.district)
        if (parsed.pincode) setPincode(parsed.pincode)
        if (parsed.address) setAddress(parsed.address)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.answers) setAnswers(parsed.answers)
        if (parsed.hospital_name) setHospitalName(parsed.hospital_name)
        if (parsed.treating_doctor) setTreatingDoctor(parsed.treating_doctor)
        if (parsed.answers?.medical_degree) setMedicalDegree(parsed.answers.medical_degree)
        if (parsed.answers?.council_reg) setCouncilRegNumber(parsed.answers.council_reg)
        if (parsed.answers?.affiliated_hospital) setAffiliatedHospital(parsed.answers.affiliated_hospital)
        if (parsed.answers?.designation) setDesignation(parsed.answers.designation)
        if (parsed.answers?.badge_id) setEmployeeBadgeId(parsed.answers.badge_id)
      } catch {
        // Ignored
      }
    }

    if (isSupabaseConfigured() && user && !user.isAnonymous) {
      supabase
        .from('personal_questionnaires')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_type', profileType)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name || '')
            if (data.dob) setDob(data.dob)
            if (data.age) setAge(data.age)
            if (data.gender) setGender(data.gender)
            if (data.blood_group) setBloodGroup(data.blood_group as BloodGroup)
            if (data.weight_kg) setWeightKg(data.weight_kg)
            if (data.city) setCity(data.city)
            if (data.district) setDistrict(data.district)
            if (data.pincode) setPincode(data.pincode)
            if (data.address) setAddress(data.address)
            if (data.phone) setPhone(data.phone)
            if (data.answers) setAnswers(data.answers)
            if (data.hospital_name) setHospitalName(data.hospital_name)
            if (data.treating_doctor) setTreatingDoctor(data.treating_doctor)
          }
        })
    }
  }, [profileType, user])

  const setAnswer = (questionKey: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: val }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    requireAuth(async () => {
      setSaving(true)

      const mergedAnswers = {
        ...answers,
        ...(profileType === 'verifier'
          ? {
              medical_degree: medicalDegree,
              council_reg: councilRegNumber,
              licensing_authority: licensingAuthority,
              affiliated_hospital: affiliatedHospital,
              designation,
              badge_id: employeeBadgeId,
              verifier_attestation: verifierAttestation
            }
          : {})
      }

      const payload = {
        profile_type: profileType,
        category,
        full_name: fullName.trim(),
        dob: dob || null,
        age: Number(age) || 30,
        gender,
        blood_group: bloodGroup,
        weight_kg: Number(weightKg) || null,
        city: city.trim(),
        district: district.trim(),
        pincode: pincode.trim(),
        address: address.trim(),
        phone: phone.trim(),
        answers: mergedAnswers,
        hospital_name: (profileType === 'verifier' ? affiliatedHospital : hospitalName).trim() || null,
        treating_doctor: (profileType === 'verifier' ? designation : treatingDoctor).trim() || null
      }

      // Save to localStorage
      const storageKey = `raktify_questionnaire_${profileType}_${user?.id || 'guest'}`
      localStorage.setItem(storageKey, JSON.stringify(payload))

      // Save to Supabase
      if (isSupabaseConfigured() && user && !user.isAnonymous) {
        try {
          const { error } = await supabase.rpc('save_my_questionnaire', {
            p_profile_type: payload.profile_type,
            p_category: payload.category,
            p_full_name: payload.full_name,
            p_dob: payload.dob,
            p_age: payload.age,
            p_gender: payload.gender,
            p_blood_group: payload.blood_group,
            p_weight_kg: payload.weight_kg,
            p_city: payload.city,
            p_district: payload.district,
            p_pincode: payload.pincode,
            p_address: payload.address,
            p_phone: payload.phone,
            p_answers: payload.answers,
            p_hospital_name: payload.hospital_name,
            p_treating_doctor: payload.treating_doctor
          })

          if (error) {
            console.warn('Supabase questionnaire save error:', error)
          }
        } catch (err: any) {
          console.warn('RPC notice:', err)
        }
      }

      setSaving(false)
      setSavedSuccess(true)
    }, 'Sign in to save your information')
  }

  const bloodGroupsList: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* ══════════════ PROMINENT HERO STAGE (Boond Mascot - Winking Star-Eye Expression) ══════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/95 via-surface-container to-surface-container-low border border-outline/25 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 border border-primary/40 text-primary-fixed text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>BloodConnect & Clinical Onboarding Standards</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {profileType === 'verifier'
                ? 'Medical Verifier Qualification Onboarding'
                : 'Personal Information & Medical Questionnaire'}
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {profileType === 'verifier'
                ? 'Verifiers onboard by submitting legitimate clinical degrees and council registration numbers. No personal health screening required.'
                : 'Complete your standard 15-question medical self-screening to establish preliminary eligibility. Encrypted in private database storage and evaluated with deterministic medical guidelines.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              <span className="text-xs px-3 py-1 rounded-full bg-surface-container-high border border-outline/30 text-white font-semibold">
                Category: <strong>{category.replace('_', ' ').toUpperCase()}</strong>
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-surface-container-high border border-outline/30 text-secondary font-semibold">
                🔒 Private Encrypted Storage
              </span>
            </div>
          </div>

          {/* Prominent Mascot Stage (Size 220, Unique Winking Star-Eye Mascot Expression) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative p-3 rounded-3xl bg-surface-container-high/40 border border-outline/20 backdrop-blur-md flex flex-col items-center">
              <div className="mb-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary/30 text-center shadow-md animate-bounce-soft">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>
                    {profileType === 'verifier'
                      ? '"Clinical verification protects patient safety!"'
                      : '"Accurate health data saves lives! You\'ve got this."'}
                  </span>
                </p>
              </div>

              {/* Distinct Mascot Expression: Meditating + Winking Star Eye Expression */}
              <BoondMascot
                size={220}
                variant="meditating"
                stage="winking"
                alt="Boond winking medical advisor mascot"
                interactive={false}
              />

              <div className="mt-1 px-3 py-1 rounded-full bg-surface-container/70 border border-outline/15 text-[11px] text-on-surface-variant font-medium">
                Boond • Onboarding & Verification Advisor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Way Role Switcher Tab (Donor vs Recipient vs Verifier) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 p-1.5 rounded-2xl bg-surface-container border border-outline/20 gap-1">
        <button
          type="button"
          onClick={() => {
            setProfileType('donor')
            setSavedSuccess(false)
          }}
          className={`py-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            profileType === 'donor'
              ? 'bg-secondary text-surface shadow-md'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Voluntary Donor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileType('recipient')
            setSavedSuccess(false)
          }}
          className={`py-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            profileType === 'recipient'
              ? 'bg-primary text-on-primary shadow-md'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span>Patient / Requester</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileType('verifier')
            setSavedSuccess(false)
          }}
          className={`py-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            profileType === 'verifier'
              ? 'bg-amber-400 text-surface shadow-md font-extrabold'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-amber-300" />
          <span>Medical Verifier</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/50 flex items-center justify-between gap-3 text-secondary-fixed text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {profileType === 'verifier'
                  ? 'Medical verifier credentials saved successfully!'
                  : 'Questionnaire successfully saved and remembered!'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Your profile is safely stored in your private Supabase profile.
              </p>
            </div>
          </div>
          <Link
            to={profileType === 'donor' ? '/donors' : profileType === 'verifier' ? '/tracker' : '/request'}
            className="px-4 py-2 rounded-xl bg-secondary text-surface font-bold text-xs hover:brightness-110 shrink-0"
          >
            Continue
          </Link>
        </div>
      )}

      {/* Minor Warning Notice if under 18 */}
      {isMinor && profileType === 'donor' && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Important Donation Rule in India</p>
            <p className="leading-relaxed">
              In India, individuals below 18 years of age are not legally permitted to donate blood. These donor-side enquiry questions are informational only and cannot create an active donor listing.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ══════════════ SECTION 1: PERSONAL IDENTIFICATION ══════════════ */}
        <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
          <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span>1. Identity & Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {profileType === 'verifier' ? 'Doctor / Verifier Legal Name *' : 'Full Legal Name *'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={profileType === 'verifier' ? 'e.g. Dr. Priya Sharma' : 'e.g. Ramesh Kumar'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Official Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">District *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Mumbai Suburban"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
              />
            </div>

            {profileType !== 'verifier' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Current Age: {age} years</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Blood Group *</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {bloodGroupsList.map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodGroup(bg)}
                        className={`py-1.5 rounded-xl font-headline font-bold text-xs transition-all ${
                          bloodGroup === bg
                            ? 'bg-primary text-on-primary ring-2 ring-primary shadow-sm'
                            : 'bg-surface-container-high border border-outline/20 text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Weight in Kilograms (kg) *</label>
                  <input
                    type="number"
                    min={20}
                    max={200}
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    placeholder="e.g. 65"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 400050"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ══════════════ SECTION 2: VERIFIER MEDICAL QUALIFICATIONS (NO HEALTH QUESTIONS) ══════════════ */}
        {profileType === 'verifier' && (
          <div className="p-6 rounded-3xl bg-surface-container border border-amber-500/30 space-y-4">
            <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>2. Medical Qualifications & Clinical Affiliation</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Provide your medical council licensing credentials to be authorized as a medical verifier for hospital blood requisitions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Medical Degree / Qualification *</label>
                <input
                  type="text"
                  required
                  value={medicalDegree}
                  onChange={(e) => setMedicalDegree(e.target.value)}
                  placeholder="e.g. MBBS, MD (Transfusion Medicine)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Medical Council Registration No. *</label>
                <input
                  type="text"
                  required
                  value={councilRegNumber}
                  onChange={(e) => setCouncilRegNumber(e.target.value)}
                  placeholder="e.g. MMC/2016/08/3421"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Licensing Medical Council *</label>
                <input
                  type="text"
                  required
                  value={licensingAuthority}
                  onChange={(e) => setLicensingAuthority(e.target.value)}
                  placeholder="e.g. Maharashtra Medical Council / NMC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Designation & Department *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Blood Transfusion Officer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white mb-1">
                  Affiliated Hospital / Blood Bank Name & Address *
                </label>
                <input
                  type="text"
                  required
                  value={affiliatedHospital}
                  onChange={(e) => setAffiliatedHospital(e.target.value)}
                  placeholder="e.g. Lilavati Hospital & Research Centre, Bandra West, Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Staff / Employee Badge ID *</label>
                <input
                  type="text"
                  required
                  value={employeeBadgeId}
                  onChange={(e) => setEmployeeBadgeId(e.target.value)}
                  placeholder="e.g. LIL-MED-8492"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-amber-400 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Verifier Attestation */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 space-y-2 mt-4">
              <label className="block text-xs font-bold text-amber-200">
                Medical Professional Ethics & Attestation Declaration *
              </label>
              <label className="flex items-start gap-2.5 text-xs text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={verifierAttestation}
                  onChange={(e) => setVerifierAttestation(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 mt-0.5"
                />
                <span className="leading-relaxed">
                  I solemnly attest and declare that I am a registered medical practitioner with valid council credentials. I accept professional responsibility to review hospital blood requisitions with due clinical diligence and protect donor safety.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ══════════════ SECTION 2: DONOR HEALTH FORM WITH CONCERTED TRUTH DECLARATION ══════════════ */}
        {profileType === 'donor' && (
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-secondary" />
                <span>2. Voluntary Donor Health Screening (15 Questions)</span>
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">
                NBTC Norms
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  1. Have you donated blood previously?
                </label>
                <div className="flex gap-3">
                  {['No, first-time donor', 'Yes, regular donor'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="radio"
                        name="prev_donation"
                        checked={answers.prev_donation === opt}
                        onChange={() => setAnswer('prev_donation', opt)}
                        className="accent-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  2. If yes, when was your last blood donation?
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 months ago, or Never"
                  value={answers.last_donation_time || ''}
                  onChange={(e) => setAnswer('last_donation_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  3. Have you experienced fever, cough, infection or any illness in the last 14 days?
                </label>
                <div className="flex gap-4">
                  {['No', 'Yes'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="radio"
                        name="recent_illness"
                        checked={answers.recent_illness === opt}
                        onChange={() => setAnswer('recent_illness', opt)}
                        className="accent-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {category === 'adult_female' && (
                <>
                  <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                    <label className="block text-xs font-semibold text-white">
                      4. Are you currently pregnant or have you given birth recently?
                    </label>
                    <div className="flex gap-4">
                      {['No', 'Yes'].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                          <input
                            type="radio"
                            name="female_pregnancy"
                            checked={answers.female_pregnancy === opt}
                            onChange={() => setAnswer('female_pregnancy', opt)}
                            className="accent-primary"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                    <label className="block text-xs font-semibold text-white">
                      5. Are you currently breastfeeding?
                    </label>
                    <div className="flex gap-4">
                      {['No', 'Yes'].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                          <input
                            type="radio"
                            name="breastfeeding"
                            checked={answers.breastfeeding === opt}
                            onChange={() => setAnswer('breastfeeding', opt)}
                            className="accent-primary"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                    <label className="block text-xs font-semibold text-white">
                      6. Have you experienced heavy menstrual bleeding or diagnosed with anaemia / low Hb?
                    </label>
                    <div className="flex gap-4">
                      {['No', 'Yes'].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                          <input
                            type="radio"
                            name="anaemia_history"
                            checked={answers.anaemia_history === opt}
                            onChange={() => setAnswer('anaemia_history', opt)}
                            className="accent-primary"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Do you have hypertension, diabetes, heart disease, or any chronic condition?
                </label>
                <div className="flex gap-4">
                  {['No', 'Yes'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="radio"
                        name="chronic_conditions"
                        checked={answers.chronic_conditions === opt}
                        onChange={() => setAnswer('chronic_conditions', opt)}
                        className="accent-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Have you undergone surgery, blood transfusion, or had a tattoo / piercing in the last 12 months?
                </label>
                <div className="flex gap-4">
                  {['No', 'Yes'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="radio"
                        name="surgery_tattoo"
                        checked={answers.surgery_tattoo === opt}
                        onChange={() => setAnswer('surgery_tattoo', opt)}
                        className="accent-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explicit True Information & Voluntary Consent Declaration */}
              <div className="p-5 rounded-2xl bg-secondary-container/20 border-2 border-secondary/50 space-y-3">
                <h3 className="font-bold text-sm text-secondary-fixed flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <span>Voluntary Consent & Truthful Information Declaration *</span>
                </h3>
                <label className="flex items-start gap-2.5 text-xs text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={answers.voluntary_consent === true}
                    onChange={(e) => setAnswer('voluntary_consent', e.target.checked)}
                    className="accent-secondary w-5 h-5 mt-0.5 shrink-0"
                  />
                  <span className="leading-relaxed font-medium">
                    I voluntarily consent to donate blood for patients in urgent need. I solemnly declare and certify that all personal, health, and medical information provided by me in this form is true, correct, and complete to the best of my knowledge. I understand that withholding medical facts could jeopardize a patient's life.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ SECTION 2: RECIPIENT QUESTIONNAIRE ══════════════ */}
        {profileType === 'recipient' && (
          <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-5">
            <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <Hospital className="w-5 h-5 text-primary" />
              <span>2. Recipient Medical Transfusion Need</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Medical condition or reason requiring blood transfusion *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Open heart surgery, severe trauma, postpartum hemorrhage"
                  value={answers.medical_reason || ''}
                  onChange={(e) => setAnswer('medical_reason', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                  <label className="block text-xs font-semibold text-white">Admitted Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lilavati Hospital & Research Centre"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
                  <label className="block text-xs font-semibold text-white">Treating Doctor / Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Sharma, Dept of Surgery"
                    value={treatingDoctor}
                    onChange={(e) => setTreatingDoctor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary-container/20 border border-primary/40 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Hospital Blood Requisition Slip Declaration *
                </label>
                <label className="flex items-center gap-2 text-xs text-primary-fixed cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={answers.requisition_confirmed === true}
                    onChange={(e) => setAnswer('requisition_confirmed', e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>
                    I confirm a valid hospital blood requisition slip has been prescribed and is ready for verifier validation.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ SUBMIT BUTTON: CHANGED TO JUST "SAVE" ══════════════ */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
