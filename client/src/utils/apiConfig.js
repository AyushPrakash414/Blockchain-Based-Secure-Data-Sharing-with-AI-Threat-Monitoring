const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

const BACKEND_HOST = configuredApiBase
  ? configuredApiBase.replace(/\/+$/, '')
  : window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://blockchain-based-secure-data-sharing.onrender.com';

export const API_BASE = BACKEND_HOST;
export const ANALYZE_URL = `${BACKEND_HOST}/analyze`;
export const LOG_URL = `${BACKEND_HOST}/log`;
export const ALERTS_URL = `${BACKEND_HOST}/alerts`;
export const TRIGGER_DEMO_URL = `${BACKEND_HOST}/trigger-demo`;
