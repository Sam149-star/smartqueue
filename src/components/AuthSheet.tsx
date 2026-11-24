import React, { useState } from 'react'
import { X, Mail, Lock, User, Phone, Check, AlertCircle, ArrowRight, Heart, Shield, Sparkles, UserCheck, Stethoscope, ChevronRight } from 'lucide-react'
import { useAuth, UserRole, AuthSheetMode } from '../lib/authContext'
import { BoondMascot } from './mascots/BoondMascot'
import { DEMO_ACCOUNTS, DemoAccount } from '../lib/demoAccounts'

export const AuthSheet: React.FC = () => {
  const {
    authSheetOpen,
    authSheetMode,
    authReason,
    closeAuthSheet,
    signIn,
    signUp,
    sendMagicLink,
    resetPassword,
    quickDemoLogin
  } = useAuth()

  const [mode, setMode] = useState<AuthSheetMode>(authSheetMode)
  const [step, setStep] = useState<1 | 2>(1) // For multi-step sign up

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['donor'])

  // Status state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Sync mode from context when sheet opens
  React.useEffect(() => {
    if (authSheetOpen) {
      setMode(authSheetMode)
      setStep(1)
      setError(null)
      setNotice(null)
    }
  }, [authSheetOpen, authSheetMode])

  if (!authSheetOpen) return null

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev // keep at least 1
        return prev.filter((r) => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fullName.trim()) {
      setError('Please provide your full name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const handleSignUpFinish = async () => {
    setError(null)
    setLoading(true)
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        pass: password,
        phone: phone.trim(),
        city: city.trim(),
        roles: selectedRoles
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await sendMagicLink(email.trim())
      setNotice('✨ Magic link sent! Please check your inbox.')
    } catch (err: any) {
      setError(err?.message || 'Could not send magic link.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your account email')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setNotice('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(err?.message || 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-surface-container border-t sm:border border-outline/25 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-outline/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BoondMascot size={36} stage="calm" />
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                {mode === 'signup' && (step === 1 ? 'Create Raktify Account' : 'Choose Your Purpose')}
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'magic' && 'Instant Magic Link'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {authReason || 'Urgent blood matching with voluntary consent'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthSheet}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 flex items-start gap-2.5 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-secondary-container/30 border border-secondary/40 flex items-start gap-2.5 text-xs text-secondary-fixed">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
              <span>{notice}</span>
            </div>
          )}

          {/* ══════════════ SIGN UP ══════════════ */}
          {mode === 'signup' && step === 1 && (
            <form onSubmit={handleSignUpStep1} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Phone Number <span className="text-secondary text-[10px] font-normal">(stored privately)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant/80 mt-1">
                  Never visible in search or public listings. Only revealed when you accept a donation request.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Role Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === 'signup' && step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant">
                Select your role on Raktify. You can choose one or both:
              </p>

              {/* Role cards */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => toggleRole('donor')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    selectedRoles.includes('donor')
                      ? 'bg-secondary-container/40 border-secondary text-white ring-1 ring-secondary'
                      : 'bg-surface-container-high border-outline/25 text-on-surface-variant hover:border-outline/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRoles.includes('donor')
                        ? 'bg-secondary text-surface font-bold'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Voluntary Donor</span>
                      {selectedRoles.includes('donor') && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-surface font-extrabold">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      I want to help save lives by donating blood when someone nearby is in critical need.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleRole('receiver')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    selectedRoles.includes('receiver')
                      ? 'bg-primary-container/30 border-primary text-white ring-1 ring-primary'
                      : 'bg-surface-container-high border-outline/25 text-on-surface-variant hover:border-outline/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRoles.includes('receiver')
                        ? 'bg-primary text-on-primary font-bold'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Patient / Requester</span>
                      {selectedRoles.includes('receiver') && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-on-primary font-extrabold">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      I or my family member need urgent blood matching for a medical procedure.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/25 text-xs font-semibold text-on-surface hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading || selectedRoles.length === 0}
                  onClick={handleSignUpFinish}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ SIGN IN ══════════════ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-on-surface">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('magic')}
                  className="text-xs text-secondary hover:underline font-semibold"
                >
                  ✉️ Email me a magic link instead
                </button>
              </div>
            </form>
          )}

          {/* ══════════════ MAGIC LINK ══════════════ */}
          {mode === 'magic' && (
            <form onSubmit={handleMagicLink} className="space-y-3.5">
              <p className="text-xs text-on-surface-variant">
                We'll email you a password-free sign-in link. One tap and you're in.
              </p>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-secondary text-surface font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Magic Link</span>
                )}
              </button>
            </form>
          )}

          {/* ══════════════ FORGOT PASSWORD ══════════════ */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-xs text-on-surface-variant">
                Enter your registered email and we'll send you instructions to reset your password.
              </p>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 focus:border-primary text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>
            </form>
          )}

          {/* ══════════════ EXPANDED DEMO ACCOUNTS & AUTOFILL ══════════════ */}
          <div className="pt-4 border-t border-outline/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sample Demo Profiles</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">1-Tap or Autofill Form</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {DEMO_ACCOUNTS.map((demo) => {
                const isDonorDemo = demo.category === 'donor'
                const isRequesterDemo = demo.category === 'requester'
                const isVerifierDemo = demo.category === 'verifier'

                const handleAutofill = () => {
                  setEmail(demo.email)
                  setPassword('demo123456')
                  setFullName(demo.fullName)
                  setPhone(demo.phone)
                  setCity(demo.city)
                  setSelectedRoles(demo.roles)
                  setNotice(`Autofilled ${demo.fullName}'s credentials! You can now tap Sign In or edit fields.`)
                }

                return (
                  <div
                    key={demo.id}
                    className="p-2.5 rounded-2xl bg-surface-container-high/60 border border-outline/20 hover:border-outline/40 transition-all flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white text-xs truncate">{demo.fullName}</strong>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isDonorDemo
                              ? 'bg-secondary-container text-secondary-fixed'
                              : isRequesterDemo
                              ? 'bg-primary-container/40 text-primary-fixed'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {demo.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{demo.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={handleAutofill}
                        title="Fill the email & password into the form"
                        className="px-2 py-1 rounded-lg bg-surface-container border border-outline/30 text-[10px] font-semibold text-on-surface-variant hover:text-white hover:border-primary transition-all"
                      >
                        Autofill
                      </button>
                      <button
                        type="button"
                        onClick={() => quickDemoLogin(demo)}
                        title="Instant 1-tap login as this persona"
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                          isDonorDemo
                            ? 'bg-secondary text-surface hover:brightness-110'
                            : isRequesterDemo
                            ? 'bg-primary text-on-primary hover:brightness-110'
                            : 'bg-amber-500 text-surface font-extrabold hover:brightness-110'
                        }`}
                      >
                        1-Tap Login
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-outline/15 flex items-center justify-between text-xs">
          {mode === 'signup' ? (
            <>
              <span className="text-on-surface-variant">Already have an account?</span>
              <button
                onClick={() => {
                  setMode('signin')
                  setStep(1)
                  setError(null)
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <span className="text-on-surface-variant">Need an account?</span>
              <button
                onClick={() => {
                  setMode('signup')
                  setStep(1)
                  setError(null)
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
