import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, PlusCircle, Activity, User, LogIn, ChevronDown, LogOut, Database, AlertTriangle, ShieldCheck, Stethoscope, ClipboardList, Heart, ZoomIn } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { SupabaseModal } from './SupabaseModal'
import { AuthSheet } from './AuthSheet'
import { BoondChatbot } from './BoondChatbot'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation()
  const { user, signOut, openAuthSheet, isDonor, isReceiver, isVerifier } = useAuth()
  const [dbModalOpen, setDbModalOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<'100' | '110' | '120'>('110')
  const isConfigured = isSupabaseConfigured()

  const isAuth = user && !user.isAnonymous

  // ══════════════ STRICT ROLE-BASED NAVIGATION VISIBILITY ══════════════
  // When NOT signed in: ONLY Home and Sign In are available.
  // When signed in as Donor: ONLY Donor tabs.
  // When signed in as Requester: ONLY Requester tabs.
  // When signed in as Verifier: ONLY Verifier tabs.
  interface NavItem {
    to?: string
    label: string
    icon: any
    highlight?: boolean
    onClick?: () => void
  }

  let navItems: NavItem[] = []

  if (!isAuth) {
    navItems = [
      { to: '/', label: 'Home', icon: Home },
      { label: 'Sign In', icon: LogIn, highlight: true, onClick: () => openAuthSheet('signin') }
    ]
  } else if (isVerifier) {
    navItems = [
      { to: '/', label: 'Home', icon: Home },
      { to: '/verifier', label: 'Verifier Console', icon: ShieldCheck, highlight: true },
      { to: '/tracker', label: 'Hospital Tracker', icon: Activity },
      { to: '/questionnaire', label: 'Clinical Onboarding', icon: Stethoscope },
      { to: '/me', label: 'My Account', icon: User }
    ]
  } else if (isReceiver) {
    navItems = [
      { to: '/', label: 'Home', icon: Home },
      { to: '/request', label: 'Urgent Request', icon: PlusCircle, highlight: true },
      { to: '/tracker', label: 'Live Tracker', icon: Activity },
      { to: '/questionnaire', label: 'Patient Questionnaire', icon: ClipboardList },
      { to: '/me', label: 'My Account', icon: User }
    ]
  } else {
    // Default Donor persona
    navItems = [
      { to: '/', label: 'Home', icon: Home },
      { to: '/donors', label: 'Donor Directory & Alerts', icon: Users, highlight: true },
      { to: '/questionnaire', label: 'Health Screening & Consent', icon: Heart },
      { to: '/me', label: 'My Account', icon: User }
    ]
  }

  return (
    <div
      className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-white pb-28 transition-all duration-200"
      style={{ zoom: `${Number(zoomLevel) / 100}` }}
    >
      {/* ══════════════ EMERGENCY DISCLAIMER BANNER (Permanent & Visible on Every Screen) ══════════════ */}
      <aside
        className="w-full bg-[#2a0e12] border-b border-red-900/60 px-3 py-1.5 text-center text-xs sm:text-sm font-semibold text-red-200 flex items-center justify-center gap-1.5 z-50 sticky top-0 backdrop-blur-md"
        role="alert"
        aria-label="Medical emergency disclaimer"
      >
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span>
          <strong>Prototype — not an emergency medical service.</strong> In an emergency call <strong>112</strong> or go to the nearest hospital blood bank.
        </span>
      </aside>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-[31px] z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-outline/15 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-primary-container/20 border border-primary/40 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/logo-icon.png" alt="Raktify" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5 font-headline">
                Raktify
              </span>
              <p className="text-[11px] text-on-surface-variant font-medium -mt-0.5">Find a donor. Fast. With consent.</p>
            </div>
          </Link>

          {/* Desktop Navigation (Filtered Strictly by Role) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container/70 border border-outline/20 p-1.5 rounded-full">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const active = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false

              if (item.onClick) {
                return (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all bg-primary text-on-primary shadow-md hover:brightness-110"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.to || idx}
                  to={item.to!}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-on-surface text-surface shadow-sm font-bold'
                      : item.highlight
                      ? 'text-primary hover:text-white hover:bg-primary-container/30'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Screen Zoom Switcher for Judges & Presentation */}
            <div className="hidden sm:flex items-center gap-1 bg-surface-container/80 border border-outline/25 px-2.5 py-1.5 rounded-full text-xs">
              <span className="text-on-surface-variant font-medium flex items-center gap-1 text-[11px]">
                <ZoomIn className="w-3.5 h-3.5 text-secondary" />
                <span>Zoom:</span>
              </span>
              {(['100', '110', '120'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all ${
                    zoomLevel === z
                      ? 'bg-secondary text-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                  }`}
                  title={`Set screen scale to ${z}%`}
                >
                  {z}%
                </button>
              ))}
            </div>

            {/* Supabase status badge */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-102 ${
                isConfigured
                  ? 'bg-secondary-container/40 border-secondary/50 text-secondary-fixed'
                  : 'bg-surface-container-high border-outline/30 text-on-surface-variant hover:border-secondary'
              }`}
              title="Database Connection Status"
            >
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-secondary animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">
                {isConfigured ? 'Supabase' : 'Demo Sync'}
              </span>
            </button>

            {/* User Profile / Sign In */}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-container-high border border-outline/30 hover:border-outline/50 transition-all text-xs text-white shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                  {isVerifier && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                  <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container border border-outline/25 shadow-2xl p-2.5 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-outline/15">
                      <p className="font-bold text-white truncate flex items-center gap-1">
                        <span>{user.fullName}</span>
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {isDonor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-secondary-fixed">
                            Voluntary Donor
                          </span>
                        )}
                        {isReceiver && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container/40 text-primary-fixed">
                            Requester
                          </span>
                        )}
                        {isVerifier && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">
                            Medical Verifier
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1 space-y-1">
                      {isVerifier && (
                        <Link
                          to="/verifier"
                          onClick={() => setUserDropdown(false)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          <span>Verifier Console</span>
                        </Link>
                      )}
                      {isReceiver && (
                        <Link
                          to="/request"
                          onClick={() => setUserDropdown(false)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface font-semibold"
                        >
                          <PlusCircle className="w-4 h-4 text-primary" />
                          <span>Urgent Request Form</span>
                        </Link>
                      )}
                      {isDonor && (
                        <Link
                          to="/donors"
                          onClick={() => setUserDropdown(false)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface font-semibold"
                        >
                          <Users className="w-4 h-4 text-secondary" />
                          <span>Donor Directory & Alerts</span>
                        </Link>
                      )}
                      <Link
                        to="/questionnaire"
                        onClick={() => setUserDropdown(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                      >
                        <ClipboardList className="w-4 h-4 text-on-surface-variant" />
                        <span>Questionnaire</span>
                      </Link>
                      <Link
                        to="/me"
                        onClick={() => setUserDropdown(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                      >
                        <User className="w-4 h-4 text-on-surface-variant" />
                        <span>My Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-outline/15">
                      <button
                        onClick={() => {
                          signOut()
                          setUserDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-950/40 text-red-400 font-semibold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthSheet('signin', 'Sign in to access your persona')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:brightness-110 transition-all shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN CONTENT (More Spacious Max Width) ══════════════ */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        {children}
      </main>

      {/* ══════════════ FLOATING PILL BOTTOM NAVIGATION (Role Filtered) ══════════════ */}
      <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-surface-container-high/95 backdrop-blur-xl border border-outline/30 rounded-full px-2.5 py-2 shadow-2xl flex items-center gap-1 sm:gap-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const active = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all bg-primary text-on-primary shadow-md hover:brightness-110"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] sm:text-xs">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.to || idx}
                to={item.to!}
                className={`flex flex-col sm:flex-row items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-md font-bold'
                    : item.highlight
                    ? 'text-primary-fixed hover:bg-surface-container'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[11px] sm:text-xs">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Modals & In-place AuthSheet */}
      <AuthSheet />
      <BoondChatbot />
      <SupabaseModal isOpen={dbModalOpen} onClose={() => setDbModalOpen(false)} />
    </div>
  )
}
