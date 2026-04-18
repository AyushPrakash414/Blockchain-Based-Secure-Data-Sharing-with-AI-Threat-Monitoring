import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import { ThemeProvider } from './context/ThemeContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
