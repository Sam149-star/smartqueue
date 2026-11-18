import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, AlertCircle, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Star, Accessibility } from 'lucide-react'
import { playChime } from '../hooks/useNotify'
import { getToken, callNext } from '../lib/api'
import type { TokenWithQueue } from '../lib/types'
import { label } from '../lib/eta'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const QRScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [verifiedToken, setVerifiedToken] = useState<TokenWithQueue | null>(null)
  const [verifying, setVerifying] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isStartedRef = useRef(false)

  const handleScanSuccess = async (decodedText: string) => {
    playChime('join')
    stopScanner()

    let target = decodedText.trim()

    // Check if it's a ticket verification QR (contains token parameter or tokenId)
    let tokenId: string | null = null
    try {
      if (target.includes('token=')) {
        const urlObj = new URL(target)
        tokenId = urlObj.searchParams.get('token')
      }
    } catch {
      // not a full url
    }

    if (tokenId) {
      // Real-time verification in Supabase
      setVerifying(true)
      try {
        const t = await getToken(tokenId)
        if (t) {
          setVerifiedToken(t)
          setVerifying(false)
          return
        }
      } catch (err) {
        console.warn(err)
      }
      setVerifying(false)
    }

    // Default route navigation
    try {
      if (target.startsWith('http')) {
        const parsed = new URL(target)
        target = parsed.pathname
      } else if (!target.startsWith('/')) {
        target = `/ticket/${target}`
      }
    } catch {
      target = `/ticket/${target}`
    }

    onClose()
    navigate(target)
  }

  const startScanner = async () => {
    setCameraError(null)
    setScanning(true)
    setVerifiedToken(null)
    try {
      const html5Qr = new Html5Qrcode('qr-reader-container')
      scannerRef.current = html5Qr

      await html5Qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {}
      )
      isStartedRef.current = true
    } catch (err: unknown) {
      setCameraError(
        (err as Error).message || 'Unable to access camera. Please grant camera permission or enter code below.'
      )
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current && isStartedRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear()
          isStartedRef.current = false
          setScanning(false)
        })
        .catch(() => {
          isStartedRef.current = false
          setScanning(false)
        })
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    handleScanSuccess(manualCode)
  }

  const handleDemoQuickScan = (qId: string) => {
    handleScanSuccess(`/ticket/${qId}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface-container border border-outline/25 rounded-3xl p-5 text-on-surface shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-secondary-container text-secondary">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base font-headline text-white">QR Code Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopScanner()
              onClose()
            }}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Verified Ticket Card (if a ticket QR was scanned) */}
        {verifiedToken ? (
          <div className="p-4 rounded-2xl bg-surface-container-high border-2 border-secondary space-y-3 text-center animate-fade-in">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-fixed bg-secondary-container/80 px-3 py-1 rounded-full border border-secondary/40">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Verified in Supabase Database</span>
            </div>

            <h4 className="text-4xl font-extrabold font-mono text-white">
              {label(verifiedToken.queues?.prefix || 'A', verifiedToken.number)}
            </h4>

            <div>
              <p className="text-sm font-bold text-white">{verifiedToken.display_name || 'Guest'}</p>
              <p className="text-xs text-on-surface-variant">{verifiedToken.queues?.name}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                Status: {verifiedToken.status}
              </span>
              {verifiedToken.display_name?.includes('Senior Citizen') && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" />
                  <span>Senior</span>
                </span>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onClose()
                  navigate(`/ticket/${verifiedToken.queue_id}`)
                }}
                className="flex-1 py-2 rounded-xl bg-primary-container text-white text-xs font-bold shadow-md hover:brightness-110"
              >
                Open Ticket View
              </button>
              <button
                onClick={() => {
                  setVerifiedToken(null)
                  startScanner()
                }}
                className="px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-on-surface"
              >
                Scan Another
              </button>
            </div>
          </div>
        ) : (
          /* Video Scanner Viewport */
          <div className="relative w-full aspect-square rounded-2xl bg-black border-2 border-outline/30 overflow-hidden flex flex-col items-center justify-center">
            <div id="qr-reader-container" className="w-full h-full" />

            {/* Crosshair Scanner Overlay */}
            {scanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-2xl relative animate-pulse">
                  <span className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary" />
                  <span className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary" />
                </div>
              </div>
            )}

            {verifying && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 z-20">
                <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-white font-semibold">Verifying with Supabase...</span>
              </div>
            )}

            {cameraError && (
              <div className="p-4 text-center space-y-2 z-10">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-amber-200">{cameraError}</p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-[11px] font-semibold text-white border border-outline/20"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-center text-on-surface-variant">
          Point at counter desk QR, lobby TV display, or customer ticket.
        </p>

        {/* 1-Click Demo Scanner Presets */}
        <div className="p-3 rounded-2xl bg-surface-container-high/60 border border-outline/15 space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Hackathon Quick-Scan Presets</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoQuickScan('demo-clinic-1')}
              className="py-1.5 px-2 rounded-xl bg-surface-container border border-outline/20 hover:border-secondary text-[11px] font-semibold text-white truncate"
            >
              🏥 OPD Clinic Desk
            </button>
            <button
              type="button"
              onClick={() => handleDemoQuickScan('demo-bank-2')}
              className="py-1.5 px-2 rounded-xl bg-surface-container border border-outline/20 hover:border-primary text-[11px] font-semibold text-white truncate"
            >
              🏦 Bank Counter
            </button>
          </div>
        </div>

        {/* Manual Code Entry */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-outline/15 flex gap-2">
          <input
            type="text"
            placeholder="Or enter Queue ID / URL"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-outline/30 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-on-surface text-surface text-xs font-bold hover:bg-white"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
