import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { JoeyAndRachelDuo } from '../components/Mascots'
import {
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  User,
  Camera,
  Calendar,
  Star
} from 'lucide-react'

export const AuthView: React.FC = () => {
  const navigate = useNavigate()
  const {
    user,
    signIn,
    signUp,
    sendEmailOtp,
    sendPhoneOtp,
    verifyOtp,
    signInWithGoogle,
    quickDemoLogin,
    signOut
  } = useAuth()

  // Main Auth Tab
  const [authMethod, setAuthMethod] = useState<'email_signin' | 'email_signup' | 'otp'>('email_signin')

  // OTP sub-mode: 'email' or 'phone'
  const [otpMode, setOtpMode] = useState<'email' | 'phone'>('email')
  const [otpInput, setOtpInput] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [disability, setDisability] = useState('None')
  const [disease, setDisease] = useState('None')

  // Status
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isSeniorAge = typeof age === 'number' && age >= 60

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (authMethod === 'email_signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name')
        await signUp({
          email,
          pass: password,
          fullName,
          phone,
          avatarUrl,
          age: typeof age === 'number' ? age : undefined,
          disability,
          disease
        })
        setSuccessMsg('Account created successfully! Auto-saving profile.')
      } else {
        await signIn(email, password)
        setSuccessMsg('Signed in successfully!')
      }
      setTimeout(() => navigate('/'), 900)
    } catch (err: unknown) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpInput.trim()) {
      setErrorMsg(`Please enter your ${otpMode === 'email' ? 'email address' : 'mobile phone number'}`)
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSimulatedNotice(null)
    try {
      if (otpMode === 'email') {
        const res = await sendEmailOtp(otpInput)
        setOtpSent(true)
        if (res.simulatedOtp) {
          setSimulatedNotice(`Code: ${res.simulatedOtp} (or check inbox/use 123456)`)
        } else {
          setSimulatedNotice('Real 6-digit code sent to your email inbox! Check your mail.')
        }
      } else {
        const res = await sendPhoneOtp(otpInput)
        setOtpSent(true)
        if (res.simulatedOtp) {
          setSimulatedNotice(`SMS sent! (Demo code: ${res.simulatedOtp} or 123456)`)
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    try {
      await verifyOtp(otpInput, otpCode, otpMode)
      setSuccessMsg('Verification successful! Logged in.')
      setTimeout(() => navigate('/'), 900)
    } catch (err: unknown) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      setErrorMsg((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = (role: 'customer' | 'provider' | 'senior') => {
    quickDemoLogin(role)
    setSuccessMsg(`Logged in as ${role === 'senior' ? 'Senior Citizen' : role}!`)
    setTimeout(() => {
      navigate(role === 'provider' ? '/provider' : '/')
    }, 600)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Queues</span>
      </button>

      {/* Mascot Header */}
      <div className="text-center space-y-2">
        <JoeyAndRachelDuo state="waiting" size="compact" showStatusBadge={false} />
        <h1 className="text-2xl font-extrabold text-white font-headline">
          {user
            ? `Welcome, ${user.fullName}!`
            : authMethod === 'email_signup'
            ? 'Create SmartQueue Profile'
            : authMethod === 'otp'
            ? 'Instant OTP Verification'
            : 'Welcome Back'}
        </h1>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
          {user
            ? 'Your profile is active. You can now take spots in any queue with 1-tap booking.'
            : 'Save your profile and health preferences once. Counter staff will be notified of priority assistance.'}
        </p>
      </div>

      {user ? (
        /* Already Logged In Profile Card */
        <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-secondary/40 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-secondary-container border border-secondary/40 text-secondary flex items-center justify-center font-bold text-2xl">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {user.isSenior && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-md" title="Senior Citizen Priority">
                  ⭐
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.fullName}</h3>
                {user.isSenior && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Senior (60+)
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-mono">{user.email}</p>
              {user.phone && <p className="text-xs text-secondary mt-0.5">{user.phone}</p>}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Age:</span>
              <span className="font-semibold text-white">{user.age ? `${user.age} yrs` : 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mobility / Disability:</span>
              <span className="font-semibold text-white">{user.disability || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Medical Notes:</span>
              <span className="font-semibold text-white">{user.disease || 'None'}</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold hover:brightness-110 shadow-md"
            >
              Browse & Join Queues
            </button>
            <button
              onClick={() => signOut()}
              className="py-2.5 px-4 rounded-xl bg-surface-container-high border border-outline/20 text-xs font-semibold text-red-400 hover:bg-red-950/40"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        /* Sign In / Sign Up Card */
        <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 shadow-xl space-y-5">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-outline/30 text-white text-xs font-bold flex items-center justify-center gap-3 transition-all hover:scale-101 active:scale-98 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Free Supabase OAuth)</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-outline/20" />
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Or Choose Method
            </span>
            <span className="flex-1 h-px bg-outline/20" />
          </div>

          {/* Authentication Method Selector Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-surface-container-high border border-outline/15 text-[11px] font-bold text-center">
            <button
              type="button"
              onClick={() => { setAuthMethod('email_signin'); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition-all ${
                authMethod === 'email_signin'
                  ? 'bg-on-surface text-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('otp'); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition-all ${
                authMethod === 'otp'
                  ? 'bg-on-surface text-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              ⚡ Free OTP
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('email_signup'); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition-all ${
                authMethod === 'email_signup'
                  ? 'bg-on-surface text-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════ METHOD 1: FREE OTP (EMAIL OR SMS) ══════════════ */}
          {authMethod === 'otp' && (
            <div className="space-y-4">
              {/* Sub-selector: Email OTP vs Phone SMS */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-high border border-outline/15 text-[11px] font-semibold text-center">
                <button
                  type="button"
                  onClick={() => { setOtpMode('email'); setOtpSent(false); setOtpInput(''); }}
                  className={`py-1.5 rounded-lg transition-all ${
                    otpMode === 'email' ? 'bg-secondary-container text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  ✉️ Email OTP (100% Free)
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpMode('phone'); setOtpSent(false); setOtpInput(''); }}
                  className={`py-1.5 rounded-lg transition-all ${
                    otpMode === 'phone' ? 'bg-secondary-container text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  📱 Mobile SMS OTP
                </button>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      {otpMode === 'email' ? 'Your Email Address (Receives 6-digit code)' : 'Mobile Phone Number'}
                    </label>
                    <div className="relative">
                      <input
                        type={otpMode === 'email' ? 'email' : 'tel'}
                        required
                        placeholder={otpMode === 'email' ? 'name@example.com' : '+91 98765 43210'}
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-secondary focus:outline-none"
                      />
                      {otpMode === 'email' ? (
                        <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                      ) : (
                        <Phone className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-secondary-container text-secondary font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-md"
                  >
                    <span>Send 6-Digit Verification Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  {simulatedNotice && (
                    <div className="p-2.5 rounded-xl bg-secondary-container/40 border border-secondary/30 text-secondary-fixed text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-secondary" />
                      <span>{simulatedNotice}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl bg-surface-container-high border border-outline/30 focus:border-secondary focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2.5 rounded-xl border border-outline/30 text-xs font-medium text-on-surface-variant"
                    >
                      Change Contact
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-secondary-container text-secondary font-bold text-xs hover:brightness-110"
                    >
                      Verify & Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ══════════════ METHOD 2: EMAIL PASSWORD SIGN IN / SIGN UP ══════════════ */}
          {(authMethod === 'email_signin' || authMethod === 'email_signup') && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {authMethod === 'email_signup' && (
                <>
                  {/* Photo Feature */}
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
                      Profile Photo (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-xl object-cover border border-secondary/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-dashed border-outline/40 flex items-center justify-center text-on-surface-variant">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <label className="inline-block px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline/30 text-[11px] font-semibold text-on-surface hover:text-white cursor-pointer">
                          <span>Choose Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFile}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-on-surface-variant">Stored with your ticket.</p>
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-primary focus:outline-none"
                      />
                      <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Age Input with Auto Senior Citizen Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-on-surface-variant">
                        Age (Years)
                      </label>
                      {isSeniorAge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1 border border-amber-400/30">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>60+ Senior Citizen Priority</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        placeholder="e.g. 68"
                        value={age}
                        onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-primary focus:outline-none"
                      />
                      <Calendar className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Disability */}
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      Disability / Mobility Assistance (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['None', 'Wheelchair', 'Walking Stick / Mobility', 'Visual Assistance', 'Hearing Assistance'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDisability(d)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            disability === d
                              ? 'bg-secondary-container text-secondary border-secondary/50'
                              : 'bg-surface-container-high text-on-surface-variant border-outline/20 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Disease */}
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      Medical Condition / Chronic Disease (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['None', 'Diabetes', 'Hypertension / Cardiac', 'Asthma', 'Pregnancy', 'Dialysis'].map(med => (
                        <button
                          key={med}
                          type="button"
                          onClick={() => setDisease(med)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            disease === med
                              ? 'bg-primary-container text-white border-primary'
                              : 'bg-surface-container-high text-on-surface-variant border-outline/20 hover:text-white'
                          }`}
                        >
                          {med}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-primary focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:border-primary focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : authMethod === 'email_signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Profile & Save</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Hackathon Demo Logins */}
          <div className="pt-4 border-t border-outline/15 space-y-2">
            <p className="text-[10px] text-center uppercase tracking-wider font-semibold text-on-surface-variant">
              ⚡ 1-Click Hackathon Demo Profiles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="py-2 px-2 rounded-xl bg-surface-container-high border border-outline/20 hover:border-secondary text-[10px] font-semibold text-secondary flex flex-col items-center gap-1 transition-colors"
              >
                <span>👤 Customer</span>
                <span className="text-[9px] opacity-70">Rahul (31y)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('senior')}
                className="py-2 px-2 rounded-xl bg-surface-container-high border border-outline/20 hover:border-amber-400 text-[10px] font-semibold text-amber-300 flex flex-col items-center gap-1 transition-colors"
              >
                <span>⭐ Senior Citizen</span>
                <span className="text-[9px] opacity-70">Kamala (72y)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('provider')}
                className="py-2 px-2 rounded-xl bg-surface-container-high border border-outline/20 hover:border-primary text-[10px] font-semibold text-primary flex flex-col items-center gap-1 transition-colors"
              >
                <span>🩺 Provider</span>
                <span className="text-[9px] opacity-70">Dr. Anita</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
