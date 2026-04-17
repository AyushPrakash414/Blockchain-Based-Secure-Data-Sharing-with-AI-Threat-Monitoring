import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../utils/monitorApi';

const AlertsPanel = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadAlerts = async () => {
            const data = await fetchAlerts();
            if (!isMounted) return;
            if (Array.isArray(data)) {
                setAlerts(data);
            }
            setLoading(false);
        }
        
        setLoading(true);
        loadAlerts();
        const intervalId = setInterval(loadAlerts, 10000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        }
    }, []);

    // Helper map for colors
    const severityColors = {
        'low': { bg: 'theme-accent-soft', border: 'border-[var(--color-accent)]', text: 'theme-accent'},
        'medium': { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-400 dark:border-amber-500', text: 'text-amber-700 dark:text-amber-300'},
        'high': { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-400 dark:border-red-500', text: 'text-red-700 dark:text-red-300'},
        'critical': { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-500 dark:border-red-400 border-l-4', text: 'text-red-800 dark:text-red-300 font-bold'}
    };

    if (loading) return <div className="text-sm theme-text-muted animate-pulse">Analyzing threat vectors...</div>;

    return (
        <div className="theme-bg-surface p-4 rounded-xl border theme-border-subtle transition-colors duration-300">
            <h3 className="text-sm uppercase tracking-wider mb-4 theme-text-secondary font-semibold">Threat Alerts</h3>
            {alerts.length === 0 ? (
                <div className="p-4 theme-bg-inset rounded-lg text-center border theme-border-subtle transition-colors duration-300">
                    <p className="text-sm theme-text-muted">No active threats detected.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert, i) => {
                        const style = severityColors[alert.severity?.toLowerCase()] || severityColors['medium'];
                        return (
                            <div key={i} className={`p-3 ${style.bg} border-l-2 ${style.border} rounded-lg transition-colors duration-300`}>
                                <div className="flex justify-between">
                                    <p className={`text-xs uppercase tracking-widest ${style.text}`}>{alert.severity}</p>
                                    {alert.time && <p className="text-xs theme-text-faint">{new Date(alert.time).toLocaleTimeString()}</p>}
                                </div>
                                <p className="text-sm mt-1 theme-text">{alert.reason}</p>
                                {alert.recommended_action && (
                                    <p className="text-xs mt-2 theme-text-muted">Action: <span className="theme-text-secondary">{alert.recommended_action}</span></p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default AlertsPanel;
