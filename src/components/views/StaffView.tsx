import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Barcode,
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
  Camera,
  Upload,
  Image as ImageIcon,
  User,
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

const PRESET_AVATARS = [
  { label: 'Architect', url: '/src/assets/images/avatar_lead_architect_1790158411177.jpg' },
  { label: 'Supervisor', url: '/src/assets/images/avatar_operations_supervisor_1790158425376.jpg' },
  { label: 'Medical Dr.', url: '/src/assets/images/avatar_clinical_specialist_1790158436944.jpg' },
  { label: 'HR Officer', url: '/src/assets/images/avatar_hr_officer_1790158448933.jpg' },
];

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
    avatarUrl: '',
  });
  const [formError, setFormError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

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
      avatarUrl: '',
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
      avatarUrl: staff.avatarUrl || '',
    });
    setFormError('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
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
        avatarUrl: formData.avatarUrl.trim() || undefined,
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
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });
      handleCloseAddModal();
      // Promptly show badge modal so admin can print/download Barcode immediately
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, ID, position, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Assigned Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Account Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member & Photo</th>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
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
                    <tr key={staff.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {staff.avatarUrl ? (
                            <img
                              src={staff.avatarUrl}
                              alt={staff.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 uppercase shrink-0">
                              {staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{staff.fullName}</div>
                            <div className="text-[11px] text-slate-400">Joined {staff.joinedDate}</div>
                          </div>
                        </div>
                      </td>

                      {/* Staff ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {staff.staffId}
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{staff.position}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: dept?.color || '#94a3b8' }}
                          />
                          <span>{dept?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Shift Schedule */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{shift?.name || 'Shift'}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {shift?.startTime} - {shift?.endTime}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div className="truncate max-w-[150px]">{staff.email}</div>
                        <div className="font-mono text-[11px] text-slate-400">{staff.phone}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
                            staff.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Barcode ID Badge Print Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedBadgeStaff(staff)}
                            title="Print Staff Barcode ID Badge Card"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Print ID</span>
                          </button>

                          {/* Edit Staff */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit Staff Information"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Showing {filteredStaff.length} of {staffList.length} staff records</span>
          <span className="font-mono text-[11px]">Badge & Barcode Ready</span>
        </div>
      </div>

      {/* Add or Edit Staff Modal */}
      {(isAddOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {editingStaff ? 'Edit Staff Profile' : 'Staff Registration & ID Badge Generator'}
                </h3>
              </div>
              <button
                onClick={() => {
                  handleCloseAddModal();
                  setEditingStaff(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Staff Picture Upload & Presets */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Staff ID Badge Picture
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Frame */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-indigo-400/40 bg-slate-200 dark:bg-slate-700 shrink-0">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Staff Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="staff-photo-upload"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Upload Photo</span>
                      </button>

                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                          className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 rounded-xl transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      PNG or JPEG portrait photo for badge (max 5MB).
                    </span>
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-1.5">
                    Or select sample executive portrait:
                  </span>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        title={`Select ${preset.label}`}
                        className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition-transform ${
                          formData.avatarUrl === preset.url
                            ? 'border-indigo-600 ring-2 ring-indigo-500 scale-105'
                            : 'border-slate-300 dark:border-slate-600 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="EMP-1001"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Job Position / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Senior Registered Nurse"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Assigned Shift *
                  </label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseAddModal();
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingStaff ? 'Save Changes' : 'Generate ID Badge & Register'}
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
      />
    </div>
  );
};
