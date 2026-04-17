import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
window.Buffer = Buffer
window.global = window
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'

import AppShell from './components/AppShell.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import VaultPage from './pages/VaultPage.jsx'
import SharePage from './pages/SharePage.jsx'
import ThreatPage from './pages/ThreatPage.jsx'
import AuditPage from './pages/AuditPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'vault', element: <VaultPage /> },
      { path: 'share', element: <SharePage /> },
      { path: 'threats', element: <ThreatPage /> },
      { path: 'audit', element: <AuditPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
