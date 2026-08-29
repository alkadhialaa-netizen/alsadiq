import React, { useState, useEffect, useRef } from 'react';
import { VehicleRegistration } from '../types';
import { YemenNationalEmblem } from './YemenNationalEmblem';
import { ImagePlus, RotateCcw, Upload } from 'lucide-react';

export type FormTheme = 'classic' | 'navy' | 'emerald' | 'crimson';

const CUSTOM_EMBLEM_STORAGE_KEY = 'yemen_custom_header_emblem';

interface RegistrationFormA4Props {
  data: VehicleRegistration;
  id?: string;
  theme?: FormTheme;
  customEmblemUrl?: string | null;
  onCustomEmblemChange?: (url: string | null) => void;
}

// Official Circular Seal: لجنة الترقيم بالجمارك - إدارة مرور تعز
const CustomsCommitteeSeal = ({ primaryColor = '#1E3A8A' }: { primaryColor?: string }) => (
  <svg viewBox="0 0 120 120" className="w-[72px] h-[72px] select-none drop-shadow-2xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path id="sealTopArc" d="M 18,60 A 42,42 0 0,1 102,60" />
      <path id="sealBottomArc" d="M 102,60 A 42,42 0 0,1 18,60" />
    </defs>
    {/* Outer Double Ring */}
    <circle cx="60" cy="60" r="57" stroke={primaryColor} strokeWidth="2.2" fill="#F8FAFC" fillOpacity="0.4" />
    <circle cx="60" cy="60" r="53" stroke={primaryColor} strokeWidth="0.9" strokeDasharray="2.5 1.5" />
    
    {/* Circular Arched Texts */}
    <text fill={primaryColor} fontSize="7" fontWeight="900" fontFamily="'Cairo', sans-serif" letterSpacing="0.3">
      <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
        الجمهورية اليمنية • وزارة الداخلية
      </textPath>
    </text>
    <text fill={primaryColor} fontSize="7.2" fontWeight="900" fontFamily="'Cairo', sans-serif" letterSpacing="0.3">
      <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
        إدارة مرور محافظة تعز
      </textPath>
    </text>

    {/* Side Stars */}
    <text x="14" y="62.5" fill={primaryColor} fontSize="8" fontWeight="bold" textAnchor="middle">★</text>
    <text x="106" y="62.5" fill={primaryColor} fontSize="8" fontWeight="bold" textAnchor="middle">★</text>

    {/* Inner Circle Ring */}
    <circle cx="60" cy="60" r="35" stroke={primaryColor} strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.9" />
    
    {/* Central Republic Eagle / Traffic Symbol */}
    <g transform="translate(60, 44)">
      {/* Eagle Wings Silhouette */}
      <path
        d="M-22 -8 C-16 -16 -4 -18 0 -8 C4 -18 16 -16 22 -8 C14 -2 8 8 0 14 C-8 8 -14 -2 -22 -8 Z"
        fill={primaryColor}
      />
      {/* Central Shield Accent */}
      <path d="M-6 -4 L6 -4 L6 4 C6 8 0 11 0 11 C0 11 -6 8 -6 4 Z" fill="#DC2626" />
      <path d="M-4 -2 L4 -2 L4 2 L-4 2 Z" fill="#FEF08A" />
    </g>

    {/* Central Official Badge Ribbon: لجنة الترقيم بالجمارك */}
    <rect x="14" y="62" width="92" height="15" rx="3" fill={primaryColor} />
    <rect x="15.5" y="63.5" width="89" height="12" rx="2" fill="none" stroke="#FEF08A" strokeWidth="0.7" />
    <text
      x="60"
      y="72.5"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="7.5"
      fontWeight="900"
      fontFamily="'Cairo', sans-serif"
      letterSpacing="0.2"
    >
      لجنة الترقيم بالجمارك
    </text>
  </svg>
);

const TrafficAuthorityLogo = () => (
  <svg viewBox="0 0 120 120" className="w-11 h-11 drop-shadow-xs select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="taizBadgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="80%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="taizBadgeNavy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <path id="topTextArc" d="M 18,60 A 42,42 0 0,1 102,60" />
      <path id="bottomTextArc" d="M 102,60 A 42,42 0 0,1 18,60" />
    </defs>

    {/* Outer Ring */}
    <circle cx="60" cy="60" r="57" fill="#FFFFFF" stroke="url(#taizBadgeGold)" strokeWidth="3" />
    <circle cx="60" cy="60" r="52" fill="url(#taizBadgeNavy)" stroke="#CA8A04" strokeWidth="1" />

    {/* Circular Text: وزارة الداخلية • إدارة مرور تعز */}
    <text fill="#FEF08A" fontSize="7" fontWeight="bold" fontFamily="'Cairo', sans-serif" letterSpacing="0.3">
      <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
        وزارة الداخلية • الجمهورية اليمنية
      </textPath>
    </text>
    <text fill="#FEF08A" fontSize="7.5" fontWeight="900" fontFamily="'Cairo', sans-serif" letterSpacing="0.4">
      <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
        إدارة مرور محافظة تعز
      </textPath>
    </text>

    {/* Inner White Core */}
    <circle cx="60" cy="60" r="32" fill="#FFFFFF" stroke="url(#taizBadgeGold)" strokeWidth="1.5" />

    {/* Laurel Leaves in Gold/Green */}
    <path d="M36 68 C32 58 35 46 42 38 C40 44 43 52 48 58 C43 62 39 66 36 68 Z" fill="#15803D" />
    <path d="M84 68 C88 58 85 46 78 38 C80 44 77 52 72 58 C77 62 81 66 84 68 Z" fill="#15803D" />

    {/* Central Traffic Badge Shield (Red, White, Black + Traffic Star) */}
    <path d="M48 42 L72 42 L72 62 C72 72 60 78 60 78 C60 78 48 72 48 62 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
    <path d="M50 44 L70 44 L70 54 L50 54 Z" fill="#DC2626" />
    <path d="M50 54 L70 54 L70 63 L50 63 Z" fill="#FFFFFF" />
    <path d="M50 63 L70 63 L70 68 C68 73 60 76 60 76 C60 76 52 73 50 68 Z" fill="#111827" />

    {/* Golden Steering Wheel & Traffic Star in Core */}
    <circle cx="60" cy="56" r="6" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
    <circle cx="60" cy="56" r="2.2" fill="#DC2626" />
    <line x1="60" y1="50" x2="60" y2="62" stroke="#78350F" strokeWidth="1" />
    <line x1="54" y1="56" x2="66" y2="56" stroke="#78350F" strokeWidth="1" />
  </svg>
);

export const RegistrationFormA4: React.FC<RegistrationFormA4Props> = ({
  data,
  id = 'registration-a4-document',
  customEmblemUrl,
  onCustomEmblemChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customEmblem, setCustomEmblem] = useState<string | null>(() => {
    if (customEmblemUrl !== undefined) return customEmblemUrl;
    try {
      return localStorage.getItem(CUSTOM_EMBLEM_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (customEmblemUrl !== undefined) {
      setCustomEmblem(customEmblemUrl);
    }
  }, [customEmblemUrl]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem(CUSTOM_EMBLEM_STORAGE_KEY);
        setCustomEmblem(saved);
      } catch {
        // ignore
      }
    };
    window.addEventListener('yemen_custom_emblem_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('yemen_custom_emblem_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleEmblemFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomEmblem(result);
        try {
          localStorage.setItem(CUSTOM_EMBLEM_STORAGE_KEY, result);
          window.dispatchEvent(new Event('yemen_custom_emblem_updated'));
        } catch (err) {
          console.error('Failed to save emblem in storage:', err);
        }
        if (onCustomEmblemChange) {
          onCustomEmblemChange(result);
        }
      }
    };
    reader.readAsDataURL(file);
    // reset input value so user can re-select same file if needed
    e.target.value = '';
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomEmblem(null);
    try {
      localStorage.removeItem(CUSTOM_EMBLEM_STORAGE_KEY);
      window.dispatchEvent(new Event('yemen_custom_emblem_updated'));
    } catch (err) {
      console.error('Failed to remove emblem from storage:', err);
    }
    if (onCustomEmblemChange) {
      onCustomEmblemChange(null);
    }
  };

  // Check if plate type is "نقل" (Commercial / Transport)
  const isTransport = 
    data.plateCategory === 'commercial' || 
    data.plateLetter?.trim() === 'نقل' || 
    data.plateLetter?.includes('نقل') ||
    (data.plateCategory as string) === 'نقل';

  // Format VIN into exactly 17 character slots
  const rawVin = (data.vinNumber || 'KMJWA37R8FU641664').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const vinChars = Array.from({ length: 17 }, (_, i) => rawVin[i] || '-');

  // Format Plate Display Numbers (e.g. 68742 separated or reversed)
  const plateDigits = data.plateNumber ? data.plateNumber.split('') : ['6', '8', '7', '4', '2'];
  const platePrefix = data.platePrefix || '4';

  // Category in Arabic: "خصوصي" if private, "نقل" if transport
  const categoryName = isTransport ? 'نقل'
    : data.plateCategory === 'taxi' ? 'أجرة' 
    : data.plateCategory === 'government' ? 'حكومي' 
    : 'خصوصي';

  // Formatted Plate Number representation
  const cleanPlateDigits = data.plateNumber || '68742';
  const formattedPlateNumber = isTransport
    ? (platePrefix ? `نقل ${platePrefix}-${cleanPlateDigits}` : `نقل ${cleanPlateDigits}`)
    : (platePrefix ? `خصوصي ${platePrefix}-${cleanPlateDigits}` : `خصوصي ${cleanPlateDigits}`);

  // Color Theme definitions: Blue for خصوصي, Red for نقل
  const themeColors = isTransport ? {
    primary: '#dc2626',       // Red-600
    primaryDark: '#991b1b',   // Red-800
    primaryDeep: '#7f1d1d',   // Red-900
    primaryLight: '#ef4444',  // Red-500
    border: '#ef4444',        // Red-500
    outerBorder: '#dc2626',   // Red-600
    bgLight: 'rgba(254, 242, 242, 0.7)',
    pillBg: '#dc2626',
    pillText: '#ffffff',
    watermark: '#dc2626',
    plateBg: '#b91c1c',       // For YEM country box
    plateCategoryText: '#991b1b',
    plateBorder: '#dc2626',
    accentText: '#dc2626',
    vinBorder: '#ef4444',
    vinText: '#991b1b',
  } : {
    primary: '#1d4ed8',       // Blue-700
    primaryDark: '#1e3a8a',   // Blue-900
    primaryDeep: '#172554',   // Blue-950
    primaryLight: '#2563eb',  // Blue-600
    border: '#2563eb',        // Blue-600
    outerBorder: '#1d4ed8',   // Blue-700
    bgLight: 'rgba(239, 246, 255, 0.6)',
    pillBg: '#1d4ed8',
    pillText: '#ffffff',
    watermark: '#1d4ed8',
    plateBg: '#1e3a8a',       // For YEM country box
    plateCategoryText: '#1e3a8a',
    plateBorder: '#1d4ed8',
    accentText: '#1d4ed8',
    vinBorder: '#2563eb',
    vinText: '#1e40af',
  };

  // Vehicle type in Arabic (supporting both manual text and legacy codes)
  const vehicleTypeMap: Record<string, string> = {
    van: 'باص',
    sedan: 'صالون',
    suv: 'جيب',
    pickup: 'بيك أب',
    bus: 'حافلة',
    truck: 'شاحنة',
    motorcycle: 'دراجة نارية',
    trailer: 'مقطورة',
  };
  const vehicleTypeName = (data.vehicleType && vehicleTypeMap[data.vehicleType]) 
    ? vehicleTypeMap[data.vehicleType] 
    : (data.vehicleType || 'باص');

  // Fuel in Arabic
  const fuelName = data.fuelType === 'petrol' ? 'بترول' 
    : data.fuelType === 'diesel' ? 'ديزل' 
    : data.fuelType === 'hybrid' ? 'هايبرد' 
    : data.fuelType === 'electric' ? 'كهربائي' 
    : 'بترول';

  return (
    <div className="w-full flex justify-center bg-slate-200/70 p-1 sm:p-3 overflow-x-auto print:p-0 print:bg-white print:m-0">
      {/* Exact A4 Canvas: 210mm x 297mm (Strict Fixed Dimensions) */}
      <div
        id={id}
        className="a4-page relative bg-white text-slate-900 mx-auto shadow-xl print:shadow-none select-none shrink-0"
        style={{
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          height: '297mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          padding: '7mm 8mm 6mm 8mm',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: "'Cairo', sans-serif, system-ui",
        }}
      >
        {/* Outer Official Rounded Border (Blue for Private, Red for Transport) */}
        <div 
          className="absolute inset-[6px] border-[2px] rounded-[18px] pointer-events-none z-20 transition-colors"
          style={{ borderColor: themeColors.outerBorder }}
        />

        {/* Security Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none z-0">
          <div className="flex flex-col items-center justify-center text-center rotate-[-15deg] space-y-3">
            <div className="scale-200 transform opacity-80 mb-2">
              <YemenNationalEmblem size="xl" className="w-64 h-48" />
            </div>
            <div 
              className="text-5xl font-black tracking-widest"
              style={{ color: themeColors.watermark }}
            >
              الجمهورية اليمنية
            </div>
            <div className="text-2xl font-black text-slate-900">
              وزارة الداخلية - إدارة مرور محافظة تعز
            </div>
            <div className="text-lg font-bold font-mono tracking-widest">
              لجنة ترقيم الجمارك - تعز
            </div>
          </div>
        </div>

        {/* Inner Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
          
          {/* ========================================================= */}
          {/* 1. Official Header with Emblems                           */}
          {/* ========================================================= */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-2 pt-0.5">
              
              {/* Right Side: Republic of Yemen & Official Hierarchy */}
              <div className="text-right text-[10.5px] leading-snug text-slate-800">
                <p className="font-extrabold text-slate-950 text-[12px]">الجمهورية اليمنية</p>
                <p className="font-bold text-[10px]">وزارة الداخلية</p>
                <p className="font-bold text-[9.5px] text-slate-700">إدارة مرور محافظة تعز</p>
                <p 
                  className="text-[10px] font-black"
                  style={{ color: themeColors.primaryDark }}
                >
                  لجنة ترقيم الجمارك
                </p>
              </div>

              {/* Center Yemen Crest - طير جمهوري واحد في وسط الترويسة (يدعم اختيار صورة مخصصة من المعرض أو الشعار المعتمد) */}
              <div className="relative group flex flex-col items-center justify-center shrink-0 px-2 min-w-[130px] min-h-[72px]">
                {/* Hidden File Input for picking custom emblem from device gallery */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleEmblemFileChange}
                  className="hidden"
                />

                {/* Display either custom uploaded emblem or default official vector eagle */}
                {customEmblem ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer transition transform hover:scale-[1.02] flex items-center justify-center"
                    title="انقر لتغيير صورة الشعار من المعرض"
                  >
                    <img
                      src={customEmblem}
                      alt="شعار الجمهورية اليمنية المعتمد"
                      className="max-h-20 max-w-[140px] w-auto h-auto object-contain drop-shadow-xs select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer transition transform hover:scale-[1.02] flex items-center justify-center"
                    title="انقر لإضافة صورة شعار من المعرض"
                  >
                    <YemenNationalEmblem className="w-32 h-20 drop-shadow-xs" />
                  </div>
                )}

                {/* Interactive Controls Overlay (Hidden when printing/PDF exporting) */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full shadow-lg border border-slate-700 text-[9px] font-bold z-30 pointer-events-auto print:hidden whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 hover:text-amber-300 cursor-pointer transition"
                    title="اختر صورة من المعرض"
                  >
                    <ImagePlus className="w-3 h-3 text-amber-400" />
                    <span>{customEmblem ? 'تغيير الصورة' : 'إضافة صورة من المعرض'}</span>
                  </button>

                  {customEmblem && (
                    <>
                      <span className="text-slate-500">|</span>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="flex items-center gap-0.5 hover:text-rose-400 cursor-pointer text-slate-300 transition"
                        title="استعادة الشعار المتجهي الرسمي"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-rose-400" />
                        <span>استعادة الافتراضي</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Left Side: Department Hierarchy & English Details */}
              <div className="text-left text-[10.5px] leading-snug text-slate-800">
                <p className="font-extrabold text-slate-950 text-[12px]">وزارة الداخلية</p>
                <p className="font-bold text-[10px] text-slate-700">إدارة مرور محافظة تعز</p>
                <p className="text-[10px] font-black" style={{ color: themeColors.primaryDark }}>لجنة ترقيم الجمارك</p>
                <p className="font-mono text-[8px] text-slate-500 font-bold tracking-tight mt-0.5">TAIZ TRAFFIC DEPARTMENT</p>
              </div>

            </div>

            {/* Official Title */}
            <div className="text-center my-0.5">
              <h1 
                className="text-[18px] font-black tracking-wide font-['Cairo'] inline-block relative leading-tight"
                style={{ color: themeColors.primaryDark }}
              >
                استمارة الفحص والترقيم
                {/* Decorative underline */}
                <span 
                  className="block h-[2px] rounded-full w-full mt-0.5 opacity-80"
                  style={{ backgroundColor: themeColors.primaryDark }}
                />
              </h1>
            </div>

            {/* Sub-Header: Metadata (Left) + Plate Visual (Center) + Plate Photo Box (Right) */}
            <div className="grid grid-cols-12 gap-2 items-center px-1">
              
              {/* Left: Serial Number & Metadata */}
              <div className="col-span-3 text-right space-y-2 text-[10px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم تسلسلي :</span>
                  <span 
                    className="font-mono font-black text-[12px] px-2 py-0.5 rounded shadow-2xs"
                    style={{ backgroundColor: themeColors.bgLight, color: themeColors.primaryDark }}
                  >
                    {data.registrationSequenceNumber || data.serialNumber || '4-3580'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم الاستمارة:</span>
                  <span className="font-mono font-black text-slate-900 text-[11px]">{data.formNumber || data.customsDeclarationNumber || 'C2006'}</span>
                </div>
              </div>

              {/* Center: Official Plate Box with Issue Date */}
              <div className="col-span-6 flex flex-col items-center">
                {/* Visual License Plate */}
                <div 
                  className="w-full max-w-[280px] border-[2px] rounded-xl overflow-hidden bg-white shadow-xs flex items-stretch h-[46px] relative"
                  style={{ borderColor: themeColors.plateBorder }}
                >
                  {/* 1. Category Box: خصوصي أو نقل */}
                  <div 
                    className="w-[28%] border-l-[1.5px] flex items-center justify-center text-center px-1 shrink-0 select-none"
                    style={{ 
                      borderColor: themeColors.plateBorder,
                      backgroundColor: themeColors.bgLight,
                    }}
                  >
                    <span 
                      className="text-[14px] font-black tracking-tight leading-none"
                      style={{ color: themeColors.plateCategoryText }}
                    >
                      {categoryName}
                    </span>
                  </div>

                  {/* 2. Plate Number & Prefix Extension */}
                  <div 
                    className="flex-1 flex items-center justify-center font-mono font-black px-2 bg-white relative min-w-0"
                    dir="ltr"
                  >
                    {platePrefix && (
                      <span 
                        className="font-black text-[16px] tracking-tight shrink-0"
                        style={{ color: themeColors.primaryDark }}
                      >
                        {platePrefix}
                      </span>
                    )}

                    {/* Clear, Compact Separator */}
                    <span className="mx-1.5 px-1.5 py-0.2 rounded bg-slate-200 border border-slate-300 text-slate-800 font-black text-[11px] select-none shadow-2xs leading-none shrink-0">
                      -
                    </span>

                    {/* Main Sequential Digits */}
                    <span 
                      className="tracking-wider font-black text-[16px] drop-shadow-2xs shrink-0"
                      style={{ color: themeColors.primaryDark }}
                    >
                      {cleanPlateDigits}
                    </span>
                  </div>

                  {/* 3. Yemen Country Box */}
                  <div 
                    className="w-[18%] text-white flex flex-col items-center justify-center py-0.5 leading-none shrink-0 border-r-[1.5px] select-none"
                    style={{ 
                      backgroundColor: themeColors.plateBg,
                      borderColor: themeColors.plateBorder,
                    }}
                  >
                    <span className="font-mono font-black text-[10px] tracking-wider">YEM</span>
                    <span className="text-[9px] font-black mt-0.5">اليمن</span>
                  </div>

                </div>

                {/* Dates below plate */}
                <div className="flex items-center justify-between w-full max-w-[280px] text-[9px] font-bold text-slate-600 mt-1 px-1">
                  <span>إصدار: <span className="font-mono font-bold text-slate-900">{data.issueDate || '2026/7/7'}</span></span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span>انتهاء: <span className="font-mono font-bold text-slate-900">{data.expiryDate || '---'}</span></span>
                </div>
              </div>

              {/* Right: Plate Photo Dashed Box - Expanded and Enlarged */}
              <div className="col-span-3 flex justify-end">
                <div 
                  className="w-[140px] h-[52px] border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden p-0.5 relative shadow-2xs bg-white"
                  style={{ 
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.bgLight,
                  }}
                >
                  {data.vehiclePlatePhoto ? (
                    <img 
                      src={data.vehiclePlatePhoto} 
                      alt="صورة لوحة المركبة" 
                      className="w-full h-full object-contain rounded-lg bg-white" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span 
                        className="text-[10px] font-black select-none leading-tight"
                        style={{ color: themeColors.primary }}
                      >
                        صورة لوحة الرقم
                      </span>
                      <span className="text-[8px] text-slate-500 mt-0.5">(مرفق اللوحة)</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. Section I: Personal Data & Address (بيانات المالك)     */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-3 py-1 rounded-full flex items-center justify-between text-[10px] font-extrabold shadow-2xs"
              style={{ backgroundColor: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                البيانات الشخصية والعنوان
              </span>
              <span>بيانات المالك</span>
            </div>

            {/* Content Box */}
            <div 
              className="border rounded-lg p-2.5 bg-white flex items-center gap-3"
              style={{ borderColor: themeColors.border }}
            >
              
              {/* Right: Personal Data Grid */}
              <div className="flex-1 space-y-1.5 text-[10px]">
                
                {/* Row 1: Full Name & Phone */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم الرباعي:</span>
                    <span className="font-black text-slate-950 text-[11px] truncate">{data.ownerFullName || 'محمد صالح مثنى راجح'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-black text-slate-900 text-[10.5px]">{data.ownerPhone || '779797629'}</span>
                  </div>
                </div>

                {/* Row 2: Birth Date & Blood Type */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">تاريخ الميلاد:</span>
                    <span className="font-mono font-bold text-slate-800">{data.ownerBirthDate || '---'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">فصيلة الدم:</span>
                    <span className="font-mono font-black text-rose-800 text-[10.5px]">{data.ownerBloodType || 'A+'}</span>
                  </div>
                </div>

                {/* Row 3: ID Type & National ID */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع الهوية:</span>
                    <span className="font-bold text-slate-900">{data.ownerIdType || 'بطاقة شخصية'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهوية:</span>
                    <span className="font-mono font-black text-slate-950 text-[10.5px]">{data.ownerNationalId || '04310027725'}</span>
                  </div>
                </div>

                {/* Row 4: Issue Place & Current Address */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">مكان الإصدار:</span>
                    <span className="font-bold text-slate-900 truncate">{data.ownerIdIssuePlace || `مركز سامع ${data.governorate || 'تعز'}`}</span>
                  </div>
                  <div className="col-span-8 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان الحالي:</span>
                    <span className="font-bold text-slate-950 text-[9.5px] leading-tight truncate">
                      {data.ownerAddress || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Left: 4x6 Portrait Photo Box */}
              <div 
                className="w-[62px] h-[72px] border rounded-lg flex flex-col items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs"
                style={{ 
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.bgLight,
                }}
              >
                {data.ownerPhoto ? (
                  <img src={data.ownerPhoto} alt="Owner 4x6" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="text-center text-slate-400 font-bold">
                    <span className="text-[8.5px] block">صورة 6×4</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. Section II: Technical Vehicle Data                     */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-3 py-1 rounded-full flex items-center justify-between text-[10px] font-extrabold shadow-2xs"
              style={{ backgroundColor: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                البيانات الفنية للمركبة
              </span>
              <span>مواصفات المركبة المسجلة</span>
            </div>

            {/* Content Box */}
            <div 
              className="border rounded-lg p-2.5 bg-white space-y-1.5 text-[9.5px]"
              style={{ borderColor: themeColors.border }}
            >
              
              {/* Row 1: Plate Number & Plate Type */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[9.5px]">رقم اللوحة:</span>
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-bold shadow-2xs"
                    style={{ 
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.bgLight,
                    }}
                  >
                    <span 
                      className="font-black text-[10.5px]"
                      style={{ color: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-400 font-black">|</span>
                    <span className="font-mono font-black text-slate-950 text-[11.5px] tracking-wide" dir="ltr">
                      {platePrefix ? `${platePrefix} - ${cleanPlateDigits}` : cleanPlateDigits}
                    </span>
                  </div>
                </div>
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[9.5px]">نوع وفئة اللوحة:</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-2.5 py-0.5 rounded text-[9.5px] font-black text-white"
                      style={{ backgroundColor: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-500 font-bold text-[8.5px]">
                      ({isTransport ? 'لوحة حمراء - نقل جمركي' : 'لوحة زرقاء - خصوصي'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Make & Vehicle Type */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الماركة:</span>
                  <span className="font-black text-slate-950 text-[10.5px]">{data.make || 'هونداي'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع المركبة:</span>
                  <span className="font-bold text-slate-900 text-[10px]">{vehicleTypeName}</span>
                </div>
              </div>

              {/* Row 3: Body Shape & Color */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الشكل:</span>
                  <span className="font-bold text-slate-800">{data.vehicleBodyShape || '---'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">اللون:</span>
                  <span className="font-black text-slate-950 text-[10px]">{data.color || 'ابيض'}</span>
                </div>
              </div>

              {/* Row 4: Manufacturing Year & Model/Trim */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">سنة الصنع:</span>
                  <span className="font-mono font-black text-slate-950 text-[10.5px]">{data.year || 2015}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الطراز:</span>
                  <span className="font-bold text-slate-800">{data.vehicleModelTrim || data.model || '---'}</span>
                </div>
              </div>

              {/* Row 5: VIN / Chassis with 17 Distinct Letter Boxes */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[9.5px]">رقم القاعدة VIN:</span>
                  <span 
                    className="font-mono font-black tracking-widest text-[10.5px]"
                    style={{ color: themeColors.primaryDark }}
                    dir="ltr"
                  >
                    {data.vinNumber || 'KMJWA37R8FU641664'}
                  </span>
                </div>
                
                {/* 17 Individual Rounded Character Boxes (Strictly Left-to-Right) */}
                <div className="flex items-center justify-between gap-0.5 pt-0.5" dir="ltr">
                  {vinChars.map((char, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-[20px] border rounded-[4px] bg-white flex items-center justify-center font-mono font-black text-[9.5px] shadow-2xs"
                      style={{ 
                        borderColor: themeColors.vinBorder,
                        color: themeColors.vinText,
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Engine Number & Fuel Type */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">رقم المحرك:</span>
                  <span className="font-mono font-black text-slate-950 text-[10px]" dir="ltr">{data.engineNumber || '0'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع الوقود:</span>
                  <span className="font-bold text-slate-900 text-[10px]">{fuelName}</span>
                </div>
              </div>

              {/* Row 7: Cylinders & Customs Declaration Number */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">عدد الأسطوانات:</span>
                  <span className="font-mono font-black text-slate-950 text-[10px]">{data.cylindersCount || 4}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">رقم البيان الجمركي:</span>
                  <span className="font-mono font-black text-slate-950 text-[10px]">{data.customsDeclarationNumber || data.formNumber || 'C2006'}</span>
                </div>
              </div>

              {/* Row 8: Customs Issuing Office */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-slate-600 font-bold whitespace-nowrap">جهة إصدار البيان:</span>
                <span className="font-black text-slate-950 text-[10px]">{data.customsIssuingOffice || data.governorate || 'تعز'}</span>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. Section III: Guarantors & Witnesses (بيانات المعرفين) */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-3 py-1 rounded-full flex items-center justify-between text-[10px] font-extrabold shadow-2xs"
              style={{ backgroundColor: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                بيانات المعرفين (الضامنين والشهود)
              </span>
              <span>الضمانة القانونية</span>
            </div>

            {/* Two Side-by-Side Guarantor Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Guarantor 1 Box */}
              <div 
                className="border rounded-lg p-2.5 bg-white relative space-y-1.5 text-[9.5px]"
                style={{ borderColor: themeColors.border }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-1 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[10.5px]"
                    style={{ color: themeColors.primaryDark }}
                  >
                    المعرف الأول
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-mono font-bold">GUARANTOR-01</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate text-[10px]">
                      {data.guarantor1?.fullName || 'محمد عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900 text-[10px]">
                      {data.guarantor1?.nationalId || '04110042835'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع القرابة:</span>
                    <span className="font-bold text-slate-800">
                      {data.guarantor1?.relationship || 'معرف'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-900 text-[10px]">
                      {data.guarantor1?.phone || '772112313'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[9px] leading-tight truncate">
                      {data.guarantor1?.address || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantor 2 Box */}
              <div 
                className="border rounded-lg p-2.5 bg-white relative space-y-1.5 text-[9.5px]"
                style={{ borderColor: themeColors.border }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-1 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[10.5px]"
                    style={{ color: themeColors.primaryDark }}
                  >
                    المعرف الثاني
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-mono font-bold">GUARANTOR-02</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate text-[10px]">
                      {data.guarantor2?.fullName || 'عزالدين عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900 text-[10px]">
                      {data.guarantor2?.nationalId || '04610011437'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع القرابة:</span>
                    <span className="font-bold text-slate-800">
                      {data.guarantor2?.relationship || 'معرف'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-900 text-[10px]">
                      {data.guarantor2?.phone || '734402762'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[9px] leading-tight truncate">
                      {data.guarantor2?.address || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. Section IV: Official Signatures & Seal                */}
          {/* ========================================================= */}
          <div className="pt-2">
            
            {/* Top Separator Bar */}
            <div 
              className="w-full h-[2px] rounded-full mb-2.5"
              style={{ backgroundColor: themeColors.outerBorder }}
            />

            <div className="flex items-end justify-between px-3 gap-3">
              
              {/* 3 Spacious Official Signature Columns (Chairman -> Specialist -> Director at the end) */}
              <div className="flex-1 grid grid-cols-3 gap-3 items-end text-center">
                
                {/* 1. Technical Specialist (مختص الفحص الفني) */}
                <div className="flex flex-col items-center">
                  <div className="h-8 w-full flex items-end justify-center pb-0.5">
                    <span className="text-[9px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[135px] border-b-[2px] border-slate-700 my-0.5" />
                  <span className="text-[10.5px] font-black text-slate-950 whitespace-nowrap">مختص الفحص الفني</span>
                </div>

                {/* 2. Chairman of Customs Numbering Committee (رئيس لجنة ترقيم الجمارك) */}
                <div className="flex flex-col items-center">
                  <div className="h-8 w-full flex items-end justify-center pb-0.5">
                    <span className="text-[9px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[135px] border-b-[2px] border-slate-700 my-0.5" />
                  <span className="text-[10.5px] font-black text-slate-950 whitespace-nowrap">رئيس لجنة ترقيم الجمارك</span>
                </div>

                {/* 3. Director of Automated Issuance (مدير الإصدار الآلي - في الأخير) */}
                <div className="flex flex-col items-center">
                  <div className="h-8 w-full flex items-end justify-center pb-0.5">
                    <span className="text-[9px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[135px] border-b-[2px] border-slate-700 my-0.5" />
                  <span className="text-[10.5px] font-black text-slate-950 whitespace-nowrap">مدير الإصدار الآلي</span>
                </div>

              </div>

              {/* Official Circular Seal: لجنة الترقيم بالجمارك - إدارة مرور محافظة تعز */}
              <div className="flex flex-col items-center justify-center shrink-0 select-none">
                <div className="relative rotate-[-2deg] transition-transform hover:rotate-0">
                  <CustomsCommitteeSeal primaryColor={themeColors.primaryDark} />
                </div>
                <span 
                  className="text-[8.5px] font-black mt-0.5 tracking-tight"
                  style={{ color: themeColors.primaryDark }}
                >
                  ختم لجنة الترقيم بالجمارك
                </span>
              </div>

            </div>

            {/* Official Bottom Credits Bar on A4 Page */}
            <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[8.5px] text-slate-500 font-bold px-1">
              <span>إدارة مرور محافظة تعز - لجنة ترقيم الجمارك</span>
              <span className="font-mono text-slate-600">مصمم ومطور النظام: المهندس / علاء القاضي</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
