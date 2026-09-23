import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Calendar,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  User,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { AttendanceRecord, Staff, Department, Shift } from '../../types';

interface AttendanceRecordsViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  initialDeptFilter?: string;
}

export const AttendanceRecordsView: React.FC<AttendanceRecordsViewProps> = ({
  isAdmin,
  onOpenAdminLogin,
  initialDeptFilter,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState(initialDeptFilter || 'all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Form Data for manual punch / edit
  const [manualForm, setManualForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    clockInTime: '08:00',
    clockOutTime: '16:00',
    status: 'on_time' as AttendanceRecord['status'],
    notes: '',
  });

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

  useEffect(() => {
    if (initialDeptFilter) {
      setSelectedDept(initialDeptFilter);
    }
  }, [initialDeptFilter]);

  const handleOpenAddManual = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    const firstStaff = staffList[0];
    setManualForm({
      staffId: firstStaff?.id || '',
      date: new Date().toISOString().split('T')[0],
      clockInTime: '08:00',
      clockOutTime: '16:00',
      status: 'on_time',
      notes: 'Manual entry approved by Admin',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rec: AttendanceRecord) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setEditingRecord(rec);
    const inTime = new Date(rec.clockInTime).toTimeString().slice(0, 5);
    const outTime = rec.clockOutTime ? new Date(rec.clockOutTime).toTimeString().slice(0, 5) : '';

    setManualForm({
      staffId: rec.staffId,
      date: rec.date,
      clockInTime: inTime,
      clockOutTime: outTime,
      status: rec.status,
      notes: rec.notes || '',
    });
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.staffId) return;

    const inIso = `${manualForm.date}T${manualForm.clockInTime}:00.000Z`;
    const outIso = manualForm.clockOutTime ? `${manualForm.date}T${manualForm.clockOutTime}:00.000Z` : undefined;

    let totalMins = 0;
    if (outIso) {
      const inMs = new Date(inIso).getTime();
      const outMs = new Date(outIso).getTime();
      totalMins = Math.max(0, Math.round((outMs - inMs) / 60000));
    }

    if (editingRecord) {
      storage.updateAttendanceRecord(editingRecord.id, {
        date: manualForm.date,
        clockInTime: inIso,
        clockOutTime: outIso,
        status: manualForm.status,
        totalWorkMinutes: totalMins || undefined,
        notes: manualForm.notes,
      });
      setEditingRecord(null);
    } else {
      const staff = staffList.find((s) => s.id === manualForm.staffId);
      if (staff) {
        storage.addManualAttendance({
          staffId: staff.id,
          date: manualForm.date,
          clockInTime: manualForm.clockInTime,
          clockOutTime: manualForm.clockOutTime || undefined,
          status: manualForm.status,
          notes: manualForm.notes,
        });
      }
      setIsAddOpen(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      storage.deleteAttendanceRecord(id);
    }
  };

  // Quick CSV Export
  const handleExportCsv = () => {
    const csvRows: string[] = [];
    csvRows.push('Staff ID,Staff Name,Department,Shift,Date,Clock In,Clock Out,Duration (mins),Status,Notes');

    filteredRecords.forEach((r) => {
      const s = staffList.find((st) => st.id === r.staffId);
      const d = departments.find((dept) => dept.id === r.departmentId);
      const sh = shifts.find((shift) => shift.id === r.shiftId);

      const inTime = new Date(r.clockInTime).toLocaleTimeString();
      const outTime = r.clockOutTime ? new Date(r.clockOutTime).toLocaleTimeString() : 'Active';

      csvRows.push(
        `"${s?.staffId || ''}","${s?.fullName || ''}","${d?.name || ''}","${sh?.name || ''}","${r.date}","${inTime}","${outTime}","${r.totalWorkMinutes || 0}","${r.status}","${r.notes || ''}"`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter evaluation
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const filteredRecords = records.filter((r) => {
    const s = staffList.find((st) => st.id === r.staffId);
    const matchesSearch =
      !searchQuery ||
      s?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s?.staffId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || r.departmentId === selectedDept;
    const matchesShift = selectedShift === 'all' || r.shiftId === selectedShift;

    let matchesStatus = true;
    if (selectedStatus === 'active') matchesStatus = !r.clockOutTime;
    else if (selectedStatus === 'completed') matchesStatus = !!r.clockOutTime;
    else if (selectedStatus !== 'all') matchesStatus = r.status === selectedStatus;

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = r.date === todayStr;
    else if (dateFilter === 'yesterday') matchesDate = r.date === yesterdayStr;
    else if (dateFilter === 'custom') matchesDate = r.date === customDate;
    else if (dateFilter === 'week') {
      const pastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      matchesDate = r.date >= pastWeek;
    } else if (dateFilter === 'month') {
      const pastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      matchesDate = r.date >= pastMonth;
    }

    return matchesSearch && matchesDept && matchesShift && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Filters Top Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by staff name or staff ID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddManual}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {(['all', 'today', 'yesterday', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                dateFilter === period
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {period === 'week' ? 'Past 7 Days' : period === 'month' ? 'Past 30 Days' : period}
            </button>
          ))}

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-slate-400">Custom Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('custom');
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Dropdown Filters (Department, Shift, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Department Filter
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Shift Filter
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Attendance Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Records</option>
              <option value="active">Active (Currently Clocked In)</option>
              <option value="completed">Completed Shifts</option>
              <option value="on_time">On Time Arrivals</option>
              <option value="late">Late Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member & Photo</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Department & Shift</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Work Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No attendance records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const s = staffList.find((st) => st.id === record.staffId);
                  const d = departments.find((dept) => dept.id === record.departmentId);
                  const sh = shifts.find((shift) => shift.id === record.shiftId);

                  const inTime = new Date(record.clockInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const outTime = record.clockOutTime
                    ? new Date(record.clockOutTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null;

                  const isLate = record.status === 'late' || (record.lateMinutes && record.lateMinutes > 0);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Staff Name, Photo & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {s?.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt={s.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 uppercase shrink-0">
                              {s?.fullName ? s.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) : <User className="w-4 h-4" />}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{s?.fullName || 'Unknown Staff'}</div>
                            <div className="text-[11px] font-mono text-slate-400">{s?.staffId || record.staffId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {record.date}
                      </td>

                      {/* Department & Shift */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{d?.name || 'Department'}</div>
                        <div className="text-[11px] text-slate-400">{sh?.name || 'Shift'}</div>
                      </td>

                      {/* Clock In */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-slate-900 dark:text-white">{inTime}</div>
                        {isLate && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Late (+{record.lateMinutes || 0}m)
                          </div>
                        )}
                      </td>

                      {/* Clock Out */}
                      <td className="py-3.5 px-4 font-mono">
                        {outTime ? (
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{outTime}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Clocked In
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {record.totalWorkMinutes ? (
                          <span>
                            {Math.floor(record.totalWorkMinutes / 60)}h {record.totalWorkMinutes % 60}m
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isLate
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : !record.clockOutTime
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isLate ? 'Late' : !record.clockOutTime ? 'In Progress' : 'Completed'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            title="Edit Record / Fix Time"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Showing {filteredRecords.length} records</span>
          <span className="font-mono text-[11px]">Audit Compliant Timestamping</span>
        </div>
      </div>

      {/* Manual Punch / Edit Modal */}
      {(isAddOpen || editingRecord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {editingRecord ? 'Adjust Attendance Log' : 'Add Manual Attendance Entry'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingRecord(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Staff Member *
                </label>
                <select
                  disabled={!!editingRecord}
                  value={manualForm.staffId}
                  onChange={(e) => setManualForm({ ...manualForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.staffId} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Clock In Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={manualForm.clockInTime}
                    onChange={(e) => setManualForm({ ...manualForm, clockInTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.clockOutTime}
                    onChange={(e) => setManualForm({ ...manualForm, clockOutTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, status: e.target.value as AttendanceRecord['status'] })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="on_time">On Time</option>
                  <option value="late">Late Arrival</option>
                  <option value="completed">Completed Shift</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Administrative Note / Reason
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. Scanned via backup terminal or authorized manual punch"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
