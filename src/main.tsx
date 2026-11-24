import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// SPA non-reload boot timestamp verification (SPEC §4)
declare global {
  interface Window {
    __raktifyBoot?: number
  }
}
window.__raktifyBoot = window.__raktifyBoot || Date.now()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
