import React, { useState, useEffect } from 'react';
import { Menu, Volume2, VolumeX, ShieldCheck, Lock, QrCode } from 'lucide-react';
import { NavTab } from './Navigation';
import { storage } from '../services/storage';

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
  staff: { title: 'Staff Directory', subtitle: 'Manage staff profiles, department assignments, and unique QR badges' },
  departments: { title: 'Departments', subtitle: 'Structure organizational units, leadership, and staff distribution' },
  shifts: { title: 'Shifts & Rosters', subtitle: 'Configure operational schedules, grace periods, and punctuality rules' },
  scanner: { title: 'QR Attendance Kiosk', subtitle: 'Instant camera-based clock-in / clock-out terminal' },
  records: { title: 'Attendance Records', subtitle: 'Detailed chronological logs, manual punch adjustments, and time sheets' },
  reports: { title: 'Reports & Analytics', subtitle: 'Comprehensive attendance rates, punctuality breakdowns, and CSV export' },
  settings: { title: 'System Settings', subtitle: 'Organization profile, late thresholds, audio alerts, and data management' },
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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print">
      {/* Left: Mobile hamburger & breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 leading-none mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Live Clock & Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-Time Live Clock with tabular figures */}
        <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="text-xs font-semibold text-slate-800 font-mono tabular-nums tracking-tight">
            {formattedTime}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {formattedDate}
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={settings.enableSound ? 'Mute scan audio alerts' : 'Enable scan audio alerts'}
          className={`p-2 rounded-xl border transition-colors ${
            settings.enableSound
              ? 'text-indigo-600 bg-indigo-50/60 border-indigo-200/60 hover:bg-indigo-100/60'
              : 'text-slate-400 bg-slate-100 border-slate-200 hover:text-slate-600'
          }`}
        >
          {settings.enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Kiosk Scanner Direct Switch (if not on scanner) */}
        {activeTab !== 'scanner' && (
          <button
            onClick={() => setActiveTab('scanner')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Kiosk Terminal</span>
          </button>
        )}

        {/* Admin Mode Badge & Button */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Active</span>
            </span>
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Lock
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
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
