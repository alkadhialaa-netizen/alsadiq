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
import { RegistrationFormA4 } from './RegistrationFormA4';
import { VEHICLE_BODY_OPTIONS, deduceVehicleAndBodyShape } from '../data/vehicleBodyOptions';

interface NewRegistrationPageProps {
  currentData: VehicleRegistration;
  onChange: (updated: VehicleRegistration) => void;
  onSaveAndPreview: (record?: VehicleRegistration) => void;
  onSaveInPlace?: (record?: VehicleRegistration) => void;
  onSaveAndPrint?: (record?: VehicleRegistration) => void;
  onSaveAndExportPDF?: (record?: VehicleRegistration) => void;
  onResetToNew: () => void;
  currentUser: UserAccount | null;
}

export const NewRegistrationPage: React.FC<NewRegistrationPageProps> = ({
  currentData,
  onChange,
  onSaveAndPreview,
  onSaveInPlace,
  onSaveAndPrint,
  onSaveAndExportPDF,
  onResetToNew,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<'stepped' | 'all'>('stepped');
  const [sidePanelMode, setSidePanelMode] = useState<'summary' | 'live-a4'>('summary');
  
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
        ownerFullName: extracted.ownerFullName || extracted.fullName || currentData.ownerFullName,
        ownerNationalId: extracted.ownerNationalId || extracted.nationalId || currentData.ownerNationalId,
        ownerAddress: extracted.ownerAddress || extracted.address || currentData.ownerAddress,
        ownerPhone: extracted.ownerPhone || extracted.phone || currentData.ownerPhone,
        ownerBloodType: extracted.ownerBloodType || currentData.ownerBloodType,
        ownerBirthDate: extracted.ownerBirthDate || currentData.ownerBirthDate,
        ownerIdIssuePlace: extracted.ownerIdIssuePlace || currentData.ownerIdIssuePlace,
        ownerIdCardPhoto: imageBase64 || currentData.ownerIdCardPhoto,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المالك الشخصية بنجاح وتعبئة الحقول');
    } else if (currentScanType === 'owner-photo') {
      onChange({
        ...currentData,
        ownerPhoto: imageBase64,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم حفظ صورة المالك الشخصية (4×6) بنجاح');
    } else if (currentScanType === 'customs') {
      const deduced = deduceVehicleAndBodyShape(
        `${extracted.make || ''} ${extracted.model || ''}`,
        extracted.vehicleType,
        extracted.vehicleBodyShape
      );

      onChange({
        ...currentData,
        customsDeclarationNumber: extracted.customsDeclarationNumber || currentData.customsDeclarationNumber,
        vinNumber: extracted.vinNumber ? String(extracted.vinNumber).toUpperCase() : currentData.vinNumber,
        engineNumber: extracted.engineNumber ? String(extracted.engineNumber).toUpperCase() : currentData.engineNumber,
        make: extracted.make || currentData.make,
        model: extracted.model || currentData.model,
        year: extracted.year ? Number(extracted.year) : currentData.year,
        color: extracted.color || currentData.color,
        secondaryColor: extracted.secondaryColor || currentData.secondaryColor,
        vehicleType: (extracted.vehicleType as any) || (deduced.vehicleType as any) || currentData.vehicleType,
        vehicleBodyShape: extracted.vehicleBodyShape || deduced.bodyShape || currentData.vehicleBodyShape,
        fuelType: (extracted.fuelType as any) || currentData.fuelType,
        engineCapacity: extracted.engineCapacity || currentData.engineCapacity,
        cylindersCount: extracted.cylindersCount ? Number(extracted.cylindersCount) : currentData.cylindersCount,
        seatingCapacity: extracted.seatingCapacity ? Number(extracted.seatingCapacity) : currentData.seatingCapacity,
        loadCapacityKg: extracted.loadCapacityKg ? Number(extracted.loadCapacityKg) : currentData.loadCapacityKg,
        originCountry: extracted.originCountry || currentData.originCountry,
        customsIssuingOffice: extracted.customsIssuingOffice || currentData.customsIssuingOffice,
        vehicleCustomsPhoto: imageBase64 || currentData.vehicleCustomsPhoto,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات البيان الجمركي ونوع وشكل الهيكل بنجاح!');
    } else if (currentScanType === 'guarantor-1') {
      const g1 = currentData.guarantor1 || { fullName: '', nationalId: '', phone: '', address: '', relationship: '' };
      onChange({
        ...currentData,
        guarantor1: {
          ...g1,
          fullName: extracted.fullName || extracted.ownerFullName || g1.fullName,
          nationalId: extracted.nationalId || extracted.ownerNationalId || g1.nationalId,
          phone: extracted.phone || g1.phone,
          address: extracted.address || extracted.ownerAddress || g1.address,
          relationship: extracted.relationship || g1.relationship || 'معرّف وضامن',
          idCardPhoto: imageBase64 || g1.idCardPhoto,
        },
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المعرف الأول بنجاح! يمكنك إدخال رقم الهاتف يدوياً');
    } else if (currentScanType === 'guarantor-2') {
      const g2 = currentData.guarantor2 || { fullName: '', nationalId: '', phone: '', address: '', relationship: '' };
      onChange({
        ...currentData,
        guarantor2: {
          ...g2,
          fullName: extracted.fullName || extracted.ownerFullName || g2.fullName,
          nationalId: extracted.nationalId || extracted.ownerNationalId || g2.nationalId,
          phone: extracted.phone || g2.phone,
          address: extracted.address || extracted.ownerAddress || g2.address,
          relationship: extracted.relationship || g2.relationship || 'معرّف وشاهد',
          idCardPhoto: imageBase64 || g2.idCardPhoto,
        },
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المعرف الثاني بنجاح! يمكنك إدخال رقم الهاتف يدوياً');
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
            {onSaveInPlace && (
              <button
                type="button"
                onClick={() => onSaveInPlace(currentData)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/95 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition cursor-pointer shadow-md"
                title="حفظ البيانات المسجلة مع البقاء في نفس صفحة التعبئة"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>حفظ ومتابعة الإدخال</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetToNew}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
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
              <span>حفظ وعرض استمارة A4 للطباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Section Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">طريقة عرض الحقول:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDisplayMode('stepped')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  displayMode === 'stepped'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نظام الخطوات المنظمة (1 - 5)
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  displayMode === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عرض جميع الحقول كاملة في صفحة واحدة
              </button>
            </div>
          </div>

          <div className="text-[11.5px] text-slate-500 font-medium">
            {displayMode === 'stepped' ? (
              <span>يتم حفظ جميع التعديلات تلقائياً، ويمكنك التنقل بحرية بين الخطوات</span>
            ) : (
              <span>جميع أقسام الاستمارة معروضة معاً لتسهيل المراجعة وتعبئة الحقول دفعة واحدة</span>
            )}
          </div>
        </div>

        {/* Step Navigation Bar */}
        {displayMode === 'stepped' ? (
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
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">انتقال سريع للقسم:</span>
            {steps.map((step) => (
              <a
                key={step.id}
                href={`#section-${step.id}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-bold text-slate-700 transition border border-slate-200"
              >
                {step.id}. {step.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Multi-Step Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: Form Step Inputs */}
        <form 
          onSubmit={(e) => e.preventDefault()} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault(); 
            }
          }}
          className="lg:col-span-8 space-y-6"
        >

          {/* ================= STEP 1: اللوحة ونوع الترقيم ================= */}
          {(displayMode === 'all' || currentStep === 1) && (
            <div id="section-1" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
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
                  القسم 1 من 5
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

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {onSaveInPlace ? (
                  <button
                    type="button"
                    onClick={() => onSaveInPlace(currentData)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                    title="حفظ المدخلات والبقاء في نفس الصفحة"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>حفظ ومتابعة الإدخال</span>
                  </button>
                ) : <div />}

                {displayMode === 'stepped' && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                  >
                    <span>التالي: بيانات مالك المركبة</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: بيانات المالك ================= */}
          {(displayMode === 'all' || currentStep === 2) && (
            <div id="section-2" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">بيانات مالك المركبة والتوثيق</h3>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مسح ضوئي 📷 أو إدخال يدوي ✍️
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">الاسم الرباعي، رقم الهوية الوطنية، محل الإقامة، ورقم الهاتف</p>
                  </div>
                </div>

                {/* Scan & Photo Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openScanner('owner-id', 'مسح وقراءة البطاقة الشخصية للمالك', 'التقط بالكاميرا أو ارفع صورة البطاقة لاستخراج الاسم والرقم الوطني والعنوان تلقائياً')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>مسح البطاقة الشخصية بالـ AI</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>الصورة الشخصية (4×6)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateField('ownerPhoto', reader.result as string);
                            showToast('تم إرفاق صورة المالك الشخصية بنجاح');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Status info bar */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>طريقة الإدخال:</strong> يمكنك مسح البطاقة الشخصية بالكاميرا لاستخراج البيانات آلياً، أو كتابتها في الخانات أدناه يدوياً.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {currentData.ownerIdCardPhoto && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      تم إرفاق بطاقة الهوية
                    </span>
                  )}
                  {currentData.ownerPhoto && (
                    <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      تم إرفاق الصورة 4×6
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Previews if any */}
              {(currentData.ownerIdCardPhoto || currentData.ownerPhoto) && (
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {currentData.ownerIdCardPhoto && (
                    <div className="flex items-center gap-2">
                      <img src={currentData.ownerIdCardPhoto} alt="Owner ID Card" className="w-16 h-12 object-cover rounded-lg border border-slate-300" />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-700 block">صورة بطاقة الهوية</span>
                        <button
                          type="button"
                          onClick={() => updateField('ownerIdCardPhoto', '')}
                          className="text-rose-600 hover:text-rose-800 font-bold text-[10px] cursor-pointer"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  )}

                  {currentData.ownerPhoto && (
                    <div className="flex items-center gap-2">
                      <img src={currentData.ownerPhoto} alt="Owner Portrait" className="w-12 h-14 object-cover rounded-lg border border-slate-300 shadow-xs" />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-700 block">الصورة الشخصية 4×6</span>
                        <button
                          type="button"
                          onClick={() => updateField('ownerPhoto', '')}
                          className="text-rose-600 hover:text-rose-800 font-bold text-[10px] cursor-pointer"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المالك الرباعي واللقب <span className="text-red-500">*</span>
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
                    رقم الهاتف / الجوال (إدخال يدوي)
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

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {displayMode === 'stepped' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق: اللوحة والترقيم</span>
                  </button>
                ) : <div />}

                <div className="flex flex-wrap items-center gap-2">
                  {onSaveInPlace && (
                    <button
                      type="button"
                      onClick={() => onSaveInPlace(currentData)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                      title="حفظ المدخلات والبقاء في نفس الصفحة"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>حفظ ومتابعة الإدخال</span>
                    </button>
                  )}

                  {displayMode === 'stepped' && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                    >
                      <span>التالي: بيانات المركبة والجمارك</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: مواصفات المركبة والبيان الجمركي ================= */}
          {(displayMode === 'all' || currentStep === 3) && (
            <div id="section-3" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
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

              {/* Vehicle Body Type & Shape - Manual Direct Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نوع المركبة (إدخال يدوي)
                  </label>
                  <input
                    type="text"
                    value={
                      currentData.vehicleType === 'van' ? 'باص' :
                      currentData.vehicleType === 'sedan' ? 'صالون' :
                      currentData.vehicleType === 'suv' ? 'جيب' :
                      currentData.vehicleType === 'pickup' ? 'بيك أب' :
                      currentData.vehicleType === 'bus' ? 'حافلة' :
                      currentData.vehicleType === 'truck' ? 'شاحنة' :
                      currentData.vehicleType === 'motorcycle' ? 'دراجة نارية' :
                      currentData.vehicleType === 'trailer' ? 'مقطورة' :
                      (currentData.vehicleType || '')
                    }
                    onChange={(e) => updateField('vehicleType', e.target.value)}
                    placeholder="مثال: باص، صالون، جيب، بيك أب، شاحنة..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شكل الهيكل (إدخال يدوي)
                  </label>
                  <input
                    type="text"
                    value={currentData.vehicleBodyShape || ''}
                    onChange={(e) => updateField('vehicleBodyShape', e.target.value)}
                    placeholder="مثال: باص مقفل (ركاب / فان)، صالون 4 أبواب، شاص غمارتين..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase text-left"
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
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase text-left"
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

              {/* Vehicle Plate Photo Attachment - Expanded & Enlarged */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>صورة لوحة المركبة (مرفق اللوحة)</span>
                        {currentData.vehiclePlatePhoto && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            تم الإرفاق ✓
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">التقاط أو إرفاق صورة اللوحة المركبة على السيارة بوضوح للمطابقة في الاستمارة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                      <Camera className="w-4 h-4" />
                      <span>{currentData.vehiclePlatePhoto ? 'تغيير / إعادة تصوير اللوحة' : 'التقاط أو رفع صورة اللوحة'}</span>
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
                              showToast('تم إرفاق وتكبير صورة لوحة المركبة بنجاح');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {currentData.vehiclePlatePhoto && (
                      <button
                        type="button"
                        onClick={() => updateField('vehiclePlatePhoto', undefined)}
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                      >
                        حذف الصورة
                      </button>
                    )}
                  </div>
                </div>

                {/* Large Plate Photo Display Area */}
                {currentData.vehiclePlatePhoto ? (
                  <div className="bg-slate-100/80 border-2 border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-64 h-32 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white flex items-center justify-center">
                      <img 
                        src={currentData.vehiclePlatePhoto} 
                        alt="صورة لوحة المركبة" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs font-black text-slate-800 block">معاينة صورة لوحة الرقم الموسعة:</span>
                      <p className="text-[11px] text-slate-600">
                        تظهر هذه الصورة مباشرة بالحجم المخصص في الترويسة العلوية لاستمارة التسجيل الرسمية وبطاقة الملكية.
                      </p>
                      <span className="inline-block text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        جاهزة للطباعة والتوثيق
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium">
                      لم يتم إرفاق صورة للوحة بعد. يمكنك تصوير لوحة السيارة لإدراجها في خانة صورة اللوحة في استمارة A4.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {displayMode === 'stepped' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق: بيانات المالك</span>
                  </button>
                ) : <div />}

                <div className="flex flex-wrap items-center gap-2">
                  {onSaveInPlace && (
                    <button
                      type="button"
                      onClick={() => onSaveInPlace(currentData)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                      title="حفظ المدخلات والبقاء في نفس الصفحة"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>حفظ ومتابعة الإدخال</span>
                    </button>
                  )}

                  {displayMode === 'stepped' && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                    >
                      <span>التالي: المعرفين والشهود</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: المعرفين والشهود ================= */}
          {(displayMode === 'all' || currentStep === 4) && (
            <div id="section-4" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">المعرفين والشهود المعتمدين</h3>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مسح البطاقات 📷 + هاتف يدوي ✍️
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">بيانات المعرف الأول والمعرف الثاني لتوثيق ملكية المركبة وضمانها</p>
                  </div>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>تعليمات الإدخال:</strong> يمكنك مسح بطاقة هوية كل معرّف لاستخراج الاسم الرباعي والرقم الوطني تلقائياً، مع إدخال رقم الهاتف وصلة القرابة يدوياً.
                </span>
              </div>

              {/* Guarantor 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    بيانات المعرف الأول (الضامن الأساسي):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('guarantor-1', 'مسح بطاقة المعرف الأول', 'التقط بالكاميرا أو ارفع صورة البطاقة الشخصية للمعرف الأول لاستخراج بياناته')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>مسح بطاقة المعرف الأول بالـ AI</span>
                    </button>
                  </div>
                </div>

                {/* Guarantor 1 Photo Attachment */}
                {currentData.guarantor1?.idCardPhoto && (
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={currentData.guarantor1.idCardPhoto} alt="Guarantor 1 ID" className="w-14 h-10 object-cover rounded-lg border border-slate-300" />
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم مسح وإرفاق بطاقة المعرف الأول
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateGuarantor('guarantor1', 'idCardPhoto', '')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المعرف الأول الرباعي واللقب</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.fullName || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'fullName', e.target.value)}
                      placeholder="مثال: عبد الله أحمد حسن غالب"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم الوطني / رقم الهوية</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.nationalId || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'nationalId', e.target.value)}
                      placeholder="مثال: 0101007721"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رقم هاتف المعرف <span className="text-blue-600">(إدخال يدوي)</span>
                    </label>
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

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">محل السكن / العنوان</label>
                    <input
                      type="text"
                      value={currentData.guarantor1?.address || ''}
                      onChange={(e) => updateGuarantor('guarantor1', 'address', e.target.value)}
                      placeholder="مثال: تعز - المظفر"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    بيانات المعرف الثاني (الضامن الثاني / الشاهد):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('guarantor-2', 'مسح بطاقة المعرف الثاني', 'التقط بالكاميرا أو ارفع صورة البطاقة الشخصية للمعرف الثاني لاستخراج بياناته')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>مسح بطاقة المعرف الثاني بالـ AI</span>
                    </button>
                  </div>
                </div>

                {/* Guarantor 2 Photo Attachment */}
                {currentData.guarantor2?.idCardPhoto && (
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={currentData.guarantor2.idCardPhoto} alt="Guarantor 2 ID" className="w-14 h-10 object-cover rounded-lg border border-slate-300" />
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم مسح وإرفاق بطاقة المعرف الثاني
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateGuarantor('guarantor2', 'idCardPhoto', '')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الشاهد الثاني الرباعي واللقب</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.fullName || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'fullName', e.target.value)}
                      placeholder="مثال: محمد سعيد عبده فارع"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم الوطني / رقم الهوية</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.nationalId || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'nationalId', e.target.value)}
                      placeholder="مثال: 0101009812"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رقم هاتف المعرف <span className="text-indigo-600">(إدخال يدوي)</span>
                    </label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.phone || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'phone', e.target.value)}
                      placeholder="مثال: 772334455"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">صلة المعرفة / القرابة</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.relationship || 'معرّف وشاهد'}
                      onChange={(e) => updateGuarantor('guarantor2', 'relationship', e.target.value)}
                      placeholder="مثال: معرف وشاهد"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">محل السكن / العنوان</label>
                    <input
                      type="text"
                      value={currentData.guarantor2?.address || ''}
                      onChange={(e) => updateGuarantor('guarantor2', 'address', e.target.value)}
                      placeholder="مثال: تعز - القاهرة"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {displayMode === 'stepped' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق: المركبة والجمارك</span>
                  </button>
                ) : <div />}

                <div className="flex flex-wrap items-center gap-2">
                  {onSaveInPlace && (
                    <button
                      type="button"
                      onClick={() => onSaveInPlace(currentData)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                      title="حفظ المدخلات والبقاء في نفس الصفحة"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>حفظ ومتابعة الإدخال</span>
                    </button>
                  )}

                  {displayMode === 'stepped' && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                    >
                      <span>التالي: الفحص والرسوم والاعتماد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: الفحص والرسوم والاعتماد ================= */}
          {(displayMode === 'all' || currentStep === 5) && (
            <div id="section-5" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">محضر الفحص الفني، الرسوم، والاعتماد النهائي</h3>
                    <p className="text-xs text-slate-500">حالة المطابقة، سند التحصيل المالي، واعتماد رئيس اللجنة ومختص الفحص</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  القسم 5 من 5
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
                      مدير الإصدار الآلي:
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
                {displayMode === 'stepped' ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق: المعرفين</span>
                  </button>
                ) : <div />}

                <div className="flex flex-wrap items-center gap-2">
                  {onSaveInPlace && (
                    <button
                      type="button"
                      onClick={() => onSaveInPlace(currentData)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                      title="حفظ المدخلات والبقاء في نفس الصفحة"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>حفظ ومتابعة الإدخال (دون الخروج)</span>
                    </button>
                  )}

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

          {/* All Mode Bottom Global Action Bar */}
          {displayMode === 'all' && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-white">اكتمال تعبئة الاستمارة</h4>
                <p className="text-xs text-slate-400">يمكنك حفظ البيانات والبقاء هنا أو الانتقال لمعاينة وطباعة استمارة A4 الرسمية</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onSaveInPlace && (
                  <button
                    type="button"
                    onClick={() => onSaveInPlace(currentData)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm border border-slate-700"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>حفظ ومتابعة الإدخال</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSaveAndPreview(currentData)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وعرض استمارة A4 للطباعة</span>
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Right Column: Live Summary & Plate Preview Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Panel Mode Switcher */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSidePanelMode('summary')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sidePanelMode === 'summary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>ملخص اللوحة والمعاملة</span>
            </button>
            <button
              type="button"
              onClick={() => setSidePanelMode('live-a4')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sidePanelMode === 'live-a4'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>معاينة حية A4 📄</span>
            </button>
          </div>

          {sidePanelMode === 'live-a4' ? (
            <div className="bg-slate-900 rounded-2xl p-3.5 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between px-1 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  تتحدث فوراً مع كل حرف تكتبه
                </span>
                <button
                  type="button"
                  onClick={() => onSaveAndPreview(currentData)}
                  className="text-xs font-bold text-sky-300 hover:text-sky-200 underline cursor-pointer"
                >
                  فتح بالحجم الكامل
                </button>
              </div>

              {/* Scaled A4 Preview Box */}
              <div className="bg-slate-200 rounded-xl p-2 overflow-y-auto max-h-[620px] shadow-inner flex justify-center border border-slate-300">
                <div className="origin-top scale-[0.40] sm:scale-[0.45] -my-44 -mx-36 pointer-events-none select-none">
                  <RegistrationFormA4 data={currentData} />
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

        </div>

      </div>
    </div>
  );
};
