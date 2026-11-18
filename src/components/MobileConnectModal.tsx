import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Smartphone, Wifi, Copy, Check, ExternalLink, Globe } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const MobileConnectModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // The local IP of this machine detected via ipconfig
  const localIp = '192.168.137.40'
  const port = '5173'
  const localUrl = `http://${localIp}:${port}`

  const handleCopy = () => {
    navigator.clipboard.writeText(localUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-surface-container border border-outline/25 rounded-3xl p-6 text-on-surface shadow-2xl space-y-5 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-white rounded-full bg-surface-container-high"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary mx-auto flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold font-headline text-white">Open Live on Your Phone</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Scan this QR code with your mobile camera to test the customer ticket on your real phone!
          </p>
        </div>

        {/* High Contrast QR Code */}
        <div className="p-4 bg-white rounded-3xl shadow-xl inline-block border-4 border-secondary/30">
          <QRCodeSVG value={localUrl} size={180} level="M" />
        </div>

        {/* Direct URL with Copy button */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-high border border-outline/20">
          <span className="flex-1 text-xs font-mono text-secondary truncate text-left pl-2">
            {localUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-white hover:text-black text-on-surface transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* 3 Step Instructions */}
        <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline/15 text-left text-xs space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-secondary">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connection Steps:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-on-surface-variant text-[11px]">
            <li>Connect your phone to the <strong>same Wi-Fi or laptop hotspot</strong>.</li>
            <li>Open your phone's <strong>Camera app</strong> and point at the QR code above.</li>
            <li>Tap the link banner to open SmartQueue directly on your mobile browser!</li>
          </ol>
        </div>

        {/* Internet Tunnel Alternative */}
        <div className="text-[11px] text-on-surface-variant text-center pt-1 border-t border-outline/15">
          <p>
            On mobile cellular data? Run:
          </p>
          <code className="inline-block mt-1 px-2 py-1 rounded bg-black/40 text-amber-300 font-mono text-[10px]">
            npx localtunnel --port 5173
          </code>
        </div>
      </div>
    </div>
  )
}
