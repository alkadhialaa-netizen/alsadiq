import React from 'react';
import { 
  ShieldCheck, 
  Car, 
  Printer, 
  FileDown, 
  Image as ImageIcon, 
  PlusCircle, 
  ListOrdered, 
  FolderDown, 
  FolderUp, 
  RefreshCw 
} from 'lucide-react';
import { VehicleRegistration } from '../types';

interface HeaderProps {
  activeView: 'preview' | 'form' | 'registry';
  setActiveView: (view: 'preview' | 'form' | 'registry') => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onExportImage: () => void;
  onNewRecord: () => void;
  onBackup: () => void;
  onRestore: () => void;
  isExporting: boolean;
  exportStep: string;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onPrint,
  onExportPDF,
  onExportImage,
  onNewRecord,
  onBackup,
  onRestore,
  isExporting,
  exportStep,
  totalRecordsCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  نظام ترقيم وتسجيل المركبات
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  A4 استمارة رسمية
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                إصدار وتوثيق استمارات اللوحات وترقيم السيارات مع تصدير PDF وصورة قابلة للطباعة
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              معاينة وطباعة الاستمارة
            </button>

            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === 'form'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              إدخال وبيانات الترقيم
            </button>

            <button
              type="button"
              onClick={() => setActiveView('registry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === 'registry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              الأرشيف السجلات ({totalRecordsCount})
            </button>
          </div>

          {/* Export & Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Print */}
            <button
              type="button"
              onClick={onPrint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="طباعة الاستمارة مباشرة عبر الطابعة"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              طباعة فورية
            </button>

            {/* Export High-Res Image */}
            <button
              type="button"
              onClick={onExportImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="تصدير الاستمارة كصورة عالية الدقة PNG"
            >
              <ImageIcon className="w-4 h-4 text-purple-400" />
              حفظ كصورة A4
            </button>

            {/* Export Official PDF */}
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              title="تنزيل استمارة ترقيم بصيغة PDF قياس A4"
            >
              <FileDown className="w-4 h-4" />
              تصدير PDF (A4)
            </button>

            {/* New Button */}
            <button
              type="button"
              onClick={onNewRecord}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              ترقيم جديد
            </button>
          </div>
        </div>

        {/* Progress Alert Bar when exporting */}
        {isExporting && (
          <div className="pb-2.5 pt-1">
            <div className="bg-blue-900/60 border border-blue-500/40 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>{exportStep || 'جاري معالجة استمارة الترقيم وتجهيز الملف...'}</span>
              </div>
              <span className="text-[10px] text-blue-300 font-mono">210mm x 297mm (A4)</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
