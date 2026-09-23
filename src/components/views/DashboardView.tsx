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
            Real-time synchronization for employee shifts, QR clocking kiosks, and automated punctuality audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Open QR Scanner</span>
          </button>
          <button
            onClick={onOpenAddStaff}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors backdrop-blur-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* 5 Core Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Staff */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Staff</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {totalStaffCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {staff.length - totalStaffCount} inactive
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium text-slate-600">Present Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono tabular-nums">
            {presentTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            {attendanceRate}% of workforce
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium text-slate-600">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono tabular-nums">
            {lateTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Past grace threshold
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium text-slate-600">Absent Today</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 font-mono tabular-nums">
            {absentTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Unrecorded punches
          </div>
        </div>

        {/* Currently Clocked In */}
        <div className="col-span-2 lg:col-span-1 bg-linear-to-br from-indigo-50 to-white rounded-2xl p-4 sm:p-5 border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-medium text-indigo-900 font-semibold">Currently Clocked In</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-700 font-mono tabular-nums">
            {currentlyClockedInCount}
          </div>
          <div className="mt-1 text-[11px] text-indigo-600/80 font-medium">
            Active on premises
          </div>
        </div>
      </div>

      {/* Main Grid: Department & Shift Breakdown + Live Scan Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Department Breakdown & Shift Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Attendance by Department</h3>
              </div>
              <button
                onClick={() => onNavigate('departments')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
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
                const percentage = deptTotal > 0 ? Math.round((deptPresent / deptTotal) * 100) : 0;

                return (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="font-semibold text-slate-800">{dept.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({dept.code})</span>
                      </div>
                      <div className="text-slate-600 font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">{deptPresent}</span>
                        <span className="text-slate-400"> / {deptTotal}</span>
                        <span className="ml-2 font-medium text-slate-500">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: dept.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Breakdown */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Attendance by Shift</h3>
              </div>
              <button
                onClick={() => onNavigate('shifts')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
              >
                <span>View Rosters</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shifts.map((shift) => {
                const shiftStaff = activeStaff.filter((s) => s.shiftId === shift.id);
                const shiftTotal = shiftStaff.length;
                const shiftPresent = shiftStaff.filter((s) => presentStaffIds.has(s.id)).length;
                const shiftLate = shiftStaff.filter((s) => lateStaffIds.has(s.id)).length;

                return (
                  <div
                    key={shift.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{shift.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                      <span className="text-slate-500">Assigned: <strong className="text-slate-800 font-mono">{shiftTotal}</strong></span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-medium">In: {shiftPresent}</span>
                        {shiftLate > 0 && (
                          <span className="text-amber-700 font-medium">Late: {shiftLate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Recent Clock-in Stream & Punctuality Meter (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Workforce Punctuality Index Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Punctuality Index
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {punctualityRate}% On Time
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {punctualityRate}%
              </span>
              <span className="text-xs text-slate-500">of arrivals today met shift grace threshold</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${punctualityRate}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${100 - punctualityRate}%` }}
              />
            </div>
          </div>

          {/* Recent Scans Activity Feed */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Today's Live Punch Log</h3>
              </div>
              <button
                onClick={() => onNavigate('records')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
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
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isClockedOut
                              ? 'bg-slate-100 text-slate-600'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isClockedOut ? (
                            <LogOut className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {s?.fullName || 'Staff Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            {s?.staffId} · {isClockedOut ? 'Clocked Out' : rec.status === 'late' ? `Late (${rec.lateMinutes}m)` : 'Clocked In'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                          {clockTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isClockedOut ? (
                            <span>{rec.totalWorkMinutes ? `${Math.round(rec.totalWorkMinutes / 60)}h ${rec.totalWorkMinutes % 60}m` : 'Done'}</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">On premise</span>
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
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
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
