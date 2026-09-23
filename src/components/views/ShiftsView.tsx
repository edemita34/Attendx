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
        gracePeriodMinutes: Number(formData.gracePeriodMinutes) || 0,
        crossMidnight: formData.crossMidnight,
        description: formData.description.trim(),
      });
      setEditingShift(null);
    } else {
      storage.addShift({
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        gracePeriodMinutes: Number(formData.gracePeriodMinutes) || 0,
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
    if (shifts.length <= 1) {
      alert('At least one shift schedule must be maintained in the system.');
      return;
    }
    if (window.confirm(`Delete shift "${shift.name}"? Staff will need to be reassigned.`)) {
      storage.deleteShift(shift.id);
    }
  };

  const getShiftIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('night') || lower.includes('graveyard')) return Moon;
    if (lower.includes('afternoon') || lower.includes('evening')) return Sunset;
    return Sun;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shift Timetables & Rosters</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure working hours, midnight cross-overs, and late grace period thresholds.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
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
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{shift.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {shift.startTime} – {shift.endTime}
                        </span>
                        {shift.crossMidnight && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded font-sans font-medium">
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
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      title="Delete Shift"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {shift.description || 'Standard working roster with defined start and grace window.'}
                </p>

                {/* Grace Period & Timeliness Rules */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Grace period for clock-in:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    +{shift.gracePeriodMinutes} mins past start
                  </span>
                </div>

                {/* Real-time Today Status for Shift */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Present</span>
                    <span className="text-base font-bold text-emerald-800 dark:text-emerald-300 font-mono">{presentCount}</span>
                  </div>
                  <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Late</span>
                    <span className="text-base font-bold text-amber-800 dark:text-amber-300 font-mono">{lateCount}</span>
                  </div>
                  <div className="p-2.5 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block">Absent</span>
                    <span className="text-base font-bold text-rose-800 dark:text-rose-300 font-mono">{absentCount}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Assigned Staff Roster Preview */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{shiftStaff.length}</strong> staff assigned
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {Math.round((presentCount / Math.max(1, shiftStaff.length)) * 100)}% attendance
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Shift Modal */}
      {(isAddOpen || editingShift) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingShift(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Shift Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Morning Shift A"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Grace Period (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.gracePeriodMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.crossMidnight}
                      onChange={(e) => setFormData({ ...formData, crossMidnight: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                    />
                    <span>Crosses Midnight (Overnight)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Operational notes or roster coverage..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingShift(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  {editingShift ? 'Save Changes' : 'Create Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
