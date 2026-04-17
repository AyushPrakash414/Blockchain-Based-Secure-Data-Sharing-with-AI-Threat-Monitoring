import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FolderLock, Share2, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/vault', label: 'My Vault', icon: FolderLock },
  { to: '/share', label: 'Share Access', icon: Share2 },
  { to: '/threats', label: 'Threat Monitor', icon: ShieldAlert },
  { to: '/audit', label: 'Audit Logs', icon: FileText },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-secondary border-r border-theme z-40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-theme ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-lg">S</span>
          </div>
          {!collapsed && <span className="text-primary font-bold text-lg tracking-tight">Sentinel Drive</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-soft text-accent shadow-sm'
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-theme text-muted hover:text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-theme z-50 flex justify-around py-2 px-1">
        {navItems.slice(0, 5).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted hover:text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
