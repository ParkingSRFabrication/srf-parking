import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  LogOut,
  BookOpen,
  Home
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1120] text-slate-100 border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <BrandLogo inverted={true} />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation scrollable body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Operations Section */}
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-3 mb-2 font-mono">
              Terminal Operations
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
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-glow'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Administration Section */}
          {isAdmin && (
            <div>
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-3 mb-2 font-mono">
                Railway Administration
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
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-glow'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-purple-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Quick Landing Page & Manual link */}
          <div className="pt-2 border-t border-white/5">
            <Link
              to="/#manual"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>User Manuals</span>
            </Link>
            <Link
              to="/"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Landing Page</span>
            </Link>
          </div>
        </div>

        {/* Footer info & Mobile Logout */}
        <div className="p-4 border-t border-white/10 text-center space-y-3">
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
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              SR FABRICATION RAILWAY OS
            </div>
            <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
              Production v2.0 • ISO Certified
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
