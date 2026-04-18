import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Copy, Wallet, CheckCheck, Trash2, Clock, AlertTriangle } from 'lucide-react';

import { useWallet } from '../context/WalletContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { roleOptions } from '../data/product.js';
import { formatDateTime, shortAddress } from '../lib/format.js';
import { StatusBadge } from '../ui/Primitives.jsx';

export default function Topbar({ account, role, setRole, isConnected }) {
  const { connectWallet, isConnecting, hasWallet } = useWallet();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) markAllAsRead();
  };

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

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-theme ${showNotifications ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-base bg-[var(--bg-inset)] hover:bg-[var(--border)] text-base-muted'}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white ring-2 ring-[var(--bg)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-base bg-[var(--bg)] shadow-xl z-50 overflow-hidden"
                >
                  <div className="border-b border-base bg-[var(--bg-inset)] p-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-base-strong">Notifications</h3>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} title="Mark all as read" className="p-1.5 hover:bg-white/50 rounded-md transition-colors text-base-soft hover:text-[var(--accent)]">
                        <CheckCheck className="h-4 w-4" />
                      </button>
                      <button onClick={clearNotifications} title="Clear all" className="p-1.5 hover:bg-white/50 rounded-md transition-colors text-base-soft hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bell className="h-8 w-8 mx-auto mb-3 text-base-faint" />
                        <p className="text-sm text-base-muted font-medium">No alerts yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-base">
                        {notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 transition-colors hover:bg-[var(--bg-inset)] ${!notif.read ? 'bg-[var(--accent-strong)]/5' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.severity === 'critical' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C05C39]">
                                    {notif.severity || 'Info'}
                                  </p>
                                  <span className="flex items-center gap-1 text-[10px] text-base-faint">
                                    <Clock className="h-3 w-3" />
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <h4 className={`text-sm font-bold leading-tight ${!notif.read ? 'text-base-strong' : 'text-base-muted'}`}>
                                  {notif.title}
                                </h4>
                                <p className="text-xs text-base-soft leading-relaxed line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
