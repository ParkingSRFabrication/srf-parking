import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-50 text-[#142B4A] rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[#C9343A]" />
      </div>
      <h1 className="text-3xl font-black text-[#142B4A] tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-2 max-w-sm">
        The requested screen does not exist or you do not have permission to access it.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#142B4A] hover:bg-[#2457A7] text-white text-xs font-bold rounded-xl shadow-md transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
