import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, PlusCircle, Activity, User, LogIn, ChevronDown, LogOut, Database, AlertTriangle, ShieldCheck } from 'lucide-react'
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
  const isConfigured = isSupabaseConfigured()

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/donors', label: 'Donors', icon: Users },
    { to: '/request', label: 'Request', icon: PlusCircle, highlight: true },
    { to: '/tracker', label: 'Tracker', icon: Activity },
    { to: '/verifier', label: 'Verifier', icon: ShieldCheck },
    { to: '/me', label: 'Me', icon: User },
  ]

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-white pb-24">
      {/* ══════════════ EMERGENCY DISCLAIMER BANNER (Permanent & Visible on Every Screen) ══════════════ */}
      <aside
        className="w-full bg-[#2a0e12] border-b border-red-900/60 px-3 py-1.5 text-center text-[11px] sm:text-xs font-semibold text-red-200 flex items-center justify-center gap-1.5 z-50 sticky top-0 backdrop-blur-md"
        role="alert"
        aria-label="Medical emergency disclaimer"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>
          <strong>Prototype — not an emergency medical service.</strong> In an emergency call <strong>112</strong> or go to the nearest hospital blood bank.
        </span>
      </aside>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-[31px] z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-outline/15 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-container/20 border border-primary/40 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/logo-icon.png" alt="Raktify" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-headline">
                Raktify
              </span>
              <p className="text-[10px] text-on-surface-variant font-medium -mt-0.5">Find a donor. Fast. With consent.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container/70 border border-outline/20 p-1 rounded-full">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-on-surface text-surface shadow-sm'
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
          <div className="flex items-center gap-2">
            {/* Supabase status badge */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-102 ${
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
            {user && !user.isAnonymous ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-surface-container-high border border-outline/30 hover:border-outline/50 transition-all text-xs text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[11px]">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold max-w-[90px] truncate">{user.fullName.split(' ')[0]}</span>
                  {isVerifier && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                  <ChevronDown className="w-3 h-3 text-on-surface-variant" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface-container border border-outline/25 shadow-2xl p-2 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-outline/15">
                      <p className="font-bold text-white truncate flex items-center gap-1">
                        <span>{user.fullName}</span>
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {isDonor && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-container text-secondary-fixed">
                            Donor
                          </span>
                        )}
                        {isReceiver && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-container/40 text-primary-fixed">
                            Requester
                          </span>
                        )}
                        {isVerifier && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300">
                            Verifier
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/verifier"
                      onClick={() => setUserDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verifier Console</span>
                    </Link>
                    <Link
                      to="/questionnaire"
                      onClick={() => setUserDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Medical Questionnaire</span>
                    </Link>
                    <Link
                      to="/me"
                      onClick={() => setUserDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                    >
                      <User className="w-3.5 h-3.5 text-secondary" />
                      <span>My Profile & Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setUserDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-950/40 text-red-400 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthSheet('signin', 'Sign in to access donor directory or make a request')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-on-surface text-surface text-xs font-bold hover:bg-white transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 animate-fade-in">
        {children}
      </main>

      {/* ══════════════ FLOATING PILL BOTTOM NAVIGATION ══════════════ */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-surface-container-high/95 backdrop-blur-xl border border-outline/30 rounded-full px-2 py-1.5 shadow-2xl flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col sm:flex-row items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-md'
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
