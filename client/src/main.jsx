import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
window.Buffer = Buffer
window.global = window
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Files from './components/Files.jsx'
import Share from './components/Share.jsx'
import Layout from './components/Layout.jsx'
import Alerts from './components/Alerts.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: '',
        element: <App />
      },
      {
        path: '/files',
        element: <Files />
      },
      {
        path: '/share',
        element: <Share />
      },
      {
        path: '/alerts',
        element: <Alerts />
      },
    ],
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
