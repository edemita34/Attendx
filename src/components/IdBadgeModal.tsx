import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  QrCode,
  Building,
  Clock,
  Briefcase,
  RefreshCw,
  ScanBarcode,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Staff, Department, Shift } from '../types';
import { generateQrDataUrl, downloadImage } from '../utils/qrcode';
import { generateBarcodeSvg } from '../utils/barcode';
import { storage } from '../services/storage';

interface IdBadgeModalProps {
  staff: Staff | null;
  departments: Department[];
  shifts: Shift[];
  isOpen: boolean;
  onClose: () => void;
  onRegenerateQr?: (staffId: string) => void;
}

export const IdBadgeModal: React.FC<IdBadgeModalProps> = ({
  staff,
  departments,
  shifts,
  isOpen,
  onClose,
  onRegenerateQr,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const badgeRef = useRef<HTMLDivElement>(null);
  const settings = storage.getSettings();

  useEffect(() => {
    if (staff) {
      generateQrDataUrl(staff.qrCodeToken, 400).then((url) => setQrUrl(url));
    }
  }, [staff, staff?.qrCodeToken]);

  if (!isOpen || !staff) return null;

  const dept = departments.find((d) => d.id === staff.departmentId);
  const shift = shifts.find((s) => s.id === staff.shiftId);

  const barcodeSvg = generateBarcodeSvg(staff.staffId, 44);

  const handleDownload = () => {
    if (qrUrl) {
      downloadImage(qrUrl, `${staff.staffId}_QR_Badge.png`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Staff Official ID & Barcode Badge
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Printable Physical ID Card Card Layout */}
          <div
            ref={badgeRef}
            className="print-container bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800"
          >
            {/* Top decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-indigo-500 via-sky-400 to-emerald-400" />
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Organization Branding & Card Type */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-300 font-extrabold block">
                  {settings.organizationName || 'StaffSync'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {settings.organizationSubtitle || 'Official Staff Identity Pass'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-indigo-200">
                  {staff.staffId}
                </span>
              </div>
            </div>

            {/* Main content: Staff Photo, QR and Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
              {/* Staff Official Photo */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-lg bg-slate-800">
                  {staff.avatarUrl ? (
                    <img
                      src={staff.avatarUrl}
                      alt={staff.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                      <User className="w-12 h-12" />
                      <span className="text-[10px] uppercase font-mono mt-1 text-slate-400">No Photo</span>
                    </div>
                  )}
                  {/* Subtle photo frame shine */}
                  <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-wider">
                  Photo ID
                </span>
              </div>

              {/* Staff Details & Department info */}
              <div className="sm:col-span-2 space-y-3 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {staff.fullName}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-indigo-200 font-semibold mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{staff.position}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-white">{dept?.name || 'Department'}</span>
                    <span className="text-slate-500 font-mono">({dept?.code || 'GEN'})</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {shift?.name || 'Shift'} ({shift?.startTime || '08:00'} - {shift?.endTime || '16:00'})
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 border-t border-white/10 font-mono flex items-center justify-center sm:justify-start gap-3">
                  <span>Issued: {new Date(staff.joinedDate).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold capitalize">{staff.status}</span>
                </div>
              </div>
            </div>

            {/* Dual Barcode & QR Code Section (Compatible with USB Scanners & Cameras) */}
            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* 2D QR Code Container */}
              <div className="bg-white p-3 rounded-xl shadow-md flex items-center gap-3">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code for ${staff.fullName}`}
                    className="w-20 h-20 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <QrCode className="w-8 h-8 animate-pulse" />
                  </div>
                )}
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-900 block">
                    Camera & QR Imager
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Hold to camera lens or tablet kiosk screen.
                  </p>
                  <span className="text-[9px] font-mono text-indigo-600 block mt-1">
                    {staff.qrCodeToken.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* 1D Linear USB Barcode Container */}
              <div className="bg-white p-3 rounded-xl shadow-md flex flex-col justify-center text-center">
                <div
                  className="w-full flex justify-center text-slate-900"
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                />
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 mt-1 px-1">
                  <span className="flex items-center gap-1 text-slate-500">
                    <ScanBarcode className="w-3 h-3 text-indigo-600" />
                    <span>USB Laser</span>
                  </span>
                  <span className="text-slate-900 tracking-wider">*{staff.staffId}*</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions & USB Scanner note */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScanBarcode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Compatible with all <strong>USB Handheld Laser / CCD Barcode Scanners</strong> and <strong>2D Camera QR Readers</strong>.
              </span>
            </div>
            {onRegenerateQr && (
              <button
                type="button"
                onClick={() => onRegenerateQr(staff.id)}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                title="Invalidate current QR code and generate a new security token"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate QR
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Download QR Code
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print ID Badge
          </button>
        </div>
      </div>
    </div>
  );
};
