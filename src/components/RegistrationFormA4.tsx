import React from 'react';
import { VehicleRegistration } from '../types';

export type FormTheme = 'classic' | 'navy' | 'emerald' | 'crimson';

interface RegistrationFormA4Props {
  data: VehicleRegistration;
  id?: string;
  theme?: FormTheme;
}

// Yemeni National Crest SVG
const YemenEagleCrest = () => (
  <svg viewBox="0 0 100 80" className="w-12 h-10 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Eagle Wings & Body in Gold / Bronze */}
    <path
      d="M50 18 C45 8, 25 10, 10 24 C22 26, 32 35, 38 48 C42 40, 47 36, 50 36 C53 36, 58 40, 62 48 C68 35, 78 26, 90 24 C75 10, 55 8, 50 18 Z"
      fill="#C5832B"
    />
    <path
      d="M50 14 C48 10, 32 14, 18 28 C28 30, 36 38, 40 50 C44 44, 47 40, 50 40 C53 40, 56 44, 60 50 C64 38, 72 30, 82 28 C68 14, 52 10, 50 14 Z"
      fill="#DDA15E"
    />
    {/* Eagle Head */}
    <path d="M47 16 C47 12, 53 12, 53 16 C53 18, 55 19, 56 18 C57 19, 55 21, 52 21 C48 21, 47 19, 47 16 Z" fill="#99582A" />
    <circle cx="51" cy="15" r="1" fill="#000" />
    {/* Central Shield (Yemen Flag: Red, White, Black + Marib Dam / Coffee Plant) */}
    <g transform="translate(42, 38) scale(0.16)">
      <path d="M50 0 L95 15 L95 65 C95 90 50 105 50 105 C50 105 5 90 5 65 L5 15 Z" fill="#FFFFFF" stroke="#C5832B" strokeWidth="4" />
      {/* Flag Bands */}
      <path d="M7 16 L93 16 L93 38 L7 38 Z" fill="#CE1126" />
      <path d="M7 38 L93 38 L93 60 L7 60 Z" fill="#FFFFFF" />
      <path d="M7 60 L93 60 L93 75 C85 87 50 101 50 101 C50 101 15 87 7 75 Z" fill="#000000" />
      {/* Gold Branch / Dam on Shield */}
      <path d="M30 45 Q50 35 70 45 L65 55 Q50 48 35 55 Z" fill="#DDA15E" />
    </g>
    {/* Scroll / Ribbon at Bottom */}
    <path d="M32 68 Q50 64 68 68 Q50 72 32 68 Z" fill="#DDA15E" stroke="#99582A" strokeWidth="0.75" />
  </svg>
);

// Yemeni Traffic Authority Official Emblem
const TrafficAuthorityLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#1E40AF" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="41" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    {/* Laurel Wreath */}
    <path d="M22 62 C16 48 20 32 30 22 C28 30 32 40 38 48 C32 54 26 60 22 62 Z" fill="#16A34A" />
    <path d="M78 62 C84 48 80 32 70 22 C72 30 68 40 62 48 C68 54 74 60 78 62 Z" fill="#16A34A" />
    {/* Central Red Shield with Traffic Symbol */}
    <path d="M36 32 L64 32 L64 56 C64 68 50 76 50 76 C50 76 36 68 36 56 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.5" />
    {/* Steering Wheel / Traffic Light Icon in Gold */}
    <circle cx="50" cy="46" r="8" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
    <circle cx="50" cy="46" r="3" fill="#DC2626" />
    <path d="M50 38 L50 43 M50 49 L50 54 M42 46 L47 46 M53 46 L58 46" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const RegistrationFormA4: React.FC<RegistrationFormA4Props> = ({
  data,
  id = 'registration-a4-document',
}) => {
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

  // Vehicle type in Arabic
  const vehicleTypeName = data.vehicleType === 'van' ? 'باص'
    : data.vehicleType === 'sedan' ? 'صالون'
    : data.vehicleType === 'suv' ? 'جيب'
    : data.vehicleType === 'pickup' ? 'بيك أب'
    : data.vehicleType === 'bus' ? 'حافلة'
    : data.vehicleType === 'truck' ? 'شاحنة'
    : data.vehicleType === 'motorcycle' ? 'دراجة نارية'
    : 'باص';

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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
          <div className="text-center rotate-[-25deg] space-y-3">
            <div 
              className="text-6xl font-black tracking-widest"
              style={{ color: themeColors.watermark }}
            >
              الجمهورية اليمنية
            </div>
            <div className="text-3xl font-black text-slate-900">
              وزارة الداخلية - الإدارة العامة للمرور تعز
            </div>
            <div className="text-xl font-bold font-mono tracking-widest">
              لجنة ترقيم الجمارك - تعز
            </div>
          </div>
        </div>

        {/* Inner Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
          
          {/* ========================================================= */}
          {/* 1. Official Header with Emblems                           */}
          {/* ========================================================= */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pt-0.5">
              
              {/* Right Side: Republic of Yemen & Official Hierarchy */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full border p-0.5 flex items-center justify-center bg-slate-50 shadow-2xs shrink-0"
                  style={{ borderColor: themeColors.primaryDark }}
                >
                  <TrafficAuthorityLogo />
                </div>
                <div className="text-right text-[8.5px] leading-tight text-slate-800">
                  <p className="font-extrabold text-slate-950 text-[9px]">الجمهورية اليمنية</p>
                  <p className="font-bold text-[7.5px]">وزارة الداخلية</p>
                  <p className="text-[7px] text-slate-700">الإدارة العامة للمرور - تعز</p>
                  <p 
                    className="text-[7.5px] font-black"
                    style={{ color: themeColors.primaryDark }}
                  >
                    لجنة ترقيم الجمارك
                  </p>
                </div>
              </div>

              {/* Center Yemen Crest */}
              <div className="flex flex-col items-center shrink-0">
                <YemenEagleCrest />
              </div>

              {/* Left Side: Department & English / Secondary Badge */}
              <div className="flex items-center gap-2">
                <div className="text-left text-[8.5px] leading-tight text-slate-800">
                  <p className="font-extrabold text-slate-900 text-[9px]">وزارة الداخلية</p>
                  <p className="font-bold text-[7.5px] text-slate-700">الإدارة العامة للمرور - تعز</p>
                  <p className="text-[7px] font-bold" style={{ color: themeColors.primaryDark }}>لجنة ترقيم الجمارك</p>
                  <p className="font-mono text-[6px] text-slate-500 font-bold tracking-tight">TRAFFIC AUTHORITY - TAIZ</p>
                </div>
                <div 
                  className="w-8 h-8 rounded-full border p-0.5 flex items-center justify-center bg-slate-50 shadow-2xs shrink-0"
                  style={{ borderColor: themeColors.primaryDark }}
                >
                  <TrafficAuthorityLogo />
                </div>
              </div>

            </div>

            {/* Official Title */}
            <div className="text-center my-0.5">
              <h1 
                className="text-[17px] font-black tracking-wide font-['Cairo'] inline-block relative leading-tight"
                style={{ color: themeColors.primaryDark }}
              >
                استمارة الفحص والترقيم
                {/* Decorative underline */}
                <span 
                  className="block h-[1.5px] rounded-full w-full mt-0.5 opacity-80"
                  style={{ backgroundColor: themeColors.primaryDark }}
                />
              </h1>
            </div>

            {/* Sub-Header: Metadata (Left) + Plate Visual (Center) + Plate Photo Box (Right) */}
            <div className="grid grid-cols-12 gap-2 items-center px-1">
              
              {/* Left: Serial Number & Metadata */}
              <div className="col-span-3 text-right space-y-1.5 text-[9px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم تسلسلي :</span>
                  <span 
                    className="font-mono font-black text-[10.5px] px-2 py-0.5 rounded shadow-2xs"
                    style={{ backgroundColor: themeColors.bgLight, color: themeColors.primaryDark }}
                  >
                    {data.registrationSequenceNumber || data.serialNumber || '4-3580'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم الاستمارة:</span>
                  <span className="font-mono font-black text-slate-900 text-[10px]">{data.formNumber || data.customsDeclarationNumber || 'C2006'}</span>
                </div>
              </div>

              {/* Center: Official Plate Box with Issue Date */}
              <div className="col-span-6 flex flex-col items-center">
                {/* Visual License Plate */}
                <div 
                  className="w-full max-w-[270px] border-[2px] rounded-xl overflow-hidden bg-white shadow-xs flex items-stretch h-[44px] relative"
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
                      className="text-[13px] font-black tracking-tight leading-none"
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
                        className="font-black text-[15px] tracking-tight shrink-0"
                        style={{ color: themeColors.primaryDark }}
                      >
                        {platePrefix}
                      </span>
                    )}

                    {/* Clear, Compact Separator */}
                    <span className="mx-1.5 px-1.5 py-0.2 rounded bg-slate-200 border border-slate-300 text-slate-800 font-black text-[10.5px] select-none shadow-2xs leading-none shrink-0">
                      -
                    </span>

                    {/* Main Sequential Digits */}
                    <span 
                      className="tracking-wider font-black text-[15px] drop-shadow-2xs shrink-0"
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
                    <span className="font-mono font-black text-[9px] tracking-wider">YEM</span>
                    <span className="text-[8px] font-black mt-0.5">اليمن</span>
                  </div>

                </div>

                {/* Dates below plate */}
                <div className="flex items-center justify-between w-full max-w-[270px] text-[8px] font-semibold text-slate-600 mt-0.5 px-1">
                  <span>إصدار: <span className="font-mono font-bold text-slate-900">{data.issueDate || '2026/7/7'}</span></span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span>انتهاء: <span className="font-mono font-bold text-slate-900">{data.expiryDate || '---'}</span></span>
                </div>
              </div>

              {/* Right: Plate Photo Dashed Box - Expanded and Enlarged */}
              <div className="col-span-3 flex justify-end">
                <div 
                  className="w-[130px] h-[48px] border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden p-0.5 relative shadow-2xs bg-white"
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
                        className="text-[9.5px] font-black select-none leading-tight"
                        style={{ color: themeColors.primary }}
                      >
                        صورة لوحة الرقم
                      </span>
                      <span className="text-[7.5px] text-slate-500 mt-0.5">(مرفق اللوحة)</span>
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
              className="text-white px-2.5 py-0.5 rounded-full flex items-center justify-between text-[8.5px] font-extrabold shadow-2xs"
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
              className="border rounded-lg p-2 bg-white flex items-center gap-2.5"
              style={{ borderColor: themeColors.border }}
            >
              
              {/* Right: Personal Data Grid */}
              <div className="flex-1 space-y-1 text-[9px]">
                
                {/* Row 1: Full Name & Phone */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم الرباعي:</span>
                    <span className="font-black text-slate-950 text-[9.5px] truncate">{data.ownerFullName || 'محمد صالح مثنى راجح'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-900">{data.ownerPhone || '779797629'}</span>
                  </div>
                </div>

                {/* Row 2: Birth Date & Blood Type */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">تاريخ الميلاد:</span>
                    <span className="font-mono font-semibold text-slate-800">{data.ownerBirthDate || '---'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">فصيلة الدم:</span>
                    <span className="font-mono font-black text-rose-800">{data.ownerBloodType || 'A+'}</span>
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
                    <span className="font-mono font-black text-slate-950">{data.ownerNationalId || '04310027725'}</span>
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
                    <span className="font-bold text-slate-950 text-[8.5px] leading-tight truncate">
                      {data.ownerAddress || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Left: 4x6 Portrait Photo Box */}
              <div 
                className="w-[58px] h-[68px] border rounded-lg flex flex-col items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs"
                style={{ 
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.bgLight,
                }}
              >
                {data.ownerPhoto ? (
                  <img src={data.ownerPhoto} alt="Owner 4x6" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="text-center text-slate-400 font-bold">
                    <span className="text-[8px] block">صورة 6×4</span>
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
              className="text-white px-2.5 py-0.5 rounded-full flex items-center justify-between text-[8.5px] font-extrabold shadow-2xs"
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
              className="border rounded-lg p-2 bg-white space-y-1 text-[8.5px]"
              style={{ borderColor: themeColors.border }}
            >
              
              {/* Row 1: Plate Number & Plate Type */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[8.5px]">رقم اللوحة:</span>
                  <div 
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-bold shadow-2xs"
                    style={{ 
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.bgLight,
                    }}
                  >
                    <span 
                      className="font-black text-[9px]"
                      style={{ color: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-400 font-black">|</span>
                    <span className="font-mono font-black text-slate-950 text-[10.5px] tracking-wide" dir="ltr">
                      {platePrefix ? `${platePrefix} - ${cleanPlateDigits}` : cleanPlateDigits}
                    </span>
                  </div>
                </div>
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[8.5px]">نوع وفئة اللوحة:</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-2 py-0.5 rounded text-[8.5px] font-black text-white"
                      style={{ backgroundColor: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-500 font-bold text-[7.5px]">
                      ({isTransport ? 'لوحة حمراء - نقل جمركي' : 'لوحة زرقاء - خصوصي'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Make & Vehicle Type */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الماركة:</span>
                  <span className="font-black text-slate-950">{data.make || 'هونداي'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع المركبة:</span>
                  <span className="font-bold text-slate-900">{vehicleTypeName}</span>
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
                  <span className="font-black text-slate-950">{data.color || 'ابيض'}</span>
                </div>
              </div>

              {/* Row 4: Manufacturing Year & Model/Trim */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">سنة الصنع:</span>
                  <span className="font-mono font-black text-slate-950">{data.year || 2015}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الطراز:</span>
                  <span className="font-bold text-slate-800">{data.vehicleModelTrim || data.model || '---'}</span>
                </div>
              </div>

              {/* Row 5: VIN / Chassis with 17 Distinct Letter Boxes */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">رقم القاعدة VIN:</span>
                  <span 
                    className="font-mono font-black tracking-widest text-[9.5px]"
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
                      className="flex-1 h-[17px] border rounded-[3px] bg-white flex items-center justify-center font-mono font-black text-[8.5px] shadow-2xs"
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
                  <span className="font-mono font-black text-slate-950" dir="ltr">{data.engineNumber || '0'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع الوقود:</span>
                  <span className="font-bold text-slate-900">{fuelName}</span>
                </div>
              </div>

              {/* Row 7: Cylinders & Customs Declaration Number */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">عدد الأسطوانات:</span>
                  <span className="font-mono font-black text-slate-950">{data.cylindersCount || 4}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">رقم البيان الجمركي:</span>
                  <span className="font-mono font-black text-slate-950">{data.customsDeclarationNumber || data.formNumber || 'C2006'}</span>
                </div>
              </div>

              {/* Row 8: Customs Issuing Office */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-slate-600 font-bold whitespace-nowrap">جهة إصدار البيان:</span>
                <span className="font-black text-slate-950">{data.customsIssuingOffice || data.governorate || 'تعز'}</span>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. Section III: Guarantors & Witnesses (بيانات المعرفين) */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-2.5 py-0.5 rounded-full flex items-center justify-between text-[8.5px] font-extrabold shadow-2xs"
              style={{ backgroundColor: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                بيانات المعرفين (الضامنين والشهود)
              </span>
              <span>الضمانة القانونية</span>
            </div>

            {/* Two Side-by-Side Guarantor Cards */}
            <div className="grid grid-cols-2 gap-2">
              
              {/* Guarantor 1 Box */}
              <div 
                className="border rounded-lg p-2 bg-white relative space-y-1 text-[8.5px]"
                style={{ borderColor: themeColors.border }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-0.5 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[9px]"
                    style={{ color: themeColors.primaryDark }}
                  >
                    المعرف الأول
                  </span>
                  <span className="text-[7px] text-slate-400 font-mono font-bold">GUARANTOR-01</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate">
                      {data.guarantor1?.fullName || 'محمد عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900">
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
                    <span className="font-mono font-bold text-slate-900">
                      {data.guarantor1?.phone || '772112313'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[8px] leading-tight truncate">
                      {data.guarantor1?.address || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantor 2 Box */}
              <div 
                className="border rounded-lg p-2 bg-white relative space-y-1 text-[8.5px]"
                style={{ borderColor: themeColors.border }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-0.5 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[9px]"
                    style={{ color: themeColors.primaryDark }}
                  >
                    المعرف الثاني
                  </span>
                  <span className="text-[7px] text-slate-400 font-mono font-bold">GUARANTOR-02</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate">
                      {data.guarantor2?.fullName || 'عزالدين عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900">
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
                    <span className="font-mono font-bold text-slate-900">
                      {data.guarantor2?.phone || '734402762'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[8px] leading-tight truncate">
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
          <div className="pt-1">
            
            {/* Top Separator Bar */}
            <div 
              className="w-full h-[1.5px] rounded-full mb-2"
              style={{ backgroundColor: themeColors.outerBorder }}
            />

            <div className="flex items-end justify-between px-2 gap-2">
              
              {/* 3 Spacious Official Signature Columns (Chairman -> Specialist -> Director at the end) */}
              <div className="flex-1 grid grid-cols-3 gap-2 items-end text-center">
                
                {/* 1. Chairman of Customs Numbering Committee (رئيس لجنة ترقيم الجمارك) */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-blue-950 pb-0.5 whitespace-nowrap truncate max-w-full">
                    المقدم / صادق القاضي
                  </div>
                  <div className="w-full max-w-[125px] border-b-[1.5px] border-slate-700 my-0.5" />
                  <span className="text-[9px] font-black text-slate-950 whitespace-nowrap">رئيس لجنة ترقيم الجمارك</span>
                </div>

                {/* 2. Technical Specialist (مختص الفحص الفني) */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-950 pb-0.5 whitespace-nowrap truncate max-w-full">
                    {data.officerName && !data.officerName.includes('صادق') ? (data.officerName.startsWith('الملازم') ? data.officerName : `الملازم / ${data.officerName}`) : 'الملازم / محمد بجاش الكمالي'}
                  </div>
                  <div className="w-full max-w-[125px] border-b-[1.5px] border-slate-700 my-0.5" />
                  <span className="text-[9px] font-black text-slate-950 whitespace-nowrap">مختص الفحص الفني</span>
                </div>

                {/* 3. Director of Automated Issuance (مدير الإصدار الآلي - في الأخير) */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-blue-950 pb-0.5 whitespace-nowrap truncate max-w-full">
                    {data.automatedIssuanceDirector || 'العقيد / ماجد الحكيم'}
                  </div>
                  <div className="w-full max-w-[125px] border-b-[1.5px] border-slate-700 my-0.5" />
                  <span className="text-[9px] font-black text-slate-950 whitespace-nowrap">مدير الإصدار الآلي</span>
                </div>

              </div>

              {/* Official Circular Seal: الإدارة العامة للمرور - تعز */}
              <div className="flex flex-col items-center justify-center shrink-0 select-none">
                <div 
                  className="w-14 h-14 rounded-full border-2 border-double border-blue-900 flex flex-col items-center justify-center p-0.5 text-center bg-blue-50/20 shadow-2xs relative rotate-[-2deg]"
                  style={{ borderColor: themeColors.primaryDark }}
                >
                  {/* Inner dashed ring */}
                  <div className="absolute inset-[2px] rounded-full border border-dashed border-blue-800/60 pointer-events-none" />
                  
                  <span className="text-[6.5px] font-black text-blue-950 leading-tight">
                    الجمهورية اليمنية
                  </span>
                  <span className="text-[5.5px] font-bold text-slate-700 leading-tight">
                    شرطة السير - تعز
                  </span>
                  <span className="text-[8px] font-black text-blue-900 leading-none my-0.2">
                    🦅
                  </span>
                  <span className="text-[6px] font-black text-blue-950 bg-blue-100/80 px-1 py-0.2 rounded leading-tight">
                    لجنة الترقيم
                  </span>
                </div>
                <span className="text-[7.5px] font-black text-blue-900 mt-0.5">
                  ختم الإدارة المعتمد
                </span>
              </div>

            </div>

            {/* Official Bottom Credits Bar on A4 Page */}
            <div className="pt-1 mt-1 border-t border-slate-200/80 flex items-center justify-between text-[7.5px] text-slate-500 font-bold px-1">
              <span>الإدارة العامة للمرور تعز - لجنة ترقيم الجمارك • رئيس اللجنة: المقدم / صادق القاضي</span>
              <span className="font-mono text-slate-600">مصمم ومطور النظام: المهندس / علاء القاضي</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
