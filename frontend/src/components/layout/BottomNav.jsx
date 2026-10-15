import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  Ticket,
  CalendarCheck,
  Car,
  Receipt,
  Layers,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import './BottomNav.css';

export function BottomNav({ onOpenMenu }) {
  const { isAdmin, isOperator, isCustomer } = useAuth();

  let bottomNavItems = [];

  if (isCustomer) {
    bottomNavItems = [
      { to: '/customer/dashboard', label: 'Home', icon: LayoutDashboard },
      { to: '/customer/vehicles', label: 'Vehicles', icon: Car },
      { to: '/customer/passes', label: 'Passes', icon: CalendarCheck },
      { to: '/customer/history', label: 'Receipts', icon: Receipt }
    ];
  } else if (isAdmin) {
    bottomNavItems = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tariffs', label: 'Tariffs', icon: Layers },
      { to: '/operators', label: 'Operators', icon: Users },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/tokens', label: 'Tokens', icon: Ticket }
    ];
  } else {
    // Default / Operator
    bottomNavItems = [
      { to: '/operator/dashboard', label: 'Home', icon: LayoutDashboard },
      { to: '/entry', label: 'Entry', icon: ArrowDownRight },
      { to: '/exit', label: 'Exit', icon: ArrowUpRight },
      { to: '/tokens', label: 'Tokens', icon: Ticket },
      { to: '/passes', label: 'Passes', icon: CalendarCheck }
    ];
  }

  return (
    <nav
      className="whatsapp-bottom-bar fixed bottom-0 left-0 right-0 z-60 bg-[#0B1120]/95 backdrop-blur-xl border-t border-white/10 lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.5)] safe-bottom no-print"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whatsapp-nav-item flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 min-w-0 select-none active:scale-90 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`whatsapp-icon-pill px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 truncate transition-colors duration-200 ${
                      isActive
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
