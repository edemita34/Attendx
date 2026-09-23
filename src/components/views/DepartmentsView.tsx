import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Department, Staff, AttendanceRecord } from '../../types';
import { NavTab } from '../Navigation';

interface DepartmentsViewProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onNavigateToRecords: (deptId: string) => void;
}

const COLOR_PALETTE = [
  '#0284c7', // Sky
  '#16a34a', // Emerald
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#ca8a04', // Yellow/Gold
];

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onNavigateToRecords,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    managerName: '',
    color: COLOR_PALETTE[0],
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setDepartments(storage.getDepartments());
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
      code: '',
      description: '',
      managerName: '',
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      managerName: dept.managerName,
      color: dept.color,
    });
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Department name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Department code is required (e.g. ENG).');
      return;
    }

    if (editingDept) {
      storage.updateDepartment(editingDept.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        managerName: formData.managerName.trim(),
        color: formData.color,
      });
      setEditingDept(null);
    } else {
      storage.addDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        managerName: formData.managerName.trim(),
        color: formData.color,
      });
      setIsAddOpen(false);
    }
  };

  const handleDelete = (dept: Department) => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    const result = storage.deleteDepartment(dept.id);
    if (!result.success) {
      alert(result.message || 'Cannot delete department with active staff.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Organizational Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure division rosters, leadership heads, and attendance filtering parameters.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptStaff = staff.filter((s) => s.departmentId === dept.id);
          const activeCount = deptStaff.filter((s) => s.status === 'active').length;

          // Today's attendance for this department
          const deptTodayLogs = attendance.filter(
            (r) => r.departmentId === dept.id && r.date === todayStr
          );
          const presentCount = new Set(deptTodayLogs.map((r) => r.staffId)).size;
          const attendancePercent = activeCount > 0 ? Math.round((presentCount / activeCount) * 100) : 0;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Header stripe with custom color */}
              <div className="h-1.5 w-full" style={{ backgroundColor: dept.color }} />

              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md font-mono mb-1 text-white"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {dept.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      title="Delete Department"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {dept.description || 'No description specified for this department.'}
                </p>

                {/* Manager Name */}
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400">Head / Manager:</span>
                  <span className="font-semibold text-slate-800">{dept.managerName || 'Arthur Pendelton'}</span>
                </div>

                {/* Staff Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Total Staff</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {activeCount}
                    </span>
                  </div>
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-emerald-700 block">Present Today</span>
                    <span className="text-lg font-bold text-emerald-800 font-mono">
                      {presentCount} ({attendancePercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: View Attendance Button */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {deptStaff.length} profiles linked
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToRecords(dept.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>Attendance Records</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {(isAddOpen || editingDept) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingDept(null);
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Clinical Nursing"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="NUR"
                    className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department Manager / Lead
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="e.g. Dr. Elena Rostova"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Responsibilities, scope, and key deliverables..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Badge Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        formData.color === color ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingDept(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
