import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { BottomNav } from './BottomNav.jsx';
import { usePWAInstall } from '../../utils/usePWAInstall.js';
import { Smartphone, Download, X } from 'lucide-react';
import './AppLayout.css';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);
  const { canInstall, isInstalled, install, isIOS } = usePWAInstall();

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Mobile PWA Install Floating Banner */}
      {!isInstalled && !dismissInstallBanner && (canInstall || isIOS) && (
        <div className="lg:hidden relative z-20 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 border-b border-indigo-500/30 px-3.5 py-2 flex items-center justify-between text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span className="text-white font-medium text-[11px]">
              Use as native mobile app for faster gate operation!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (canInstall) install();
                else alert('On iPhone: Tap Share -> Add to Home Screen');
              }}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] shadow-xs"
            >
              Install
            </button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Dedicated Mobile Bottom Bar */}
      <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
