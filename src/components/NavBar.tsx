import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Database, Layers, Monitor, Tv, Camera, User, LogIn, ChevronDown, LogOut, Smartphone } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../lib/authContext'
import { SupabaseModal } from './SupabaseModal'
import { QRScannerModal } from './QRScannerModal'
import { MobileConnectModal } from './MobileConnectModal'

export const NavBar: React.FC = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const isConfigured = isSupabaseConfigured()

  const navLinks = [
    { to: '/', label: 'Queues', icon: Layers },
    { to: '/provider', label: 'Provider Console', icon: Monitor },
    { to: '/display', label: 'Lobby TV', icon: Tv },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-outline/15 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-container-high border border-outline/30 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/logo-icon.png" alt="SmartQueue" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-headline">
                SmartQueue
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-container text-white">
                  v2.0
                </span>
              </span>
              <p className="text-[10px] text-on-surface-variant font-medium -mt-0.5">Virtual Queue Ecosystem</p>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container/70 border border-outline/20 p-1 rounded-full">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-on-surface text-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            {/* Phone Demo Button */}
            <button
              onClick={() => setMobileModalOpen(true)}
              className="p-2 rounded-xl bg-secondary-container/40 border border-secondary/40 hover:brightness-110 text-secondary-fixed flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-102"
              title="Open app on your phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-secondary" />
              <span className="hidden sm:inline">📱 Phone Demo</span>
            </button>

            {/* Scan QR Button */}
            <button
              onClick={() => setScannerOpen(true)}
              className="p-2 rounded-xl bg-surface-container-high border border-outline/30 hover:border-secondary text-secondary flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-102"
              title="Scan Counter QR Code"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Supabase status badge */}
            <button
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-102 ${
                isConfigured
                  ? 'bg-secondary-container/40 border-secondary/50 text-secondary-fixed'
                  : 'bg-surface-container-high border-outline/30 text-on-surface-variant hover:border-secondary'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-secondary animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">
                {isConfigured ? 'Supabase' : 'Demo Sync'}
              </span>
            </button>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-surface-container-high border border-outline/30 hover:border-outline/50 transition-all text-xs text-white"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-[11px]">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold max-w-[90px] truncate">{user.fullName.split(' ')[0]}</span>
                  {user.isSenior && <span className="text-[10px]">⭐</span>}
                  <ChevronDown className="w-3 h-3 text-on-surface-variant" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface-container border border-outline/25 shadow-2xl p-2 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-outline/15">
                      <p className="font-bold text-white truncate flex items-center gap-1">
                        <span>{user.fullName}</span>
                        {user.isSenior && <span className="text-[10px] text-amber-300">⭐</span>}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/auth"
                      onClick={() => setUserDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-high flex items-center gap-2 text-on-surface"
                    >
                      <User className="w-3.5 h-3.5 text-secondary" />
                      <span>Manage Profile</span>
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
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-on-surface text-surface text-xs font-bold hover:bg-white transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <SupabaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <MobileConnectModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </>
  )
}
