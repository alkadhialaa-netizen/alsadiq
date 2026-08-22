import React, { useState } from 'react';
import { 
  Car, 
  Hash, 
  User, 
  CreditCard, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Check, 
  Calendar, 
  MapPin, 
  Layers, 
  Fuel, 
  Building2, 
  FileText,
  Camera,
  Upload,
  UserCheck,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Printer,
  FileDown,
  ShieldCheck,
  BadgeCheck,
  Info,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { VehicleRegistration, PlateCategory, VehicleType, FuelType, GuarantorInfo, UserAccount } from '../types';
import { PlateVisualizer } from './PlateVisualizer';
import { AiCaptureModal, ScanType } from './AiCaptureModal';

interface NewRegistrationPageProps {
  currentData: VehicleRegistration;
  onChange: (updated: VehicleRegistration) => void;
  onSaveAndPreview: (record?: VehicleRegistration) => void;
  onSaveAndPrint?: (record?: VehicleRegistration) => void;
  onSaveAndExportPDF?: (record?: VehicleRegistration) => void;
  onResetToNew: () => void;
  currentUser: UserAccount | null;
}

export const NewRegistrationPage: React.FC<NewRegistrationPageProps> = ({
  currentData,
  onChange,
  onSaveAndPreview,
  onSaveAndPrint,
  onSaveAndExportPDF,
  onResetToNew,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // AI Scanner Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentScanType, setCurrentScanType] = useState<ScanType>('owner-id');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalSubtitle, setModalSubtitle] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateField = <K extends keyof VehicleRegistration>(field: K, value: VehicleRegistration[K]) => {
    onChange({
      ...currentData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateGuarantor = (guarantorKey: 'guarantor1' | 'guarantor2', field: keyof GuarantorInfo, value: string) => {
    const current = currentData[guarantorKey] || {
      fullName: '',
      nationalId: '',
      phone: '',
      address: '',
      relationship: '',
    };

    onChange({
      ...currentData,
      [guarantorKey]: {
        ...current,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const openScanner = (type: ScanType, title: string, subtitle: string) => {
    setCurrentScanType(type);
    setModalTitle(title);
    setModalSubtitle(subtitle);
    setIsModalOpen(true);
  };

  const handleAiExtractionSuccess = (extracted: any, imageBase64: string) => {
    if (currentScanType === 'owner-id') {
      onChange({
        ...currentData,
        ownerFullName: extracted.ownerFullName || currentData.ownerFullName,
        ownerNationalId: extracted.ownerNationalId || currentData.ownerNationalId,
        ownerAddress: extracted.ownerAddress || currentData.ownerAddress,
        ownerBloodType: extracted.ownerBloodType || currentData.ownerBloodType,
        ownerBirthDate: extracted.ownerBirthDate || currentData.ownerBirthDate,
        ownerIdIssuePlace: extracted.ownerIdIssuePlace || currentData.ownerIdIssuePlace,
        ownerIdCardPhoto: imageBase64 || currentData.ownerIdCardPhoto,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات البطاقة الشخصية وحفظ الصورة بنجاح');
    } else if (currentScanType === 'customs') {
      onChange({
        ...currentData,
        customsDeclarationNumber: extracted.customsDeclarationNumber || currentData.customsDeclarationNumber,
        vinNumber: extracted.vinNumber || currentData.vinNumber,
        engineNumber: extracted.engineNumber || currentData.engineNumber,
        make: extracted.make || currentData.make,
        model: extracted.model || currentData.model,
        year: extracted.year || currentData.year,
        color: extracted.color || currentData.color,
        customsIssuingOffice: extracted.customsIssuingOffice || currentData.customsIssuingOffice,
        vehicleCustomsPhoto: imageBase64 || currentData.vehicleCustomsPhoto,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات البيان الجمركي والمركبة بنجاح');
    } else if (currentScanType === 'guarantor-1') {
      onChange({
        ...currentData,
        guarantor1: {
          fullName: extracted.ownerFullName || currentData.guarantor1?.fullName || '',
          nationalId: extracted.ownerNationalId || currentData.guarantor1?.nationalId || '',
          phone: currentData.guarantor1?.phone || '',
          address: extracted.ownerAddress || currentData.guarantor1?.address || '',
          relationship: currentData.guarantor1?.relationship || 'معرّف وضامن',
          idCardPhoto: imageBase64 || currentData.guarantor1?.idCardPhoto,
        },
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المعرف وضبطها بنجاح');
    }
  };

  const steps = [
    { id: 1, title: 'اللوحة ونوع الترقيم', desc: 'تحديد الصنف ورقم اللوحة' },
    { id: 2, title: 'بيانات مالك المركبة', desc: 'الاسم والهوية والتواصل' },
    { id: 3, title: 'مواصفات المركبة والجمارك', desc: 'الشاصي والمحرك والبيان' },
    { id: 4, title: 'المعرفين والشهود', desc: 'الضامن الأول والثاني' },
    { id: 5, title: 'الفحص والرسوم والاعتماد', desc: 'التقرير والرسوم والتوقيع' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* AI Extraction Modal */}
      <AiCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExtractionSuccess={handleAiExtractionSuccess}
        scanType={currentScanType}
        title={modalTitle}
        subtitle={modalSubtitle}
      />

      {/* Top Officer & Committee Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-blue-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  معاملة ترقيم جديدة
                </span>
                <span className="text-xs text-slate-300">
                  الجمهورية اليمنية • وزارة الداخلية
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                الإدارة العامة للمرور تعز - لجنة ترقيم الجمارك
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <strong className="text-white">رئيس اللجنة:</strong> المقدم / صادق القاضي
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-200">رقم المعاملة:</strong>{' '}
                  <span className="font-mono font-bold text-sky-300">{currentData.registrationNumber}</span>
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-200">التاريخ:</strong>{' '}
                  <span className="font-mono text-slate-300">{currentData.issueDate || '2026/7/7'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Top Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
            <button
              type="button"
              onClick={onResetToNew}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
              title="تفريغ الحقول وبدء معاملة جديدة"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>إفراغ وبدء جديد</span>
            </button>

            <button
              type="button"
              onClick={() => onSaveAndPreview(currentData)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وعرض استمارة A4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-right transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isCompleted
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold truncate">{step.title}</p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: Form Step Inputs */}
        <div className="lg:col-span-8 space-y-6">

          {/* ================= STEP 1: اللوحة ونوع الترقيم ================= */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">بيانات اللوحة وتحديد صنف الترقيم الجمركي</h3>
                    <p className="text-xs text-slate-500">اختر نوع اللوحة (خصوصي / نقل) وأدخل رقم اللوحة والحرف يدوياً</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  خطوة 1 من 5
                </span>
              </div>

              {/* 1. Category Switcher */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  نوع الترقيم الجمركي (لون الاستمارة وشكل اللوحة):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Private (Blue) */}
                  <button
                    type="button"
                    onClick={() => updateField('plateCategory', 'private')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      currentData.plateCategory === 'private'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="w-8 h-4 bg-blue-600 rounded-xs mb-1.5 shadow-xs flex items-center justify-center text-[7px] text-white font-bold">
                      خصوصي
                    </div>
                    <span className="text-xs font-bold">خصوصي</span>
                    <span className="text-[10px] text-blue-600 font-medium">استمارة زرقاء</span>
                  </button>

                  {/* Commercial / Transport (Red) */}
                  <button
                    type="button"
                    onClick={() => updateField('plateCategory', 'commercial')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      currentData.plateCategory === 'commercial'
                        ? 'border-red-600 bg-red-50/80 text-red-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="w-8 h-4 bg-red-600 rounded-xs mb-1.5 shadow-xs flex items-center justify-center text-[7px] text-white font-bold">
                      نقل
                    </div>
                    <span className="text-xs font-bold">نقل</span>
                    <span className="text-[10px] text-red-600 font-medium">استمارة حمراء</span>
                  </button>

                  {/* Taxi (Orange/Yellow) */}
                  <button
                    type="button"
                    onClick={() => updateField('plateCategory', 'taxi')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      currentData.plateCategory === 'taxi'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="w-8 h-4 bg-amber-500 rounded-xs mb-1.5 shadow-xs flex items-center justify-center text-[7px] text-white font-bold">
                      أجرة
                    </div>
                    <span className="text-xs font-bold">أجرة</span>
                    <span className="text-[10px] text-amber-600 font-medium">استمارة برتقالية</span>
                  </button>

                  {/* Government (White/Black) */}
                  <button
                    type="button"
                    onClick={() => updateField('plateCategory', 'government')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      currentData.plateCategory === 'government'
                        ? 'border-slate-800 bg-slate-100 text-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="w-8 h-4 bg-slate-800 rounded-xs mb-1.5 shadow-xs flex items-center justify-center text-[7px] text-white font-bold">
                      حكومي
                    </div>
                    <span className="text-xs font-bold">حكومي</span>
                    <span className="text-[10px] text-slate-600 font-medium">استمارة رسمية</span>
                  </button>
                </div>
              </div>

              {/* 2. Plate Input Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم اللوحة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentData.plateNumber}
                    onChange={(e) => updateField('plateNumber', e.target.value)}
                    placeholder="مثال: 68742"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-lg font-black font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حرف اللوحة / البادئة
                  </label>
                  <input
                    type="text"
                    value={currentData.plateLetter}
                    onChange={(e) => updateField('plateLetter', e.target.value)}
                    placeholder="مثال: د أو أ أو نقل"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-lg font-black focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم المحافظة / الرمز
                  </label>
                  <input
                    type="text"
                    value={currentData.platePrefix || '4'}
                    onChange={(e) => updateField('platePrefix', e.target.value)}
                    placeholder="مثال: 4 (تعز)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-base font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Form & Registration Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الاستمارة</label>
                  <input
                    type="text"
                    value={currentData.formNumber || 'C2006'}
                    onChange={(e) => updateField('formNumber', e.target.value)}
                    placeholder="مثال: C2006"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإصدار</label>
                  <input
                    type="text"
                    value={currentData.issueDate || '2026/7/7'}
                    onChange={(e) => updateField('issueDate', e.target.value)}
                    placeholder="2026/7/7"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة / الإدارة</label>
                  <input
                    type="text"
                    value={currentData.governorate || 'تعز'}
                    onChange={(e) => updateField('governorate', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Next Step Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <span>التالي: بيانات مالك المركبة</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: بيانات المالك ================= */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">بيانات مالك المركبة والتوثيق</h3>
                    <p className="text-xs text-slate-500">الاسم الرباعي، رقم الهوية الوطنية، ومحل الإقامة ورقم الهاتف</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openScanner('owner-id', 'مسح وقراءة البطاقة الشخصية', 'التقط أو ارفع صورة البطاقة لاستخراج الاسم والرقم الوطني تلقائياً')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>مسح البطاقة بالذكاء الاصطناعي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المالك الرباعي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentData.ownerFullName}
                    onChange={(e) => updateField('ownerFullName', e.target.value)}
                    placeholder="مثال: يحيى علي غالب القاسمي"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الرقم الوطني / رقم الهوية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentData.ownerNationalId}
                    onChange={(e) => updateField('ownerNationalId', e.target.value)}
                    placeholder="مثال: 01010048291"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف / الجوال
                  </label>
                  <input
                    type="text"
                    value={currentData.ownerPhone}
                    onChange={(e) => updateField('ownerPhone', e.target.value)}
                    placeholder="مثال: 777123456"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان ومحل الإقامة
                  </label>
                  <input
                    type="text"
                    value={currentData.ownerAddress}
                    onChange={(e) => updateField('ownerAddress', e.target.value)}
                    placeholder="مثال: تعز - صالة - حي الجمهوري"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">فصيلة الدم</label>
                  <select
                    value={currentData.ownerBloodType || 'O+'}
                    onChange={(e) => updateField('ownerBloodType', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مكان وتاريخ إصدار الهوية</label>
                  <input
                    type="text"
                    value={currentData.ownerIdIssuePlace || 'تعز'}
                    onChange={(e) => updateField('ownerIdIssuePlace', e.target.value)}
                    placeholder="مثال: الأحوال المدنية - تعز"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: اللوحة والترقيم</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <span>التالي: بيانات المركبة والجمارك</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: مواصفات المركبة والبيان الجمركي ================= */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">مواصفات المركبة والبيان الجمركي وصورة اللوحة</h3>
                    <p className="text-xs text-slate-500">أرقام الشاصي والمحرك، بيانات الجمرك، وصورة لوحة السيارة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openScanner('customs', 'مسح وقراءة البيان الجمركي', 'التقط أو ارفع صورة وثيقة الجمارك لملء رقم البيان والشاصي والمحرك تلقائياً')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>مسح البيان الجمركي بالـ AI</span>
                </button>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الشركة الصانعة / الماركة</label>
                  <input
                    type="text"
                    value={currentData.make}
                    onChange={(e) => updateField('make', e.target.value)}
                    placeholder="مثال: هيونداي، تويوتا"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الطراز / الموديل</label>
                  <input
                    type="text"
                    value={currentData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="مثال: سوناتا، كامري، توسان"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سنة الصنع (الموديل)</label>
                  <input
                    type="number"
                    value={currentData.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value) || 2020)}
                    placeholder="2016"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللون الرئيسي</label>
                  <input
                    type="text"
                    value={currentData.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    placeholder="مثال: فضي، أبيض، أسود"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الوقود</label>
                  <select
                    value={currentData.fuelType}
                    onChange={(e) => updateField('fuelType', e.target.value as FuelType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="petrol">بترول (بنزين)</option>
                    <option value="diesel">ديزل</option>
                    <option value="hybrid">هجين (هايبرد)</option>
                    <option value="electric">كهربائي</option>
                    <option value="gas">غاز</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعة المحرك (CC)</label>
                  <input
                    type="text"
                    value={currentData.engineCapacity || '2000 CC'}
                    onChange={(e) => updateField('engineCapacity', e.target.value)}
                    placeholder="مثال: 2000 CC"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* VIN & Engine Numbers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black text-slate-800">
                        رقم الشاصي / القاعدة (VIN) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => openScanner('customs', 'مسح وقراءة رقم الشاصي (VIN)', 'وجه الكاميرا نحو رقم الشاصي المحفور أو الملصق')}
                        className="text-[10.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>مسح الشاصي</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={currentData.vinNumber}
                      onChange={(e) => updateField('vinNumber', e.target.value.toUpperCase())}
                      placeholder="17 حرف ورقم (مثال: KMHD84LF7HA123456)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      رقم المحرك (Engine No) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentData.engineNumber}
                      onChange={(e) => updateField('engineNumber', e.target.value.toUpperCase())}
                      placeholder="مثال: G4NA-FU94821"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Customs Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم البيان الجمركي
                    </label>
                    <input
                      type="text"
                      value={currentData.customsDeclarationNumber || ''}
                      onChange={(e) => updateField('customsDeclarationNumber', e.target.value)}
                      placeholder="مثال: 948271-TZ"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      منفذ / جمرك التخليص
                    </label>
                    <input
                      type="text"
                      value={currentData.customsIssuingOffice || 'جمرك تعز'}
                      onChange={(e) => updateField('customsIssuingOffice', e.target.value)}
                      placeholder="مثال: جمرك تعز / ميناء عدن"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Plate Photo Attachment */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">صورة لوحة المركبة الملتقطة</h4>
                    <p className="text-[11px] text-slate-500">التقاط أو إرفاق صورة اللوحة المركبة على السيارة للمطابقة</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentData.vehiclePlatePhoto && (
                    <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-300">
                      <img src={currentData.vehiclePlatePhoto} alt="Plate preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>التقاط / رفع صورة اللوحة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateField('vehiclePlatePhoto', reader.result as string);
                            showToast('تم إرفاق صورة لوحة المركبة بنجاح');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: بيانات المالك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <span>التالي: المعرفين والشهود</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: المعرفين والشهود ================= */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">المعرفين والشهود المعتمدين</h3>
                    <p className="text-xs text-slate-500">بيانات المعرف الأول والمعرف الثاني لتوثيق ملكية المركبة</p>
                  </div>
                </div>
              </div>

              {/* Guarantor 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    بيانات المعرف الأول:
                  </span>
                  <button
                    type="button"
                    onClick={() => openScanner('guarantor-1', 'مسح بطاقة المعرف الأول', 'التقط صورة البطاقة الشخصية للمعرف لاستخراج بياناته')}
                    className="text-[10.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>مسح البطاقة بالـ AI</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المعرف الرباعي</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.fullName || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'fullName', e.target.value)}
                      placeholder="مثال: عبد الله أحمد حسن غالب"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم الوطني للمعرف</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.nationalId || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'nationalId', e.target.value)}
                      placeholder="مثال: 0101007721"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم هاتف المعرف</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.phone || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'phone', e.target.value)}
                      placeholder="مثال: 771234567"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">صلة المعرفة / القرابة</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.relationship || 'معرّف وضامن'}
                      onChange={(e) => updateGuarantor('guarantor1', 'relationship', e.target.value)}
                      placeholder="مثال: أخ، جار، معرف"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-600" />
                  بيانات المعرف الثاني (اختياري / شاهد):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الشاهد الثاني الرباعي</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.fullName || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'fullName', e.target.value)}
                      placeholder="مثال: محمد سعيد عبده فارع"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم الوطني</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.nationalId || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'nationalId', e.target.value)}
                      placeholder="مثال: 0101009812"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.phone || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'phone', e.target.value)}
                      placeholder="مثال: 772334455"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">صلة المعرفة</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.relationship || 'معرّف وشاهد'}
                      onChange={(e) => updateGuarantor('guarantor2', 'relationship', e.target.value)}
                      placeholder="مثال: معرف وشاهد"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: المركبة والجمارك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <span>التالي: الفحص والرسوم والاعتماد</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: الفحص والرسوم والاعتماد ================= */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">محضر الفحص الفني، الرسوم، والاعتماد النهائي</h3>
                    <p className="text-xs text-slate-500">حالة المطابقة، سند التحصيل المالي، واعتماد رئيس اللجنة المقدم صادق القاضي</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  الخطوة الأخيرة
                </span>
              </div>

              {/* Inspection & Officer Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نتيجة الفحص الفني والمطابقة</label>
                  <select
                    value={currentData.inspectionStatus}
                    onChange={(e) => updateField('inspectionStatus', e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="passed">لائق فنياً ومطابق للمواصفات والقانون</option>
                    <option value="conditional">مشروط باستكمال نواقص فنية</option>
                    <option value="exempt">معفى بقرار رسمي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جهة ومركز الفحص</label>
                  <input
                    type="text"
                    value={currentData.inspectionCenter || 'لجنة ترقيم الجمارك - الإدارة العامة للمرور تعز'}
                    onChange={(e) => updateField('inspectionCenter', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم سند / إيصال الرسوم</label>
                  <input
                    type="text"
                    value={currentData.feeReceiptNumber || 'C2006'}
                    onChange={(e) => updateField('feeReceiptNumber', e.target.value)}
                    placeholder="مثال: C2006"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي الرسوم المدفوعة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentData.totalFeesPaid || 45000}
                      onChange={(e) => updateField('totalFeesPaid', parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-600 shrink-0">ريال يمني</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      مختص الفحص الفني:
                    </label>
                    <input
                      type="text"
                      value={currentData.officerName || 'الملازم / محمد بجاش الكمالي'}
                      onChange={(e) => updateField('officerName', e.target.value)}
                      placeholder="الملازم / محمد بجاش الكمالي"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">
                      خانة توقيع مختص الفحص الفني في الاستمارة الرسمية A4.
                    </p>
                  </div>

                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                    <label className="block text-xs font-black text-blue-950 mb-1">
                      مدير الإصدار الآلي (في الأخير):
                    </label>
                    <input
                      type="text"
                      value={currentData.automatedIssuanceDirector || 'العقيد / ماجد الحكيم'}
                      onChange={(e) => updateField('automatedIssuanceDirector', e.target.value)}
                      placeholder="العقيد / ماجد الحكيم"
                      className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs font-black text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-blue-700 mt-1">
                      خانة توقيع مدير الإصدار الآلي في أقصى يسار أسفل الاستمارة A4.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المحضر والاعتماد</label>
                  <textarea
                    rows={2}
                    value={currentData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="تمت مطابقة بيانات الشاصي والمحرك وفحص الوثائق الجمركية واستيفاء كافة الشروط القانونية."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation & Final Submission Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: المعرفين</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSaveAndPreview(currentData)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>حفظ المعاملة وعرض استمارة A4 للطباعة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Summary & Plate Preview Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Live Plate Visualizer Box */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-blue-600" />
                معاينة اللوحة المعتمدة:
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {currentData.plateCategory === 'commercial' ? 'نقل عام' : 'خصوصي'}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <PlateVisualizer
                plateNumber={currentData.plateNumber || '00000'}
                plateLetter={currentData.plateLetter || 'د'}
                category={currentData.plateCategory}
                prefix={currentData.platePrefix || '4'}
                country={currentData.plateCountry || 'اليمن'}
                size="md"
              />
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-amber-300">ملخص المعاملة الحالية</span>
              <span className="text-[10px] font-mono text-slate-400">{currentData.registrationNumber}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مالك المركبة:</span>
                <span className="font-bold text-white truncate max-w-[170px]">{currentData.ownerFullName || 'لم يحدد بعد'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الرقم الوطني:</span>
                <span className="font-mono font-bold text-sky-300">{currentData.ownerNationalId || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">نوع المركبة:</span>
                <span className="font-bold text-slate-200">{currentData.make} {currentData.model} ({currentData.year})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم الشاصي VIN:</span>
                <span className="font-mono text-[10.5px] text-amber-300 truncate max-w-[150px]">{currentData.vinNumber || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الرسوم المدفوعة:</span>
                <span className="font-mono font-bold text-emerald-400">{currentData.totalFeesPaid?.toLocaleString() || 45000} ريال</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => onSaveAndPreview(currentData)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>حفظ ومعاينة الاستمارة A4</span>
              </button>

              <button
                type="button"
                onClick={onResetToNew}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تفريغ وبدء ترقيم آخر</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
