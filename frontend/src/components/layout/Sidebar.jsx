import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Ticket,
  CalendarCheck,
  Search,
  BarChart3,
  Layers,
  Users,
  Settings,
  ShieldAlert,
  X,
  LogOut
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicle Entry', path: '/entry', icon: ArrowDownRight },
    { label: 'Vehicle Exit', path: '/exit', icon: ArrowUpRight },
    { label: 'Issue Monthly Pass', path: '/monthly-pass', icon: CreditCard },
    { label: 'Token Records', path: '/tokens', icon: Ticket },
    { label: 'Monthly Passes', path: '/passes', icon: CalendarCheck },
    { label: 'Vehicle History', path: '/vehicles', icon: Search },
  ];

  const adminNavItems = [
    { label: 'Reports & Accounts', path: '/reports', icon: BarChart3 },
    { label: 'Tariff Management', path: '/tariffs', icon: Layers },
    { label: 'Booth Operators', path: '/operators', icon: Users },
    { label: 'System Settings', path: '/settings', icon: Settings },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#142B4A] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-900/50">
          <BrandLogo inverted={true} />
          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white rounded-lg lg:hidden hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Operations Section */}
          <div>
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest px-3 mb-2">
              Operations
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                        isActive
                          ? 'bg-[#2457A7] text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-blue-300" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Administration Section */}
          {isAdmin && (
            <div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest px-3 mb-2">
                Administration
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                          isActive
                            ? 'bg-[#2457A7] text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-300" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer info & Mobile Logout */}
        <div className="p-4 border-t border-blue-900/40 text-center space-y-3">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full lg:hidden flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
          <div>
            <div className="text-[10px] text-blue-300 font-medium">
              SR FABRICATION • RAILWAY STATION
            </div>
            <div className="text-[9px] text-blue-400/80 font-mono mt-0.5">
              Production v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
