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

  // Calculate aggregates
  const totalPunches = filteredRecords.length;
  const onTimeCount = filteredRecords.filter((r) => r.status === 'on_time' || (r.status === 'completed' && !r.lateMinutes)).length;
  const lateCount = filteredRecords.filter((r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)).length;
  const punctualityRate = totalPunches > 0 ? Math.round((onTimeCount / totalPunches) * 100) : 100;

  const totalMinutesWorked = filteredRecords.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);
  const avgHoursPerShift = totalPunches > 0 ? (totalMinutesWorked / totalPunches / 60).toFixed(1) : '0';

  // Export report as Excel/CSV
  const handleExportCsv = () => {
    const headers = [
      'Report: Staff Attendance & Performance Summary',
      `Period: ${timeRange.toUpperCase()}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Staff Name,Staff ID,Department,Shift,Total Punches,On Time,Late Arrivals,Total Hours Worked',
    ];

    const staffRows = staffList.map((s) => {
      const sRecords = filteredRecords.filter((r) => r.staffId === s.id);
      const sPunches = sRecords.length;
      const sOnTime = sRecords.filter((r) => r.status === 'on_time' || (r.status === 'completed' && !r.lateMinutes)).length;
      const sLate = sRecords.filter((r) => r.status === 'late' || (r.lateMinutes && r.lateMinutes > 0)).length;
      const sMinutes = sRecords.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
      const sHours = (sMinutes / 60).toFixed(1);

      const deptName = departments.find((d) => d.id === s.departmentId)?.name || 'N/A';
      const shiftName = shifts.find((sh) => sh.id === s.shiftId)?.name || 'N/A';

      return `"${s.fullName}","${s.staffId}","${deptName}","${shiftName}",${sPunches},${sOnTime},${sLate},${sHours}`;
    });

    const csvContent = [...headers, ...staffRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${timeRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900">Attendance Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official audit timesheets and workforce punctuality summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
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
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs no-print">
        {/* Time range tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
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

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Shift Punches</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {totalPunches}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Logged attendance records</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Workforce Punctuality</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 tabular-nums">
            {punctualityRate}%
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1">{onTimeCount} on time, {lateCount} late</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Hours Recorded</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600 tabular-nums">
            {totalHoursWorked}h
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Across all filtered logs</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Avg Shift Duration</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {avgHoursPerShift}h
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Standard shift length</span>
        </div>
      </div>

      {/* Staff Attendance Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Individual Staff Attendance Performance</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {staffList.length} total staff profiles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-xs">
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
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.staffId}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {dept?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {shift?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-900">
                      {sPunches}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 font-medium">
                      {sOnTime}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-600 font-medium">
                      {sLate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
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
