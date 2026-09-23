import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building,
  Clock,
  Shield,
  Database,
  RotateCcw,
  Download,
  Upload,
  Save,
  Volume2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SystemSettings } from '../../types';

interface SettingsViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isAdmin, onOpenAdminLogin }) => {
  const [settings, setSettings] = useState<SystemSettings>(storage.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    storage.saveSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (!newPassword.trim()) {
      setPasswordNotice('Password cannot be empty.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice('Passwords do not match.');
      return;
    }

    const updated = { ...settings, adminPassword: newPassword.trim() };
    storage.saveSettings(updated);
    setSettings(updated);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordNotice('Admin password successfully updated!');
    setTimeout(() => setPasswordNotice(''), 3000);
  };

  const handleResetData = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm('Reset all system records to default sample demo data? Any custom staff will be reverted.')) {
      storage.resetToDemoData();
      alert('System successfully reset to default sample data.');
    }
  };

  const handleClearTodayLogs = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm("Clear all of today's attendance logs? Past days will remain.")) {
      storage.clearTodayAttendance();
      alert("Today's logs cleared.");
    }
  };

  const handleExportBackup = () => {
    const json = storage.exportAllDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StaffSync_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importAllDataJson(content);
        if (success) {
          alert('Database successfully restored from backup.');
          setSettings(storage.getSettings());
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">System Configuration & Policies</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage organization branding, attendance rules, admin security, and database backup.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* Organization Profile & Attendance Rules */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Organization & Branding</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={settings.organizationName}
              onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subtitle / Facility Division
            </label>
            <input
              type="text"
              value={settings.organizationSubtitle}
              onChange={(e) => setSettings({ ...settings, organizationSubtitle: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-100">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Kiosk & Punctuality Policies</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Default Late Grace Period (Minutes)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              required
              value={settings.defaultGracePeriodMinutes}
              onChange={(e) =>
                setSettings({ ...settings, defaultGracePeriodMinutes: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used when a specific shift does not override the grace threshold.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kiosk Auto-Reset Countdown (Seconds)
            </label>
            <input
              type="number"
              min={3}
              max={30}
              required
              value={settings.autoKioskResetSeconds}
              onChange={(e) =>
                setSettings({ ...settings, autoKioskResetSeconds: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Time the scanner displays confirmation before clearing for the next scan.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enable synthetic audio chime feedback on scan</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowSelfCheckOut}
              onChange={(e) => setSettings({ ...settings, allowSelfCheckOut: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow second shift re-clocking on same day</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Admin Security Password */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Admin Security Credentials</h3>
        </div>

        {passwordNotice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs">
            {passwordNotice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Admin Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Update Admin Password
          </button>
        </div>
      </form>

      {/* Database Backup & Maintenance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Database Storage & Disaster Recovery</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">JSON Backup & Restore</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export the entire relational database (staff, departments, shifts, attendance) as a single JSON file.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="json-backup-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
            <h4 className="text-xs font-bold text-rose-900">Maintenance & Reset</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clear current session logs or reset the system with clean default sample data.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearTodayLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Today's Logs</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
