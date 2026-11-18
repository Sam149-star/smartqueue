import React, { useState } from 'react'
import { Sparkles, X, Smartphone, Monitor, Tv, Users, FastForward, RotateCcw, Volume2, ShieldCheck, QrCode } from 'lucide-react'
import { callNext, simulateCrowd, resetQueue } from '../lib/api'
import { playChime } from '../hooks/useNotify'
import { MobileConnectModal } from './MobileConnectModal'

interface Props {
  activeQueueId?: string
  onSelectQueue?: (id: string) => void
}

export const PresenterDrawer: React.FC<Props> = ({ activeQueueId = 'demo-clinic-1' }) => {
  const [open, setOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleSimulate = async () => {
    setLoadingAction('sim')
    try {
      await simulateCrowd(activeQueueId, 5)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCallNext = async () => {
    setLoadingAction('next')
    try {
      await callNext(activeQueueId)
      playChime('turn')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleReset = async () => {
    if (confirm('Reset this queue back to zero for the next judge?')) {
      setLoadingAction('reset')
      try {
        await resetQueue(activeQueueId)
      } finally {
        setLoadingAction(null)
      }
    }
  }

  return (
    <>
      {/* Floating pill button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary-container to-amber-600 text-white font-semibold text-xs shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-white/20"
      >
        <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
        <span>⚡ Pitch & Demo Control</span>
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-container border-l border-outline/20 h-full p-6 overflow-y-auto flex flex-col justify-between text-on-surface">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline/20">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary-container/20 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base font-headline">Hackathon Demo Console</h3>
                    <p className="text-xs text-on-surface-variant">Live controls for testing & presentation</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View switchers */}
              <div className="mt-5">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  1. Launch Demo Screens
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`/ticket/${activeQueueId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-secondary flex flex-col items-center text-center gap-1.5 transition-all hover:-translate-y-0.5"
                  >
                    <Smartphone className="w-5 h-5 text-secondary" />
                    <span className="text-xs font-semibold">Customer</span>
                    <span className="text-[10px] text-on-surface-variant">Mobile Hero</span>
                  </a>

                  <a
                    href={`/provider/${activeQueueId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-primary flex flex-col items-center text-center gap-1.5 transition-all hover:-translate-y-0.5"
                  >
                    <Monitor className="w-5 h-5 text-primary" />
                    <span className="text-xs font-semibold">Provider</span>
                    <span className="text-[10px] text-on-surface-variant">Operator Desk</span>
                  </a>

                  <a
                    href={`/display/${activeQueueId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-surface-container-high border border-outline/20 hover:border-amber-400 flex flex-col items-center text-center gap-1.5 transition-all hover:-translate-y-0.5"
                  >
                    <Tv className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-semibold">Lobby TV</span>
                    <span className="text-[10px] text-on-surface-variant">Public Kiosk</span>
                  </a>
                </div>

                {/* Open on phone button */}
                <button
                  onClick={() => setMobileModalOpen(true)}
                  className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-secondary-container/50 border border-secondary/40 text-secondary-fixed text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-secondary" />
                  <span>📱 Connect Real Phone via Wi-Fi QR</span>
                </button>
              </div>

              {/* Instant Trigger Buttons */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  2. Live Hackathon Action Triggers
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleCallNext}
                    disabled={loadingAction === 'next'}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary-container text-white font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Call Next Customer (Trigger Sound & Turn)</span>
                  </button>

                  <button
                    onClick={handleSimulate}
                    disabled={loadingAction === 'sim'}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high border border-outline/30 text-secondary font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span>+ Simulate 5 Waiters in Line</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => playChime('turn')}
                      className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high border border-outline/20 text-xs flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-white"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test Chime</span>
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={loadingAction === 'reset'}
                      className="py-2 px-3 rounded-xl bg-surface-container-high border border-outline/20 text-xs flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-950/30"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pitch points */}
              <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-outline/20 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-secondary font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Judges Pitch Cheat Sheet (60-sec Pitch):</span>
                </div>
                <ul className="space-y-1.5 text-on-surface-variant list-disc list-inside">
                  <li><strong className="text-on-surface">The Problem:</strong> Physical lines waste 2.4B hours annually; physical buzzers cost $50 each with 50m limit.</li>
                  <li><strong className="text-on-surface">Accessibility First:</strong> Auto-flags 60+ senior citizens and wheelchair accessibility for priority counter care.</li>
                  <li><strong className="text-on-surface">Delegated Care:</strong> Book for elderly parents, children, or clients with real-time updates on both phones.</li>
                  <li><strong className="text-on-surface">Zero App Download:</strong> Fast Google OAuth, SMS OTP, or 1-tap QR scan via Supabase.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-outline/20 text-[11px] text-center text-on-surface-variant">
              SmartQueue • Built with Supabase & React • Hackathon Ready
            </div>
          </div>
        </div>
      )}

      <MobileConnectModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </>
  )
}
