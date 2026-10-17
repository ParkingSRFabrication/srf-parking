import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, Clock, MapPin, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import './Navbar.css';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-white/90 dark:bg-[#0B141A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-xs dark:shadow-glass no-print transition-colors">
      {/* Left: Mobile menu toggle & station indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-[#00A884] dark:text-[#2DD4BF] hover:text-emerald-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 lg:hidden focus:outline-none transition flex items-center justify-center min-w-[42px] min-h-[42px] touch-manipulation"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white">SRF RAIL</span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="truncate max-w-[120px] sm:max-w-none text-slate-600 dark:text-slate-300">Central Station</span>
        </div>
      </div>

      {/* Right: Theme switch, live time, manual shortcut, user info, logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick link to Landing Page / Manuals */}
        <Link
          to="/#manual"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 transition"
          title="Open Railway User Manuals"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#00A884]" />
          <span>Manuals</span>
        </Link>

        {/* Live Clock (IST) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <Clock className="w-3.5 h-3.5 text-[#00A884]" />
          <span>{formatDateTime(currentTime)}</span>
        </div>

        {/* Quick Light / Dark Mode Toggle Button */}
        <ThemeToggle variant="icon" />

        {/* User Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-xl">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#00A884] to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
              {user?.name || 'Operator'}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-mono">{user?.operatorId}</span>
              <span>•</span>
              <span className={`capitalize px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isAdmin
                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                  : (user?.role === 'customer' || user?.role === 'commuter')
                  ? 'bg-emerald-500/15 text-[#00755B] dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              }`}>
                {isAdmin ? 'Admin' : (user?.role === 'customer' || user?.role === 'commuter') ? 'Vehicle User' : 'Operator'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition border border-rose-300 dark:border-rose-500/20 active:scale-95"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
