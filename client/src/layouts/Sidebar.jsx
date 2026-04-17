import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Sparkles } from 'lucide-react';

import { roleNavigation, roleOptions } from '../data/product.js';
import { shortAddress } from '../lib/format.js';

export default function Sidebar({ collapsed, onToggle, role, account }) {
  const items = roleNavigation[role] || roleNavigation.analyst;

  return (
    <>
      <aside className={`hidden lg:flex fixed left-0 top-0 z-30 h-screen flex-col border-r border-base surface-strong transition-theme ${collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'}`}>
        <div className={`flex h-20 items-center border-b border-base px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl hero-ribbon text-base-strong soft-ring">
            <Shield className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Secure Vault</p>
              <h1 className="text-xl font-serif text-base-strong leading-none mt-1">DataFort AI</h1>
            </div>
          ) : null}
        </div>

        <div className="border-b border-base p-4">
          {!collapsed ? (
            <div className="rounded-[22px] bg-[var(--bg-inset)] p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Operational role</p>
              <p className="mt-2 text-xl font-serif capitalize text-base-strong">{role}</p>
              <p className="mt-1 text-sm text-base-muted">{roleOptions.find(option => option.value === role)?.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-base-soft">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span>{account ? shortAddress(account) : 'Wallet disconnected'}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-bg-strong text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-theme ${isActive ? 'bg-[var(--bg-accent)] text-[var(--accent)]' : 'text-base-muted hover:bg-[rgba(148,163,184,0.08)] hover:text-base-strong'} ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggle}
          className="flex h-14 items-center justify-center border-t border-base text-base-soft transition-theme hover:bg-[rgba(148,163,184,0.08)] hover:text-base-strong"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-base surface-strong px-2 py-2 lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {items.slice(0, 4).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-theme ${isActive ? 'bg-[var(--bg-accent)] text-[var(--accent)]' : 'text-base-soft'}`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}