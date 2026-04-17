import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../utils/monitorApi';
import { ShieldAlert, X } from 'lucide-react';

const AlertToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const checkNewAlerts = async () => {
      const data = await fetchAlerts();
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[0];
        const lastSeenTs = localStorage.getItem('lastSeenAlertTs');
        const currentUniq = latest.created_at || JSON.stringify(latest);
        if (lastSeenTs !== currentUniq) {
          setToast(latest);
          localStorage.setItem('lastSeenAlertTs', currentUniq);
          setTimeout(() => setToast(null), 8000);
        }
      }
    };

    const intervalId = setInterval(checkNewAlerts, 6000);
    return () => clearInterval(intervalId);
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 max-w-sm glass border-l-4 p-4 z-[9999] animate-fade-in" style={{ borderLeftColor: 'var(--color-danger)' }}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0" />
          <h4 className="text-primary font-semibold text-sm">Security Alert</h4>
        </div>
        <button onClick={() => setToast(null)} className="text-muted hover:text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-secondary mt-2">{toast.message || toast.reason}</p>
      {toast.recommended_action && (
        <p className="text-xs text-accent mt-2 font-medium">{toast.recommended_action}</p>
      )}
    </div>
  );
};

export default AlertToast;
