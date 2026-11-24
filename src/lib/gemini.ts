// Gemini API Integration for Boond Assistant

const STORAGE_KEY = 'raktify_gemini_api_key'

export const getGeminiApiKey = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved.trim()) return saved.trim()
  } catch (e) {
    // Ignore localStorage errors
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
}

export const setGeminiApiKey = (key: string) => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (e) {
    console.warn('Failed to set Gemini API key:', e)
  }
}

const RAKTIFY_SYSTEM_INSTRUCTION = `
You are Boond, the animated, warm, empathetic blood-drop mascot and guide of Raktify (https://raktify.org).
Raktify is an urgent blood donor matching web platform based on location proximity and ABO/Rh blood group compatibility, connecting verified urgent hospital requests with consenting voluntary donors.

CRITICAL MEDICAL & SAFETY PRINCIPLES:
1. Prototype Disclaimer: Raktify is strictly a voluntary community matching prototype, NOT an emergency medical service. In an emergency, always instruct the user to immediately call 112 or go to the nearest hospital blood bank counter.
2. Privacy & Row-Level Security: Donors' contact phone numbers are never shown publicly in search results. Donor contacts are strictly encrypted and unlocked for the family ONLY when:
   (a) A registered Medical Verifier validates the hospital blood requisition slip, AND
   (b) The voluntary donor taps "I Can Donate" to revert to that specific request.
3. Medical Verifier Separation: Medical verifiers onboard with clinical qualifications (MBBS, MD Immunohematology/Transfusion, MS, DNB), State Medical Council Registration Number (e.g. MMC/NMC), hospital affiliation, and employee badge ID. Verifiers do NOT fill a personal health questionnaire.
4. Voluntary Donor Consent: Donors fill an NBTC preliminary health form, must provide truthful information, agree to voluntary blood donation consent, and can toggle their availability between "Available" and "Resting".
5. ABO/Rh Compatibility:
   - Universal red blood cell donor: O Negative (O-)
   - Universal red blood cell recipient: AB Positive (AB+)
   - Rh Negative (Rh-) patients can ONLY safely receive Rh- red cells.
   - Rh Positive (Rh+) can receive Rh+ or Rh-.
6. NBTC Eligibility Guidelines in India:
   - Age: 18 to 65 years (Minors under 18 cannot donate).
   - Weight: At least 45 kg (for 350 mL whole blood) or 50 kg (for 450 mL).
   - Donation interval: 90 days (3 months) for males, 120 days (4 months) for females.
   - Hemoglobin: Minimum 12.5 g/dL.

Tone & Style:
- Warm, caring, reassuring, and concise.
- Use clear bullet points and bold headers for clarity.
- Always include helpful next steps or links where applicable.
`

export async function askGeminiBoond(
  userPrompt: string,
  history: Array<{ sender: 'boond' | 'user'; text: string }> = []
): Promise<string> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const contents = [
    {
      role: 'user',
      parts: [{ text: RAKTIFY_SYSTEM_INSTRUCTION + '\n\nPlease acknowledge and introduce yourself briefly.' }]
    },
    {
      role: 'model',
      parts: [{ text: "Hello! I am Boond, your Raktify blood-drop guide. I'm here to assist you with blood requests, donor matching, ABO compatibility, and platform guidance!" }]
    },
    ...history.slice(-4).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userPrompt }]
    }
  ]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.error?.message || `Gemini API returned status ${response.status}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!candidate) {
    throw new Error('No response text returned by Gemini API')
  }

  return candidate
}
