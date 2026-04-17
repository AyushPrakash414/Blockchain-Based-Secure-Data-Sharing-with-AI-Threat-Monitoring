import React from 'react';
import ActivityFeed from './ActivityFeed';
import AlertsPanel from './AlertsPanel';

const SecurityConsole = ({ account }) => {
    return (
        <div className="theme-text h-full font-['Inter'] relative overflow-hidden transition-colors duration-300">
            
            <div className="mb-5 p-4 rounded-xl theme-bg-surface border theme-border-subtle relative overflow-hidden group hover:border-[var(--color-accent)] transition-all duration-300">
                <h3 className="text-[10px] sm:text-xs uppercase tracking-widest mb-3 theme-text-muted font-semibold">System Diagnostics</h3>
                <div className="flex flex-col gap-3 relative z-10">
                    <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)]/40 to-transparent"></div>
                    
                    <div className="flex justify-between items-center theme-bg-inset p-2.5 rounded-lg transition-colors duration-300">
                        <span className="text-xs theme-text-secondary">Wallet Key</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-wider ${account ? 'theme-accent-soft theme-accent border-l-2' : 'theme-bg-surface theme-text-muted'}`} style={account ? { borderColor: 'var(--color-accent)' } : {}}>
                            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'DISCONNECTED'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center theme-bg-inset p-2.5 rounded-lg transition-colors duration-300">
                        <span className="text-xs theme-text-secondary">Tunnel</span>
                        <span className="px-2 py-1 rounded text-[10px] font-mono tracking-wider theme-accent-soft theme-accent border-l-2" style={{ borderColor: 'var(--color-accent)' }}>Ethereum (Sepolia)</span>
                    </div>
                </div>
            </div>

            <ActivityFeed account={account} />
            <div className="my-5 border-b border-dashed theme-border-subtle"></div>
            <AlertsPanel />
        </div>
    );
};

export default SecurityConsole;
