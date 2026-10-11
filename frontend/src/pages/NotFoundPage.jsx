import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Compass, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.jsx';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="mb-6">
        <BrandLogo size="default" inverted={true} />
      </div>

      <div className="w-16 h-16 bg-indigo-500/15 border border-indigo-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
        <Compass className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black font-outfit text-white tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
        The requested screen does not exist on this station terminal or has moved.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/10 transition"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Landing Page & Manual</span>
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-glow transition"
        >
          <Home className="w-4 h-4" />
          <span>Open Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
