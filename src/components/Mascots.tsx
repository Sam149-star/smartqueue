import React from 'react'
import type { TurnState } from '../lib/types'

interface MascotProps {
  state?: TurnState | 'idle' | 'celebrating'
  size?: 'compact' | 'medium' | 'large'
  showStatusBadge?: boolean
  className?: string
}

export const JoeyAndRachelDuo: React.FC<MascotProps> = ({
  state = 'waiting',
  size = 'large',
  showStatusBadge = true,
  className = ''
}) => {
  const isNow = state === 'now' || state === 'celebrating'
  const isNear = state === 'near'
  const isFinished = state === 'finished'

  // Dimensions based on size
  const maxW = size === 'compact' ? 'max-w-[200px]' : size === 'medium' ? 'max-w-[260px]' : 'max-w-[340px]'
  const viewBox = "0 0 340 260"

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* SVG Container */}
      <div className={`w-full ${maxW} relative`}>
        <svg
          className="w-full h-auto relative z-10 select-none drop-shadow-lg overflow-visible"
          viewBox={viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>{`
              @keyframes joeyFloat {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(${isNow ? '-10px' : isNear ? '-7px' : '-5px'}) scale(${isNow ? '1.04' : '1.02'}); }
              }
              @keyframes rachelFloat {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(${isNow ? '-8px' : isNear ? '-6px' : '-4px'}) scale(${isNow ? '1.03' : '1.015'}); }
              }
              @keyframes raysRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes orbitPulse {
                0%, 100% { opacity: 0.25; stroke-dashoffset: 0; }
                50% { opacity: 0.5; stroke-dashoffset: 10; }
              }
              .joey-anim {
                animation: joeyFloat ${isNow ? '1.1s' : isNear ? '2s' : '4s'} ease-in-out infinite;
                transform-origin: 116px 130px;
              }
              .rachel-anim {
                animation: rachelFloat ${isNow ? '1.1s' : isNear ? '1.9s' : '3.8s'} ease-in-out infinite 0.3s;
                transform-origin: 224px 130px;
              }
              .joey-rays-spin {
                animation: raysRotate ${isNow ? '8s' : isNear ? '14s' : '26s'} linear infinite;
                transform-origin: 116px 126px;
              }
              .orbit-anim {
                animation: orbitPulse 6s ease-in-out infinite;
              }
            `}</style>

            <radialGradient id="joeySunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF085" />
              <stop offset="40%" stopColor="#FFD147" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            <radialGradient id="rachelBlushGlow" cx="45%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#ffdad3" />
              <stop offset="45%" stopColor="#ffb4a6" />
              <stop offset="85%" stopColor="#ee654c" />
              <stop offset="100%" stopColor="#ab3520" />
            </radialGradient>

            <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Orbital tracks and alignment guides */}
          <circle cx="170" cy="130" r="115" stroke="#cfe9d8" strokeOpacity="0.14" strokeDasharray="4 6" strokeWidth="1.5" className="orbit-anim" />
          <circle cx="170" cy="130" r="88" stroke="#cfe9d8" strokeOpacity="0.18" strokeWidth="1" />
          <ellipse cx="170" cy="130" rx="120" ry="42" stroke="#b3ccbd" strokeOpacity="0.22" strokeWidth="1.5" transform="rotate(-18 170 130)" />
          <ellipse cx="170" cy="130" rx="120" ry="42" stroke="#b3ccbd" strokeOpacity="0.22" strokeWidth="1.5" transform="rotate(35 170 130)" />

          {/* Glowing orbital satellite nodes */}
          <circle cx="50" cy="78" r="4" fill="#ee654c" fillOpacity="0.85" className={isNow ? 'animate-ping' : ''} />
          <circle cx="292" cy="64" r="4.5" fill="#cfe9d8" fillOpacity="0.75" />
          <circle cx="298" cy="178" r="3.5" fill="#ffb4a6" fillOpacity="0.9" />
          <circle cx="46" cy="188" r="3" fill="#b3ccbd" fillOpacity="0.7" />

          {/* ══════════════ JOEY THE GUARDIAN ══════════════ */}
          <g className="joey-anim" filter="url(#heroShadow)">
            {/* Legs & Feet */}
            <path d="M104 172 Q100 196 94 204" stroke="#261904" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="92" cy="205" rx="6" ry="3" fill="#261904" />
            <path d="M128 172 Q130 196 136 204" stroke="#261904" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="138" cy="205" rx="6" ry="3" fill="#261904" />

            {/* Left Arm & Shield */}
            <path d="M82 134 Q66 142 68 156" stroke="#261904" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M60 148 C60 144 76 144 76 148 C76 160 68 168 68 168 C68 168 60 160 60 148 Z" fill="#ee654c" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M68 152 L68 162 M64 156 L72 156" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

            {/* Right Arm */}
            <path d="M150 132 Q164 126 172 132" stroke="#261904" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="172" cy="132" r="2.5" fill="#261904" />

            {/* Spinning Sun Rays */}
            <g className="joey-rays-spin" id="joey-sun-rays">
              <g transform="translate(116, 126)" fill="#F59E0B" stroke="#D97706" strokeWidth="1" strokeLinejoin="round">
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(0)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(22.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(45)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(67.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(90)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(112.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(135)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(157.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(180)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(202.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(225)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(247.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(270)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(292.5)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(315)" />
                <polygon points="-7,-28 0,-52 7,-28" transform="rotate(337.5)" />
              </g>
            </g>

            {/* Joey Body & Face */}
            <circle cx="116" cy="126" r="34" fill="url(#joeySunGlow)" stroke="#FFE58F" strokeWidth="2.5" />
            <circle cx="99" cy="133" r="5.5" fill="#ee654c" fillOpacity="0.45" />
            <circle cx="133" cy="133" r="5.5" fill="#ee654c" fillOpacity="0.45" />
            
            {/* Eyes */}
            <ellipse cx="104" cy="122" rx="3.5" ry="4.5" fill="#1c180f" />
            <circle cx="105.5" cy="120" r="1.2" fill="#ffffff" />
            <ellipse cx="128" cy="122" rx="3.5" ry="4.5" fill="#1c180f" />
            <circle cx="129.5" cy="120" r="1.2" fill="#ffffff" />

            {/* Smiling Mouth */}
            {isNow ? (
              <path d="M106 131 Q116 144 126 131" stroke="#1c180f" strokeWidth="2.8" strokeLinecap="round" fill="#ee654c" />
            ) : (
              <path d="M109 133 Q116 142 123 133" stroke="#1c180f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* ══════════════ RACHEL THE SYNC COMPANION ══════════════ */}
          <g className="rachel-anim" filter="url(#heroShadow)">
            {/* Legs */}
            <path d="M212 170 Q208 194 202 204" stroke="#33110f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="200" cy="205" rx="6" ry="3" fill="#33110f" />
            <path d="M236 170 Q238 194 244 204" stroke="#33110f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="246" cy="205" rx="6" ry="3" fill="#33110f" />

            {/* Arms */}
            <path d="M190 134 Q178 128 172 134" stroke="#33110f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="172" cy="134" r="2.5" fill="#33110f" />
            <path d="M258 132 Q272 124 278 134" stroke="#33110f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="278" cy="134" r="2.5" fill="#33110f" />

            {/* Rachel Body & Blush */}
            <circle cx="224" cy="128" r="37" fill="url(#rachelBlushGlow)" stroke="#ffdad3" strokeWidth="2.5" />
            <circle cx="206" cy="136" r="6" fill="#ffdad3" fillOpacity="0.6" />
            <circle cx="242" cy="136" r="6" fill="#ffdad3" fillOpacity="0.6" />

            {/* Eyes */}
            <path d="M205 124 Q211 117 217 124" stroke="#33110f" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M231 124 Q237 117 243 124" stroke="#33110f" strokeWidth="3" strokeLinecap="round" fill="none" />
            
            {/* Cute nose & smile */}
            <path d="M224 126 Q222 130 224 131" stroke="#33110f" strokeWidth="2" strokeLinecap="round" fill="none" />
            {isNow ? (
              <path d="M216 134 Q224 146 232 134" stroke="#33110f" strokeWidth="2.8" strokeLinecap="round" fill="#ffffff" />
            ) : (
              <path d="M218 135 Q224 143 230 135" stroke="#33110f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>
        </svg>
      </div>

      {/* Floating Status Pill Underneath (as in Stitch UI) */}
      {showStatusBadge && (
        <div className="mt-2 px-3.5 py-1 rounded-full bg-[#18261e]/90 border border-[#3e5547]/60 backdrop-blur-md flex items-center gap-2 shadow-md z-20">
          <span
            className={`w-2 h-2 rounded-full ${
              isNow
                ? 'bg-primary animate-ping'
                : isNear
                ? 'bg-amber-400 animate-pulse'
                : 'bg-[#f6c343] animate-ping'
            }`}
          />
          <span className="text-[11px] font-semibold text-[#cfe9d8] font-sans">
            {isNow
              ? "Joey & Rachel: IT'S YOUR TURN! Proceed to desk"
              : isNear
              ? "Joey & Rachel: Turn Approaching! Pacing Up"
              : isFinished
              ? "Joey & Rachel: Service Completed"
              : "Joey & Rachel: Synchronized & Holding Your Spot"}
          </span>
        </div>
      )}
    </div>
  )
}

// Backward-compatible individual exports
export const JoeyMascot: React.FC<{ state?: TurnState | 'idle'; size?: number; className?: string }> = ({
  state = 'waiting',
  size = 110,
  className = ''
}) => {
  return (
    <div style={{ width: size }} className={`inline-block ${className}`}>
      <JoeyAndRachelDuo state={state} size="compact" showStatusBadge={false} />
    </div>
  )
}

export const RachelMascot: React.FC<{ state?: TurnState | 'idle'; size?: number; className?: string }> = ({
  state = 'waiting',
  size = 110,
  className = ''
}) => {
  return (
    <div style={{ width: size }} className={`inline-block ${className}`}>
      <JoeyAndRachelDuo state={state} size="compact" showStatusBadge={false} />
    </div>
  )
}
