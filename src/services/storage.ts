import { Department, Shift, Staff, AttendanceRecord, SystemSettings, ScanResult } from '../types';

const STORAGE_KEYS = {
  STAFF: 'staffsync_staff_v1',
  DEPARTMENTS: 'staffsync_departments_v1',
  SHIFTS: 'staffsync_shifts_v1',
  ATTENDANCE: 'staffsync_attendance_v1',
  SETTINGS: 'staffsync_settings_v1',
  RECENT_SCANS: 'staffsync_recent_scans_v1',
  ADMIN_AUTH: 'staffsync_admin_session_v1',
};

// Initial default seed departments
const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    code: 'ENG',
    name: 'Software & Technology',
    description: 'Engineering, product development, and IT infrastructure',
    managerName: 'Sarah Jenkins',
    color: '#0284c7', // Sky
    createdAt: '2026-01-10',
  },
  {
    id: 'dept-2',
    code: 'OPS',
    name: 'Logistics & Operations',
    description: 'Supply chain management, fulfillment, and field operations',
    managerName: 'Marcus Vance',
    color: '#16a34a', // Emerald
    createdAt: '2026-01-10',
  },
  {
    id: 'dept-3',
    code: 'MED',
    name: 'Health & Clinical Care',
    description: 'Nursing, clinical attendance, and emergency medical triage',
    managerName: 'Dr. Elena Rostova',
    color: '#e11d48', // Rose
    createdAt: '2026-01-10',
  },
  {
    id: 'dept-4',
    code: 'ADM',
    name: 'General Administration & HR',
    description: 'Human resources, corporate affairs, and office administration',
    managerName: 'Arthur Pendelton',
    color: '#7c3aed', // Purple
    createdAt: '2026-01-10',
  },
  {
    id: 'dept-5',
    code: 'CS',
    name: 'Customer Service & Support',
    description: '24/7 frontline support, client inquiries, and hospitality',
    managerName: 'Aisha Bello',
    color: '#ea580c', // Orange
    createdAt: '2026-01-10',
  },
];

// Initial default shifts
const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'shift-1',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    gracePeriodMinutes: 15,
    description: 'Standard early morning shift with 15-minute grace period.',
  },
  {
    id: 'shift-2',
    name: 'Afternoon Shift',
    startTime: '14:00',
    endTime: '22:00',
    gracePeriodMinutes: 15,
    description: 'Midday to evening shift for operations and client response.',
  },
  {
    id: 'shift-3',
    name: 'Night Shift',
    startTime: '22:00',
    endTime: '06:00',
    gracePeriodMinutes: 15,
    crossMidnight: true,
    description: 'Overnight shift for continuous coverage and security.',
  },
  {
    id: 'shift-4',
    name: 'Executive & Flex',
    startTime: '09:00',
    endTime: '17:00',
    gracePeriodMinutes: 30,
    description: 'Flexible corporate schedule with 30-minute grace window.',
  },
];

// Initial realistic staff list
const DEFAULT_STAFF: Staff[] = [
  {
    id: 'staff-1',
    staffId: 'EMP-1001',
    fullName: 'Alexander Wright',
    email: 'a.wright@staffsync.corp',
    phone: '+1 (555) 234-8901',
    departmentId: 'dept-1',
    position: 'Lead Systems Architect',
    shiftId: 'shift-1',
    status: 'active',
    qrCodeToken: 'QR-EMP-1001-SEC-78A9B2',
    qrCodeGeneratedAt: '2026-01-15T09:00:00.000Z',
    joinedDate: '2026-01-15',
  },
  {
    id: 'staff-2',
    staffId: 'EMP-1002',
    fullName: 'David K. Oconnor',
    email: 'd.oconnor@staffsync.corp',
    phone: '+1 (555) 345-6712',
    departmentId: 'dept-2',
    position: 'Operations Supervisor',
    shiftId: 'shift-1',
    status: 'active',
    qrCodeToken: 'QR-EMP-1002-SEC-41C8F0',
    qrCodeGeneratedAt: '2026-01-18T10:00:00.000Z',
    joinedDate: '2026-01-18',
  },
  {
    id: 'staff-3',
    staffId: 'EMP-1003',
    fullName: 'Dr. Priya Sharma',
    email: 'p.sharma@staffsync.corp',
    phone: '+1 (555) 456-7823',
    departmentId: 'dept-3',
    position: 'Clinical Specialist',
    shiftId: 'shift-2',
    status: 'active',
    qrCodeToken: 'QR-EMP-1003-SEC-92D3E1',
    qrCodeGeneratedAt: '2026-02-01T11:00:00.000Z',
    joinedDate: '2026-02-01',
  },
  {
    id: 'staff-4',
    staffId: 'EMP-1004',
    fullName: 'Sophia Martinez',
    email: 's.martinez@staffsync.corp',
    phone: '+1 (555) 567-8934',
    departmentId: 'dept-4',
    position: 'HR & Personnel Officer',
    shiftId: 'shift-4',
    status: 'active',
    qrCodeToken: 'QR-EMP-1004-SEC-63F7A4',
    qrCodeGeneratedAt: '2026-02-05T08:30:00.000Z',
    joinedDate: '2026-02-05',
  },
  {
    id: 'staff-5',
    staffId: 'EMP-1005',
    fullName: 'Lucas Chen',
    email: 'l.chen@staffsync.corp',
    phone: '+1 (555) 678-9045',
    departmentId: 'dept-1',
    position: 'Frontend Engineer',
    shiftId: 'shift-1',
    status: 'active',
    qrCodeToken: 'QR-EMP-1005-SEC-15E8B9',
    qrCodeGeneratedAt: '2026-02-10T14:15:00.000Z',
    joinedDate: '2026-02-10',
  },
  {
    id: 'staff-6',
    staffId: 'EMP-1006',
    fullName: 'Fatima Al-Mansoor',
    email: 'f.mansoor@staffsync.corp',
    phone: '+1 (555) 789-0156',
    departmentId: 'dept-5',
    position: 'Support Team Lead',
    shiftId: 'shift-1',
    status: 'active',
    qrCodeToken: 'QR-EMP-1006-SEC-87C2D5',
    qrCodeGeneratedAt: '2026-02-15T09:45:00.000Z',
    joinedDate: '2026-02-15',
  },
  {
    id: 'staff-7',
    staffId: 'EMP-1007',
    fullName: 'Kofi Mensah',
    email: 'k.mensah@staffsync.corp',
    phone: '+1 (555) 890-1267',
    departmentId: 'dept-2',
    position: 'Dispatch Coordinator',
    shiftId: 'shift-2',
    status: 'active',
    qrCodeToken: 'QR-EMP-1007-SEC-39B6F3',
    qrCodeGeneratedAt: '2026-03-01T12:00:00.000Z',
    joinedDate: '2026-03-01',
  },
  {
    id: 'staff-8',
    staffId: 'EMP-1008',
    fullName: 'Rachel Greenburg',
    email: 'r.greenburg@staffsync.corp',
    phone: '+1 (555) 901-2378',
    departmentId: 'dept-3',
    position: 'Charge Nurse',
    shiftId: 'shift-3',
    status: 'active',
    qrCodeToken: 'QR-EMP-1008-SEC-54A1E8',
    qrCodeGeneratedAt: '2026-03-05T16:20:00.000Z',
    joinedDate: '2026-03-05',
  },
  {
    id: 'staff-9',
    staffId: 'EMP-1009',
    fullName: 'Mateo Rossi',
    email: 'm.rossi@staffsync.corp',
    phone: '+1 (555) 012-3489',
    departmentId: 'dept-5',
    position: 'Customer Help Specialist',
    shiftId: 'shift-2',
    status: 'active',
    qrCodeToken: 'QR-EMP-1009-SEC-72D9C6',
    qrCodeGeneratedAt: '2026-03-10T10:00:00.000Z',
    joinedDate: '2026-03-10',
  },
  {
    id: 'staff-10',
    staffId: 'EMP-1010',
    fullName: 'Hanna Lindqvist',
    email: 'h.lindqvist@staffsync.corp',
    phone: '+1 (555) 123-4590',
    departmentId: 'dept-4',
    position: 'Facilities Manager',
    shiftId: 'shift-1',
    status: 'inactive',
    qrCodeToken: 'QR-EMP-1010-SEC-91B4A7',
    qrCodeGeneratedAt: '2026-01-20T08:00:00.000Z',
    joinedDate: '2026-01-20',
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  organizationName: 'Nexus Global Enterprise',
  organizationSubtitle: 'Staff Attendance & Operations Hub',
  autoKioskResetSeconds: 7,
  enableSound: true,
  defaultGracePeriodMinutes: 15,
  adminPassword: 'admin',
  allowSelfCheckOut: true,
};

// Generate realistic past attendance history for demo
function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Generate logs for past 5 days
  for (let d = 5; d >= 0; d--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - d);
    const dateStr = targetDate.toISOString().split('T')[0];
    const isToday = d === 0;

    DEFAULT_STAFF.forEach((staff, index) => {
      if (staff.status !== 'active') return;

      // Make 1 or 2 absent occasionally
      if ((index + d) % 7 === 0 && !isToday) {
        return; // absent
      }

      const shift = DEFAULT_SHIFTS.find((s) => s.id === staff.shiftId) || DEFAULT_SHIFTS[0];
      const [startH, startM] = shift.startTime.split(':').map(Number);
      
      // Determine if on-time or late
      const isLateToday = index === 4 || index === 6; // Lucas or Kofi late
      const minuteOffset = isLateToday ? (shift.gracePeriodMinutes + 12) : ((index * 3) % 12 - 5);
      
      const clockInDate = new Date(targetDate);
      clockInDate.setHours(startH, startM + minuteOffset, Math.floor(Math.random() * 50));
      const clockInIso = clockInDate.toISOString();

      let clockOutIso: string | null = null;
      let status: AttendanceRecord['status'] = isLateToday ? 'late' : 'on_time';
      let totalWorkMinutes: number | undefined;

      if (!isToday) {
        // Completed past days
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const clockOutDate = new Date(targetDate);
        if (shift.crossMidnight) {
          clockOutDate.setDate(clockOutDate.getDate() + 1);
        }
        clockOutDate.setHours(endH, endM + Math.floor(Math.random() * 20), Math.floor(Math.random() * 50));
        clockOutIso = clockOutDate.toISOString();
        totalWorkMinutes = Math.round((clockOutDate.getTime() - clockInDate.getTime()) / 60000);
        status = 'completed';
      } else {
        // Today: some are currently clocked in, some clocked out already
        if (index === 0 || index === 1 || index === 2 || index === 4 || index === 5) {
          // currently clocked in (no clock out yet)
          clockOutIso = null;
          status = isLateToday ? 'late' : 'on_time';
        } else if (index === 6) {
          // clocked in and out early
          const clockOutDate = new Date(clockInDate.getTime() + 4 * 60 * 60 * 1000);
          clockOutIso = clockOutDate.toISOString();
          totalWorkMinutes = 240;
          status = 'completed';
        }
      }

      records.push({
        id: `att-${dateStr}-${staff.id}`,
        staffId: staff.id,
        date: dateStr,
        clockInTime: clockInIso,
        clockOutTime: clockOutIso,
        shiftId: staff.shiftId,
        departmentId: staff.departmentId,
        status,
        lateMinutes: isLateToday ? minuteOffset : undefined,
        totalWorkMinutes,
        verifiedBy: 'qr_scan',
      });
    });
  }

  return records;
}

export class StorageService {
  private lastScanTimestamps = new Map<string, number>();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateSeedAttendance()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // --- Departments ---
  getDepartments(): Department[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      return data ? JSON.parse(data) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  }

  saveDepartments(departments: Department[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    this.notifyUpdate();
  }

  addDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Department {
    const departments = this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    departments.push(newDept);
    this.saveDepartments(departments);
    return newDept;
  }

  updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const departments = this.getDepartments();
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    departments[index] = { ...departments[index], ...updates };
    this.saveDepartments(departments);
    return departments[index];
  }

  deleteDepartment(id: string): { success: boolean; message?: string } {
    const staff = this.getStaff();
    const hasAssignedStaff = staff.some((s) => s.departmentId === id);
    if (hasAssignedStaff) {
      return { success: false, message: 'Cannot delete department with assigned active staff members.' };
    }
    const departments = this.getDepartments().filter((d) => d.id !== id);
    this.saveDepartments(departments);
    return { success: true };
  }

  // --- Shifts ---
  getShifts(): Shift[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return data ? JSON.parse(data) : DEFAULT_SHIFTS;
    } catch {
      return DEFAULT_SHIFTS;
    }
  }

  saveShifts(shifts: Shift[]): void {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    this.notifyUpdate();
  }

  addShift(shift: Omit<Shift, 'id'>): Shift {
    const shifts = this.getShifts();
    const newShift: Shift = {
      ...shift,
      id: `shift-${Date.now()}`,
    };
    shifts.push(newShift);
    this.saveShifts(shifts);
    return newShift;
  }

  updateShift(id: string, updates: Partial<Shift>): Shift | null {
    const shifts = this.getShifts();
    const index = shifts.findIndex((s) => s.id === id);
    if (index === -1) return null;
    shifts[index] = { ...shifts[index], ...updates };
    this.saveShifts(shifts);
    return shifts[index];
  }

  deleteShift(id: string): { success: boolean; message?: string } {
    const staff = this.getStaff();
    const hasAssignedStaff = staff.some((s) => s.shiftId === id);
    if (hasAssignedStaff) {
      return { success: false, message: 'Cannot delete shift because staff members are assigned to it.' };
    }
    const shifts = this.getShifts().filter((s) => s.id !== id);
    this.saveShifts(shifts);
    return { success: true };
  }

  // --- Staff ---
  getStaff(): Staff[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  }

  saveStaff(staffList: Staff[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
    this.notifyUpdate();
  }

  getNextStaffId(): string {
    const staff = this.getStaff();
    const ids = staff
      .map((s) => {
        const match = s.staffId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 1000;
    return `EMP-${maxId + 1}`;
  }

  generateQrToken(staffId: string): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QR-${staffId}-SEC-${randomHex}`;
  }

  addStaff(data: {
    fullName: string;
    email: string;
    phone: string;
    departmentId: string;
    position: string;
    shiftId: string;
    staffId?: string;
  }): Staff {
    const staffList = this.getStaff();
    const finalStaffId = data.staffId?.trim() || this.getNextStaffId();
    const qrToken = this.generateQrToken(finalStaffId);

    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      staffId: finalStaffId,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      departmentId: data.departmentId,
      position: data.position.trim(),
      shiftId: data.shiftId,
      status: 'active',
      qrCodeToken: qrToken,
      qrCodeGeneratedAt: new Date().toISOString(),
      joinedDate: new Date().toISOString().split('T')[0],
    };

    staffList.push(newStaff);
    this.saveStaff(staffList);
    return newStaff;
  }

  updateStaff(id: string, updates: Partial<Staff>): Staff | null {
    const staffList = this.getStaff();
    const index = staffList.findIndex((s) => s.id === id);
    if (index === -1) return null;
    staffList[index] = { ...staffList[index], ...updates };
    this.saveStaff(staffList);
    return staffList[index];
  }

  regenerateQrCode(staffId: string): Staff | null {
    const staffList = this.getStaff();
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return null;

    staff.qrCodeToken = this.generateQrToken(staff.staffId);
    staff.qrCodeGeneratedAt = new Date().toISOString();
    this.saveStaff(staffList);
    return staff;
  }

  toggleStaffStatus(id: string): Staff | null {
    const staffList = this.getStaff();
    const staff = staffList.find((s) => s.id === id);
    if (!staff) return null;
    staff.status = staff.status === 'active' ? 'inactive' : 'active';
    this.saveStaff(staffList);
    return staff;
  }

  deleteStaff(id: string): boolean {
    const staffList = this.getStaff().filter((s) => s.id !== id);
    this.saveStaff(staffList);
    return true;
  }

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    this.notifyUpdate();
  }

  /**
   * Primary Clock In / Clock Out scan resolver
   * Supports scanning raw token (e.g. QR-EMP-1001-SEC-XXX) or staffId (EMP-1001)
   */
  processScan(scanPayload: string): ScanResult {
    const cleanPayload = scanPayload.trim();
    if (!cleanPayload) {
      return {
        success: false,
        type: 'error',
        message: 'Empty QR code scanned.',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    const staffList = this.getStaff();
    const staff = staffList.find(
      (s) => s.qrCodeToken === cleanPayload || s.staffId.toLowerCase() === cleanPayload.toLowerCase()
    );

    if (!staff) {
      return {
        success: false,
        type: 'error',
        message: 'Unrecognized QR Code. Staff record not found.',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (staff.status === 'inactive') {
      return {
        success: false,
        type: 'warning',
        staff,
        message: `Account is inactive (${staff.fullName}). Please see Administrator.`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Debounce duplicate rapid scans (within 15 seconds)
    const nowMs = Date.now();
    const lastScan = this.lastScanTimestamps.get(staff.id);
    if (lastScan && nowMs - lastScan < 15000) {
      const remainingSecs = Math.ceil((15000 - (nowMs - lastScan)) / 1000);
      return {
        success: false,
        type: 'warning',
        staff,
        message: `Duplicate scan detected! Please wait ${remainingSecs} seconds before scanning again.`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    const shifts = this.getShifts();
    const shift = shifts.find((s) => s.id === staff.shiftId) || shifts[0];
    const settings = this.getSettings();

    const todayDate = new Date();
    const todayDateStr = todayDate.toISOString().split('T')[0];

    const records = this.getAttendance();

    // Check if staff has an open record for today (clockIn set, clockOut null)
    const openRecord = records.find(
      (r) => r.staffId === staff.id && r.date === todayDateStr && !r.clockOutTime
    );

    if (openRecord) {
      // Staff is currently clocked in -> Clock them out!
      const clockOutIso = new Date().toISOString();
      const inTime = new Date(openRecord.clockInTime).getTime();
      const outTime = new Date(clockOutIso).getTime();
      const diffMinutes = Math.max(1, Math.round((outTime - inTime) / 60000));
      
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      const durationFormatted = `${hours}h ${mins}m`;

      openRecord.clockOutTime = clockOutIso;
      openRecord.totalWorkMinutes = diffMinutes;
      openRecord.status = 'completed';

      this.saveAttendance(records);
      this.lastScanTimestamps.set(staff.id, nowMs);

      return {
        success: true,
        type: 'clock_out',
        staff,
        record: openRecord,
        workDurationFormatted: durationFormatted,
        message: `Goodbye, ${staff.fullName}! Clocked out successfully.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    }

    // Staff is NOT clocked in yet today -> Clock them in!
    // Check if they already completed a shift today
    const completedToday = records.find(
      (r) => r.staffId === staff.id && r.date === todayDateStr && r.clockOutTime
    );

    if (completedToday && !settings.allowSelfCheckOut) {
      return {
        success: false,
        type: 'warning',
        staff,
        message: `${staff.fullName} already completed their scheduled shift for today.`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Evaluate punctuality against assigned shift
    const [shiftHour, shiftMinute] = shift.startTime.split(':').map(Number);
    const scheduledStart = new Date(todayDate);
    scheduledStart.setHours(shiftHour, shiftMinute, 0, 0);

    const graceMs = (shift.gracePeriodMinutes ?? settings.defaultGracePeriodMinutes) * 60 * 1000;
    const isLate = todayDate.getTime() > scheduledStart.getTime() + graceMs;
    const lateMinutes = isLate ? Math.round((todayDate.getTime() - scheduledStart.getTime()) / 60000) : 0;

    const clockInIso = todayDate.toISOString();
    const newRecord: AttendanceRecord = {
      id: `att-${todayDateStr}-${staff.id}-${Date.now()}`,
      staffId: staff.id,
      date: todayDateStr,
      clockInTime: clockInIso,
      clockOutTime: null,
      shiftId: staff.shiftId,
      departmentId: staff.departmentId,
      status: isLate ? 'late' : 'on_time',
      lateMinutes: isLate ? lateMinutes : undefined,
      verifiedBy: 'qr_scan',
    };

    records.unshift(newRecord);
    this.saveAttendance(records);
    this.lastScanTimestamps.set(staff.id, nowMs);

    return {
      success: true,
      type: 'clock_in',
      staff,
      record: newRecord,
      lateMinutes: isLate ? lateMinutes : 0,
      message: isLate
        ? `Welcome, ${staff.fullName}! Clocked in (Late by ${lateMinutes} mins).`
        : `Welcome, ${staff.fullName}! Clocked in on time. Have a great day!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  }

  addManualAttendance(data: {
    staffId: string;
    date: string;
    clockInTime: string;
    clockOutTime?: string;
    status: AttendanceRecord['status'];
    notes?: string;
  }): AttendanceRecord {
    const staffList = this.getStaff();
    const staff = staffList.find((s) => s.id === data.staffId);
    if (!staff) throw new Error('Staff not found');

    const records = this.getAttendance();
    const inDate = new Date(`${data.date}T${data.clockInTime}:00`);
    let outIso: string | null = null;
    let workMinutes: number | undefined;

    if (data.clockOutTime) {
      const outDate = new Date(`${data.date}T${data.clockOutTime}:00`);
      outIso = outDate.toISOString();
      workMinutes = Math.max(0, Math.round((outDate.getTime() - inDate.getTime()) / 60000));
    }

    const newRecord: AttendanceRecord = {
      id: `manual-att-${Date.now()}`,
      staffId: data.staffId,
      date: data.date,
      clockInTime: inDate.toISOString(),
      clockOutTime: outIso,
      shiftId: staff.shiftId,
      departmentId: staff.departmentId,
      status: data.status,
      totalWorkMinutes: workMinutes,
      notes: data.notes,
      verifiedBy: 'manual_admin',
    };

    records.unshift(newRecord);
    this.saveAttendance(records);
    return newRecord;
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const records = this.getAttendance();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    records[index] = { ...records[index], ...updates };
    this.saveAttendance(records);
    return records[index];
  }

  deleteAttendanceRecord(id: string): boolean {
    const records = this.getAttendance().filter((r) => r.id !== id);
    this.saveAttendance(records);
    return true;
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyUpdate();
  }

  // --- Admin Session ---
  isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return true;
    const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    return session === 'authenticated';
  }

  setAdminAuthenticated(auth: boolean): void {
    if (auth) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
    this.notifyUpdate();
  }

  // --- Reset & Import / Export ---
  resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateSeedAttendance()));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.notifyUpdate();
  }

  clearTodayAttendance(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = this.getAttendance().filter((r) => r.date !== todayStr);
    this.saveAttendance(records);
  }

  exportAllDataJson(): string {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      departments: this.getDepartments(),
      shifts: this.getShifts(),
      staff: this.getStaff(),
      attendance: this.getAttendance(),
      settings: this.getSettings(),
    };
    return JSON.stringify(exportObject, null, 2);
  }

  importAllDataJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.departments) localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(parsed.departments));
      if (parsed.shifts) localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(parsed.shifts));
      if (parsed.staff) localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(parsed.staff));
      if (parsed.attendance) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(parsed.attendance));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      this.notifyUpdate();
      return true;
    } catch (err) {
      console.error('Failed to import data', err);
      return false;
    }
  }

  // Listener pattern
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyUpdate() {
    this.listeners.forEach((fn) => fn());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('staffsync_storage_change'));
    }
  }
}

export const storage = new StorageService();
