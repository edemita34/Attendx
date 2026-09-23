import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarClock,
  QrCode,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  X,
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'staff'
  | 'departments'
  | 'shifts'
  | 'scanner'
  | 'records'
  | 'reports'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staff' as NavTab, label: 'Staff Directory', icon: Users },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'shifts' as NavTab, label: 'Shifts & Rosters', icon: CalendarClock },
    {
      id: 'scanner' as NavTab,
      label: 'Scan QR / Attendance',
      icon: QrCode,
      highlight: true,
    },
    { id: 'records' as NavTab, label: 'Attendance Records', icon: ClipboardList },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">StaffSync</h1>
              <p className="text-[11px] text-slate-400 font-medium">Attendance & HR Hub</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Kiosk Callout Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => handleSelect('scanner')}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-xs ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'scanner' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Admin status footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Shield className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  {isAdmin ? 'Admin Mode' : 'Kiosk / Staff Mode'}
                </span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  isAdmin ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              {isAdmin
                ? 'Full administrative control over staff records, shifts, and settings.'
                : 'Limited access mode for staff clock-in/out attendance.'}
            </p>

            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Admin Mode
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                Admin Unlock
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
