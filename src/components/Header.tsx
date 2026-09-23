import React, { useState, useEffect } from 'react';
import { Menu, Volume2, VolumeX, ShieldCheck, Lock, QrCode, Sun, Moon } from 'lucide-react';
import { NavTab } from './Navigation';
import { storage } from '../services/storage';
import { getStoredTheme, setTheme, ThemeMode } from '../utils/theme';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenMobileNav: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Attendance Dashboard', subtitle: 'Live overview of workforce attendance, shifts, and daily metrics' },
  staff: { title: 'Staff Directory', subtitle: 'Manage staff profiles, department assignments, photos, and ID badges' },
  departments: { title: 'Departments', subtitle: 'Structure organizational units, leadership, and staff distribution' },
  shifts: { title: 'Shifts & Rosters', subtitle: 'Configure operational schedules, grace periods, and punctuality rules' },
  scanner: { title: 'Attendance Kiosk Terminal', subtitle: 'USB Barcode & Camera QR scanner for instant staff clock-in / clock-out' },
  records: { title: 'Attendance Records', subtitle: 'Detailed chronological logs, manual punch adjustments, and time sheets' },
  reports: { title: 'Reports & Analytics', subtitle: 'Comprehensive attendance rates, punctuality breakdowns, and CSV export' },
  settings: { title: 'System Settings', subtitle: 'Organization profile, theme preference, audio alerts, and database backup' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenMobileNav,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [settings, setSettings] = useState(storage.getSettings());
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const theme = getStoredTheme();
    setCurrentTheme(theme);

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      setCurrentTheme(customEvent.detail);
    };

    window.addEventListener('staffsync_theme_changed', onThemeChange);
    return () => window.removeEventListener('staffsync_theme_changed', onThemeChange);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
  }, []);

  const toggleSound = () => {
    const updated = { ...settings, enableSound: !settings.enableSound };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    setTheme(nextTheme);
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between no-print transition-colors">
      {/* Left: Mobile hamburger & breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Live Clock, Theme Toggle & Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-Time Live Clock with tabular figures */}
        <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums tracking-tight">
            {formattedTime}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {formattedDate}
          </div>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={handleToggleTheme}
          title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          aria-label="Toggle color theme"
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Audio Alerts Toggle */}
        <button
          onClick={toggleSound}
          title={settings.enableSound ? 'Mute scan audio alerts' : 'Enable scan audio alerts'}
          className={`p-2 rounded-xl border transition-colors ${
            settings.enableSound
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800 hover:bg-indigo-100/60'
              : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:text-slate-600'
          }`}
        >
          {settings.enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Kiosk Scanner Direct Switch (if not on scanner) */}
        {activeTab !== 'scanner' && (
          <button
            onClick={() => setActiveTab('scanner')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Kiosk Terminal</span>
          </button>
        )}

        {/* Admin Mode Badge & Button */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Active</span>
            </span>
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Lock
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl transition-colors shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Login</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
