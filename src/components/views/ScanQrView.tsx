import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanBarcode,
  Barcode,
  Camera,
  Upload,
  CheckCircle2,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  Building,
  Play,
  ShieldAlert,
  Usb,
  User,
  Radio,
  LayoutDashboard,
  Lock,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { sound } from '../../utils/audio';
import { generateBarcodeSvg } from '../../utils/barcode';
import { Staff, Department, Shift, ScanResult } from '../../types';

interface ScanQrViewProps {
  isAdmin?: boolean;
  onExitKiosk?: () => void;
  onOpenAdminLogin?: () => void;
}

export const ScanQrView: React.FC<ScanQrViewProps> = ({
  isAdmin,
  onExitKiosk,
  onOpenAdminLogin,
}) => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resetCountdown, setResetCountdown] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastScannedMethod, setLastScannedMethod] = useState<'camera' | 'usb_barcode' | 'file' | 'simulator'>('usb_barcode');
  const [usbScannerIndicator, setUsbScannerIndicator] = useState<boolean>(false);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'html5-barcode-scanner-element';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const usbInputRef = useRef<HTMLInputElement>(null);

  // USB Barcode Scanner hardware keystroke buffer
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  const loadData = () => {
    setStaffList(storage.getStaff());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    loadData();
    return storage.subscribe(loadData);
  }, []);

  // Process decoded Barcode text
  const handleScanText = useCallback((text: string, method: 'camera' | 'usb_barcode' | 'file' | 'simulator' = 'usb_barcode') => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLastScannedMethod(method);

    const settings = storage.getSettings();
    const result = storage.processScan(text);
    setScanResult(result);

    if (result.success) {
      if (result.type === 'clock_in') {
        if (settings.enableSound) sound.playClockInSuccess();
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#38bdf8'],
        });
      } else if (result.type === 'clock_out') {
        if (settings.enableSound) sound.playClockOutSuccess();
      }
    } else {
      if (settings.enableSound) sound.playWarning();
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 1200);
  }, [isProcessing]);

  // USB Barcode Scanner Global Hardware Listener
  // Hardware scanners act as an HID keyboard: bursts of characters within < 50ms followed by Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a normal form input (except our dedicated usbInputRef)
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isInput && target !== usbInputRef.current) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const buffered = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';

        if (buffered.length >= 2) {
          e.preventDefault();
          // Visual indicator for USB scan flash
          setUsbScannerIndicator(true);
          setTimeout(() => setUsbScannerIndicator(false), 1500);
          handleScanText(buffered, 'usb_barcode');
        }
      } else if (e.key.length === 1) {
        // If keystroke arrived within 75ms of previous, or if buffer is starting
        if (timeDiff > 90 && barcodeBufferRef.current.length > 0) {
          // Typed too slowly - reset buffer as likely human typing
          barcodeBufferRef.current = '';
        }
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleScanText]);

  // Handle auto-reset countdown when a scan result is displayed
  useEffect(() => {
    if (!scanResult) {
      setResetCountdown(0);
      return;
    }

    const settings = storage.getSettings();
    const duration = scanResult.success ? (settings.autoKioskResetSeconds || 7) : 5;
    setResetCountdown(duration);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = window.setInterval(() => {
      setResetCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          handleClearResult();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [scanResult]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const handleClearResult = () => {
    setScanResult(null);
    setResetCountdown(0);
  };

  // Start Camera Barcode Scanner (Exclusively linear 1D barcode formats)
  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      if (html5QrCodeRef.current) {
        await stopCameraScanner();
      }

      const barcodeScanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });
      html5QrCodeRef.current = barcodeScanner;

      await barcodeScanner.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 320, height: 160 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          handleScanText(decodedText, 'camera');
        },
        () => {
          // Frame scan empty - ignore
        }
      );
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(
        `Unable to access camera (${errMsg}). You can plug in a USB Barcode Scanner gun, enter the staff ID above, or use the Simulator below.`
      );
      setCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {
        // ignore cleanup error
      }
    }
    html5QrCodeRef.current = null;
    setCameraActive(false);
  };

  // File Upload Barcode Scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let barcodeScanner = html5QrCodeRef.current;
      if (!barcodeScanner) {
        barcodeScanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
          verbose: false,
        });
      }
      const decodedText = await barcodeScanner.scanFile(file, true);
      handleScanText(decodedText, 'file');
    } catch {
      const settings = storage.getSettings();
      if (settings.enableSound) sound.playWarning();
      setScanResult({
        success: false,
        type: 'error',
        message: 'Could not detect a valid linear Barcode (Code 39 / Code 128) in the uploaded image. Please try a clearer picture.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Instant Staff Simulator Punch using Staff ID Barcode
  const handleSimulateStaffScan = () => {
    if (!selectedStaffId) return;
    const staff = staffList.find((s) => s.id === selectedStaffId);
    if (staff) {
      handleScanText(staff.staffId, 'simulator');
    }
  };

  // Random Staff Simulator
  const handleRandomStaffScan = () => {
    const activeStaff = staffList.filter((s) => s.status === 'active');
    if (activeStaff.length === 0) return;
    const random = activeStaff[Math.floor(Math.random() * activeStaff.length)];
    handleScanText(random.staffId, 'simulator');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanText(manualInput.trim(), 'usb_barcode');
      setManualInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Kiosk Mode Status & Main Menu Locked Notice */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Staff Barcode Terminal
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                Main Menu Hidden
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dedicated barcode clock-in terminal. Administrative navigation is hidden for staff privacy and terminal protection.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={onExitKiosk}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs self-start sm:self-auto shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Exit Kiosk</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs self-start sm:self-auto shrink-0"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Admin Access</span>
          </button>
        )}
      </div>

      {/* USB Barcode Hardware Active Live Alert Pill */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            usbScannerIndicator ? 'bg-emerald-500 text-slate-950 scale-110' : 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
          }`}>
            <Usb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Hardware USB Barcode Laser Gun
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Plug & Play Listening
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pull the trigger on any handheld USB laser gun or CCD scanner. ID barcodes are captured instantly.
            </p>
          </div>
        </div>

        {/* Dedicated Scanner Focus Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              ref={usbInputRef}
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualSubmit(e);
                }
              }}
              placeholder="Scan or Enter Barcode..."
              className="w-48 sm:w-56 pl-9 pr-3 py-1.5 text-xs font-mono rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleManualSubmit}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shrink-0"
          >
            Clock In/Out
          </button>
        </div>
      </div>

      {/* Confirmation Screen */}
      {scanResult ? (
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all duration-300 animate-in zoom-in-95 ${
            scanResult.success
              ? scanResult.type === 'clock_in'
                ? 'bg-linear-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50 text-white'
                : 'bg-linear-to-b from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/50 text-white'
              : scanResult.type === 'warning'
              ? 'bg-linear-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500/50 text-white'
              : 'bg-linear-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500/50 text-white'
          }`}
        >
          {/* Header Status Tag */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  scanResult.success
                    ? scanResult.type === 'clock_in'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : scanResult.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {scanResult.success ? (
                  scanResult.type === 'clock_in' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <LogOut className="w-7 h-7" />
                  )
                ) : scanResult.type === 'warning' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <ShieldAlert className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-md ${
                      scanResult.success
                        ? scanResult.type === 'clock_in'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-indigo-400 text-slate-950'
                        : scanResult.type === 'warning'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {scanResult.success
                      ? scanResult.type === 'clock_in'
                        ? 'CLOCK-IN CONFIRMED'
                        : 'CLOCK-OUT CONFIRMED'
                      : scanResult.type === 'warning'
                      ? 'ATTENDANCE ALERT'
                      : 'SCAN REJECTED'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    {lastScannedMethod === 'usb_barcode' && <Usb className="w-3 h-3 text-indigo-400" />}
                    {lastScannedMethod === 'usb_barcode' ? 'USB Barcode Gun' : lastScannedMethod === 'camera' ? 'Camera Barcode' : 'Direct Entry'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-200 mt-1">
                  {scanResult.message}
                </p>
              </div>
            </div>

            {/* Auto reset badge */}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Auto-return in
              </span>
              <span className="text-xl font-bold font-mono text-indigo-300">
                {resetCountdown}s
              </span>
            </div>
          </div>

          {/* Staff Details with Photo and Verified Barcode */}
          {scanResult.staff && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
              <div className="flex items-center gap-4">
                {/* Staff Avatar / Photo on Confirmation Screen */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shrink-0 shadow-md">
                  {scanResult.staff.avatarUrl ? (
                    <img
                      src={scanResult.staff.avatarUrl}
                      alt={scanResult.staff.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300">
                      <User className="w-9 h-9" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Staff Identity
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {scanResult.staff.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
                    <span className="font-bold">{scanResult.staff.staffId}</span>
                    <span>·</span>
                    <span className="text-slate-300">{scanResult.staff.position}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {departments.find((d) => d.id === scanResult.staff?.departmentId)?.name || 'Department'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {shifts.find((s) => s.id === scanResult.staff?.shiftId)?.name || 'Shift'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-3 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-4 md:pt-0">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Punch Timestamp
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {scanResult.timestamp}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Additional metrics: Late or Duration */}
                {scanResult.type === 'clock_in' && (
                  <div className="pt-1">
                    {scanResult.lateMinutes && scanResult.lateMinutes > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Late by {scanResult.lateMinutes} minutes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Punctual · Arrived On Time
                      </span>
                    )}
                  </div>
                )}

                {scanResult.type === 'clock_out' && scanResult.workDurationFormatted && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Shift Completed: {scanResult.workDurationFormatted}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Terminal will automatically reset for the next staff member.
            </span>
            <button
              onClick={handleClearResult}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Scan Next Barcode</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standby Barcode Kiosk Interface */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="text-center max-w-lg mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
              <ScanBarcode className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Attendance Barcode Terminal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Scan your printed staff ID barcode with a <strong>USB Laser Gun</strong> or the <strong>Camera Barcode Reader</strong> to clock in or out.
            </p>
          </div>

          {/* Camera Viewport or Start Camera Placeholder */}
          <div className="max-w-md mx-auto relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner aspect-video flex flex-col items-center justify-center">
            {/* The element HTML5-Barcode mounts into */}
            <div
              id={scannerContainerId}
              className={`w-full h-full ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Red Laser Scanning Guide Line overlay when camera is active */}
            {cameraActive && (
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest block text-center mt-1">
                  Align Barcode with Red Line
                </span>
              </div>
            )}

            {!cameraActive && (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Barcode className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    Live Camera Barcode Reader
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Activate camera to scan printed staff ID card barcodes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md rounded-xl hover:bg-slate-800 border border-white/20 transition-colors shadow-lg"
                >
                  Turn Camera Off
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="max-w-md mx-auto mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Secondary Methods: Upload Barcode Image File */}
          <div className="max-w-md mx-auto mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="barcode-file-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Upload Barcode Image File (PNG/JPEG)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator / Interactive Testing Panel */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Staff Barcode Punch Simulator (Instant Testing)</span>
          </div>
          <button
            type="button"
            onClick={handleRandomStaffScan}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Punch Random Staff
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full sm:flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
          >
            <option value="">-- Select staff member to simulate barcode scan --</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.staffId} - {s.fullName} ({departments.find((d) => d.id === s.departmentId)?.name || 'Dept'})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSimulateStaffScan}
            disabled={!selectedStaffId}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Barcode Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
