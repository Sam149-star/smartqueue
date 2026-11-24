import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Shield, Heart, Phone, LogOut, Check, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth, UserRole } from '../lib/authContext'
import { BoondMascot } from '../components/mascots/BoondMascot'
import { DEMO_ACCOUNTS } from '../lib/demoAccounts'

export const MeView: React.FC = () => {
  const { user, signOut, setMyRoles, openAuthSheet, quickDemoLogin } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  if (!user || user.isAnonymous) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-white">My Account</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">Sign in to manage your donor profile and requests.</p>
        </div>

        <div className="rounded-3xl bg-surface-container border border-outline/20 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <BoondMascot size={140} stage="calm" />
          </div>
          <div className="max-w-sm mx-auto space-y-2">
            <h2 className="font-headline text-xl font-bold text-white">Join Raktify</h2>
            <p className="text-xs text-on-surface-variant">
              Register as a voluntary donor or create urgent blood requests for hospital patients.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openAuthSheet('signin')}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthSheet('signup')}
              className="px-5 py-2.5 rounded-xl bg-secondary-container border border-secondary/40 text-secondary-fixed font-bold text-xs hover:brightness-110"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleRoleToggle = async (role: 'donor' | 'receiver') => {
    let newRoles: UserRole[] = [...user.roles]
    if (newRoles.includes(role)) {
      if (newRoles.filter((r) => r === 'donor' || r === 'receiver').length <= 1) {
        setMsg('You must have at least one active role.')
        return
      }
      newRoles = newRoles.filter((r) => r !== role)
    } else {
      newRoles.push(role)
    }

    setUpdating(true)
    setMsg(null)
    try {
      await setMyRoles(newRoles.filter((r) => r !== 'verifier'))
      setMsg('Roles updated successfully!')
    } catch (err: any) {
      setMsg(err?.message || 'Failed to update roles')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-white">My Profile</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Manage your account, roles and privacy settings.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-secondary-container/40 border border-secondary/40 flex items-center gap-2 text-xs text-secondary-fixed">
          <Check className="w-4 h-4 text-secondary" />
          <span>{msg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-white flex items-center justify-center font-headline text-2xl font-bold shadow-md">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <span>{user.fullName}</span>
                {user.roles.includes('verifier') && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Verifier
                  </span>
                )}
              </h2>
              <p className="text-xs text-on-surface-variant">{user.email}</p>
              {user.city && <p className="text-[11px] text-on-surface-variant/70 mt-0.5">📍 {user.city}</p>}
            </div>
          </div>
          <div className="hidden sm:block">
            <BoondMascot size={70} stage="celebrating" variant="meditating" interactive={false} />
          </div>
        </div>

        {/* Private phone notice */}
        <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15 flex items-start gap-3">
          <Phone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-white">Private Contact: </span>
            <span className="text-on-surface-variant">{user.phone || 'None registered'}</span>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              Strictly protected in private storage. Never exposed in search or public API. Only revealed when you voluntarily accept a match.
            </p>
          </div>
        </div>

        {/* Questionnaire shortcut */}
        <div className="pt-2">
          <Link
            to="/questionnaire"
            className="w-full py-2.5 px-4 rounded-2xl bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold hover:brightness-110 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Personal Medical Questionnaire (BloodConnect Standards)</span>
            </div>
            <span className="text-white">Complete / Edit →</span>
          </Link>
        </div>
      </div>

      {/* Role Picker */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-3">
        <h3 className="font-headline text-base font-bold text-white">Your Raktify Roles</h3>
        <p className="text-xs text-on-surface-variant">
          You can participate as a voluntary donor, a requester, or both.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={updating}
            onClick={() => handleRoleToggle('donor')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              user.roles.includes('donor')
                ? 'bg-secondary-container/40 border-secondary text-white ring-1 ring-secondary'
                : 'bg-surface-container-high border-outline/20 text-on-surface-variant hover:border-outline/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className={`w-4 h-4 ${user.roles.includes('donor') ? 'text-secondary fill-current' : ''}`} />
              <span className="text-xs font-bold">Voluntary Donor</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface-container">
              {user.roles.includes('donor') ? 'Active' : 'Enable'}
            </span>
          </button>

          <button
            type="button"
            disabled={updating}
            onClick={() => handleRoleToggle('receiver')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              user.roles.includes('receiver')
                ? 'bg-primary-container/30 border-primary text-white ring-1 ring-primary'
                : 'bg-surface-container-high border-outline/20 text-on-surface-variant hover:border-outline/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className={`w-4 h-4 ${user.roles.includes('receiver') ? 'text-primary' : ''}`} />
              <span className="text-xs font-bold">Requester</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface-container">
              {user.roles.includes('receiver') ? 'Active' : 'Enable'}
            </span>
          </button>
        </div>
      </div>

      {/* Demo Account Switcher */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Switch Demo Account (Quick Testing)</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">7 Diverse Role Personas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((demo) => {
            const isDonorDemo = demo.category === 'donor'
            const isRequesterDemo = demo.category === 'requester'
            const isCurrent = user.email === demo.email

            return (
              <button
                key={demo.id}
                onClick={() => quickDemoLogin(demo)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-primary-container/30 border-primary ring-1 ring-primary'
                    : 'bg-surface-container-high/60 border-outline/20 hover:border-outline/40'
                }`}
              >
                <div className="flex items-center justify-between">
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
              </button>
            )
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={signOut}
          className="w-full py-3 rounded-2xl bg-surface-container border border-red-900/40 text-red-400 font-bold text-xs hover:bg-red-950/30 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Raktify</span>
        </button>
      </div>
    </div>
  )
}
