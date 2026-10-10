import React from 'react';
import './BrandLogo.css';

export function BrandLogo({ size = 'default', showSubtitle = true, inverted = false }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Brand Icon Mark */}
      <div className={`relative flex items-center justify-center rounded-xl font-black shadow-md transition-transform hover:scale-105 ${
        isLarge ? 'w-12 h-12 text-2xl' : isSmall ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'
      } ${
        inverted ? 'bg-white text-[#142B4A]' : 'bg-[#142B4A] text-white border border-blue-900/40'
      }`}>
        <span className="tracking-tighter">SR</span>
        {/* Accent Red Dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C9343A] rounded-full border-2 border-white shadow-sm" />
      </div>

      {/* Brand Typography */}
      <div>
        <div className={`font-extrabold tracking-tight leading-none ${
          isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-lg'
        } ${inverted ? 'text-white' : 'text-[#142B4A]'}`}>
          SR FABRICATION
        </div>
        {showSubtitle && (
          <div className={`font-medium tracking-wide leading-tight mt-0.5 ${
            isLarge ? 'text-xs' : 'text-[10px]'
          } ${inverted ? 'text-blue-200' : 'text-slate-500'}`}>
            RAILWAY PARKING MANAGEMENT SYSTEM
          </div>
        )}
      </div>
    </div>
  );
}
