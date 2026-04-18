import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, ShieldCheck, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.jsx';

const toastStyles = {
  critical: { icon: AlertTriangle, bg: 'bg-[var(--bg-danger)]', border: 'border-[var(--danger)]', text: 'text-[var(--danger)]' },
  high: { icon: AlertTriangle, bg: 'bg-[var(--bg-warning)]', border: 'border-[var(--warning)]', text: 'text-[var(--warning)]' },
  medium: { icon: Info, bg: 'bg-[var(--bg-success)]', border: 'border-[var(--info)]', text: 'text-[var(--info)]' },
  low: { icon: ShieldCheck, bg: 'bg-[var(--bg-success)]', border: 'border-[var(--success)]', text: 'text-[var(--success)]' },
};

export default function NotificationToast() {
  const { notifications } = useNotifications();
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    // Show the most recent notification if it's new
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only auto-show if created in the last 2 seconds
      if (Date.now() - latest.id < 2000) {
        setActiveToast(latest);
        const timer = setTimeout(() => setActiveToast(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  return (
    <div className="fixed top-24 right-6 z-50 pointer-events-none flex flex-col items-end gap-3 w-full max-w-sm">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto w-full rounded-2xl border p-4 shadow-lg surface ${toastStyles[activeToast.severity]?.border || 'border-base'}`}
          >
            <div className="flex gap-4">
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toastStyles[activeToast.severity]?.bg || 'accent-bg-strong'}`}>
                {(() => {
                  const Icon = toastStyles[activeToast.severity]?.icon || Info;
                  return <Icon className={`h-5 w-5 ${toastStyles[activeToast.severity]?.text || 'text-[var(--accent)]'}`} />;
                })()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-base-soft">
                    {activeToast.severity || 'System'} Alert
                  </p>
                  <button onClick={() => setActiveToast(null)} className="text-base-faint hover:text-base-strong transition-theme">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-base-strong leading-tight">
                  {activeToast.title || 'Security Anomaly Detected'}
                </h4>
                <p className="text-xs text-base-muted leading-relaxed">
                  {activeToast.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
