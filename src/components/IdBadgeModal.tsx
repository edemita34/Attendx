import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Printer,
  Building,
  Clock,
  Briefcase,
  ScanBarcode,
  Barcode,
  User,
  ShieldCheck,
  CreditCard,
  Scissors,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';
import { Staff, Department, Shift } from '../types';
import { generateBarcodeSvg, downloadBarcodePng } from '../utils/barcode';
import { storage } from '../services/storage';

interface IdBadgeModalProps {
  staff: Staff | null;
  departments: Department[];
  shifts: Shift[];
  isOpen: boolean;
  onClose: () => void;
}

type BadgeOrientation = 'portrait' | 'landscape' | 'double';
type BadgeTheme = 'navy' | 'light' | 'dark';

export const IdBadgeModal: React.FC<IdBadgeModalProps> = ({
  staff,
  departments,
  shifts,
  isOpen,
  onClose,
}) => {
  const [orientation, setOrientation] = useState<BadgeOrientation>('portrait');
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>('navy');
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);
  const [showLanyardGuide, setShowLanyardGuide] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const settings = storage.getSettings();

  // Manage print isolation class on body
  useEffect(() => {
    if (isOpen && staff) {
      document.body.classList.add('badge-modal-active');
    } else {
      document.body.classList.remove('badge-modal-active');
    }
    return () => {
      document.body.classList.remove('badge-modal-active');
    };
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const dept = departments.find((d) => d.id === staff.departmentId);
  const shift = shifts.find((s) => s.id === staff.shiftId);

  // High-density Code 39 Barcode for Portrait (taller bars for laser scanners)
  const portraitBarcodeSvg = generateBarcodeSvg(staff.staffId, 54, {
    showText: true,
    padding: 10,
    narrowWidth: 2,
    wideWidth: 5,
    gap: 2,
  });

  // Code 39 Barcode for Landscape
  const landscapeBarcodeSvg = generateBarcodeSvg(staff.staffId, 52, {
    showText: true,
    padding: 8,
    narrowWidth: 2,
    wideWidth: 5,
    gap: 2,
  });

  const handleDownloadBarcode = () => {
    downloadBarcodePng(
      staff.staffId,
      `${staff.staffId}_${staff.fullName.replace(/\s+/g, '_')}_Barcode.png`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(staff.staffId).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Card theme styles
  const isLight = badgeTheme === 'light';
  const cardBgClass = isLight
    ? 'bg-white text-slate-900 border-2 border-slate-300 shadow-xl'
    : badgeTheme === 'dark'
    ? 'bg-slate-950 text-white border-2 border-slate-800 shadow-2xl'
    : 'bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 text-white border-2 border-indigo-900/60 shadow-2xl';

  const cardHeaderBorder = isLight ? 'border-slate-200' : 'border-white/10';
  const textMutedClass = isLight ? 'text-slate-600' : 'text-slate-300';
  const textSubtleClass = isLight ? 'text-slate-400' : 'text-slate-400';
  const staffIdBannerClass = isLight
    ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-xs'
    : 'bg-indigo-950/80 border-2 border-indigo-500/40 text-indigo-100 shadow-md';

  /* ---------------------------------------------------- */
  /* FRONT OF ID CARD: PORTRAIT (VERTICAL LANYARD BADGE)  */
  /* Standard 54mm x 86mm CR80 format                     */
  /* ---------------------------------------------------- */
  const renderPortraitFront = () => (
    <div
      className={`id-card-element relative w-[340px] rounded-3xl p-5 overflow-hidden flex flex-col justify-between transition-all ${cardBgClass}`}
      style={{
        minHeight: '520px',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative top color bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-indigo-500 via-sky-400 to-emerald-400" />

      {/* Lanyard punch hole slot guide marker */}
      {showLanyardGuide && (
        <div className="pt-1 pb-2 flex flex-col items-center justify-center">
          <div className="w-14 h-3.5 border-2 border-dashed border-slate-400/80 rounded-full flex items-center justify-center bg-slate-100/30">
            <span className="text-[7px] uppercase font-mono tracking-widest text-slate-400">
              PUNCH
            </span>
          </div>
        </div>
      )}

      {/* Card Header: Organization Name & Verified Badge */}
      <div className={`pb-3 border-b ${cardHeaderBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {settings.organizationName ? settings.organizationName.charAt(0) : 'S'}
          </div>
          <div>
            <span className="text-xs font-black tracking-wider uppercase block leading-none text-indigo-400 dark:text-indigo-300">
              {settings.organizationName || 'StaffSync'}
            </span>
            <span className={`text-[9px] uppercase tracking-widest font-semibold block mt-0.5 ${textSubtleClass}`}>
              Staff Identity Pass
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          <span>Valid</span>
        </div>
      </div>

      {/* Photo & Staff Identity Block */}
      <div className="py-3 flex flex-col items-center text-center">
        {/* Photo Portrait */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-md bg-slate-800 shrink-0 mb-2.5">
          {staff.avatarUrl ? (
            <img
              src={staff.avatarUrl}
              alt={staff.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300">
              <User className="w-10 h-10" />
              <span className="text-[8px] uppercase font-mono mt-0.5">Staff</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Staff Full Name */}
        <h3 className="text-lg font-black tracking-tight leading-snug line-clamp-1">
          {staff.fullName}
        </h3>

        {/* Position / Title */}
        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-indigo-400 dark:text-indigo-300 mt-0.5">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{staff.position}</span>
        </div>

        {/* Department Badge */}
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-medium">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dept?.color || '#0284c7' }}
          />
          <span className={textMutedClass}>{dept?.name || 'Department'}</span>
          <span className="font-mono text-slate-400">({dept?.code || 'GEN'})</span>
        </div>
      </div>

      {/* PROMINENT STAFF FULL ID BANNER */}
      <div className={`py-1.5 px-3 rounded-xl text-center mb-2.5 ${staffIdBannerClass}`}>
        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-indigo-500 dark:text-indigo-300">
          Official Staff ID
        </span>
        <span className="font-mono font-black text-base sm:text-lg tracking-widest">
          {staff.staffId}
        </span>
      </div>

      {/* ATTENDANCE BARCODE CONTAINER (REPLACING QR CODE) */}
      <div className="bg-white rounded-2xl p-3 shadow-md text-slate-900 border border-slate-200">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>Barcode Attendance Pass</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Clock In / Out
          </span>
        </div>

        {/* High-Resolution Code 39 Barcode */}
        <div className="py-1 flex flex-col items-center justify-center">
          <div
            className="w-full flex justify-center text-slate-900"
            dangerouslySetInnerHTML={{ __html: portraitBarcodeSvg }}
          />
        </div>

        <p className="text-[9px] text-center text-slate-500 mt-1 font-medium">
          Scan with handheld USB laser gun or kiosk terminal reader
        </p>
      </div>

      {/* Footer Details: Shift & Validity */}
      <div className={`mt-3 pt-2 border-t ${cardHeaderBorder} flex items-center justify-between text-[10px] font-mono ${textSubtleClass}`}>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{shift?.name || 'Standard Shift'}</span>
        </div>
        <div>
          <span>Issue: {new Date(staff.joinedDate).getFullYear()}</span>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------ */
  /* FRONT OF ID CARD: LANDSCAPE (HORIZONTAL WALLET BADGE)  */
  /* Standard 85.6mm x 54mm CR80 format                     */
  /* ------------------------------------------------------ */
  const renderLandscapeFront = () => (
    <div
      className={`id-card-element relative w-[510px] rounded-3xl p-5 overflow-hidden flex flex-col justify-between transition-all ${cardBgClass}`}
      style={{
        minHeight: '320px',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-indigo-500 via-sky-400 to-emerald-400" />

      {/* Card Header: Brand, Title, and Prominent Staff ID */}
      <div className={`pb-2.5 border-b ${cardHeaderBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {settings.organizationName ? settings.organizationName.charAt(0) : 'S'}
          </div>
          <div>
            <span className="text-xs font-black tracking-wider uppercase block leading-none text-indigo-400 dark:text-indigo-300">
              {settings.organizationName || 'StaffSync'}
            </span>
            <span className={`text-[9px] uppercase tracking-widest font-semibold block mt-0.5 ${textSubtleClass}`}>
              Staff Barcode ID Pass
            </span>
          </div>
        </div>

        {/* STAFF ID BADGE ON TOP RIGHT */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs tracking-wider ${staffIdBannerClass}`}>
            STAFF ID: {staff.staffId}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Photo & Info on Left, Large Scannable Barcode on Right */}
      <div className="grid grid-cols-12 gap-4 py-2.5 items-center">
        {/* Photo */}
        <div className="col-span-3 flex justify-center">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-md bg-slate-800 shrink-0">
            {staff.avatarUrl ? (
              <img
                src={staff.avatarUrl}
                alt={staff.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300">
                <User className="w-10 h-10" />
                <span className="text-[8px] uppercase font-mono mt-0.5">Staff</span>
              </div>
            )}
          </div>
        </div>

        {/* Staff Details */}
        <div className="col-span-4 space-y-1">
          <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-1">
            {staff.fullName}
          </h3>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 dark:text-indigo-300">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{staff.position}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs pt-0.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={textMutedClass}>{dept?.name || 'Department'}</span>
            <span className="font-mono text-slate-400">({dept?.code || 'GEN'})</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{shift?.name || 'Shift'} ({shift?.startTime}-{shift?.endTime})</span>
          </div>
        </div>

        {/* Dedicated Barcode Attendance Box on Right */}
        <div className="col-span-5 flex justify-end">
          <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 text-slate-900 flex flex-col items-center text-center w-full">
            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Barcode Pass</span>
            </div>
            
            <div
              className="w-full flex justify-center text-slate-900"
              dangerouslySetInnerHTML={{ __html: landscapeBarcodeSvg }}
            />

            <span className="text-[8px] text-slate-500 font-medium mt-1">
              Scan barcode to clock in & out
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`pt-2 border-t ${cardHeaderBorder} flex items-center justify-between text-[10px] font-mono ${textSubtleClass}`}>
        <span>Joined: {new Date(staff.joinedDate).toLocaleDateString()}</span>
        <span>Standard Code 39 Barcode</span>
        <span className="text-emerald-500 font-semibold">Authorized Personnel</span>
      </div>
    </div>
  );

  /* ---------------------------------------------------- */
  /* BACK OF ID CARD: TERMS, RETURN INFO, SIGNATURE       */
  /* ---------------------------------------------------- */
  const renderCardBack = (isPortrait = true) => (
    <div
      className={`id-card-element relative ${
        isPortrait ? 'w-[340px] min-h-[520px]' : 'w-[510px] min-h-[320px]'
      } rounded-3xl p-5 overflow-hidden flex flex-col justify-between transition-all ${cardBgClass}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Magnetic Stripe simulation */}
      <div className="-mx-5 -mt-5 mb-4 h-10 bg-slate-950 border-b border-white/20 flex items-center justify-center">
        <span className="text-[9px] font-mono tracking-widest text-slate-500">
          BARCODE & MAGNETIC IDENTIFICATION TRACK
        </span>
      </div>

      <div className="space-y-3 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block text-indigo-400">
            Terms & Conditions of Use
          </span>
          <p className={`text-[10px] leading-relaxed mt-1 ${textMutedClass}`}>
            This barcode card is the property of <strong>{settings.organizationName || 'StaffSync'}</strong> and is issued for employee identification and attendance recording. It is strictly non-transferable and must be presented when scanning in or out.
          </p>
        </div>

        <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'} text-[10px] space-y-1`}>
          <div className="font-bold text-indigo-400">If Found, Please Return To:</div>
          <div className={textMutedClass}>
            {settings.organizationName || 'StaffSync'} • Human Resources Department
          </div>
          <div className="flex items-center gap-3 pt-1 text-[9px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> (555) 019-8422
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-2.5 h-2.5" /> hr@company.com
            </span>
          </div>
        </div>

        {/* Signature Line */}
        <div className="pt-2">
          <div className={`border-b border-dashed ${isLight ? 'border-slate-400' : 'border-slate-500'} h-8 mb-1`} />
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>Authorized Signature</span>
            <span>Cardholder Signature</span>
          </div>
        </div>
      </div>

      {/* Back Footer */}
      <div className={`pt-2 border-t ${cardHeaderBorder} flex items-center justify-between text-[9px] font-mono ${textSubtleClass}`}>
        <span>ID: {staff.staffId}</span>
        <span>REF: {staff.id.slice(0, 8)}</span>
        <span>ISO / IEC 7810 ID-1</span>
      </div>
    </div>
  );

  const modalContent = (
    <div className="id-badge-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="id-badge-modal-window bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="id-badge-modal-header px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Staff Barcode ID Badge
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {staff.staffId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready for physical card printing with scannable Code 39 laser barcode and Full Staff ID
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Toolbar (Hidden in Print) */}
        <div className="id-badge-modal-controls px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Selector */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                orientation === 'portrait'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vertical Badge
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                orientation === 'landscape'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Horizontal Card
            </button>
            <button
              type="button"
              onClick={() => setOrientation('double')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                orientation === 'double'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Double-Sided (Fold)
            </button>
          </div>

          {/* Theme Selector & Toggles */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBadgeTheme('navy')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  badgeTheme === 'navy'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Executive Navy"
              >
                Navy
              </button>
              <button
                type="button"
                onClick={() => setBadgeTheme('light')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  badgeTheme === 'light'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-300'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Ink Saver White Background"
              >
                Ink Saver
              </button>
              <button
                type="button"
                onClick={() => setBadgeTheme('dark')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  badgeTheme === 'dark'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Midnight Dark"
              >
                Dark
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] font-medium flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Cut Guides
              </span>
            </label>
          </div>
        </div>

        {/* Modal Printable Workspace */}
        <div className="p-6 overflow-x-auto flex justify-center bg-slate-100/60 dark:bg-slate-950/40">
          <div className="id-card-print-canvas flex flex-col items-center justify-center">
            
            {/* Cut guide frame */}
            <div className={`relative p-3 ${showCutGuides ? 'border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl' : ''}`}>
              
              {/* Corner crosshair trim marks for physical cutting */}
              {showCutGuides && (
                <>
                  <span className="absolute -top-2 -left-2 text-slate-400 font-mono text-xs">+</span>
                  <span className="absolute -top-2 -right-2 text-slate-400 font-mono text-xs">+</span>
                  <span className="absolute -bottom-2 -left-2 text-slate-400 font-mono text-xs">+</span>
                  <span className="absolute -bottom-2 -right-2 text-slate-400 font-mono text-xs">+</span>
                </>
              )}

              {/* CARD RENDER BY ORIENTATION */}
              {orientation === 'portrait' && renderPortraitFront()}

              {orientation === 'landscape' && renderLandscapeFront()}

              {orientation === 'double' && (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 text-center no-print">
                      Front Side
                    </span>
                    {renderPortraitFront()}
                  </div>

                  <div className="hidden sm:flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                    <div className="w-px h-64 border-l-2 border-dashed border-slate-300 dark:border-slate-700 my-2" />
                    <span className="text-[9px] uppercase tracking-widest text-slate-400">
                      FOLD LINE
                    </span>
                    <div className="w-px h-64 border-l-2 border-dashed border-slate-300 dark:border-slate-700 my-2" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 text-center no-print">
                      Back Side
                    </span>
                    {renderCardBack(true)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Instructions & USB Barcode Compatibility (Hidden in Print) */}
        <div className="id-badge-instructions px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Contains <strong>Full Staff ID ({staff.staffId})</strong> and standard <strong>Code 39 Linear Barcode</strong> compatible with handheld USB laser guns and terminal scanners.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyId}
              className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium transition-colors"
            >
              {isCopied ? 'Staff ID Copied!' : 'Copy Staff ID'}
            </button>
          </div>
        </div>

        {/* Action Buttons (Hidden in Print) */}
        <div className="id-badge-modal-footer px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Print on cardstock (CR80 3.375" × 2.125") or standard letter/A4
          </span>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownloadBarcode}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Barcode</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Badge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
