import React from 'react';
import './StatusBadge.css';

export function StatusBadge({ status }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  switch (s) {
    case 'INSIDE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono shadow-xs">
          <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse" />
          INSIDE
        </span>
      );

    case 'EXITED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-white/10 font-mono">
          EXITED
        </span>
      );

    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
          CANCELLED
        </span>
      );

    case 'ACTIVE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
          ACTIVE
        </span>
      );

    case 'EXPIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
          EXPIRED
        </span>
      );

    case 'PAID':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
          PAID
        </span>
      );

    case 'EXEMPT_PASS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
          PASS COVERED
        </span>
      );

    case 'PENDING':
    case 'UNPAID':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
          UNPAID
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-white/10">
          {status}
        </span>
      );
  }
}
