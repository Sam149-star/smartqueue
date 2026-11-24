import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, ArrowRight, ShieldCheck, Heart, PlusCircle, Activity, ClipboardList, HelpCircle, UserCheck, Stethoscope, Key, Check, AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BoondMascot } from './mascots/BoondMascot'
import { getGeminiApiKey, setGeminiApiKey, askGeminiBoond } from '../lib/gemini'

interface ChatMessage {
  id: string
  sender: 'boond' | 'user'
  text: string
  actionLink?: { label: string; to: string }
  isAiGenerated?: boolean
  timestamp: string
}

export const BoondChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey())
  const [hasApiKey, setHasApiKey] = useState(() => !!getGeminiApiKey())
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'boond',
      text: "Hi! I'm Boond, your Raktify guide. 🩸 How can I help you today? Ask me about making requests, donor consent, clinical verification, or live tracking!",
      timestamp: 'Just now'
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const quickQuestions = [
    { label: '🩸 Requester Flow', query: 'What can a Requester see and do?' },
    { label: '❤️ Donor Consent', query: 'What can a Donor see and do?' },
    { label: '🩺 Verifier Role', query: 'What does a Medical Verifier see?' },
    { label: '🔒 Phone Privacy', query: 'How are donor phone numbers protected?' },
    { label: '⏱️ Live Tracker', query: 'How does the Live Tracker work?' }
  ]

  const getBoondResponse = (query: string): { text: string; actionLink?: { label: string; to: string } } => {
    const q = query.toLowerCase()

    if (q.includes('requester') || q.includes('request page') || (q.includes('what') && q.includes('requester'))) {
      return {
        text: "🩸 **What a Requester Sees & Can Do:**\n\n1. **My Requisition Details**: Patient name, blood group & units required (PRBC, Platelets, etc.), hospital, room/bed, and treating doctor.\n2. **Hospital Slip Upload**: Attaches verified hospital blood requisition slip.\n3. **Reverted Donors List**: Real-time list of compatible voluntary donors who have tapped 'I Can Donate'.\n4. **Verified Contact Unlocking**: Prior to verification, donor phones are safely locked. Once an on-duty medical verifier reviews the hospital requisition, donor phone numbers & direct WhatsApp links unlock immediately!",
        actionLink: { label: 'Go to Requester Portal', to: '/request' }
      }
    }

    if (q.includes('donor') && (q.includes('see') || q.includes('consent') || q.includes('truth') || q.includes('do'))) {
      return {
        text: "❤️ **What a Donor Sees & Can Do:**\n\n1. **Donor Form & NBTC Questionnaire**: Demographics, blood group, city/location, and 15 NBTC health screening questions.\n2. **Voluntary Consent & Truthfulness Declaration**: Explicit solemn agreement confirming voluntary donation consent and certifying all personal information is truthful and accurate.\n3. **Availability Toggle**: 1-tap switch between '🟢 Available' and '⚪ Resting'.\n4. **Incoming Urgent Alerts**: Direct notification feed of matching patients in their city.\n5. **One-Tap Revert**: Tap 'I Can Donate' to respond to the family with estimated arrival time!",
        actionLink: { label: 'Open Donor Directory & Alerts', to: '/donors' }
      }
    }

    if (q.includes('verifier') || q.includes('doctor') || q.includes('qualification') || q.includes('console')) {
      return {
        text: "🩺 **What a Medical Verifier Sees & Can Do:**\n\n1. **Separate Qualification Onboarding**: Verifiers do NOT fill a personal health questionnaire! Instead, they onboard with medical qualifications (MBBS, MD Transfusion/Pathology, MS, DNB), State Medical Council registration number, hospital affiliation, and staff badge ID.\n2. **Clinical Verification Console**: Review pending hospital requests, inspect requisition slips, and cross-check patient admission.\n3. **One-Click Approval**: Tap 'Verify & Dispatch Donor Alerts', which broadcasts priority alerts to nearby donors and unlocks contact sharing for the anxious family!",
        actionLink: { label: 'Go to Verifier Console', to: '/verifier' }
      }
    }

    if (q.includes('request') || q.includes('need blood') || q.includes('patient') || q.includes('hospital')) {
      return {
        text: "To request urgent blood, tap 'Request' in the bottom navigation. You'll specify the patient's blood group, required units, hospital, and attach a valid hospital blood requisition slip. Our verifiers prioritize and approve legitimate hospital requests before dispatching nearby donor alerts!",
        actionLink: { label: 'Go to Urgent Request Form', to: '/request' }
      }
    }

    if (q.includes('find') || q.includes('donor') || q.includes('search') || q.includes('directory') || q.includes('compatible') || q.includes('abo')) {
      return {
        text: "You can search our voluntary donor directory filtered by exact ABO/Rh compatibility and city proximity. O- is the universal red-cell donor, and AB+ is the universal recipient. Donors are marked available when ready for urgent requests.",
        actionLink: { label: 'Explore Donor Directory', to: '/donors' }
      }
    }

    if (q.includes('eligible') || q.includes('eligibility') || q.includes('age') || q.includes('weight') || q.includes('who can donate') || q.includes('rule')) {
      return {
        text: "General blood donation criteria in India (NBTC norms):\n• Age: 18 to 65 years (Minors under 18 cannot donate)\n• Minimum Weight: 45 kg\n• Donation Gap: At least 3 months for men, 4 months for women\n• Health: Normal blood pressure, no fever or active infections, and minimum Hb of 12.5 g/dL.\nComplete our Medical Questionnaire to check preliminary self-screening!",
        actionLink: { label: 'Take Medical Questionnaire', to: '/questionnaire' }
      }
    }

    if (q.includes('phone') || q.includes('privacy') || q.includes('contact') || q.includes('safe') || q.includes('lock') || q.includes('unlock')) {
      return {
        text: "🔒 **Donor Privacy & Contact Unlocking Protocol:**\n\n• Donor phone numbers are NEVER publicly listed in search results.\n• When a donor reverts to an urgent request, their phone is locked (`+91 98201 •••••`) until a medical verifier approves the requisition slip.\n• Once verified, the requester sees the donor's phone number, Call button, and WhatsApp link for immediate coordination.",
        actionLink: { label: 'View Requester Portal', to: '/request' }
      }
    }

    if (q.includes('track') || q.includes('status') || q.includes('live') || q.includes('share')) {
      return {
        text: "The Live Tracker lets patients and family members follow their request in real-time through 4 clear stages: Submitted → Requisition Verified → Matching Donors → Units Confirmed. You can share a direct tracker link (/r/:token) with your family so no one has to make repeated stressful phone calls!",
        actionLink: { label: 'View Live Tracker', to: '/tracker' }
      }
    }

    if (q.includes('emergency') || q.includes('112') || q.includes('ambulance')) {
      return {
        text: "⚠️ Important safety notice: Raktify is a voluntary community matching prototype, NOT an emergency medical service. If a patient is in immediate life-threatening danger, please immediately call 112 or go to the nearest hospital emergency blood bank!",
        actionLink: { label: 'Back to Home', to: '/' }
      }
    }

    if (q.includes('questionnaire') || q.includes('medical') || q.includes('form') || q.includes('save')) {
      return {
        text: "Our questionnaire provides distinct paths:\n• **Voluntary Donors**: Health questions + Voluntary Donation Consent + Truthfulness Declaration.\n• **Recipients**: Hospital admission & urgency.\n• **Medical Verifiers**: Professional degrees, council registration #, and hospital affiliation (no health questions).\nAfter completion, tap 'Save' to securely store your data!",
        actionLink: { label: 'Open Questionnaire', to: '/questionnaire' }
      }
    }

    if (q.includes('who are you') || q.includes('boond') || q.includes('mascot') || q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return {
        text: "Hello! I'm Boond, the animated blood-drop mascot of Raktify! 🩸 I'm here to ensure nobody in need of blood feels lost. I can guide you through making requests, checking donor compatibility, or answering any health and safety questions!"
      }
    }

    return {
      text: "I can help you with anything on Raktify! You can ask about:\n1. 'What can a Requester see?'\n2. 'What can a Donor see?'\n3. 'What can a Verifier see?'\n4. 'How are donor contacts unlocked?'\n5. 'Who is eligible to donate blood?'\nWhat would you like to explore?",
      actionLink: { label: 'Explore Donor Directory', to: '/donors' }
    }
  }

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault()
    setGeminiApiKey(apiKeyInput.trim())
    setHasApiKey(!!apiKeyInput.trim())
    setKeySaveMessage(apiKeyInput.trim() ? 'Gemini API key saved! Live AI active.' : 'API key cleared. Standard mode restored.')
    setTimeout(() => {
      setKeySaveMessage(null)
      setSettingsOpen(false)
    }, 1800)
  }

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now'
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Attempt Gemini API call if key is available
    if (hasApiKey) {
      try {
        const aiResponseText = await askGeminiBoond(query.trim(), messages)
        const q = query.toLowerCase()
        let actionLink: { label: string; to: string } | undefined
        if (q.includes('request') || q.includes('need blood') || q.includes('patient')) {
          actionLink = { label: 'Go to Urgent Request Form', to: '/request' }
        } else if (q.includes('find') || q.includes('donor') || q.includes('directory')) {
          actionLink = { label: 'Explore Donor Directory', to: '/donors' }
        } else if (q.includes('verifier') || q.includes('verify')) {
          actionLink = { label: 'Open Verifier Console', to: '/verifier' }
        } else if (q.includes('questionnaire') || q.includes('form')) {
          actionLink = { label: 'Open Medical Questionnaire', to: '/questionnaire' }
        }

        const boondAiMsg: ChatMessage = {
          id: 'boond_' + Date.now(),
          sender: 'boond',
          text: aiResponseText,
          actionLink,
          isAiGenerated: true,
          timestamp: 'Just now'
        }
        setMessages((prev) => [...prev, boondAiMsg])
        setIsTyping(false)
        return
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local engine:', err)
      }
    }

    // Fallback to local built-in expert knowledge engine
    setTimeout(() => {
      const response = getBoondResponse(query)
      const boondMsg: ChatMessage = {
        id: 'boond_' + Date.now(),
        sender: 'boond',
        text: response.text,
        actionLink: response.actionLink,
        isAiGenerated: false,
        timestamp: 'Just now'
      }
      setMessages((prev) => [...prev, boondMsg])
      setIsTyping(false)
    }, 500)
  }

  return (
    <>
      {/* ══════════════ BIGGER & PROMINENT FLOATING LAUNCHER PILL WITH MASCOT ANIMATIONS ══════════════ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-gradient-to-r from-[#ba002e] via-primary-container to-primary text-white font-extrabold text-sm sm:text-base shadow-2xl flex items-center gap-3.5 hover:scale-105 active:scale-95 transition-all border-2 border-white/30 ring-4 ring-primary/40 group backdrop-blur-md"
          aria-label="Ask Boond for any help"
        >
          {/* Animated Mascot Avatar */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center -my-2 -ml-1 shrink-0 overflow-visible group-hover:scale-110 transition-transform">
            <BoondMascot size={46} stage="celebrating" variant="sign" interactive={false} />
          </div>
          <span className="font-headline tracking-wide text-white drop-shadow-md whitespace-nowrap text-sm sm:text-base">
            Ask Boond for any help
          </span>
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 ring-2 ring-white/40" />
          </div>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-20 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[430px] z-50 rounded-3xl bg-surface-container border border-outline/30 shadow-2xl overflow-hidden flex flex-col h-[570px] max-h-[85vh] animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-surface-container-high border-b border-outline/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-container/30 border border-primary/40 flex items-center justify-center overflow-hidden">
                <BoondMascot size={36} stage="celebrating" variant="sign" interactive={false} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Boond Helper</span>
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {hasApiKey && (
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-container/60 text-secondary-fixed text-[9px] font-bold border border-secondary/40">
                      Gemini AI
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-on-surface-variant font-medium">Instant Raktify Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                  hasApiKey
                    ? 'bg-secondary-container/40 border-secondary/40 text-secondary-fixed hover:brightness-110'
                    : 'bg-surface-container border-outline/20 text-on-surface-variant hover:text-white hover:border-primary'
                }`}
                title="Configure Gemini API Key"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline">{hasApiKey ? 'AI Key' : 'Set Key'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gemini API Key Configuration Panel */}
          {settingsOpen && (
            <form onSubmit={handleSaveApiKey} className="p-4 bg-surface-container-high/90 border-b border-outline/25 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>Configure Gemini API Key</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-on-surface-variant hover:text-white text-[11px]"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Provide your Google Gemini API key to enable live intelligence powered by <strong>Gemini 1.5 Flash</strong>. Or leave blank to use the built-in Raktify knowledge engine.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/30 text-xs text-white focus:outline-none focus:border-secondary font-mono"
                />
              </div>
              {keySaveMessage && (
                <div className="p-2 rounded-lg bg-secondary-container/30 border border-secondary/40 text-secondary-fixed text-[11px] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-secondary" />
                  <span>{keySaveMessage}</span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                {hasApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('')
                      setGeminiApiKey('')
                      setHasApiKey(false)
                      setKeySaveMessage('API key cleared.')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-surface-container text-xs text-red-400 hover:bg-red-950/30"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-secondary text-surface text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  Save Key
                </button>
              </div>
            </form>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'boond' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container/30 border border-primary/40 flex items-center justify-center mt-1">
                    <BoondMascot size={26} stage="calm" variant="meditating" interactive={false} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-on-primary rounded-tr-none'
                      : 'bg-surface-container-high text-on-surface border border-outline/20 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.actionLink && (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        navigate(msg.actionLink!.to)
                      }}
                      className="mt-1 w-full py-2 px-3 rounded-xl bg-surface-container border border-primary/40 text-primary-fixed text-xs font-bold hover:brightness-110 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex items-center justify-between text-[9px] text-on-surface-variant/60 pt-0.5">
                    {msg.isAiGenerated && (
                      <span className="text-secondary-fixed font-bold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Gemini 1.5</span>
                      </span>
                    )}
                    <span className={`block ml-auto ${msg.sender === 'user' ? 'text-white/70' : 'text-on-surface-variant/60'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] pl-9">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span>Boond is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-surface-container-low border-t border-outline/15 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
            {quickQuestions.map((q) => (
              <button
                key={q.label}
                onClick={() => handleSend(q.query)}
                className="px-3 py-1 rounded-full bg-surface-container-high border border-outline/20 text-[11px] font-semibold text-on-surface-variant hover:text-white hover:border-primary transition-all shrink-0"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3.5 bg-surface-container-high border-t border-outline/15 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Boond anything..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline/30 focus:border-primary text-xs text-white placeholder-on-surface-variant/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-primary text-on-primary hover:brightness-105 active:scale-95 transition-all disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
