import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/authContext'
import { NavBar } from './components/NavBar'
import { PresenterDrawer } from './components/PresenterDrawer'
import { QueueListView } from './views/QueueListView'
import { TicketView } from './views/TicketView'
import { ProviderConsoleView } from './views/ProviderConsoleView'
import { LobbyDisplayView } from './views/LobbyDisplayView'
import { AuthView } from './views/AuthView'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-white pb-16">
          <NavBar />
          
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<QueueListView />} />
              <Route path="/ticket/:queueId" element={<TicketView />} />
              <Route path="/q/:queueId" element={<TicketView />} />
              <Route path="/provider" element={<ProviderConsoleView />} />
              <Route path="/provider/:queueId" element={<ProviderConsoleView />} />
              <Route path="/display" element={<LobbyDisplayView />} />
              <Route path="/display/:queueId" element={<LobbyDisplayView />} />
              <Route path="/auth" element={<AuthView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <PresenterDrawer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
