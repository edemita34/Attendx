import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Building,
  CalendarClock,
  Users,
  CheckCircle2,
  ClockAlert,
  TrendingUp,
  User,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Staff, Department, Shift, AttendanceRecord } from '../../types';

export const ReportsView: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Filters
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');

  const settings = storage.getSettings();

  const loadData = () => {
    setRecords(storage.getAttendance());
    setStaffList(storage.getStaff());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    loadData();
    return storage.subscribe(loadData);
  }, []);

  // Filter records based on selected time range
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const filteredRecords = records.filter((r) => {
    if (selectedDept !== 'all' && r.departmentId !== selectedDept) return false;
    if (selectedShift !== 'all' && r.shiftId !== selectedShift) return false;

    if (timeRange === 'today') {
      return r.date === todayStr;
    }
    if (timeRange === 'week') {
      const recDate = new Date(r.date);
      const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7 && diffDays >= 0;
    }
    if (timeRange === 'month') {
      const recDate = new Date(r.date);
      const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30 && diffDays >= 0;
    }
    return true;
  });

  // Calculate metrics
  const totalPunches = filteredRecords.length;
  const onTimePunches = filteredRecords.filter(
    (r) => r.status === 'on_time' || (r.status === 'completed' && !r.lateMinutes)
  ).length;
  const latePunches = filteredRecords.filter(
    (r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)
  ).length;

  const totalWorkedMinutes = filteredRecords.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
  const totalWorkedHours = Math.round(totalWorkedMinutes / 60);

  const punctualityRate = totalPunches > 0 ? Math.round((onTimePunches / totalPunches) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows: string[] = [];
    csvRows.push('Staff ID,Staff Name,Department,Shift,Total Logged Punches,On Time Punches,Late Punches,Total Work Hours');

    staffList.forEach((s) => {
      const sRecords = filteredRecords.filter((r) => r.staffId === s.id);
      const sPunches = sRecords.length;
      const sOnTime = sRecords.filter((r) => r.status === 'on_time' || (r.status === 'completed' && !r.lateMinutes)).length;
      const sLate = sRecords.filter((r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)).length;
      const sMinutes = sRecords.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
      const sHours = (sMinutes / 60).toFixed(1);

      const dept = departments.find((d) => d.id === s.departmentId);
      const shift = shifts.find((sh) => sh.id === s.shiftId);

      csvRows.push(
        `"${s.staffId}","${s.fullName}","${dept?.name || ''}","${shift?.name || ''}",${sPunches},${sOnTime},${sLate},${sHours}`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Staff_Attendance_Summary_${timeRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Attendance Reports & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export official audit timesheets and workforce punctuality summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Download Excel/CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs no-print">
        {/* Time range tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'today' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6 border-b border-black pb-4">
        <h1 className="text-xl font-bold">{settings.organizationName || 'StaffSync'}</h1>
        <p className="text-sm text-slate-600">Workforce Attendance Audit & Timesheet Report</p>
        <div className="text-xs text-slate-500 mt-2 flex gap-4">
          <span>Reporting Period: {timeRange.toUpperCase()}</span>
          <span>Generated On: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Punches Logged</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{totalPunches}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Punctuality Score</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {punctualityRate}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Late Punches</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{latePunches}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Hours Tracked</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {totalWorkedHours} hrs
          </div>
        </div>
      </div>

      {/* Staff Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Staff Member Timesheet Summary
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4 text-center">Punches Logged</th>
                <th className="py-3 px-4 text-center">On Time</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {staffList.map((s) => {
                const sRecords = filteredRecords.filter((r) => r.staffId === s.id);
                const sPunches = sRecords.length;
                const sOnTime = sRecords.filter(
                  (r) => r.status === 'on_time' || (r.status === 'completed' && !r.lateMinutes)
                ).length;
                const sLate = sRecords.filter(
                  (r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)
                ).length;
                const sMinutes = sRecords.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
                const sHours = (sMinutes / 60).toFixed(1);

                const dept = departments.find((d) => d.id === s.departmentId);
                const shift = shifts.find((sh) => sh.id === s.shiftId);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {s.avatarUrl ? (
                          <img
                            src={s.avatarUrl}
                            alt={s.fullName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300 shrink-0">
                            {s.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {s.staffId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {dept?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {shift?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-900 dark:text-white">
                      {sPunches}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {sOnTime}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-600 dark:text-amber-400 font-medium">
                      {sLate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {sHours}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
