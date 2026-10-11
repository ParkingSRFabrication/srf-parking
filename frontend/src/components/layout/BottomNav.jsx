import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Menu
} from 'lucide-react';
import './BottomNav.css';

export function BottomNav({ onOpenMenu }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-xl border-t border-white/10 lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.5)] safe-bottom no-print"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-600/20 text-cyan-400' : ''}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-medium">Home</span>
            </>
          )}
        </NavLink>

        {/* Fast Entry (Elevated/Highlighted Button) */}
        <NavLink
          to="/entry"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[58px] -mt-3.5 ${
              isActive
                ? 'text-emerald-300 font-bold'
                : 'text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-2.5 rounded-2xl shadow-glowEmerald transition transform active:scale-90 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-bold text-emerald-400">Entry</span>
            </>
          )}
        </NavLink>

        {/* Fast Exit */}
        <NavLink
          to="/exit"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
              isActive
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-medium">Exit</span>
            </>
          )}
        </NavLink>

        {/* Passes */}
        <NavLink
          to="/passes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
              isActive
                ? 'text-purple-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-purple-600/20 text-purple-400' : ''}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-medium">Passes</span>
            </>
          )}
        </NavLink>

        {/* More / Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition min-w-[56px]"
          aria-label="Open More Menu"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
