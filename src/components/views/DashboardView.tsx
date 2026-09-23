import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  ClockAlert,
  UserX,
  Radio,
  QrCode,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Building,
  CalendarClock,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Department, Shift, Staff, AttendanceRecord } from '../../types';
import { NavTab } from '../Navigation';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddStaff: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenAddStaff }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const loadData = () => {
    setStaff(storage.getStaff());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
    setAttendance(storage.getAttendance());
  };

  useEffect(() => {
    loadData();
    return storage.subscribe(loadData);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeStaff = staff.filter((s) => s.status === 'active');
  const totalStaffCount = activeStaff.length;

  // Today's attendance logs
  const todayLogs = attendance.filter((r) => r.date === todayStr);

  // Present today: unique staff members who clocked in today
  const presentStaffIds = new Set(todayLogs.map((r) => r.staffId));
  const presentTodayCount = presentStaffIds.size;

  // Late today: unique staff who had status 'late' or lateMinutes > 0
  const lateStaffIds = new Set(
    todayLogs.filter((r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)).map((r) => r.staffId)
  );
  const lateTodayCount = lateStaffIds.size;

  // Currently Clocked In: records with clockIn set but NO clockOutTime yet
  const currentlyClockedInLogs = todayLogs.filter((r) => !r.clockOutTime);
  const currentlyClockedInCount = currentlyClockedInLogs.length;

  // Absent today: active staff who haven't clocked in yet
  const absentTodayCount = Math.max(0, totalStaffCount - presentTodayCount);

  // Attendance rate percentage
  const attendanceRate = totalStaffCount > 0 ? Math.round((presentTodayCount / totalStaffCount) * 100) : 0;
  const punctualityRate = presentTodayCount > 0 ? Math.round(((presentTodayCount - lateTodayCount) / presentTodayCount) * 100) : 100;

  // Recent 6 activity events today (sorted newest first)
  const recentEvents = [...todayLogs]
    .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Action Row */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Live Workforce System · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Daily Attendance Monitor
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time synchronization for employee shifts, USB Barcode & QR clocking terminals, and automated punctuality audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Attendance Kiosk</span>
          </button>
          <button
            onClick={onOpenAddStaff}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* Top 5 Key Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Staff */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Staff</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalStaffCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {staff.length - totalStaffCount} inactive
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Present Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {presentTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {attendanceRate}% of workforce
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {lateTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Past grace threshold
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Absent Today</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {absentTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Unrecorded punches
          </div>
        </div>

        {/* Currently Clocked In */}
        <div className="col-span-2 lg:col-span-1 bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 rounded-2xl p-4 sm:p-5 border border-indigo-200 dark:border-indigo-900 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-2">
            <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200 font-semibold">Currently Clocked In</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300 font-mono tabular-nums">
            {currentlyClockedInCount}
          </div>
          <div className="mt-1 text-[11px] text-indigo-600/80 dark:text-indigo-400 font-medium">
            Active on premises
          </div>
        </div>
      </div>

      {/* Main Grid: Department & Shift Breakdown + Live Scan Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Department Breakdown & Shift Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance by Department</h3>
              </div>
              <button
                onClick={() => onNavigate('departments')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {departments.map((dept) => {
                const deptStaff = activeStaff.filter((s) => s.departmentId === dept.id);
                const deptTotal = deptStaff.length;
                const deptPresent = deptStaff.filter((s) => presentStaffIds.has(s.id)).length;
                const pct = deptTotal > 0 ? Math.round((deptPresent / deptTotal) * 100) : 0;

                return (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span>{dept.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({dept.code})</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{deptPresent}</span> / {deptTotal} ({pct}%)
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: dept.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Schedule Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Shift Rosters</h3>
              </div>
              <button
                onClick={() => onNavigate('shifts')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                <span>View Shifts</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shifts.map((shift) => {
                const shiftStaff = activeStaff.filter((s) => s.shiftId === shift.id);
                const shiftPresent = shiftStaff.filter((s) => presentStaffIds.has(s.id)).length;

                return (
                  <div
                    key={shift.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{shift.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span>Assigned: {shiftStaff.length} staff</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono">{shiftPresent} present</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Punch Activity Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Attendance Punches</h3>
              </div>
              <button
                onClick={() => onNavigate('records')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                <span>All Logs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No attendance punches recorded yet today.
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((rec) => {
                  const s = staff.find((st) => st.id === rec.staffId);
                  const isClockedOut = !!rec.clockOutTime;
                  const clockTime = new Date(isClockedOut ? rec.clockOutTime! : rec.clockInTime).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Profile picture thumbnail or punch icon */}
                        {s?.avatarUrl ? (
                          <img
                            src={s.avatarUrl}
                            alt={s.fullName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isClockedOut
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                : rec.status === 'late'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {isClockedOut ? (
                              <LogOut className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {s?.fullName || 'Staff Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {s?.staffId} · {isClockedOut ? 'Clocked Out' : rec.status === 'late' ? `Late (${rec.lateMinutes}m)` : 'Clocked In'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {clockTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isClockedOut ? (
                            <span>{rec.totalWorkMinutes ? `${Math.round(rec.totalWorkMinutes / 60)}h ${rec.totalWorkMinutes % 60}m` : 'Done'}</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">On premise</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => onNavigate('scanner')}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Open Scanner Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
