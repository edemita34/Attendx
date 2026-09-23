import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Printer,
  Download,
  Building,
  CalendarClock,
  Mail,
  Phone,
  X,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Staff, Department, Shift } from '../../types';
import { IdBadgeModal } from '../IdBadgeModal';

interface StaffViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  isAdmin,
  onOpenAdminLogin,
  isAddModalOpen: propIsAddModalOpen,
  setIsAddModalOpen: propSetIsAddModalOpen,
}) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedBadgeStaff, setSelectedBadgeStaff] = useState<Staff | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    fullName: '',
    staffId: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    shiftId: '',
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setStaffList(storage.getStaff());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    loadData();
    return storage.subscribe(loadData);
  }, []);

  // Sync prop controlled add modal
  useEffect(() => {
    if (propIsAddModalOpen !== undefined) {
      setIsAddOpen(propIsAddModalOpen);
    }
  }, [propIsAddModalOpen]);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    const nextId = storage.getNextStaffId();
    const depts = storage.getDepartments();
    const shfts = storage.getShifts();

    setFormData({
      fullName: '',
      staffId: nextId,
      email: '',
      phone: '',
      departmentId: depts[0]?.id || '',
      position: '',
      shiftId: shfts[0]?.id || '',
    });
    setFormError('');
    setIsAddOpen(true);
    if (propSetIsAddModalOpen) propSetIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddOpen(false);
    if (propSetIsAddModalOpen) propSetIsAddModalOpen(false);
  };

  const handleOpenEdit = (staff: Staff) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      staffId: staff.staffId,
      email: staff.email,
      phone: staff.phone,
      departmentId: staff.departmentId,
      position: staff.position,
      shiftId: staff.shiftId,
    });
    setFormError('');
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('Staff full name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.position.trim()) {
      setFormError('Position / Title is required.');
      return;
    }

    if (editingStaff) {
      // Edit
      storage.updateStaff(editingStaff.id, {
        fullName: formData.fullName.trim(),
        staffId: formData.staffId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        departmentId: formData.departmentId,
        position: formData.position.trim(),
        shiftId: formData.shiftId,
      });
      setEditingStaff(null);
    } else {
      // Add new
      const created = storage.addStaff({
        fullName: formData.fullName,
        staffId: formData.staffId,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        position: formData.position,
        shiftId: formData.shiftId,
      });
      handleCloseAddModal();
      // Promptly show badge modal so admin can print/download QR immediately
      setSelectedBadgeStaff(created);
    }
  };

  const handleToggleStatus = (staff: Staff) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    storage.toggleStaffStatus(staff.id);
  };

  const handleDeleteStaff = (staff: Staff) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm(`Are you sure you want to delete staff member "${staff.fullName}" (${staff.staffId})?`)) {
      storage.deleteStaff(staff.id);
    }
  };

  const handleRegenerateQr = (staffId: string) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    if (window.confirm('Regenerating QR code will invalidate any printed physical cards. Continue?')) {
      const updated = storage.regenerateQrCode(staffId);
      if (updated && selectedBadgeStaff?.id === staffId) {
        setSelectedBadgeStaff(updated);
      }
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || s.departmentId === selectedDept;
    const matchesShift = selectedShift === 'all' || s.shiftId === selectedShift;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Add Staff Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, ID, position, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Departments ({staffList.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({staffList.filter((s) => s.departmentId === d.id).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Assigned Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Account Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No staff members match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const dept = departments.find((d) => d.id === staff.departmentId);
                  const shift = shifts.find((s) => s.id === staff.shiftId);

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar initials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase shrink-0">
                            {staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{staff.fullName}</div>
                            <div className="text-[11px] text-slate-400">Joined {staff.joinedDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* Staff ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {staff.staffId}
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{staff.position}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: dept?.color || '#94a3b8' }}
                          />
                          <span>{dept?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Shift Schedule */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{shift?.name || 'Shift'}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {shift?.startTime} - {shift?.endTime}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-500 space-y-0.5">
                        <div className="truncate max-w-[150px]">{staff.email}</div>
                        <div className="font-mono text-[11px] text-slate-400">{staff.phone}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
                            staff.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* QR Code / ID Badge Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedBadgeStaff(staff)}
                            title="View QR Code & Digital ID Badge"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Edit Staff */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit Staff Information"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(staff)}
                            title={staff.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              staff.status === 'active'
                                ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            {staff.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff)}
                            title="Delete Staff"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Table Footer Count */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredStaff.length} of {staffList.length} staff records</span>
          <span className="font-mono text-[11px]">QR Tokens Encrypted</span>
        </div>
      </div>

      {/* Add or Edit Staff Modal */}
      {(isAddOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingStaff ? 'Edit Staff Profile' : 'Staff Registration & QR Generator'}
                </h3>
              </div>
              <button
                onClick={() => {
                  handleCloseAddModal();
                  setEditingStaff(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="EMP-1001"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Job Position / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Senior Registered Nurse"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Shift *
                  </label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingStaff && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                  <QrCode className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    A secure unique QR Code token will be automatically generated upon registration. You will be able to print or download their ID card immediately.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseAddModal();
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingStaff ? 'Save Changes' : 'Generate QR & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Badge View Modal */}
      <IdBadgeModal
        isOpen={!!selectedBadgeStaff}
        staff={selectedBadgeStaff}
        departments={departments}
        shifts={shifts}
        onClose={() => setSelectedBadgeStaff(null)}
        onRegenerateQr={handleRegenerateQr}
      />
    </div>
  );
};
