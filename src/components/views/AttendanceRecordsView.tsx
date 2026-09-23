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

    if (editingRecord) {
      const inDate = new Date(`${manualForm.date}T${manualForm.clockInTime}:00`);
      let outIso: string | null = null;
      let duration: number | undefined;

      if (manualForm.clockOutTime) {
        const outDate = new Date(`${manualForm.date}T${manualForm.clockOutTime}:00`);
        outIso = outDate.toISOString();
        duration = Math.max(0, Math.round((outDate.getTime() - inDate.getTime()) / 60000));
      }

      storage.updateAttendanceRecord(editingRecord.id, {
        date: manualForm.date,
        clockInTime: inDate.toISOString(),
        clockOutTime: outIso,
        status: manualForm.status,
        totalWorkMinutes: duration,
        notes: manualForm.notes,
      });
      setEditingRecord(null);
    } else {
      storage.addManualAttendance({
        staffId: manualForm.staffId,
        date: manualForm.date,
        clockInTime: manualForm.clockInTime,
        clockOutTime: manualForm.clockOutTime || undefined,
        status: manualForm.status,
        notes: manualForm.notes,
      });
      setIsAddOpen(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm('Delete this attendance record entry?')) {
      storage.deleteAttendanceRecord(id);
    }
  };

  // Date Filtering Logic
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const filteredRecords = records.filter((rec) => {
    // 1. Date Filter
    if (dateFilter === 'today' && rec.date !== todayStr) return false;
    if (dateFilter === 'yesterday' && rec.date !== yesterdayStr) return false;
    if (dateFilter === 'custom' && rec.date !== customDate) return false;
    if (dateFilter === 'week') {
      const recDate = new Date(rec.date);
      const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7 || diffDays < 0) return false;
    }
    if (dateFilter === 'month') {
      const recDate = new Date(rec.date);
      const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 30 || diffDays < 0) return false;
    }

    // 2. Department Filter
    if (selectedDept !== 'all' && rec.departmentId !== selectedDept) return false;

    // 3. Shift Filter
    if (selectedShift !== 'all' && rec.shiftId !== selectedShift) return false;

    // 4. Status Filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active' && !!rec.clockOutTime) return false;
      if (selectedStatus === 'completed' && !rec.clockOutTime) return false;
      if (selectedStatus === 'late' && rec.status !== 'late') return false;
      if (selectedStatus === 'on_time' && rec.status !== 'on_time') return false;
    }

    // 5. Search Filter
    if (searchQuery.trim()) {
      const staff = staffList.find((s) => s.id === rec.staffId);
      const query = searchQuery.toLowerCase();
      const matchName = staff?.fullName.toLowerCase().includes(query);
      const matchId = staff?.staffId.toLowerCase().includes(query);
      if (!matchName && !matchId) return false;
    }

    return true;
  });

  // Export to CSV Function
  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert('No records available to export with the current filter selection.');
      return;
    }

    const headers = [
      'Record ID',
      'Date',
      'Staff Name',
      'Staff ID',
      'Department',
      'Shift',
      'Clock In Time',
      'Clock Out Time',
      'Duration (Minutes)',
      'Status',
      'Late Minutes',
      'Verified By',
      'Notes',
    ];

    const rows = filteredRecords.map((r) => {
      const s = staffList.find((st) => st.id === r.staffId);
      const d = departments.find((dept) => dept.id === r.departmentId);
      const sh = shifts.find((shift) => shift.id === r.shiftId);

      const inTime = new Date(r.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const outTime = r.clockOutTime
        ? new Date(r.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Still Clocked In';

      return [
        `"${r.id}"`,
        `"${r.date}"`,
        `"${s?.fullName || 'N/A'}"`,
        `"${s?.staffId || 'N/A'}"`,
        `"${d?.name || 'N/A'}"`,
        `"${sh?.name || 'N/A'}"`,
        `"${inTime}"`,
        `"${outTime}"`,
        r.totalWorkMinutes ?? 'N/A',
        `"${r.status}"`,
        r.lateMinutes ?? 0,
        `"${r.verifiedBy}"`,
        `"${r.notes || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `StaffSync_Attendance_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner, Filter Controls & Export */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by staff name or EMP ID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddManual}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Punch</span>
            </button>
          </div>
        </div>

        {/* Date Presets Segmented Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Time Range:
          </span>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              dateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              dateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              dateFilter === 'yesterday' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              dateFilter === 'week' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              dateFilter === 'month' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past 30 Days
          </button>

          {/* Custom Date Input */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-slate-400">Custom Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('custom');
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Dropdown Filters (Department, Shift, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department Filter
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700"
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Shift Filter
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700"
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Attendance Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Department & Shift</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Work Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
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
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Staff Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{s?.fullName || 'Unknown Staff'}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s?.staffId || record.staffId}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {record.date}
                      </td>

                      {/* Department & Shift */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{d?.name || 'Department'}</div>
                        <div className="text-[11px] text-slate-400">{sh?.name || 'Shift'}</div>
                      </td>

                      {/* Clock In */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-slate-900">{inTime}</div>
                        {isLate ? (
                          <span className="text-[10px] text-amber-600 font-medium">
                            Late ({record.lateMinutes || 0}m)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">On time</span>
                        )}
                      </td>

                      {/* Clock Out */}
                      <td className="py-3.5 px-4">
                        {outTime ? (
                          <div className="font-mono font-medium text-slate-900">{outTime}</div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            Clocked In
                          </span>
                        )}
                      </td>

                      {/* Total Duration */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {record.totalWorkMinutes ? (
                          <span>
                            {Math.floor(record.totalWorkMinutes / 60)}h {record.totalWorkMinutes % 60}m
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">— In progress —</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isLate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : !record.clockOutTime
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredRecords.length} records</span>
          <span className="font-mono text-[11px]">Audit Compliant Timestamping</span>
        </div>
      </div>

      {/* Manual Punch / Edit Modal */}
      {(isAddOpen || editingRecord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingRecord ? 'Adjust Attendance Log' : 'Add Manual Attendance Entry'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingRecord(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Staff Member *
                </label>
                <select
                  disabled={!!editingRecord}
                  value={manualForm.staffId}
                  onChange={(e) => setManualForm({ ...manualForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.staffId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Clock-In Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={manualForm.clockInTime}
                    onChange={(e) => setManualForm({ ...manualForm, clockInTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Clock-Out Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.clockOutTime}
                    onChange={(e) => setManualForm({ ...manualForm, clockOutTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Punctuality Status
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as AttendanceRecord['status'] })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="on_time">On Time</option>
                  <option value="late">Late Arrival</option>
                  <option value="completed">Completed Full Day</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Adjustment Note
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="Reason for manual entry or time correction..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingRecord ? 'Save Correction' : 'Log Punch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
