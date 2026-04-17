import React from 'react';
import { Sun, Moon, Bell, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Topbar({ account }) {
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-secondary/80 backdrop-blur-xl border-b border-theme flex items-center justify-between px-4 lg:px-8">
      {/* Page context — left side on mobile */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-black font-bold text-sm">S</span>
        </div>
        <span className="text-primary font-bold text-base">Sentinel</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Wallet chip */}
        {account ? (
          <button
            onClick={copyAddress}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-soft border border-theme text-sm font-mono transition-all hover:shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-accent text-xs">{account.slice(0, 6)}...{account.slice(-4)}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger-soft border border-theme text-xs font-medium text-danger">
            <div className="w-2 h-2 rounded-full bg-danger" />
            No Wallet
          </div>
        )}

        {/* Network badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-tertiary text-xs font-medium text-secondary">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          Sepolia
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-tertiary border border-theme text-muted hover:text-primary transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Bell */}
        <button className="relative p-2 rounded-lg bg-tertiary border border-theme text-muted hover:text-primary transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>
      </div>
    </header>
  );
}
