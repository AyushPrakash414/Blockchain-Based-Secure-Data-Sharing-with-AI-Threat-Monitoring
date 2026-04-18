import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Copy, RefreshCcw, Wallet } from 'lucide-react';

import { useWallet } from '../context/WalletContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { roleOptions } from '../data/product.js';
import { shortAddress } from '../lib/format.js';
import { StatusBadge } from '../ui/Primitives.jsx';

export default function Topbar({ account, role, setRole, isConnected }) {
  const { connectWallet, switchAccount, isConnecting, isSwitchingAccount, hasWallet } = useWallet();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="surface-strong sticky top-0 z-20 border-x-0 border-t-0 border-b border-base px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-left">
          <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Secure vault orchestration</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">DataFort AI</h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
          <StatusBadge tone={isConnected ? 'success' : 'warning'}>{isConnected ? 'Wallet connected' : 'Wallet idle'}</StatusBadge>

          <button
            type="button"
            onClick={markAllAsRead}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-base bg-[var(--bg-inset)] transition-theme hover:bg-[var(--border)]"
          >
            <Bell className="h-4 w-4 text-base-muted" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="tab-rail relative flex flex-wrap items-center justify-center gap-1 rounded-full p-1">
            {roleOptions.map(option => {
              const active = option.value === role;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold capitalize transition-theme ${active ? 'text-[var(--bg)]' : 'text-base-muted hover:text-base-strong'}`}
                >
                  {active ? (
                    <motion.span
                      layoutId="role-pill"
                      className="absolute inset-0 rounded-full bg-[var(--accent)] shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>

          {isConnected && account ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={copyAddress} className="flex items-center gap-2 rounded-full border border-base bg-[var(--bg-inset)] px-4 py-2 text-sm transition-theme hover:bg-[var(--border)]">
                <Wallet className="h-4 w-4 text-[var(--accent)]" />
                <span className="mono">{shortAddress(account)}</span>
                <Copy className={`h-4 w-4 ${copied ? 'text-[var(--accent)]' : 'text-base-soft'}`} />
              </button>
              <button
                type="button"
                onClick={() => switchAccount().catch(error => console.error('Account switch failed', error))}
                className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition-theme disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSwitchingAccount || isConnecting || !hasWallet}
              >
                <RefreshCcw className={`h-4 w-4 ${isSwitchingAccount ? 'animate-spin' : ''}`} />
                {isSwitchingAccount ? 'Switching...' : 'Switch Account'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => connectWallet().catch(error => console.error('Wallet connection failed', error))} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold transition-theme" disabled={isConnecting || !hasWallet}>
              {isConnecting ? 'Connecting...' : hasWallet ? 'Connect wallet' : 'Install MetaMask'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
