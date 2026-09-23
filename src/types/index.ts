export type StaffStatus = 'active' | 'inactive';

export type AttendanceStatus = 
  | 'on_time' 
  | 'late' 
  | 'early_departure' 
  | 'half_day' 
  | 'completed' 
  | 'active' 
  | 'absent';

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  managerName: string;
  color: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm (24h)
  endTime: string;   // HH:mm (24h)
  gracePeriodMinutes: number; // e.g., 15
  crossMidnight?: boolean;
  description: string;
}

export interface Staff {
  id: string;
  staffId: string; // e.g. "EMP-1001"
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  shiftId: string;
  status: StaffStatus;
  qrCodeToken: string; // Unique cryptographic/random token embedded in QR
  qrCodeGeneratedAt: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string; // Staff.id
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO string e.g. "2026-09-23T08:04:12"
  clockOutTime?: string | null; // ISO string e.g. "2026-09-23T16:32:00"
  shiftId: string;
  departmentId: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  totalWorkMinutes?: number;
  notes?: string;
  verifiedBy: 'barcode_scan' | 'qr_scan' | 'manual_admin';
}

export interface SystemSettings {
  organizationName: string;
  organizationSubtitle: string;
  autoKioskResetSeconds: number;
  enableSound: boolean;
  defaultGracePeriodMinutes: number;
  adminPassword: string;
  allowSelfCheckOut: boolean;
}

export interface ScanResult {
  success: boolean;
  type?: 'clock_in' | 'clock_out' | 'warning' | 'error';
  staff?: Staff;
  record?: AttendanceRecord;
  message: string;
  timestamp: string;
  lateMinutes?: number;
  workDurationFormatted?: string;
}
