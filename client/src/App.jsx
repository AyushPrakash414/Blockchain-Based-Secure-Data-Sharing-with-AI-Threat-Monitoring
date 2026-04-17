import { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { initWallet } from './config/web3modal';

const AppFrame = lazy(() => import('./layouts/AppFrame.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const VaultPage = lazy(() => import('./pages/VaultPage.jsx'));
const MonitorPage = lazy(() => import('./pages/MonitorPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function PageFallback() {
  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-4">
      <div className="surface rounded-[var(--radius-xl)] px-6 py-4 text-sm text-base-muted">Loading secure workspace...</div>
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    path: '/app',
    element: <AppFrame />,
    children: [
      { index: true, element: <UploadPage /> },
      { path: 'files', element: <VaultPage /> },
      { path: 'monitor', element: <MonitorPage /> },
    ],
  },
  { path: '/dashboard', element: <Navigate to="/app" replace /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  useEffect(() => {
    initWallet();
  }, []);

  return (
    <Suspense fallback={<PageFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
