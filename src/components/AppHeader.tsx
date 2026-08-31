import React, { useState, useRef, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { 
  Download, 
  LogOut, 
  Sparkles, 
  Cloud, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { User } from 'firebase/auth';

interface AppHeaderProps {
  user: User;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  onOpenExport: () => void;
  onOpenAdvisor: () => void;
  onLogout: () => void;
  urgentCount: number;
  isStandalone?: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onOpenExport,
  onOpenAdvisor,
  onLogout,
  urgentCount,
  isStandalone = false,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const userInitial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <header 
      className={`px-4 pb-3 ${
        isStandalone ? 'pt-[env(safe-area-inset-top,44px)]' : 'pt-3.5'
      } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0 z-30 shrink-0 transition-colors`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Clean Brand Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size="sm" />
          <h1 className="text-sm font-black text-zinc-950 dark:text-zinc-100 tracking-[0.25em] leading-none font-mono uppercase select-none">
            LEDGER
          </h1>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0" ref={menuRef}>
          {/* Quick Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title={isDarkMode ? 'Switch to Light mode' : 'Switch to Night mode'}
            aria-label="Toggle Night Mode"
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700" />
            )}
          </button>

          {/* User Profile Avatar / Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-zinc-800 dark:border-zinc-200 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
            title="Account & Settings"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </button>

          {/* User Account Popover Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100">
              {/* Account header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-full h-full rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {user.displayName || 'Active Account'}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                    {user.email}
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Menu items */}
              <div className="py-2 space-y-1.5">
                {/* Night Mode Toggle row in menu */}
                <div className="px-2 py-1 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>Night Mode</span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDarkMode ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={isDarkMode}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDarkMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdvisor();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Priority Advisor</span>
                  </div>
                  {urgentCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      {urgentCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenExport();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Backup & CSV Export</span>
                  </div>
                </button>
              </div>

              {/* Cloud Sync Status */}
              <div className="px-2 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mb-2">
                <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Firebase Cloud Synced</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
