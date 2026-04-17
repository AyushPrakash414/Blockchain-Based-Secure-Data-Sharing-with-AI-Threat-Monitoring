import React, { useEffect, useState } from 'react';
import { fetchLogs, subscribeToLogs } from '../../utils/monitorApi';

const ActivityFeed = ({ account }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const loadLogs = async () => {
            if (!account) {
                setLoading(false);
                return;
            }
            
            const data = await fetchLogs(account, 50);
            if (!isMounted) return;

            if (data.error === 'monitor offline') {
                setIsOffline(true);
            } else if (Array.isArray(data)) {
                setEvents(data);
                setIsOffline(false);
            }
            setLoading(false);
        };

        setLoading(true);
        loadLogs();
        
        // Supabase Real-time Subscription (Replaces polling)
        const subscription = subscribeToLogs(account, (newLog) => {
            if (isMounted) {
                setEvents(prev => [newLog, ...prev].slice(0, 50));
            }
        });

        return () => {
            isMounted = false;
            if (subscription) subscription.unsubscribe();
        }
    }, [account]);

    if (loading) return <div className="text-sm theme-text-muted animate-pulse">Scanning monitor logs...</div>;
    if (isOffline) return <div className="text-sm font-medium p-3 rounded-lg border transition-colors duration-300" style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)' }}>Monitor Offline - Metrics Hidden</div>;

    return (
        <div className="theme-bg-surface p-4 rounded-xl mt-4 border theme-border-subtle transition-colors duration-300">
            <h3 className="text-sm uppercase tracking-wider mb-4 theme-text-secondary font-semibold">Activity Feed</h3>
            <div className="relative border-l-2 ml-3 transition-colors duration-300" style={{ borderColor: 'var(--color-border)' }}>
                {events.length === 0 ? (
                    <p className="text-sm theme-text-muted pl-4">No recent activity detected on network.</p>
                ) : events.map((ev, i) => (
                    <div key={i} className="mb-4 pl-4 relative group">
                        <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1 ${ev.result?.toLowerCase() === 'success' ? 'bg-[var(--color-accent)]' : 'bg-yellow-500'}`} style={{ boxShadow: `0 0 8px var(--color-accent)` }}></div>
                        <p className="text-xs theme-text-faint mb-1">{new Date(ev.timestamp || new Date()).toLocaleTimeString()}</p>
                        <p className="text-sm theme-text font-medium">{ev.action}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
