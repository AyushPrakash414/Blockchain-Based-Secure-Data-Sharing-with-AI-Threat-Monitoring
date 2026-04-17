import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import { ThemeProvider } from './context/ThemeContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister()
      })
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
