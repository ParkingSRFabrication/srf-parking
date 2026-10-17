import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Arattai-Style Light / Dark Theme Switcher
 * Variants: 'icon' (compact for navbar/header), 'sidebar' (full width pill for sidebar), 'settings' (card selectors)
 */
export function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <div className={`p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-1 select-none transition-colors ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
            !isDark
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Switch to Light (White) Mode"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
            isDark
              ? 'bg-[#111B21] text-emerald-400 shadow-sm border border-white/10'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${className}`}>
        {/* Light Option Card */}
        <div
          onClick={() => setTheme('light')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
            !isDark
              ? 'border-[#00A884] bg-emerald-500/10 shadow-sm'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Light Theme (White Mode)
              </span>
              {!isDark && (
                <span className="w-2 h-2 rounded-full bg-[#00A884] shadow-[0_0_8px_#00A884]" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Crisp white surfaces, high readability, soft neutral slate contrast
            </p>
          </div>
        </div>

        {/* Dark Option Card */}
        <div
          onClick={() => setTheme('dark')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
            isDark
              ? 'border-[#00A884] bg-[#00A884]/10 shadow-sm'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Dark Theme (Arattai Slate)
              </span>
              {isDark && (
                <span className="w-2 h-2 rounded-full bg-[#00A884] shadow-[0_0_8px_#00A884]" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Deep slate-navy background, comfortable low-glare night operation
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default compact icon variant (Navbar / Header)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 transition-all active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px] ${className}`}
      title={isDark ? 'Switch to Light (White) Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </button>
  );
}
