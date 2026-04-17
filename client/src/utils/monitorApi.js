import supabase from "./supabaseClient";

export const fetchLogs = async (wallet, limit = 50) => {
    try {
        let query = supabase
            .from('access_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
        
        if (wallet) {
            query = query.ilike('wallet_address', wallet);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Monitor tracking error:', error);
        return { error: 'monitor offline' };
    }
};

export const fetchAlerts = async () => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Alerts tracking error:', error);
        return { error: 'monitor offline' };
    }
};

export const subscribeToLogs = (wallet, callback) => {
    return supabase
        .channel('access_logs_changes')
        .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'access_logs',
                // Cannot filter effectively by ilike in realtime yet, so client-side filter
            },
            (payload) => {
                if (!wallet || payload.new.wallet_address?.toLowerCase() === wallet.toLowerCase()) {
                    callback(payload.new);
                }
            }
        )
        .subscribe();
};

export const subscribeToAlerts = (callback) => {
    return supabase
        .channel('alerts_changes')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'alerts' },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();
};
