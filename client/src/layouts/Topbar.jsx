import { useState } from 'react';
import { Moon, Sun, Copy, Wallet, Shield, ChevronDown } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/ethers5/react';

import { roleOptions } from '../data/product.js';
import { shortAddress } from '../lib/format.js';
import { StatusBadge } from '../ui/Primitives.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Topbar({ account, role, setRole, isConnected }) {
  const { open } = useWeb3Modal();
  const { isDark, toggleTheme } = useTheme();
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
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Secure vault orchestration</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">DataFort AI</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={isConnected ? 'success' : 'warning'}>{isConnected ? 'Wallet connected' : 'Wallet idle'}</StatusBadge>

          <label className="flex items-center gap-2 rounded-full border border-base bg-[var(--bg-inset)] px-3 py-2 text-sm text-base-muted font-sans">
            <Shield className="h-4 w-4 text-[var(--accent)]" />
            <select value={role} onChange={event => setRole(event.target.value)} className="bg-transparent outline-none cursor-pointer">
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4" />
          </label>

          {isConnected && account ? (
            <>
              <button type="button" onClick={copyAddress} className="flex items-center gap-2 rounded-full border border-base bg-[var(--bg-inset)] px-4 py-2 text-sm transition-theme hover:bg-[var(--border)]">
                <Wallet className="h-4 w-4 text-[var(--accent)]" />
                <span className="mono">{shortAddress(account)}</span>
                <Copy className={`h-4 w-4 ${copied ? 'text-[var(--accent)]' : 'text-base-soft'}`} />
              </button>
              <StatusBadge tone="info">Sepolia</StatusBadge>
            </>
          ) : (
            <button type="button" onClick={() => open()} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-theme hover:opacity-90">
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}