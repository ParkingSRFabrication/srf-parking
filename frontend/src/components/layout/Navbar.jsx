import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, Clock, MapPin, BookOpen, Smartphone, ShieldCheck, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { usePWAInstall } from '../../utils/usePWAInstall.js';
import './Navbar.css';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/10 shadow-glass no-print">
      {/* Left: Mobile menu toggle & station indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-cyan-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 lg:hidden focus:outline-none transition flex items-center justify-center min-w-[42px] min-h-[42px] touch-manipulation"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/90 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-200 border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
          <span className="font-bold text-white">SRF RAIL</span>
          <span className="text-slate-600">|</span>
          <span className="truncate max-w-[120px] sm:max-w-none text-slate-300">Central Station</span>
        </div>
      </div>

      {/* Right: Live time, manual shortcut, user info, logout */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Quick link to Landing Page / Manuals */}
        <Link
          to="/#manual"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition"
          title="Open Railway User Manuals"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Manuals</span>
        </Link>

        {/* Live Clock (IST) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formatDateTime(currentTime)}</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-900/80 border border-white/10 px-2.5 py-1 rounded-xl">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
              {user?.name || 'Operator'}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span className="font-mono">{user?.operatorId}</span>
              <span>•</span>
              <span className={`capitalize px-1 rounded text-[9px] font-bold ${
                isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
