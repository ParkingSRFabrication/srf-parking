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
  Home,
  Car,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isOperator, isCustomer, logout, getDashboardPath } = useAuth();
  const { isDark } = useTheme();

  const customerNavItems = [
    { label: 'Customer Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My Registered Vehicles', path: '/customer/vehicles', icon: Car },
    { label: 'Monthly Commuter Passes', path: '/customer/passes', icon: CalendarCheck },
    { label: 'Parking History & Receipts', path: '/customer/history', icon: Receipt },
  ];

  const operatorNavItems = [
    { label: 'Operator Dashboard', path: '/operator/dashboard', icon: LayoutDashboard, isBottomNav: true },
    { label: 'Vehicle Entry', path: '/entry', icon: ArrowDownRight, isBottomNav: true },
    { label: 'Vehicle Exit', path: '/exit', icon: ArrowUpRight, isBottomNav: true },
    { label: 'Issue Monthly Pass', path: '/monthly-pass', icon: CreditCard, isBottomNav: false },
    { label: 'Token Records', path: '/tokens', icon: Ticket, isBottomNav: true },
    { label: 'Monthly Passes', path: '/passes', icon: CalendarCheck, isBottomNav: true },
    { label: 'Vehicle History', path: '/vehicles', icon: Search, isBottomNav: false },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Tariff & Pricing', path: '/tariffs', icon: Layers },
    { label: 'Booth Operators', path: '/operators', icon: Users },
    { label: 'System Settings', path: '/settings', icon: Settings },
    { label: 'Reports & Accounts', path: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
  ];

  const adminOperationsNavItems = [
    { label: 'Gate Entry', path: '/entry', icon: ArrowDownRight },
    { label: 'Gate Exit', path: '/exit', icon: ArrowUpRight },
    { label: 'Issue Pass', path: '/monthly-pass', icon: CreditCard },
    { label: 'Tokens Ledger', path: '/tokens', icon: Ticket },
    { label: 'Passes Ledger', path: '/passes', icon: CalendarCheck },
    { label: 'Vehicle Search', path: '/vehicles', icon: Search },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="mobile-sidebar-backdrop fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm lg:hidden no-print transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`mobile-sidebar-drawer fixed top-0 bottom-0 left-0 z-[80] w-72 max-w-[85vw] bg-white dark:bg-[#111B21] text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 drawer-open shadow-2xl' : '-translate-x-full drawer-closed'
        } no-print`}
        aria-label="Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 min-w-0">
          <Link to={getDashboardPath()} className="min-w-0 flex-1 overflow-hidden" onClick={() => { if (window.innerWidth < 1024) onClose(); }}>
            <BrandLogo inverted={isDark} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation scrollable body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">

          {/* 1. CUSTOMER PORTAL NAVIGATION */}
          {isCustomer && (
            <div>
              <div className="text-[10px] font-bold text-[#00A884] uppercase tracking-widest px-3 mb-2 font-mono flex items-center gap-1.5">
                <Car className="w-3 h-3 text-[#00A884]" />
                <span>Vehicle Owner Portal</span>
              </div>
              <nav className="space-y-1">
                {customerNavItems.map((item) => {
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
                            ? 'bg-[#00A884]/15 dark:bg-[#00A884]/25 text-[#00755B] dark:text-[#2DD4BF] font-bold border border-[#00A884]/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#00A884]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          {/* 2. OPERATOR TERMINAL NAVIGATION */}
          {isOperator && (
            <div>
              <div className="text-[10px] font-bold text-[#00A884] uppercase tracking-widest px-3 mb-2 font-mono flex items-center gap-1.5">
                <Ticket className="w-3 h-3 text-[#00A884]" />
                <span>Terminal Operations</span>
              </div>
              <nav className="space-y-1">
                {operatorNavItems.map((item) => {
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
                            ? 'bg-[#00A884]/15 dark:bg-[#00A884]/25 text-[#00755B] dark:text-[#2DD4BF] font-bold border border-[#00A884]/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#00A884]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          {/* 3. ADMINISTRATOR GOVERNANCE NAVIGATION */}
          {isAdmin && (
            <>
              <div>
                <div className="text-[10px] font-bold text-[#00A884] uppercase tracking-widest px-3 mb-2 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#00A884]" />
                  <span>Railway Administration</span>
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
                              ? 'bg-[#00A884]/15 dark:bg-[#00A884]/25 text-[#00755B] dark:text-[#2DD4BF] font-bold border border-[#00A884]/30'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#00A884]" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-3 mb-2 font-mono">
                  Station Gate Operations
                </div>
                <nav className="space-y-1">
                  {adminOperationsNavItems.map((item) => {
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
                              ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#00A884]" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </>
          )}

          {/* Quick Landing Page & Manual link */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
            <Link
              to="/#manual"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition"
            >
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <span>User Manuals</span>
            </Link>
            <Link
              to="/"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Home className="w-4 h-4 text-[#00A884]" />
              <span>Landing Page</span>
            </Link>
          </div>
        </div>

        {/* Arattai Light / Dark Theme Switcher in Sidebar (Requested) */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
            <span>Appearance</span>
            <span className="text-[9px] text-[#00A884] font-bold">Arattai OS</span>
          </div>
          <ThemeToggle variant="sidebar" />
        </div>

        {/* Footer info & Mobile Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 text-center space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full lg:hidden flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold transition border border-rose-500/30 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              SR FABRICATION RAILWAY OS
            </div>
            <div className="text-[9px] text-[#00A884] font-mono mt-0.5">
              Production v2.0 • ISO Certified
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
