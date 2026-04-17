export const fetchLogs = async (wallet, limit = 50) => {
    try {
        const response = await fetch(`http://localhost:8000/logs?wallet=${wallet}&limit=${limit}`);
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.error('Monitor tracking error:', error);
        return { error: 'monitor offline' };
    }
};

export const fetchAlerts = async () => {
    try {
        const response = await fetch(`http://localhost:8000/alerts`);
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.error('Alerts tracking error:', error);
        return { error: 'monitor offline' };
    }
};
