import React, { useState } from 'react'
import { Database, CheckCircle2, AlertTriangle, Key, ExternalLink, X, RefreshCw } from 'lucide-react'
import { isSupabaseConfigured, supabaseUrl, supabaseKey, saveSupabaseCredentials, clearSupabaseCredentials } from '../lib/supabase'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const SupabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(supabaseUrl)
  const [key, setKey] = useState(supabaseKey)
  const [testing, setTesting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const configured = isSupabaseConfigured()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !key) {
      alert('Please provide both Project URL and Anon Key')
      return
    }
    saveSupabaseCredentials(url, key)
  }

  const handleClear = () => {
    if (confirm('Clear custom Supabase credentials and return to Local Demo Mode?')) {
      clearSupabaseCredentials()
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setStatusMsg(null)
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      })
      if (res.ok || res.status === 200 || res.status === 404) {
        setStatusMsg('✅ Connection successful! Supabase API reached.')
      } else {
        setStatusMsg(`⚠️ Server returned HTTP ${res.status}. Check key permissions.`)
      }
    } catch (err: unknown) {
      setStatusMsg(`❌ Connection failed: ${(err as Error).message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-container border border-outline/20 rounded-2xl shadow-2xl p-6 text-on-surface">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-white rounded-full bg-surface-container-high"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-headline">Supabase Backend Configuration</h2>
            <p className="text-xs text-on-surface-variant">Live Cloud Postgres & Realtime sync</p>
          </div>
        </div>

        {/* Current status banner */}
        <div className={`p-3 rounded-xl mb-5 flex items-center gap-3 border ${
          configured ? 'bg-secondary-container/40 border-secondary/40 text-secondary-fixed' : 'bg-primary-container/20 border-primary/40 text-primary-fixed'
        }`}>
          {configured ? <CheckCircle2 className="w-5 h-5 shrink-0 text-secondary" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-primary" />}
          <div className="text-xs">
            <p className="font-semibold">{configured ? 'Connected to Live Supabase' : 'Running in Local Demo Sync Mode'}</p>
            <p className="opacity-80">
              {configured
                ? `Endpoint: ${supabaseUrl.substring(0, 32)}...`
                : 'All RPCs, queues, and multi-tab broadcasts run via reactive in-memory engine.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-sm focus:border-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Publishable / Anon Public Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={e => setKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-sm focus:border-secondary focus:outline-none pr-10"
              />
              <Key className="w-4 h-4 text-on-surface-variant absolute right-3 top-3.5" />
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-lg bg-surface-container-high text-xs text-on-surface border border-outline/20">
              {statusMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url || !key}
              className="px-3 py-2 rounded-xl border border-outline/40 hover:bg-surface-container-high text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Test Connection
            </button>

            <div className="flex items-center gap-2">
              {configured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40"
                >
                  Clear & Reset
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary-container text-white font-medium text-xs hover:brightness-110 shadow-md"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-outline/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Need Supabase setup help?</span>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-secondary hover:underline"
          >
            Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
