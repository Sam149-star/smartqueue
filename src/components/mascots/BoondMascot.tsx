import React, { useId, useState } from 'react'
import '../../styles/mascots.css'

export type MascotStage = 'calm' | 'hopeful' | 'celebrating' | 'winking'
export type MascotVariant = 'meditating' | 'sign' | 'waving'

export interface BoondMascotProps {
  size?: number | string
  stage?: MascotStage
  variant?: MascotVariant
  className?: string
  alt?: string
  interactive?: boolean
  onClick?: () => void
}

export const BoondMascot: React.FC<BoondMascotProps> = ({
  size = 180,
  stage: propStage,
  variant = 'meditating',
  className = '',
  alt = 'Boond the blood drop mascot',
  interactive = true,
  onClick
}) => {
  const id = useId().replace(/:/g, '')
  const [internalStage, setInternalStage] = useState<MascotStage | undefined>(undefined)

  const activeStage = propStage || internalStage

  const isSignVariant = variant === 'sign' || variant === 'waving'

  const dropGradId = `dropGrad-${id}`
  const glowGradId = `glowGrad-${id}`
  const cheekGradId = `cheekGrad-${id}`
  const signWoodId = `signWood-${id}`
  const signBoardGradId = `signBoardGrad-${id}`
  const signDropShadowId = `signDropShadow-${id}`

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (interactive && !propStage) {
      setInternalStage((prev) => {
        if (!prev || prev === 'calm') return 'hopeful'
        if (prev === 'hopeful') return 'celebrating'
        return 'calm'
      })
    }
  }

  // Dimension scaling
  const widthNum = typeof size === 'number' ? size : parseInt(size as string, 10) || 180
  const heightRatio = isSignVariant ? 480 / 520 : 450 / 400
  const sizeStyle =
    typeof size === 'number'
      ? { width: size, height: size * heightRatio }
      : { width: size, height: 'auto' }

  return (
    <div
      className={`boond-mascot inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      } ${className}`}
      data-stage={activeStage}
      data-variant={isSignVariant ? 'sign' : 'meditating'}
      style={sizeStyle}
      role="img"
      aria-label={alt}
      title={interactive ? 'Tap Boond to change mood!' : alt}
      onClick={handleClick}
    >
      {isSignVariant ? (
        /* ══════════════ STITCH WAVING SIGN VARIANT ("We Help ! SAVE LIVES") ══════════════ */
        <svg
          className="boond-mascot-svg w-full h-full"
          viewBox="0 0 520 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={dropGradId} x1="0.2" x2="0.8" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff3b56" />
              <stop offset="45%" stopColor="#e01a3f" />
              <stop offset="100%" stopColor="#a60824" />
            </linearGradient>
            <radialGradient cx="50%" cy="50%" id={glowGradId} r="50%">
              <stop offset="0%" stopColor="#ff4b6b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ff2e4d" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ff4b6b" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id={cheekGradId} r="50%">
              <stop offset="0%" stopColor="#ff6b8b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff859d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={signWoodId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#9a6744" />
              <stop offset="50%" stopColor="#bd855c" />
              <stop offset="100%" stopColor="#8a5735" />
            </linearGradient>
            <linearGradient id={signBoardGradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff5f5" />
            </linearGradient>
            <filter height="140%" id={signDropShadowId} width="140%" x="-20%" y="-20%">
              <feDropShadow dx="2" dy="5" floodColor="#550512" floodOpacity="0.3" stdDeviation="4" />
            </filter>
          </defs>

          {/* Sparkles */}
          <g className="sparkle-1">
            <path d="M120 130 Q120 140 110 140 Q120 140 120 150 Q120 140 130 140 Q120 140 120 130 Z" fill="#ff708a" />
          </g>
          <g className="sparkle-2">
            <path d="M350 110 Q350 120 340 120 Q350 120 350 130 Q350 120 360 120 Q350 120 350 110 Z" fill="#ff4d6d" />
          </g>
          <g className="sparkle-3">
            <path d="M360 262 Q360 270 352 270 Q360 270 360 278 Q360 270 368 270 Q360 270 360 262 Z" fill="#ffa3b5" />
          </g>

          {/* Ambient Glow */}
          <circle className="pulse-aura" cx="240" cy="230" fill={`url(#${glowGradId})`} r="150" />

          {/* Grounding Shadow */}
          <ellipse className="mascot-shadow" cx="240" cy="425" fill="#2d0b13" rx="64" ry="14" />

          {/* Floating Mascot Container */}
          <g className="mascot-container">
            <g className="mascot-body-scale">
              {/* Energetically Waving Left Arm */}
              <g className="arm-left-wave">
                <path
                  d="M178 252 C150 248 128 228 120 198 C116 184 122 170 134 172 C142 174 145 184 140 194"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <g id="waving-hand" transform="translate(116, 168) rotate(-15)">
                  <ellipse cx="6" cy="14" fill="#22181c" rx="9" ry="11" />
                  <ellipse cx="-4" cy="11" fill="#22181c" rx="5" ry="4" transform="rotate(-30 -4 11)" />
                  <circle cx="2" cy="3" fill="#22181c" r="4.5" />
                  <circle cx="9" cy="4" fill="#22181c" r="4.5" />
                  <circle cx="15" cy="8" fill="#22181c" r="4" />
                </g>
                <path d="M96 170 C94 158 100 148 106 142" fill="none" opacity="0.8" stroke="#ff708a" strokeLinecap="round" strokeWidth="3" />
                <path d="M86 182 C82 170 88 156 94 150" fill="none" opacity="0.6" stroke="#ff4d6d" strokeLinecap="round" strokeWidth="2.5" />
              </g>

              {/* Right Arm & Waving Sign Board ("We Help ! SAVE LIVES") */}
              <g className="arm-right-sign">
                <path
                  d="M304 256 C332 254 360 240 376 214 C384 200 392 188 402 180"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <circle cx="396" cy="192" fill="#22181c" r="9" />
                <circle cx="390" cy="186" fill="#22181c" r="4.5" />
                <circle cx="394" cy="181" fill="#22181c" r="4.5" />
                <circle cx="400" cy="183" fill="#22181c" r="4.5" />

                {/* Sign Board */}
                <g className="sign-flutter-group">
                  <rect fill={`url(#${signWoodId})`} height="150" rx="4" stroke="#52321c" strokeWidth="1.5" width="8" x="391" y="90" />
                  <circle cx="395" cy="240" fill="#52321c" r="4.5" />

                  <g filter={`url(#${signDropShadowId})`} transform="translate(325, 45) rotate(-6 75 45)">
                    <rect fill="#693a20" height="74" rx="14" stroke="#48220f" strokeWidth="2" width="156" x="0" y="0" />
                    <rect fill={`url(#${signBoardGradId})`} height="64" rx="10" stroke="#e01a3f" strokeWidth="2" width="146" x="5" y="5" />
                    <circle cx="16" cy="37" fill="#d97706" r="3.5" stroke="#92400e" strokeWidth="1" />
                    <circle cx="140" cy="37" fill="#d97706" r="3.5" stroke="#92400e" strokeWidth="1" />

                    {/* Heart */}
                    <g className="sign-heart" transform="translate(24, 20)">
                      <path d="M10 2 C10 2 2 10 2 15 C2 19.5 5.5 23 10 23 C14.5 23 18 19.5 18 15 C18 10 10 2 10 2 Z" fill="#e01a3f" />
                      <circle cx="7" cy="13" fill="#ffffff" r="1.5" />
                    </g>

                    <text
                      fill="#b00827"
                      fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                      fontSize="21"
                      fontWeight="900"
                      letterSpacing="0.5"
                      textAnchor="middle"
                      x="76"
                      y="38"
                    >
                      We Help !
                    </text>
                    <rect fill="#ffe2e7" height="15" rx="7.5" width="76" x="42" y="47" />
                    <text
                      fill="#e01a3f"
                      fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                      fontSize="8.5"
                      fontWeight="800"
                      letterSpacing="1"
                      textAnchor="middle"
                      x="80"
                      y="58.5"
                    >
                      SAVE LIVES
                    </text>
                  </g>

                  {/* Ribbon streamers */}
                  <g transform="translate(325, 105) rotate(-6)">
                    <path d="M12 0 C16 12 8 20 18 32 C12 30 6 24 8 16 Z" fill="#e01a3f" />
                    <path d="M20 0 C26 10 18 18 24 28 C20 26 16 20 18 14 Z" fill="#ff708a" />
                  </g>
                </g>
              </g>

              {/* Meditating Lotus Legs */}
              <g className="legs-lotus">
                <path
                  d="M214 326 C214 350 228 360 240 360 C247 360 253 352 248 345 C242 338 232 338 228 332"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <path
                  d="M266 326 C266 350 252 360 240 360 C233 360 228 353 232 346 C237 339 247 338 252 332"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <ellipse cx="239" cy="354" fill="#22181c" rx="5" ry="7" />
              </g>

              {/* Blood Drop Body */}
              <g className="drop-tip">
                <path
                  d="M240 68 C252 95 280 145 308 192 C336 240 330 296 298 326 C266 356 214 356 182 326 C150 296 144 240 172 192 C200 145 228 95 240 68 Z"
                  fill={`url(#${dropGradId})`}
                />
                <path
                  d="M240 76 C251 102 277 148 303 193 C327 235 321 288 292 317 C264 344 216 344 188 317 C159 288 153 235 177 193 C203 148 229 102 240 76 Z"
                  fill="none"
                  opacity="0.6"
                  stroke="#ff5c77"
                  strokeWidth="3"
                />
                <path
                  d="M212 122 C203 136 196 152 193 168 C191 177 196 184 203 182 C210 180 214 172 216 164 C219 150 226 138 233 128 C237 122 232 116 226 117 C220 118 215 119 212 122 Z"
                  fill="#ffffff"
                  opacity="0.94"
                />
                <ellipse
                  cx="187"
                  cy="190"
                  fill="#ffffff"
                  opacity="0.9"
                  rx="6"
                  ry="11"
                  transform="rotate(-18 187 190)"
                />
              </g>

              {/* Face Expressions */}
              <g id="mascot-face">
                <g className="blush-cheeks">
                  <circle cx="198" cy="256" fill={`url(#${cheekGradId})`} r="14" />
                  <circle cx="282" cy="256" fill={`url(#${cheekGradId})`} r="14" />
                </g>

                {/* 1. Zen Eyes */}
                <g className="expr-zen">
                  <path d="M192 236 C200 245 212 245 220 236" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <path d="M260 236 C268 245 280 245 288 236" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                </g>

                {/* 2. Happy Open Eyes */}
                <g className="expr-happy-open">
                  <g className="gaze-target">
                    <ellipse cx="206" cy="234" fill="#22181c" rx="10" ry="13" />
                    <circle cx="203" cy="229" fill="#ffffff" r="4.5" />
                    <circle cx="209" cy="238" fill="#ffffff" r="2.2" />
                  </g>
                  <g className="gaze-target">
                    <ellipse cx="274" cy="234" fill="#22181c" rx="10" ry="13" />
                    <circle cx="271" cy="229" fill="#ffffff" r="4.5" />
                    <circle cx="277" cy="238" fill="#ffffff" r="2.2" />
                  </g>
                </g>

                {/* 3. Wink Eyes */}
                <g className="expr-wink">
                  <path d="M192 234 C200 227 212 227 220 236" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <ellipse cx="274" cy="233" fill="#22181c" rx="10.5" ry="13.5" />
                  <polygon fill="#ffffff" points="273,226 275,230 279,231 275,232 273,236 271,232 267,231 271,230" />
                  <circle cx="278" cy="238" fill="#ffffff" r="2.2" />
                </g>

                {/* 4. Joyful Crescent Eyes */}
                <g className="expr-joyful-crescent">
                  <path d="M192 236 C200 224 212 224 220 236" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <path d="M260 236 C268 224 280 224 288 236" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                </g>

                {/* Dynamic Reactive Mouth */}
                <path
                  className="dynamic-mouth"
                  d="M231 254 Q240 264 249 254"
                  fill="#22181c"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="5"
                />
              </g>
            </g>
          </g>
        </svg>
      ) : (
        /* ══════════════ STITCH MEDITATING LOTUS VARIANT (CHIN MUDRA) ══════════════ */
        <svg
          className="boond-mascot-svg w-full h-full"
          viewBox="0 0 400 450"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={dropGradId} x1="0.2" x2="0.8" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff3b56" />
              <stop offset="45%" stopColor="#e01a3f" />
              <stop offset="100%" stopColor="#a60824" />
            </linearGradient>
            <radialGradient cx="50%" cy="50%" id={glowGradId} r="50%">
              <stop offset="0%" stopColor="#ff4b6b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ff2e4d" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ff4b6b" stopOpacity="0" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id={cheekGradId} r="50%">
              <stop offset="0%" stopColor="#ff6b8b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff859d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Calming Ambient Twinkles */}
          <g className="sparkle-1">
            <path d="M90 130 Q90 140 80 140 Q90 140 90 150 Q90 140 100 140 Q90 140 90 130 Z" fill="#ff708a" />
          </g>
          <g className="sparkle-2">
            <path d="M310 110 Q310 120 300 120 Q310 120 310 130 Q310 120 320 120 Q310 120 310 110 Z" fill="#ff4d6d" />
          </g>
          <g className="sparkle-3">
            <path d="M320 252 Q320 260 312 260 Q320 260 320 268 Q320 260 328 260 Q320 260 320 252 Z" fill="#ffa3b5" />
          </g>

          {/* Ambient Glow Behind Mascot */}
          <circle className="pulse-aura" cx="200" cy="220" fill={`url(#${glowGradId})`} r="135" />

          {/* Dynamic Grounding Shadow */}
          <ellipse className="mascot-shadow" cx="200" cy="395" fill="#2d0b13" rx="58" ry="13" />

          {/* Floating Mascot Group */}
          <g className="mascot-container">
            <g className="mascot-body-scale">
              {/* Left Meditating Arm (Chin Mudra Gesture) */}
              <g className="arm-left">
                <path
                  d="M136 242 C110 252 86 238 78 222 C73 212 79 198 90 200 C96 201 100 207 97 214"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <circle cx="91" cy="209" fill="#fff" r="6" stroke="#22181c" strokeWidth="6" />
                <path
                  d="M82 201 C76 195 72 186 78 184 C84 182 88 191 88 198"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeWidth="6"
                />
                <path
                  d="M96 200 C98 192 101 185 107 188 C112 191 109 200 102 205"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeWidth="5.5"
                />
              </g>

              {/* Right Meditating Arm (Chin Mudra Gesture) */}
              <g className="arm-right">
                <path
                  d="M264 242 C290 252 314 238 322 222 C327 212 321 198 310 200 C304 201 300 207 303 214"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <circle cx="309" cy="209" fill="#fff" r="6" stroke="#22181c" strokeWidth="6" />
                <path
                  d="M318 201 C324 195 328 186 322 184 C316 182 312 191 312 198"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeWidth="6"
                />
                <path
                  d="M304 200 C302 192 299 185 293 188 C288 191 291 200 298 205"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeWidth="5.5"
                />
              </g>

              {/* Meditating Lotus Legs */}
              <g className="legs-lotus">
                <path
                  d="M174 316 C174 340 188 350 200 350 C207 350 213 342 208 335 C202 328 192 328 188 322"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <path
                  d="M226 316 C226 340 212 350 200 350 C193 350 188 343 192 336 C197 329 207 328 212 322"
                  fill="none"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7.5"
                />
                <ellipse cx="199" cy="344" fill="#22181c" rx="5" ry="7" />
              </g>

              {/* Blood Drop Body */}
              <g className="drop-tip">
                <path
                  d="M200 58 C212 85 240 135 268 182 C296 230 290 286 258 316 C226 346 174 346 142 316 C110 286 104 230 132 182 C160 135 188 85 200 58 Z"
                  fill={`url(#${dropGradId})`}
                />
                <path
                  d="M200 66 C211 92 237 138 263 183 C287 225 281 278 252 307 C224 334 176 334 148 307 C119 278 113 225 137 183 C163 138 189 92 200 66 Z"
                  fill="none"
                  opacity="0.6"
                  stroke="#ff5c77"
                  strokeWidth="3"
                />
                <path
                  d="M172 112 C163 126 156 142 153 158 C151 167 156 174 163 172 C170 170 174 162 176 154 C179 140 186 128 193 118 C197 112 192 106 186 107 C180 108 175 109 172 112 Z"
                  fill="#ffffff"
                  opacity="0.94"
                />
                <ellipse
                  cx="147"
                  cy="180"
                  fill="#ffffff"
                  opacity="0.9"
                  rx="6"
                  ry="11"
                  transform="rotate(-18 147 180)"
                />
              </g>

              {/* Face Expressions */}
              <g id="mascot-face">
                <g className="blush-cheeks">
                  <circle cx="158" cy="245" fill={`url(#${cheekGradId})`} r="14" />
                  <circle cx="242" cy="245" fill={`url(#${cheekGradId})`} r="14" />
                </g>

                {/* 1. Zen Eyes */}
                <g className="expr-zen">
                  <path d="M152 225 C160 234 172 234 180 225" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <path d="M220 225 C228 234 240 234 248 225" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                </g>

                {/* 2. Happy Open Eyes */}
                <g className="expr-happy-open">
                  <g className="gaze-target">
                    <ellipse cx="166" cy="223" fill="#22181c" rx="10" ry="13" />
                    <circle cx="163" cy="218" fill="#ffffff" r="4.5" />
                    <circle cx="169" cy="227" fill="#ffffff" r="2.2" />
                  </g>
                  <g className="gaze-target">
                    <ellipse cx="234" cy="223" fill="#22181c" rx="10" ry="13" />
                    <circle cx="231" cy="218" fill="#ffffff" r="4.5" />
                    <circle cx="237" cy="227" fill="#ffffff" r="2.2" />
                  </g>
                </g>

                {/* 3. Wink Eyes */}
                <g className="expr-wink">
                  <path d="M152 223 C160 216 172 216 180 225" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <ellipse cx="234" cy="222" fill="#22181c" rx="10.5" ry="13.5" />
                  <polygon fill="#ffffff" points="233,215 235,219 239,220 235,221 233,225 231,221 227,220 231,219" />
                  <circle cx="238" cy="227" fill="#ffffff" r="2.2" />
                </g>

                {/* 4. Joyful Crescent Eyes */}
                <g className="expr-joyful-crescent">
                  <path d="M152 225 C160 213 172 213 180 225" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                  <path d="M220 225 C228 213 240 213 248 225" fill="none" stroke="#22181c" strokeLinecap="round" strokeWidth="6.5" />
                </g>

                {/* Dynamic Reactive Mouth */}
                <path
                  className="dynamic-mouth"
                  d="M191 242 Q200 252 209 242"
                  fill="#22181c"
                  stroke="#22181c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="5"
                />
              </g>
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}

export default BoondMascot
