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
  SlidersHorizontal
} from 'lucide-react';
import { VehicleRegistration, PlateCategory, VehicleType, FuelType, GuarantorInfo } from '../types';
import { PlateVisualizer } from './PlateVisualizer';
import { sampleRegistrations } from '../data/mockTemplates';
import { AiCaptureModal, ScanType } from './AiCaptureModal';

interface RegistrationInputFormProps {
  currentData: VehicleRegistration;
  onChange: (updated: VehicleRegistration) => void;
  onSave: (record?: VehicleRegistration) => void;
  onReset: () => void;
  isEditing?: boolean;
}

export const RegistrationInputForm: React.FC<RegistrationInputFormProps> = ({
  currentData,
  onChange,
  onSave,
  onReset,
  isEditing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'plate' | 'vehicle' | 'owner' | 'guarantors' | 'inspection'>('owner');
  
  // AI Capture Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentScanType, setCurrentScanType] = useState<ScanType>('owner-id');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalSubtitle, setModalSubtitle] = useState<string>('');
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setAiSuccessToast(message);
    setTimeout(() => {
      setAiSuccessToast(null);
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

  // Open Scanner Helper
  const openScanner = (type: ScanType, title: string, subtitle: string) => {
    setCurrentScanType(type);
    setModalTitle(title);
    setModalSubtitle(subtitle);
    setIsModalOpen(true);
  };

  // Handle Extraction Callback from AiCaptureModal
  const handleAiExtractionSuccess = (extracted: any, imageBase64: string) => {
    if (currentScanType === 'owner-id') {
      onChange({
        ...currentData,
        ownerFullName: extracted.ownerFullName || currentData.ownerFullName,
        ownerNationalId: extracted.ownerNationalId || currentData.ownerNationalId,
        ownerAddress: extracted.ownerAddress || currentData.ownerAddress,
        ownerPhone: extracted.ownerPhone || currentData.ownerPhone,
        ownerType: (extracted.ownerType as any) || currentData.ownerType,
        ownerIdCardPhoto: imageBase64,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المالك بنجاح وتعبئة الحقول تلقائياً!');
    } else if (currentScanType === 'customs') {
      onChange({
        ...currentData,
        make: extracted.make || currentData.make,
        model: extracted.model || currentData.model,
        year: extracted.year ? Number(extracted.year) : currentData.year,
        vinNumber: extracted.vinNumber ? String(extracted.vinNumber).toUpperCase() : currentData.vinNumber,
        engineNumber: extracted.engineNumber || currentData.engineNumber,
        color: extracted.color || currentData.color,
        secondaryColor: extracted.secondaryColor || currentData.secondaryColor,
        vehicleType: (extracted.vehicleType as any) || currentData.vehicleType,
        fuelType: (extracted.fuelType as any) || currentData.fuelType,
        engineCapacity: extracted.engineCapacity || currentData.engineCapacity,
        cylindersCount: extracted.cylindersCount ? Number(extracted.cylindersCount) : currentData.cylindersCount,
        seatingCapacity: extracted.seatingCapacity ? Number(extracted.seatingCapacity) : currentData.seatingCapacity,
        loadCapacityKg: extracted.loadCapacityKg ? Number(extracted.loadCapacityKg) : currentData.loadCapacityKg,
        originCountry: extracted.originCountry || currentData.originCountry,
        plateNumber: extracted.plateNumber || currentData.plateNumber,
        vehicleCustomsPhoto: imageBase64,
        notes: extracted.notes ? `${currentData.notes ? currentData.notes + ' | ' : ''}${extracted.notes}` : currentData.notes,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج المواصفات الفنية من البيان الجمركي وتعبئتها تلقائياً!');
    } else if (currentScanType === 'guarantor-1') {
      const g1 = currentData.guarantor1 || { fullName: '', nationalId: '', phone: '', address: '', relationship: '' };
      onChange({
        ...currentData,
        guarantor1: {
          ...g1,
          fullName: extracted.fullName || g1.fullName,
          nationalId: extracted.nationalId || g1.nationalId,
          address: extracted.address || g1.address,
          phone: extracted.phone || g1.phone, // can be filled manually as user instructed
          relationship: extracted.relationship || g1.relationship || 'ضامن أول',
          idCardPhoto: imageBase64,
        },
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المعرّف الأول بنجاح! يمكنك مراجعة أو إدخال رقم الهاتف يدوياً.');
    } else if (currentScanType === 'guarantor-2') {
      const g2 = currentData.guarantor2 || { fullName: '', nationalId: '', phone: '', address: '', relationship: '' };
      onChange({
        ...currentData,
        guarantor2: {
          ...g2,
          fullName: extracted.fullName || g2.fullName,
          nationalId: extracted.nationalId || g2.nationalId,
          address: extracted.address || g2.address,
          phone: extracted.phone || g2.phone,
          relationship: extracted.relationship || g2.relationship || 'ضامن ثانٍ',
          idCardPhoto: imageBase64,
        },
        updatedAt: new Date().toISOString(),
      });
      showToast('تم استخراج بيانات بطاقة المعرّف الثاني بنجاح!');
    } else if (currentScanType === 'owner-photo') {
      onChange({
        ...currentData,
        ownerPhoto: imageBase64,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم حفظ صورة المالك الشخصية بنجاح!');
    } else if (currentScanType === 'plate-photo') {
      onChange({
        ...currentData,
        vehiclePlatePhoto: imageBase64,
        updatedAt: new Date().toISOString(),
      });
      showToast('تم حفظ وإرفاق صورة لوحة المركبة بنجاح في سجل وبيانات المركبة!');
    }
  };

  // Quick Random Plate Number Generator
  const generateRandomPlateNumber = () => {
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 'ش', 'ت'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
    const randomReg = `TRQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    onChange({
      ...currentData,
      plateNumber: randomNum,
      plateLetter: randomLetter,
      registrationNumber: currentData.registrationNumber || randomReg,
    });
  };

  // Generate standard random VIN
  const generateRandomVin = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = 'JT';
    for (let i = 0; i < 15; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateField('vinNumber', vin);
  };

  const loadPreset = (preset: VehicleRegistration) => {
    onChange({
      ...preset,
      id: `reg-${Date.now()}`,
      registrationNumber: `TRQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const governorates = [
    'بغداد', 'البصرة', 'أربيل', 'النجف الأشرف', 'كربلاء المقدسة', 'نينوى', 'السليمانية', 'كركوك', 
    'الأنبار', 'بابل', 'واسط', 'ميسان', 'ذي قار', 'المثنى', 'القادسية', 'صلاح الدين', 'دهوك', 'ديالى',
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'جدة', 'دمشق', 'حلب', 'القاهرة', 'عمان', 'صنعاء'
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
      
      {/* Toast Notification */}
      {aiSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>{aiSuccessToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setAiSuccessToast(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-black/20"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              {isEditing ? 'تعديل بيانات استمارة الترقيم' : 'إصدار استمارة ترقيم وتسجيل مركبة'}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              مدعوم بالذكاء الاصطناعي
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            يمكنك إدخال البيانات يدوياً ✍️ أو تصوير البطاقات والبيان الجمركي بالكاميرا أو اختيار صورة من المعرض للاستخراج الفوري ⚡
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 ml-1">قوالب جاهزة:</span>
          {sampleRegistrations.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-semibold text-slate-700 transition border border-slate-200/80 cursor-pointer"
            >
              {preset.make.split(' ')[0]} {preset.model.split(' ')[0]} ({preset.plateCategory === 'taxi' ? 'أجرة' : 'خصوصي'})
            </button>
          ))}
        </div>
      </div>

      {/* Plate Live Preview Strip */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="text-center md:text-right">
          <span className="text-xs text-amber-400 font-semibold block">معاينة لوحة المركبة الفورية:</span>
          <span className="text-sm font-bold text-slate-200">
            {currentData.plateCountry} - {currentData.governorate} ({currentData.make} {currentData.model})
          </span>
        </div>
        <div className="w-full md:w-auto flex justify-center">
          <PlateVisualizer
            plateNumber={currentData.plateNumber}
            plateLetter={currentData.plateLetter}
            plateCategory={currentData.plateCategory}
            country={currentData.plateCountry}
            governorate={currentData.governorate}
            size="md"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('plate')}
            className="flex items-center gap-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-300" />
            تعديل رقم وصنف اللوحة يدوياً
          </button>
          <button
            type="button"
            onClick={generateRandomPlateNumber}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            توليد رقم عشوائي
          </button>
        </div>
      </div>

      {/* Tabs Navigation (5 Structured Tabs) */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('owner')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'owner'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          1. بيانات المالك وصورته
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vehicle')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'vehicle'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          2. المركبة والبيان الجمركي
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guarantors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'guarantors'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          3. بيانات المعرّفين (الأول والثاني)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plate')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'plate'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="w-4 h-4" />
          4. اللوحة والترقيم الإداري
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inspection')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'inspection'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          5. الفحص الفني والرسوم
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: OWNER DETAILS & PHOTO (Dual Entry: AI OCR + Manual)           */}
      {/* =================================================================== */}
      {activeTab === 'owner' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Dual Action AI Extraction Bar for Owner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm">استخراج بيانات المالك بالذكاء الاصطناعي</h4>
                <p className="text-[11px] text-slate-300">
                  صوّر بطاقة الهوية / الجواز أو اخترها من المعرض ليتم ملء الاسم والرقم الوطني والعنوان تلقائياً
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openScanner('owner-id', 'مسح بطاقة هوية المالك', 'وجّه الكاميرا نحو بطاقة الهوية الوطنية أو جواز السفر للاستخراج التلقائي')}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>تصوير بطاقة المالك</span>
              </button>

              <button
                type="button"
                onClick={() => openScanner('owner-id', 'رفع بطاقة هوية المالك من المعرض', 'اختر صورة واضحة لبطاقة الهوية من جهازك')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>من المعرض</span>
              </button>
            </div>
          </div>

          {/* Photos Row for Owner: Portrait & ID Card Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Portrait Photo Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-xl bg-slate-200 border-2 border-slate-300 overflow-hidden flex items-center justify-center relative shrink-0">
                  {currentData.ownerPhoto ? (
                    <img src={currentData.ownerPhoto} alt="Owner" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">صورة المالك الشخصية</h5>
                  <p className="text-[11px] text-slate-500">تظهر في الاستمارة الرسمية A4</p>
                  {currentData.ownerPhoto && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> تم التقاط الصورة
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => openScanner('owner-photo', 'التقاط صورة المالك الشخصية', 'التقط صورة شخصية واضحة للمالك لوضعها في الاستمارة')}
                  className="flex items-center gap-1 text-xs bg-blue-900 hover:bg-blue-950 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {currentData.ownerPhoto ? 'تغيير' : 'التقاط / رفع'}
                </button>
                {currentData.ownerPhoto && (
                  <button
                    type="button"
                    onClick={() => updateField('ownerPhoto', undefined)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-bold text-center cursor-pointer"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>

            {/* Owner ID Card Scan Thumbnail */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl bg-slate-200 border-2 border-slate-300 overflow-hidden flex items-center justify-center relative shrink-0">
                  {currentData.ownerIdCardPhoto ? (
                    <img src={currentData.ownerIdCardPhoto} alt="ID Card" className="w-full h-full object-cover" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">مستند بطاقة الهوية الوطنية</h5>
                  <p className="text-[11px] text-slate-500">تم استخراج البيانات منها</p>
                  {currentData.ownerIdCardPhoto && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> تم المسح والحفظ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => openScanner('owner-id', 'مسح بطاقة هوية المالك', 'تصوير أو اختيار صورة الهوية للاستخراج')}
                  className="flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  إعادة مسح
                </button>
                {currentData.ownerIdCardPhoto && (
                  <button
                    type="button"
                    onClick={() => updateField('ownerIdCardPhoto', undefined)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-bold text-center cursor-pointer"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Manual Input Fields for Owner (Always Editable) */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-bold text-xs text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span>الحقول اليدوية لبيانات المالك</span>
              <span className="text-slate-300 font-normal">(قابلة للتعديل والإدخال اليدوي المباشر)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Owner Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الرباعي واللقب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentData.ownerFullName}
                  onChange={(e) => updateField('ownerFullName', e.target.value)}
                  placeholder="الاسم الرباعي واللقب كما في الهوية"
                  className="w-full font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهوية / الرقم الوطني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentData.ownerNationalId}
                  onChange={(e) => updateField('ownerNationalId', e.target.value)}
                  placeholder="مثال: 04310027725"
                  className="w-full font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم هاتف المالك (إدخال يدوي)
                </label>
                <input
                  type="text"
                  value={currentData.ownerPhone}
                  onChange={(e) => updateField('ownerPhone', e.target.value)}
                  placeholder="مثال: 779797629"
                  className="w-full font-mono text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  فصيلة الدم
                </label>
                <input
                  type="text"
                  value={currentData.ownerBloodType || ''}
                  onChange={(e) => updateField('ownerBloodType', e.target.value)}
                  placeholder="A+ / B+ / O+ / AB+ / ---"
                  className="w-full font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الميلاد
                </label>
                <input
                  type="text"
                  value={currentData.ownerBirthDate || ''}
                  onChange={(e) => updateField('ownerBirthDate', e.target.value)}
                  placeholder="1990/01/01 أو ---"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* ID Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع الهوية
                </label>
                <input
                  type="text"
                  value={currentData.ownerIdType || 'بطاقة شخصية'}
                  onChange={(e) => updateField('ownerIdType', e.target.value)}
                  placeholder="بطاقة شخصية / جواز سفر / عائلية"
                  className="w-full font-semibold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* ID Issue Place */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مكان الإصدار
                </label>
                <input
                  type="text"
                  value={currentData.ownerIdIssuePlace || ''}
                  onChange={(e) => updateField('ownerIdIssuePlace', e.target.value)}
                  placeholder="مثال: مركز سامع تعز"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* Owner Legal Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صفة الملكية
                </label>
                <select
                  value={currentData.ownerType}
                  onChange={(e) => updateField('ownerType', e.target.value as 'individual' | 'company' | 'government')}
                  className="w-full font-semibold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                >
                  <option value="individual">شخص طبيعي (أفراد / ملكية خاصة)</option>
                  <option value="company">شركة / قطاع خاص</option>
                  <option value="government">جهة حكومية / وزارة</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان الحالي / السكن الدائم
                </label>
                <input
                  type="text"
                  value={currentData.ownerAddress}
                  onChange={(e) => updateField('ownerAddress', e.target.value)}
                  placeholder="المحافظة - المديرية - المنطقة - القرية - المعلم الأقرب"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: VEHICLE SPECS & CUSTOMS DECLARATION (Dual Entry)              */}
      {/* =================================================================== */}
      {activeTab === 'vehicle' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Dual Action AI Extraction Bar for Customs Declaration */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-sm">استخراج بيانات المركبة من البيان الجمركي بالذكاء الاصطناعي</h4>
                <p className="text-[11px] text-slate-300">
                  صوّر البيان الجمركي أو وثيقة المركبة ليتم استخراج الشاصي، المحرك، الموديل، وسنة الصنع تلقائياً
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openScanner('customs', 'تصوير البيان الجمركي أو وثيقة المركبة', 'وجّه الكاميرا نحو ورقة البيان الجمركي بوضوح')}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>تصوير البيان الجمركي</span>
              </button>

              <button
                type="button"
                onClick={() => openScanner('customs', 'اختيار صورة البيان الجمركي من المعرض', 'اختر صورة واضحة للبيان الجمركي أو السنوية من جهازك')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>من المعرض</span>
              </button>
            </div>
          </div>

          {/* Documents & Photos Grid (Customs Document + Plate Photo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Customs Photo */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-800">صورة البيان الجمركي / وثيقة الشحن</span>
                </div>
                {currentData.vehicleCustomsPhoto && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    مرفق ✓
                  </span>
                )}
              </div>

              {currentData.vehicleCustomsPhoto ? (
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentData.vehicleCustomsPhoto} 
                      alt="Customs Document" 
                      className="w-16 h-12 object-cover rounded-lg border border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">وثيقة البيان الجمركي</span>
                      <span className="text-[10px] text-slate-500">تم حفظ الوثيقة في سجل المعاملة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('customs', 'استبدال صورة البيان الجمركي', 'التقط أو اختر صورة جديدة للبيان الجمركي')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      استبدال
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('vehicleCustomsPhoto', undefined)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center space-y-2">
                  <p className="text-xs text-slate-500">لم يتم إرفاق صورة البيان الجمركي بعد</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('customs', 'تصوير البيان الجمركي', 'وجّه الكاميرا نحو ورقة البيان الجمركي')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      تصوير
                    </button>
                    <button
                      type="button"
                      onClick={() => openScanner('customs', 'رفع صورة البيان الجمركي', 'اختر صورة من جهازك')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      رفع صورة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: Vehicle Plate Photo (Requested by User) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-800">صورة لوحة المركبة (اختيار / التقاط)</span>
                </div>
                {currentData.vehiclePlatePhoto && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    مرفق ✓
                  </span>
                )}
              </div>

              {currentData.vehiclePlatePhoto ? (
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentData.vehiclePlatePhoto} 
                      alt="Vehicle Plate Photo" 
                      className="w-16 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">صورة لوحة المركبة الحالية</span>
                      <span className="text-[10px] text-slate-500">تم حفظ وإرفاق صورة اللوحة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('plate-photo', 'استبدال صورة لوحة المركبة', 'التقط أو اختر صورة جديدة للوحة')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      استبدال
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('vehiclePlatePhoto', undefined)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 border-2 border-dashed border-indigo-200 rounded-xl bg-white text-center space-y-2">
                  <p className="text-xs text-slate-500">يمكنك التقاط أو اختيار صورة لوحة المركبة هنا</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScanner('plate-photo', 'تصوير لوحة المركبة بالكاميرا', 'التقط صورة واضحة للوحة المركبة')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      تصوير اللوحة
                    </button>
                    <button
                      type="button"
                      onClick={() => openScanner('plate-photo', 'اختيار صورة اللوحة من المعرض', 'اختر صورة لوحة المركبة من جهازك')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      اختيار صورة اللوحة
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Vehicle Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Make */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشركة الصانعة (الماركة) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentData.make}
                onChange={(e) => updateField('make', e.target.value)}
                placeholder="تويوتا، هيونداي، مرسيدس..."
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الموديل / الطراز <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentData.model}
                onChange={(e) => updateField('model', e.target.value)}
                placeholder="كامري، لاندكروزر، النترا..."
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سنة الصنع (الموديل)
              </label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={currentData.year}
                onChange={(e) => updateField('year', parseInt(e.target.value) || 2024)}
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* VIN (Chassis) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  رقم الهيكل / الشاصي (VIN) - 17 خانة <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomVin}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  + توليد رقم شاصي تجريبي
                </button>
              </div>
              <input
                type="text"
                value={currentData.vinNumber}
                onChange={(e) => updateField('vinNumber', e.target.value.toUpperCase())}
                placeholder="مثال: JTMHU01J8N4198243"
                maxLength={17}
                className="w-full font-mono font-bold tracking-widest text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                عدد الخانات: {currentData.vinNumber?.length || 0} من 17
              </span>
            </div>

            {/* Engine Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم المحرك
              </label>
              <input
                type="text"
                value={currentData.engineNumber}
                onChange={(e) => updateField('engineNumber', e.target.value)}
                placeholder="مثال: 3UR-FE-9832104"
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Vehicle Body Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع وشكل الهيكل
              </label>
              <select
                value={currentData.vehicleType}
                onChange={(e) => updateField('vehicleType', e.target.value as VehicleType)}
                className="w-full font-semibold text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="sedan">صالون (سيدان)</option>
                <option value="suv">دفع رباعي (SUV / جيب)</option>
                <option value="pickup">بيك أب (ونيت / نقل خفيف)</option>
                <option value="van">فان / باص صغير</option>
                <option value="bus">حافلة ركاب (باص كبير)</option>
                <option value="truck">شاحنة / قاطرة</option>
                <option value="motorcycle">دراجة نارية</option>
                <option value="trailer">مقطورة</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع الوقود
              </label>
              <select
                value={currentData.fuelType}
                onChange={(e) => updateField('fuelType', e.target.value as FuelType)}
                className="w-full font-semibold text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="petrol">بنزين (Gasoline)</option>
                <option value="diesel">ديزل (Gas Oil)</option>
                <option value="hybrid">هجين (هايبرد)</option>
                <option value="electric">كهربائي كامل (EV)</option>
                <option value="gas">غاز طبيعي (CNG)</option>
              </select>
            </div>

            {/* Vehicle Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اللون الأساسي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentData.color}
                onChange={(e) => updateField('color', e.target.value)}
                placeholder="أبيض، أسود، فضي، كحلي، أحمر..."
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Engine Capacity & Cylinders */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سعة المحرك (CC / L)
              </label>
              <input
                type="text"
                value={currentData.engineCapacity}
                onChange={(e) => updateField('engineCapacity', e.target.value)}
                placeholder="مثال: 2500 cc أو 4.0L"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عدد الأسطوانات (السلندر)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={currentData.cylindersCount || 4}
                onChange={(e) => updateField('cylindersCount', parseInt(e.target.value) || 4)}
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Seats & Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عدد المقاعد
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={currentData.seatingCapacity || 5}
                onChange={(e) => updateField('seatingCapacity', parseInt(e.target.value) || 5)}
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الحمولة المصرح بها (كغ)
              </label>
              <input
                type="number"
                value={currentData.loadCapacityKg || 500}
                onChange={(e) => updateField('loadCapacityKg', parseInt(e.target.value) || 0)}
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بلد المنشأ والتصنيع
              </label>
              <input
                type="text"
                value={currentData.originCountry}
                onChange={(e) => updateField('originCountry', e.target.value)}
                placeholder="اليابان، كوريا، ألمانيا، أمريكا..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shape & Trim */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشكل / المواصفة
              </label>
              <input
                type="text"
                value={currentData.vehicleBodyShape || ''}
                onChange={(e) => updateField('vehicleBodyShape', e.target.value)}
                placeholder="سيدان / صالون / ستيشن..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                فئة الطراز (Trim / Grade)
              </label>
              <input
                type="text"
                value={currentData.vehicleModelTrim || ''}
                onChange={(e) => updateField('vehicleModelTrim', e.target.value)}
                placeholder="LE / SE / XLE / GLI..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Customs Declaration Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم البيان الجمركي
              </label>
              <input
                type="text"
                value={currentData.customsDeclarationNumber || ''}
                onChange={(e) => updateField('customsDeclarationNumber', e.target.value)}
                placeholder="مثال: 07-2024-88421"
                className="w-full font-mono font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الدائرة / المنفذ الجمركي
              </label>
              <input
                type="text"
                value={currentData.customsIssuingOffice || ''}
                onChange={(e) => updateField('customsIssuingOffice', e.target.value)}
                placeholder="مثال: جمرك ميناء عدن / جمرك شحن"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: GUARANTORS / IDENTIFIERS (Dual Entry: AI OCR + Manual)        */}
      {/* =================================================================== */}
      {activeTab === 'guarantors' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950">بيانات المعرّفين والضامنين القانونيين (المعرّف الأول والثاني)</h4>
                <p className="text-xs text-amber-800">
                  يمكنك تصوير بطاقة كل معرف لاستخراج الاسم والرقم الوطني آلياً، ويبقى رقم الهاتف للتعبئة اليدوية.
                </p>
              </div>
            </div>
          </div>

          {/* Guarantor 1 Section */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-sm text-slate-900">بيانات المعرّف / الضامن الأول</h4>
              </div>

              {/* AI Dual Mode Buttons for Guarantor 1 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openScanner('guarantor-1', 'تصوير بطاقة المعرّف الأول', 'صوّر بطاقة هوية المعرف الأول لاستخراج الاسم والرقم الوطني')}
                  className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>تصوير بطاقة المعرف 1</span>
                </button>

                <button
                  type="button"
                  onClick={() => openScanner('guarantor-1', 'رفع بطاقة المعرف الأول من المعرض', 'اختر صورة بطاقة المعرف الأول من جهازك')}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>من المعرض</span>
                </button>
              </div>
            </div>

            {/* Guarantor 1 Card Photo Thumbnail */}
            {currentData.guarantor1?.idCardPhoto && (
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={currentData.guarantor1.idCardPhoto} alt="Guarantor 1 ID" className="w-14 h-10 object-cover rounded-lg border border-slate-300" />
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم مسح بطاقة المعرف الأول وحفظها
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

            {/* Guarantor 1 Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المعرّف الأول الرباعي واللقب
                </label>
                <input
                  type="text"
                  value={currentData.guarantor1?.fullName || ''}
                  onChange={(e) => updateGuarantor('guarantor1', 'fullName', e.target.value)}
                  placeholder="الاسم الكامل للمعرف الأول"
                  className="w-full font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني / رقم الهوية
                </label>
                <input
                  type="text"
                  value={currentData.guarantor1?.nationalId || ''}
                  onChange={(e) => updateGuarantor('guarantor1', 'nationalId', e.target.value)}
                  placeholder="رقم بطاقة الهوية"
                  className="w-full font-mono font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (إدخال يدوي) <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  value={currentData.guarantor1?.phone || ''}
                  onChange={(e) => updateGuarantor('guarantor1', 'phone', e.target.value)}
                  placeholder="0770xxxxxxx"
                  className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صلة القرابة أو المعرفة
                </label>
                <input
                  type="text"
                  value={currentData.guarantor1?.relationship || ''}
                  onChange={(e) => updateGuarantor('guarantor1', 'relationship', e.target.value)}
                  placeholder="شقيق، والد، قريب، صديق، زميل عمل..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  محل السكن / العنوان
                </label>
                <input
                  type="text"
                  value={currentData.guarantor1?.address || ''}
                  onChange={(e) => updateGuarantor('guarantor1', 'address', e.target.value)}
                  placeholder="المحافظة - الحي"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Guarantor 2 Section */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">2</span>
                <h4 className="font-extrabold text-sm text-slate-900">بيانات المعرّف / الضامن الثاني</h4>
              </div>

              {/* AI Dual Mode Buttons for Guarantor 2 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openScanner('guarantor-2', 'تصوير بطاقة المعرّف الثاني', 'صوّر بطاقة هوية المعرف الثاني لاستخراج الاسم والرقم الوطني')}
                  className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>تصوير بطاقة المعرف 2</span>
                </button>

                <button
                  type="button"
                  onClick={() => openScanner('guarantor-2', 'رفع بطاقة المعرف الثاني من المعرض', 'اختر صورة بطاقة المعرف الثاني من جهازك')}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>من المعرض</span>
                </button>
              </div>
            </div>

            {/* Guarantor 2 Card Photo Thumbnail */}
            {currentData.guarantor2?.idCardPhoto && (
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={currentData.guarantor2.idCardPhoto} alt="Guarantor 2 ID" className="w-14 h-10 object-cover rounded-lg border border-slate-300" />
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم مسح بطاقة المعرف الثاني وحفظها
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

            {/* Guarantor 2 Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المعرّف الثاني الرباعي واللقب
                </label>
                <input
                  type="text"
                  value={currentData.guarantor2?.fullName || ''}
                  onChange={(e) => updateGuarantor('guarantor2', 'fullName', e.target.value)}
                  placeholder="الاسم الكامل للمعرف الثاني"
                  className="w-full font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني / رقم الهوية
                </label>
                <input
                  type="text"
                  value={currentData.guarantor2?.nationalId || ''}
                  onChange={(e) => updateGuarantor('guarantor2', 'nationalId', e.target.value)}
                  placeholder="رقم بطاقة الهوية"
                  className="w-full font-mono font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (إدخال يدوي) <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  value={currentData.guarantor2?.phone || ''}
                  onChange={(e) => updateGuarantor('guarantor2', 'phone', e.target.value)}
                  placeholder="0780xxxxxxx"
                  className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صلة القرابة أو المعرفة
                </label>
                <input
                  type="text"
                  value={currentData.guarantor2?.relationship || ''}
                  onChange={(e) => updateGuarantor('guarantor2', 'relationship', e.target.value)}
                  placeholder="صديق، جار، ضامن ثانٍ..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  محل السكن / العنوان
                </label>
                <input
                  type="text"
                  value={currentData.guarantor2?.address || ''}
                  onChange={(e) => updateGuarantor('guarantor2', 'address', e.target.value)}
                  placeholder="المحافظة - الحي"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PLATE & ADMINISTRATIVE REGISTRATION                           */}
      {/* =================================================================== */}
      {activeTab === 'plate' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          {/* Quick Registration Type Selector (خصوصي vs نقل) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block text-xs font-black text-slate-800">
              نوع الاستمارة والترقيم المطلوب (تحديد تلقائي للون والبيانات):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Private (خصوصي - أزرق) */}
              <button
                type="button"
                onClick={() => {
                  updateField('plateCategory', 'private');
                  updateField('plateLetter', 'خصوصي');
                }}
                className={`p-3 rounded-xl border-2 text-right transition flex items-center justify-between cursor-pointer ${
                  currentData.plateCategory === 'private' || currentData.plateLetter === 'خصوصي'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                    {(currentData.plateCategory === 'private' || currentData.plateLetter === 'خصوصي') && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5 text-blue-900">
                      <span>🔵 خصوصي</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-md">
                        استمارة زرقاء
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تسجيل خصوصي • الاستمارة باللون الأزرق الرسمي
                    </p>
                  </div>
                </div>
              </button>

              {/* Transport (نقل - أحمر) */}
              <button
                type="button"
                onClick={() => {
                  updateField('plateCategory', 'commercial');
                  updateField('plateLetter', 'نقل');
                }}
                className={`p-3 rounded-xl border-2 text-right transition flex items-center justify-between cursor-pointer ${
                  currentData.plateCategory === 'commercial' || currentData.plateLetter === 'نقل'
                    ? 'border-rose-600 bg-rose-50/70 text-rose-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-rose-600 bg-rose-600 flex items-center justify-center">
                    {(currentData.plateCategory === 'commercial' || currentData.plateLetter === 'نقل') && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5 text-rose-900">
                      <span>🔴 نقل</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-md">
                        استمارة حمراء
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تسجيل نقل أمام رقم اللوحة • الاستمارة باللون الأحمر
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Plate Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم اللوحة / الترقيم <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentData.plateNumber}
                onChange={(e) => updateField('plateNumber', e.target.value)}
                placeholder="مثال: 68742"
                className="w-full text-left font-mono font-bold text-lg px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plate Prefix */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رمز / بادئة اللوحة (Prefix / الرقم الإضافي)
              </label>
              <input
                type="text"
                value={currentData.platePrefix || ''}
                onChange={(e) => updateField('platePrefix', e.target.value)}
                placeholder="مثال: 4 أو 1"
                className="w-full text-center font-bold text-base px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الرقم التسلسلي (السريال)
              </label>
              <input
                type="text"
                value={currentData.serialNumber || ''}
                onChange={(e) => updateField('serialNumber', e.target.value)}
                placeholder="مثال: 68742-4"
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Form Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الاستمارة
              </label>
              <input
                type="text"
                value={currentData.formNumber || ''}
                onChange={(e) => updateField('formNumber', e.target.value)}
                placeholder="مثال: 111453"
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plate Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                صنف / نوع اللوحة <span className="text-rose-500">*</span>
              </label>
              <select
                value={currentData.plateCategory}
                onChange={(e) => {
                  const val = e.target.value as PlateCategory;
                  updateField('plateCategory', val);
                  if (val === 'commercial') {
                    updateField('plateLetter', 'نقل');
                  } else if (val === 'private') {
                    updateField('plateLetter', 'خصوصي');
                  } else if (val === 'taxi') {
                    updateField('plateLetter', 'أجرة');
                  } else if (val === 'government') {
                    updateField('plateLetter', 'حكومي');
                  }
                }}
                className="w-full font-semibold text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="private">خصوصي (أزرق / شخصي)</option>
                <option value="commercial">نقل (أحمر / نقل وتجاري)</option>
                <option value="taxi">أجرة (أصفر / تاكسي)</option>
                <option value="government">حكومي ورسمي (أخضر)</option>
                <option value="temporary">فحص مؤقت (برتقالي / أصفر)</option>
                <option value="diplomatic">هيئة دبلوماسية</option>
                <option value="motorcycle">دراجة نارية</option>
              </select>
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المحافظة / المدينة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="governorates-list"
                value={currentData.governorate}
                onChange={(e) => updateField('governorate', e.target.value)}
                placeholder="اختر أو اكتب اسم المحافظة"
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="governorates-list">
                {governorates.map((gov) => (
                  <option key={gov} value={gov} />
                ))}
              </datalist>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الدولة / جهة الإصدار
              </label>
              <input
                type="text"
                value={currentData.plateCountry}
                onChange={(e) => updateField('plateCountry', e.target.value)}
                placeholder="الجمهورية اليمنية"
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Registration Record Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم القيد / المعاملة الموحد
              </label>
              <input
                type="text"
                value={currentData.registrationNumber}
                onChange={(e) => updateField('registrationNumber', e.target.value)}
                placeholder="TRQ-2024-XXXXX"
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Traffic Department */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مديرية المرور / دائرة التسجيل والترقيم
              </label>
              <input
                type="text"
                value={currentData.trafficDepartment}
                onChange={(e) => updateField('trafficDepartment', e.target.value)}
                placeholder="مثال: مديرية المرور العامة - مجمع تسجيل وترقيم المركبات"
                className="w-full font-semibold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Issue Date & Expiry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ الإصدار
              </label>
              <input
                type="date"
                value={currentData.issueDate}
                onChange={(e) => updateField('issueDate', e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ انتهاء الصلاحية
              </label>
              <input
                type="date"
                value={currentData.expiryDate}
                onChange={(e) => updateField('expiryDate', e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: INSPECTION & FINANCIAL FEES                                  */}
      {/* =================================================================== */}
      {activeTab === 'inspection' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Inspection Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حالة الفحص الفني الدوري
              </label>
              <select
                value={currentData.inspectionStatus}
                onChange={(e) => updateField('inspectionStatus', e.target.value as 'passed' | 'conditional' | 'exempt')}
                className="w-full font-bold text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-emerald-800"
              >
                <option value="passed">✓ لائق ومجتاز للفحص الفني (Passed)</option>
                <option value="conditional">مشروط / مؤجل</option>
                <option value="exempt">معفى بموجب القانون</option>
              </select>
            </div>

            {/* Inspection Center */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مركز الفحص المعتمد
              </label>
              <input
                type="text"
                value={currentData.inspectionCenter}
                onChange={(e) => updateField('inspectionCenter', e.target.value)}
                placeholder="مركز الفحص الفني الآلي رقم 1"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Inspection Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ الفحص
              </label>
              <input
                type="date"
                value={currentData.inspectionDate}
                onChange={(e) => updateField('inspectionDate', e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم إيصال الرسوم والمالية
              </label>
              <input
                type="text"
                value={currentData.feeReceiptNumber}
                onChange={(e) => updateField('feeReceiptNumber', e.target.value)}
                placeholder="RC-99482"
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Fees */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                إجمالي الرسوم المستوفاة
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currentData.totalFeesPaid}
                  onChange={(e) => updateField('totalFeesPaid', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={currentData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  placeholder="د.ع"
                  className="w-20 font-bold text-sm text-center px-2 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Officer Name / Technical Specialist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مختص الفحص الفني
              </label>
              <input
                type="text"
                value={currentData.officerName}
                onChange={(e) => updateField('officerName', e.target.value)}
                placeholder="الملازم / محمد بجاش الكمالي"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Director of Automated Issuance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مدير الإصدار الآلي
              </label>
              <input
                type="text"
                value={currentData.automatedIssuanceDirector || ''}
                onChange={(e) => updateField('automatedIssuanceDirector', e.target.value)}
                placeholder="العقيد / ماجد الحكيم"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات أو شروط خاصة
              </label>
              <textarea
                rows={2}
                value={currentData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="أي ملاحظات رسمية أو التزامات خاصة بالمركبة..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين الحقول
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSave(currentData)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'تحديث وحفظ الاستمارة' : 'حفظ وتسجيل في الأرشيف'}
          </button>
        </div>
      </div>

      {/* AI Capture & Scanner Modal */}
      <AiCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scanType={currentScanType}
        title={modalTitle}
        subtitle={modalSubtitle}
        onExtractionSuccess={handleAiExtractionSuccess}
      />
    </div>
  );
};
