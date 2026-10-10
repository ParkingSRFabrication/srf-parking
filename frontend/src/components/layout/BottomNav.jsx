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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom no-print"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[54px] ${
              isActive
                ? 'text-[#2457A7] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
            </>
          )}
        </NavLink>

        {/* Fast Entry (Elevated/Highlighted) */}
        <NavLink
          to="/entry"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[54px] ${
              isActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Entry</span>
            </>
          )}
        </NavLink>

        {/* Fast Exit (Elevated/Highlighted) */}
        <NavLink
          to="/exit"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[54px] ${
              isActive
                ? 'text-[#2457A7] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg ${
                  isActive
                    ? 'bg-blue-100 text-[#2457A7] shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Exit</span>
            </>
          )}
        </NavLink>

        {/* Passes */}
        <NavLink
          to="/passes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[54px] ${
              isActive
                ? 'text-purple-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-purple-50' : ''}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Passes</span>
            </>
          )}
        </NavLink>

        {/* More / Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition min-w-[54px]"
          aria-label="Open More Menu"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
