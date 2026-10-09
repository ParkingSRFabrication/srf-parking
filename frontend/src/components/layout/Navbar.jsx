import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shadow-sm no-print">
      {/* Left: Mobile hamburger & location indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-[#C9343A]" />
          <span>SRF-MAIN | Central Railway Station</span>
        </div>
      </div>

      {/* Right: Live time, operator info, logout */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Live Clock (IST) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-[#2457A7]" />
          <span>{formatDateTime(currentTime)}</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'Operator'}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <span className="font-mono">{user?.operatorId}</span>
              <span>•</span>
              <span className={`capitalize px-1 rounded text-[9px] font-bold ${
                isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
