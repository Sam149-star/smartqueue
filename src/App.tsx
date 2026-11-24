import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/authContext'
import { BloodRequestProvider } from './lib/bloodRequestContext'
import { AppShell } from './components/AppShell'
import { HomeView } from './views/HomeView'
import { DonorsView } from './views/DonorsView'
import { RequestView } from './views/RequestView'
import { TrackerView } from './views/TrackerView'
import { QuestionnaireView } from './views/QuestionnaireView'
import { VerifierView } from './views/VerifierView'
import { MeView } from './views/MeView'

export function App() {
  return (
    <AuthProvider>
      <BloodRequestProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/donors" element={<DonorsView />} />
              <Route path="/request" element={<RequestView />} />
              <Route path="/tracker" element={<TrackerView />} />
              <Route path="/r/:shareToken" element={<TrackerView />} />
              <Route path="/questionnaire" element={<QuestionnaireView />} />
              <Route path="/verifier" element={<VerifierView />} />
              <Route path="/me" element={<MeView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </BloodRequestProvider>
    </AuthProvider>
  )
}

export default App
