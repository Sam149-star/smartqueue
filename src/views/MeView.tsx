import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Shield, Heart, Phone, LogOut, Check, AlertCircle, Sparkles, ShieldCheck, Stethoscope, Hospital, Activity, PlusCircle, Users, ClipboardList } from 'lucide-react'
import { useAuth, UserRole } from '../lib/authContext'
import { useBloodRequests } from '../lib/bloodRequestContext'
import { BoondMascot } from '../components/mascots/BoondMascot'
import { DEMO_ACCOUNTS } from '../lib/demoAccounts'

export const MeView: React.FC = () => {
  const { user, signOut, openAuthSheet, quickDemoLogin, isDonor, isReceiver, isVerifier } = useAuth()
  const { requests, activeRequest } = useBloodRequests()
  const [donorAvailable, setDonorAvailable] = useState(true)

  if (!user || user.isAnonymous) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-8">
        <div className="space-y-1 text-center">
          <h1 className="font-headline text-3xl font-extrabold text-white">My Account</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">Sign in to manage your role-specific dashboard.</p>
        </div>

        <div className="rounded-3xl bg-surface-container border border-outline/20 p-8 text-center space-y-4 shadow-xl">
          <div className="flex justify-center">
            <BoondMascot size={150} stage="calm" variant="meditating" interactive={false} />
          </div>
          <div className="max-w-sm mx-auto space-y-2">
            <h2 className="font-headline text-xl font-bold text-white">Access Your Persona</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sign in with your email or pick a demo persona below to explore role-specific tabs.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openAuthSheet('signin')}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthSheet('signup')}
              className="px-6 py-2.5 rounded-xl bg-secondary-container border border-secondary/40 text-secondary-fixed font-bold text-xs hover:brightness-110"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentReq = activeRequest || requests[0]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ══════════════ PROFILE HEADER ══════════════ */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/25 space-y-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-white flex items-center justify-center font-headline text-2xl font-bold shadow-md">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-xl font-bold text-white">{user.fullName}</h2>
                {isVerifier && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Medical Verifier
                  </span>
                )}
                {isReceiver && !isVerifier && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary-container/40 text-primary-fixed font-bold">
                    Requester
                  </span>
                )}
                {isDonor && !isVerifier && !isReceiver && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary-fixed font-bold">
                    Voluntary Donor
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
              {user.city && <p className="text-[11px] text-on-surface-variant/80 mt-0.5">📍 {user.city}</p>}
            </div>
          </div>

          <div className="hidden sm:block">
            <BoondMascot size={75} stage="celebrating" variant="meditating" interactive={false} />
          </div>
        </div>

        {/* Private phone notice */}
        <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15 flex items-start gap-3">
          <Phone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-white">Private Contact: </span>
            <span className="text-on-surface-variant font-mono">{user.phone || '+91 98200 12345'}</span>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              Strictly protected in private database storage with Row-Level Security. Never exposed in search or public API.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ 1. DONOR-ONLY ACCOUNT HUB ══════════════ */}
      {isDonor && !isReceiver && !isVerifier && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-surface-container border border-secondary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary fill-current" />
                <h3 className="font-headline font-bold text-base text-white">Donor Availability & Status</h3>
              </div>
              <button
                onClick={() => setDonorAvailable(!donorAvailable)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  donorAvailable
                    ? 'bg-secondary text-surface'
                    : 'bg-surface-container border border-outline/30 text-on-surface-variant'
                }`}
              >
                {donorAvailable ? '🟢 Available for Urgent Alerts' : '⚪ Resting'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 text-center">
                <span className="text-[10px] text-on-surface-variant block">Blood Group</span>
                <strong className="text-base text-white font-headline">O+ Positive</strong>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 text-center">
                <span className="text-[10px] text-on-surface-variant block">Total Donations</span>
                <strong className="text-base text-white font-headline">8 Times</strong>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 text-center">
                <span className="text-[10px] text-on-surface-variant block">Last Donation</span>
                <strong className="text-base text-secondary-fixed font-headline">4 Months Ago</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/questionnaire"
                className="flex-1 py-3 px-4 rounded-2xl bg-secondary-container/40 border border-secondary/40 text-secondary-fixed text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 transition-all"
              >
                <ClipboardList className="w-4 h-4 text-secondary" />
                <span>Donor Health Screening & Truthful Consent</span>
              </Link>
              <Link
                to="/donors"
                className="py-3 px-4 rounded-2xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-secondary flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-secondary" />
                <span>Search Donor Directory</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 2. REQUESTER-ONLY ACCOUNT HUB ══════════════ */}
      {isReceiver && !isVerifier && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-surface-container border border-primary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-base text-white">Active Patient Requisitions</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-container text-primary-fixed font-bold">
                1 Active Case
              </span>
            </div>

            {currentReq && (
              <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm">Request #{currentReq.code} • {currentReq.patient_name}</strong>
                  <span className="text-secondary-fixed font-bold">
                    {currentReq.verified_by ? '✓ Verified' : '⏳ Clinical Review'}
                  </span>
                </div>
                <p className="text-on-surface-variant">
                  {currentReq.hospital_name} • {currentReq.units_needed} Units {currentReq.blood_group} {currentReq.component}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Reverted Donors: <strong>{currentReq.reverted_donors.length} voluntary donors responded</strong>
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/tracker"
                className="flex-1 py-3 px-4 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:brightness-105 flex items-center justify-center gap-2 shadow-md"
              >
                <Activity className="w-4 h-4" />
                <span>Open Live Requisition Tracker</span>
              </Link>
              <Link
                to="/request"
                className="py-3 px-4 rounded-2xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-primary flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>New Urgent Request</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 3. VERIFIER-ONLY ACCOUNT HUB ══════════════ */}
      {isVerifier && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-surface-container border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-headline font-bold text-base text-white">Registered Medical Verifier Credentials</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Council Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15">
                <span className="text-[10px] text-on-surface-variant block">Medical Degree</span>
                <strong className="text-white">MBBS, MD (Transfusion Medicine)</strong>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15">
                <span className="text-[10px] text-on-surface-variant block">Medical Council Reg. No.</span>
                <strong className="text-white font-mono">MMC-2018-09124 (Maharashtra)</strong>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 sm:col-span-2">
                <span className="text-[10px] text-on-surface-variant block">Hospital Affiliation</span>
                <strong className="text-white">Lilavati Hospital & Research Centre, Mumbai</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/verifier"
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 text-surface text-xs font-extrabold hover:brightness-110 flex items-center justify-center gap-2 shadow-md"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Clinical Verification Console</span>
              </Link>
              <Link
                to="/questionnaire"
                className="py-3 px-4 rounded-2xl bg-surface-container-high border border-outline/30 text-white text-xs font-semibold hover:border-amber-400 flex items-center justify-center gap-2"
              >
                <span>Edit Clinical Credentials</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DEMO PERSONA SWITCHER FOR JUDGES & TESTING ══════════════ */}
      <div className="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Switch Role Persona (Presentation & Testing)</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">1-Tap Role Switch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {DEMO_ACCOUNTS.map((demo) => {
            const isDonorDemo = demo.category === 'donor'
            const isRequesterDemo = demo.category === 'requester'
            const isCurrent = user.email === demo.email

            return (
              <button
                key={demo.id}
                onClick={() => quickDemoLogin(demo)}
                className={`p-3 rounded-2xl border text-left transition-all ${
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
                <p className="text-[10px] text-on-surface-variant truncate mt-1">{demo.description}</p>
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
