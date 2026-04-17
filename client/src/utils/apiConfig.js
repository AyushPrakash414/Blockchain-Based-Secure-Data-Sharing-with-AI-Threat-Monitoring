// ! IMPORTANT: Replace this placeholder with your deployed Render URL once you deploy the backend.
// Example: const BACKEND_HOST = "https://datafort-backend.onrender.com";
const BACKEND_HOST = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://APP-BACKEND-URL.onrender.com';

export const API_BASE = BACKEND_HOST;
export const ANALYZE_URL = `${BACKEND_HOST}/analyze`;
export const LOG_URL = `${BACKEND_HOST}/log`;
export const ALERTS_URL = `${BACKEND_HOST}/alerts`;
export const TRIGGER_DEMO_URL = `${BACKEND_HOST}/trigger-demo`;
