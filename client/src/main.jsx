import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
window.Buffer = Buffer
window.global = window

import './index.css'
import './config/web3modal' // Initialize Web3Modal (must be before components)

import { ThemeProvider } from './context/ThemeContext.jsx'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
