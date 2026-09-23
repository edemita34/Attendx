import React, { useState } from 'react';
import { Lock, ShieldCheck, X, KeyRound } from 'lucide-react';
import { storage } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const settings = storage.getSettings();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === settings.adminPassword) {
      storage.setAdminAuthenticated(true);
      setError('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('Incorrect admin password. Please try again.');
    }
  };

  const handleFillDemo = () => {
    setPassword(settings.adminPassword || 'admin');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Admin Authentication</h2>
              <p className="text-xs text-slate-500">Enter system credentials to unlock admin privileges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-2.5 pl-10 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-medium text-slate-700">Demo Admin Pass: </span>
              <code className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-indigo-600">
                {settings.adminPassword || 'admin'}
              </code>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Autofill
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
