import React from 'react'
import type { TurnState } from '../lib/types'
import { BoondMascot, MascotStage } from './mascots/BoondMascot'

export { BoondMascot }
export type { MascotStage }

interface MascotProps {
  state?: TurnState | 'idle' | 'celebrating' | MascotStage
  size?: 'compact' | 'medium' | 'large'
  showStatusBadge?: boolean
  className?: string
  statusText?: string
}

export const JoeyMascot: React.FC<{
  state?: TurnState | 'idle' | 'celebrating' | MascotStage
  size?: number
  className?: string
}> = ({
  state = 'waiting',
  size = 110,
  className = ''
}) => {
  const isExcited = state === 'now' || state === 'celebrating'

  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="joeySunGlowSolo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="65%" stopColor="#F6C343" />
            <stop offset="100%" stopColor="#E5A620" />
          </radialGradient>
        </defs>

        <g className="animate-spin-slow origin-center" style={{ animationDuration: isExcited ? '12s' : '28s' }}>
          <g fill="#F6C343" opacity="0.85">
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
              <polygon key={deg} points="-7,-36 0,-62 7,-36" transform={`translate(80, 80) rotate(${deg})`} />
            ))}
          </g>
        </g>

        {/* Joey Face */}
        <circle cx="80" cy="80" r="42" fill="url(#joeySunGlowSolo)" stroke="#FFE58F" strokeWidth="3" />
        <circle cx="62" cy="88" r="6.5" fill="#ee654c" fillOpacity="0.4" />
        <circle cx="98" cy="88" r="6.5" fill="#ee654c" fillOpacity="0.4" />
        <ellipse cx="68" cy="76" rx="4" ry="5.5" fill="#1c180f" />
        <circle cx="70" cy="74" r="1.5" fill="#ffffff" />
        <ellipse cx="92" cy="76" rx="4" ry="5.5" fill="#1c180f" />
        <circle cx="94" cy="74" r="1.5" fill="#ffffff" />
        {isExcited ? (
          <path d="M68 87 Q80 102 92 87" stroke="#1c180f" strokeWidth="3.2" strokeLinecap="round" fill="#ee654c" />
        ) : (
          <path d="M72 89 Q80 98 88 89" stroke="#1c180f" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  )
}

// Joey (Sun) & Boond (Stitch Blood Drop) Duo for onboarding & hero
export const JoeyAndBoondDuo: React.FC<MascotProps> = ({
  state = 'waiting',
  size = 'large',
  showStatusBadge = false,
  className = '',
  statusText
}) => {
  const boondStage: MascotStage =
    state === 'celebrating' || state === 'now'
      ? 'celebrating'
      : state === 'near' || state === 'hopeful'
      ? 'hopeful'
      : 'calm'

  const joeySize = size === 'compact' ? 70 : size === 'medium' ? 95 : 120
  const boondSize = size === 'compact' ? 100 : size === 'medium' ? 135 : 170

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex items-center justify-center gap-2 sm:gap-4">
        {/* Ambient subtle orbit glow behind them */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-amber-500/10 via-primary/10 to-red-500/10 blur-2xl pointer-events-none" />

        {/* Joey the Sun */}
        <div className="flex flex-col items-center">
          <JoeyMascot state={state} size={joeySize} />
          <span className="text-[11px] font-bold text-amber-300 mt-1">Joey</span>
        </div>

        {/* Boond the Blood Drop */}
        <div className="flex flex-col items-center">
          <BoondMascot size={boondSize} stage={boondStage} alt="Boond the blood drop mascot" />
          <span className="text-[11px] font-bold text-primary -mt-2">Boond</span>
        </div>
      </div>

      {showStatusBadge && (
        <div className="mt-3 px-3.5 py-1 rounded-full bg-surface-container-high/90 border border-outline/30 backdrop-blur-md flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-on-surface">
            {statusText || "Joey & Boond: Ready to help match donors"}
          </span>
        </div>
      )}
    </div>
  )
}

// Aliases for backwards compatibility
export const JoeyAndRachelDuo = JoeyAndBoondDuo
export const RachelMascot: React.FC<{
  state?: TurnState | 'idle' | MascotStage
  size?: number
  className?: string
}> = ({ state = 'calm', size = 110, className = '' }) => {
  const boondStage: MascotStage =
    state === 'celebrating' || state === 'now'
      ? 'celebrating'
      : state === 'near' || state === 'hopeful'
      ? 'hopeful'
      : 'calm'
  return <BoondMascot size={size} stage={boondStage} className={className} />
}
