import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Car, 
  Printer, 
  FileDown, 
  Image as ImageIcon, 
  PlusCircle, 
  CheckCircle2, 
  RotateCcw, 
  FolderDown, 
  FolderUp, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Search,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { VehicleRegistration } from './types';
import { sampleRegistrations, defaultNewRegistration } from './data/mockTemplates';
import { RegistrationFormA4, FormTheme } from './components/RegistrationFormA4';
import { RegistrationInputForm } from './components/RegistrationInputForm';
import { VehicleRegistryTable } from './components/VehicleRegistryTable';
import { Header } from './components/Header';
import { exportToA4PDF, exportToImage, printDocument } from './utils/pdfExport';

const STORAGE_KEY = 'vehicle_registrations_db_v1';

export default function App() {
  const [records, setRecords] = useState<VehicleRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load records from storage', e);
    }
    return sampleRegistrations;
  });

  const [currentRecord, setCurrentRecord] = useState<VehicleRegistration>(() => {
    return records[0] || sampleRegistrations[0];
  });

  const [activeView, setActiveView] = useState<'preview' | 'form' | 'registry'>('preview');
  const [formTheme, setFormTheme] = useState<FormTheme>('classic');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStep, setExportStep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [records]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handler for creating a new vehicle registration
  const handleNewRecord = () => {
    const newRegNum = `TRQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomPlate = Math.floor(10000 + Math.random() * 90000).toString();
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 'ش', 'ت'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];

    const fresh: VehicleRegistration = {
      ...defaultNewRegistration,
      id: `reg-${Date.now()}`,
      registrationNumber: newRegNum,
      plateNumber: randomPlate,
      plateLetter: randomLetter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentRecord(fresh);
    setIsEditing(false);
    setActiveView('form');
    showToast('تم فتح استمارة ترقيم جديدة جاهزة للتعبئة');
  };

  // Save current record to state & database
  const handleSaveRecord = () => {
    if (!currentRecord.plateNumber) {
      alert('يرجى كتابة رقم اللوحة / الترقيم');
      return;
    }

    const recordToSave: VehicleRegistration = {
      ...currentRecord,
      id: currentRecord.id || `reg-${Date.now()}`,
      registrationNumber: currentRecord.registrationNumber || `TRQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      updatedAt: new Date().toISOString(),
    };

    const existsIndex = records.findIndex((r) => r.id === recordToSave.id);
    let updatedList: VehicleRegistration[];
    if (existsIndex >= 0) {
      updatedList = [...records];
      updatedList[existsIndex] = recordToSave;
      showToast(`تم تحديث استمارة المركبة رقم (${recordToSave.plateNumber} ${recordToSave.plateLetter})`);
    } else {
      updatedList = [recordToSave, ...records];
      showToast(`تم حفظ وترقيم المركبة بنجاح (${recordToSave.plateNumber} ${recordToSave.plateLetter})`);
    }

    setRecords(updatedList);
    setCurrentRecord(recordToSave);
    setActiveView('preview');
  };

  const handleEditRecord = (record: VehicleRegistration) => {
    setCurrentRecord(record);
    setIsEditing(true);
    setActiveView('form');
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    if (currentRecord.id === id) {
      setCurrentRecord(updated[0] || defaultNewRegistration);
    }
    showToast('تم حذف السجل من الأرشيف بنجاح');
  };

  const handleSelectRecord = (record: VehicleRegistration) => {
    setCurrentRecord(record);
    setActiveView('preview');
  };

  // PDF Export
  const handleExportPDF = async (targetRecord?: VehicleRegistration) => {
    const record = targetRecord || currentRecord;
    if (targetRecord && targetRecord.id !== currentRecord.id) {
      setCurrentRecord(targetRecord);
    }

    setIsExporting(true);
    const filename = `استمارة_ترقيم_مركبة_${record.plateNumber}_${record.plateLetter || ''}_${record.governorate}`.replace(/\s+/g, '_');

    try {
      await exportToA4PDF({
        elementId: 'registration-a4-document',
        filename,
        onProgress: (step) => setExportStep(step),
      });
      showToast('تم تصدير وتحميل استمارة PDF (A4) بنجاح');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تصدير ملف PDF، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Image Export
  const handleExportImage = async (targetRecord?: VehicleRegistration) => {
    const record = targetRecord || currentRecord;
    if (targetRecord && targetRecord.id !== currentRecord.id) {
      setCurrentRecord(targetRecord);
    }

    setIsExporting(true);
    const filename = `استمارة_ترقيم_مركبة_صورة_${record.plateNumber}_${record.plateLetter || ''}_${record.governorate}`.replace(/\s+/g, '_');

    try {
      await exportToImage({
        elementId: 'registration-a4-document',
        filename,
        onProgress: (step) => setExportStep(step),
      });
      showToast('تم تصدير وتحميل استمارة A4 كصورة عالية الدقة PNG');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تصدير الصورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Direct Print
  const handlePrint = () => {
    setActiveView('preview');
    setTimeout(() => {
      printDocument();
    }, 100);
  };

  // Reset current form
  const handleResetForm = () => {
    if (confirm('هل تريد إعادة تعيين حقول الاستمارة الحالية؟')) {
      setCurrentRecord({
        ...defaultNewRegistration,
        id: `reg-${Date.now()}`,
        registrationNumber: `TRQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      });
      showToast('تمت إعادة تعيين حقول الاستمارة');
    }
  };

  // Backup data as JSON
  const handleBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(records, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `نسخة_احتياطية_سجل_المركبات_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تنزيل النسخة الاحتياطية بنجاح');
  };

  // Restore data from JSON
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
          setCurrentRecord(parsed[0]);
          showToast(`تم استعادة ${parsed.length} سجل بنجاح`);
        } else {
          alert('الملف المحدد غير صالح أو فارغ');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSamples = () => {
    setRecords(sampleRegistrations);
    setCurrentRecord(sampleRegistrations[0]);
    showToast('تم تحميل البيانات والقوالب التجريبية بنجاح');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Main Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onPrint={handlePrint}
        onExportPDF={() => handleExportPDF()}
        onExportImage={() => handleExportImage()}
        onNewRecord={handleNewRecord}
        onBackup={handleBackup}
        onRestore={handleRestoreClick}
        isExporting={isExporting}
        exportStep={exportStep}
        totalRecordsCount={records.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View 1: A4 Document Preview & Studio */}
        {activeView === 'preview' && (
          <div className="space-y-4">
            {/* Control Strip for Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    معاينة استمارة الترقيم الرسمية (A4)
                  </h2>
                  <p className="text-xs text-slate-500">
                    المركبة: <span className="font-bold text-slate-800">{currentRecord.make} {currentRecord.model}</span> • 
                    اللوحة: <span className="font-bold font-mono text-blue-900">{currentRecord.plateNumber} {currentRecord.plateLetter}</span> • 
                    المحافظة: <span className="font-bold text-slate-800">{currentRecord.governorate}</span>
                  </p>
                </div>
              </div>

              {/* Theme Picker & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Plate Type Quick Switcher (خصوصي vs نقل) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-bold">
                  <span className="text-[11px] text-slate-400 px-1.5 hidden sm:inline">نوع الترقيم:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...currentRecord,
                        plateCategory: 'private' as const,
                        plateLetter: 'خصوصي',
                      };
                      setCurrentRecord(updated);
                      // Update records array too
                      setRecords(records.map(r => r.id === updated.id ? updated : r));
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      currentRecord.plateCategory === 'private' || currentRecord.plateLetter === 'خصوصي'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>🔵 خصوصي</span>
                    <span className="text-[9.5px] opacity-80">(أزرق)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...currentRecord,
                        plateCategory: 'commercial' as const,
                        plateLetter: 'نقل',
                      };
                      setCurrentRecord(updated);
                      // Update records array too
                      setRecords(records.map(r => r.id === updated.id ? updated : r));
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      currentRecord.plateCategory === 'commercial' || currentRecord.plateLetter === 'نقل'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>🔴 نقل</span>
                    <span className="text-[9.5px] opacity-80">(أحمر)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleEditRecord(currentRecord)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  تعديل البيانات
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  طباعة مباشرة
                </button>

                <button
                  type="button"
                  onClick={() => handleExportImage()}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  حفظ صورة A4
                </button>

                <button
                  type="button"
                  onClick={() => handleExportPDF()}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  تصدير PDF (A4)
                </button>
              </div>
            </div>

            {/* Render Printable A4 Sheet */}
            <RegistrationFormA4 data={currentRecord} theme={formTheme} />
          </div>
        )}

        {/* View 2: Data Entry & Edit Form */}
        {activeView === 'form' && (
          <div className="space-y-4">
            <RegistrationInputForm
              currentData={currentRecord}
              onChange={setCurrentRecord}
              onSave={handleSaveRecord}
              onReset={handleResetForm}
              isEditing={isEditing}
            />
          </div>
        )}

        {/* View 3: Records Registry & Table */}
        {activeView === 'registry' && (
          <div className="space-y-4">
            <VehicleRegistryTable
              records={records}
              onSelectRecord={handleSelectRecord}
              onEditRecord={handleEditRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddNew={handleNewRecord}
              onQuickExportPDF={handleExportPDF}
              onQuickExportImage={handleExportImage}
              onLoadSamples={handleLoadSamples}
            />

            {/* Backup / Restore Strip */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>يتم حفظ جميع البيانات محلياً على جهازك بأمان مع إمكانية التصدير والاستيراد.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackup}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  <FolderDown className="w-4 h-4" />
                  تصدير نسخة احتياطية (JSON)
                </button>
                <button
                  type="button"
                  onClick={handleRestoreClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  <FolderUp className="w-4 h-4" />
                  استيراد نسخة سابقة
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} نظام ترقيم وتسجيل المركبات - استمارة رسمية قياس A4 قابلة للطباعة والتصدير</p>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <span>تنسيق PDF: A4 Portrait</span>
            <span>•</span>
            <span>دقة التصدير: High-Definition 300DPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
