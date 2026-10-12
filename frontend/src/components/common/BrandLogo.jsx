import React from 'react';

export function BrandLogo({ size = 'default', showSubtitle = true, inverted = false }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none min-w-0">
      {/* Brand Icon Mark */}
      <div className={`relative flex items-center justify-center rounded-2xl font-black shadow-lg transition-transform hover:scale-105 shrink-0 ${
        isLarge ? 'w-12 h-12 text-xl' : isSmall ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
      } bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white shadow-indigo-500/25`}>
        <span className="font-outfit font-black tracking-tight">SRF</span>
        {/* Live Status indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className={`font-outfit font-black tracking-tight leading-none truncate ${
          isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-lg'
        } ${inverted ? 'text-white' : 'text-slate-100'}`}>
          SR FABRICATION
        </div>
        {showSubtitle && (
          <div className={`font-mono uppercase tracking-wider leading-tight mt-1 ${
            isLarge ? 'text-[11px]' : 'text-[9px]'
          } text-cyan-400 font-semibold flex items-center gap-1 min-w-0 max-w-full overflow-hidden`}>
            <span className="truncate min-w-0">RAILWAY PARKING MANAGEMENT SYSTEM</span>
            <span className="text-slate-600 shrink-0">•</span>
            <span className="text-emerald-400 shrink-0 font-bold">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
