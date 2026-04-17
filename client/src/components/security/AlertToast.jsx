import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../utils/monitorApi';

const AlertToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const checkNewAlerts = async () => {
            const data = await fetchAlerts();
            if (Array.isArray(data) && data.length > 0) {
                // Get the most recent one (assuming last element or order logic)
                const latest = data[data.length - 1]; 
                const lastSeenTs = localStorage.getItem('lastSeenAlertTs');
                
                // Use alert time or stringified object to check if new
                const currentUniq = latest.time || JSON.stringify(latest);
                
                if (lastSeenTs !== currentUniq) {
                    setToast(latest);
                    localStorage.setItem('lastSeenAlertTs', currentUniq);
                    // auto hide toast
                    setTimeout(() => setToast(null), 8000);
                }
            }
        };

        const intervalId = setInterval(checkNewAlerts, 6000);
        return () => clearInterval(intervalId);
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-[#93000a] border border-[#ffb4ab] rounded-lg shadow-[0_0_20px_rgba(255,180,171,0.2)] p-4 z-[9999] animate-bounce">
            <div className="flex justify-between items-start">
                <h4 className="text-[#ffdad6] font-bold text-sm">NEW SECURITY THREAT</h4>
                <button onClick={() => setToast(null)} className="text-[#ffb4ab] hover:text-white">&times;</button>
            </div>
            <p className="text-xs text-[#ffb4ab] mt-2">{toast.reason}</p>
            {toast.recommended_action && (
                <button className="mt-3 w-full bg-[#690005] hover:bg-[#410003] text-[#ffdad6] text-xs py-2 px-3 rounded transition-colors">
                    {toast.recommended_action}
                </button>
            )}
        </div>
    );
};

export default AlertToast;
