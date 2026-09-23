import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Printer, QrCode, Building, Clock, Briefcase, RefreshCw } from 'lucide-react';
import { Staff, Department, Shift } from '../types';
import { generateQrDataUrl, downloadImage } from '../utils/qrcode';
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

  const handleDownload = () => {
    if (qrUrl) {
      downloadImage(qrUrl, `${staff.staffId}_QR_Badge.png`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-900">Staff Digital ID & QR Badge</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-indigo-500 via-sky-400 to-emerald-400" />
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Company Name & Badge Type */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-300 font-semibold block">
                  {settings.organizationName || 'StaffSync'}
                </span>
                <span className="text-[11px] text-slate-400">Official Staff Identification Card</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-indigo-200">
                  {staff.staffId}
                </span>
              </div>
            </div>

            {/* Main content: QR and Staff Details */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* High Contrast QR Code in clean white frame */}
              <div className="bg-white p-3 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code for ${staff.fullName}`}
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400">
                    <QrCode className="w-8 h-8 animate-pulse" />
                  </div>
                )}
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider text-center">
                  Scan to Clock In/Out
                </span>
              </div>

              {/* Staff Details */}
              <div className="flex-1 text-center sm:text-left space-y-2.5">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{staff.fullName}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-indigo-200 font-medium">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{staff.position}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {shift?.name || 'Shift'} ({shift?.startTime || '08:00'} - {shift?.endTime || '16:00'})
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 border-t border-white/10 font-mono">
                  Token: {staff.qrCodeToken.slice(0, 16)}...
                </div>
              </div>
            </div>

            {/* Bottom ID Footer */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-emerald-400 capitalize">{staff.status}</strong></span>
              <span>Issued: {new Date(staff.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">
              Hold this QR code up to the attendance scanner camera or print it as a physical lanyard card.
            </span>
            {onRegenerateQr && (
              <button
                type="button"
                onClick={() => onRegenerateQr(staff.id)}
                className="shrink-0 ml-3 inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                title="Invalidate current QR code and generate a new security token"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate QR
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download QR Code
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print ID Badge
          </button>
        </div>
      </div>
    </div>
  );
};
