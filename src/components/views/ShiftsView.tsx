import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  AlertCircle,
  Moon,
  Sun,
  Sunset,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Shift, Staff, AttendanceRecord } from '../../types';

interface ShiftsViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const ShiftsView: React.FC<ShiftsViewProps> = ({ isAdmin, onOpenAdminLogin }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    startTime: '08:00',
    endTime: '16:00',
    gracePeriodMinutes: 15,
    crossMidnight: false,
    description: '',
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setShifts(storage.getShifts());
    setStaff(storage.getStaff());
    setAttendance(storage.getAttendance());
  };

  useEffect(() => {
    loadData();
    return storage.subscribe(loadData);
  }, []);

  const handleOpenAdd = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      gracePeriodMinutes: 15,
      crossMidnight: false,
      description: '',
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      crossMidnight: !!shift.crossMidnight,
      description: shift.description,
    });
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Shift name is required.');
      return;
    }

    if (editingShift) {
      storage.updateShift(editingShift.id, {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        gracePeriodMinutes: Number(formData.gracePeriodMinutes),
        crossMidnight: formData.crossMidnight,
        description: formData.description.trim(),
      });
      setEditingShift(null);
    } else {
      storage.addShift({
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        gracePeriodMinutes: Number(formData.gracePeriodMinutes),
        crossMidnight: formData.crossMidnight,
        description: formData.description.trim(),
      });
      setIsAddOpen(false);
    }
  };

  const handleDelete = (shift: Shift) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    const result = storage.deleteShift(shift.id);
    if (!result.success) {
      alert(result.message || 'Cannot delete shift assigned to staff.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getShiftIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('night') || lower.includes('overnight')) return Moon;
    if (lower.includes('afternoon') || lower.includes('evening')) return Sunset;
    return Sun;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Workforce Shifts & Schedules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure working hours, automatic late arrival grace periods, and night shift rollovers.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shifts.map((shift) => {
          const shiftStaff = staff.filter((s) => s.shiftId === shift.id && s.status === 'active');
          const Icon = getShiftIcon(shift.name);

          // Today's attendance for this shift
          const shiftTodayLogs = attendance.filter(
            (r) => r.shiftId === shift.id && r.date === todayStr
          );
          const presentStaffIds = new Set(shiftTodayLogs.map((r) => r.staffId));
          const presentCount = presentStaffIds.size;
          const lateCount = shiftTodayLogs.filter((r) => r.status === 'late').length;
          const absentCount = Math.max(0, shiftStaff.length - presentCount);

          return (
            <div
              key={shift.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{shift.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">
                          {shift.startTime} – {shift.endTime}
                        </span>
                        {shift.crossMidnight && (
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-sans font-medium">
                            Overnight
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(shift)}
                      title="Edit Shift"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      title="Delete Shift"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {shift.description || 'Standard working roster with defined start and grace window.'}
                </p>

                {/* Grace Period & Timeliness Rules */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Grace period for clock-in:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    +{shift.gracePeriodMinutes} mins past start
                  </span>
                </div>

                {/* Real-time Today Status for Shift */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                    <span className="text-base font-bold text-emerald-800 font-mono">{presentCount}</span>
                  </div>
                  <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Late</span>
                    <span className="text-base font-bold text-amber-800 font-mono">{lateCount}</span>
                  </div>
                  <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Absent</span>
                    <span className="text-base font-bold text-rose-800 font-mono">{absentCount}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Assigned Staff Roster Preview */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-800 font-mono">{shiftStaff.length}</strong> staff assigned
                  </span>
                </div>

                {/* Mini staff avatar row */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  {shiftStaff.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      title={s.fullName}
                      className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[9px] font-bold text-slate-700 flex items-center justify-center shrink-0"
                    >
                      {s.fullName[0]}
                    </div>
                  ))}
                  {shiftStaff.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-white text-[9px] font-bold text-indigo-700 flex items-center justify-center shrink-0">
                      +{shiftStaff.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Shift Modal */}
      {(isAddOpen || editingShift) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingShift(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Shift Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Morning Shift"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  required
                  value={formData.gracePeriodMinutes}
                  onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Scans up to this many minutes past start time will still be considered "On Time".
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="crossMidnight"
                  checked={formData.crossMidnight}
                  onChange={(e) => setFormData({ ...formData, crossMidnight: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="crossMidnight" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Crosses Midnight (Overnight schedule)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes, break schedules, or designated roles..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingShift(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingShift ? 'Update Shift' : 'Create Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
