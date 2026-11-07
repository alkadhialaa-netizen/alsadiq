import React, { useState, useEffect, useRef } from 'react';
import { VehicleRegistration } from '../types';
import { YemenNationalEmblem } from './YemenNationalEmblem';
import { MinistryOfInteriorEmblem } from './MinistryOfInteriorEmblem';
import { TrafficDepartmentEmblem } from './TrafficDepartmentEmblem';
import { ImagePlus, RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { rotateBase64Image, preparePlateImageFile } from './PlatePhotoEditor';
import { isLikelyCarModelOrTrim, isLikelyEngineNumber, getCurrentDeviceDate } from '../utils/customsNormalizer';

export type FormTheme = 'classic' | 'navy' | 'emerald' | 'crimson';

const CUSTOM_EMBLEM_STORAGE_KEY = 'yemen_custom_header_emblem';
const CUSTOM_MOI_EMBLEM_STORAGE_KEY = 'yemen_custom_moi_emblem';
const CUSTOM_TRAFFIC_EMBLEM_STORAGE_KEY = 'yemen_custom_traffic_emblem';
const WATERMARK_SIZE_STORAGE_KEY = 'yemen_watermark_size_v4_px';
const WATERMARK_OPACITY_STORAGE_KEY = 'yemen_watermark_opacity_v1';
const FORM_FONT_SCALE_STORAGE_KEY = 'yemen_form_font_scale_v1';
const FORM_COLOR_THEME_STORAGE_KEY = 'yemen_form_color_theme_v1';

interface RegistrationFormA4Props {
  data: VehicleRegistration;
  id?: string;
  theme?: FormTheme;
  customEmblemUrl?: string | null;
  onCustomEmblemChange?: (url: string | null) => void;
  onUpdateData?: (updated: VehicleRegistration) => void;
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
  onUpdateData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moiFileInputRef = useRef<HTMLInputElement>(null);
  const trafficFileInputRef = useRef<HTMLInputElement>(null);
  const plateFileInputRef = useRef<HTMLInputElement>(null);
  const [customEmblem, setCustomEmblem] = useState<string | null>(() => {
    if (customEmblemUrl !== undefined) return customEmblemUrl;
    try {
      return localStorage.getItem(CUSTOM_EMBLEM_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [customMoiEmblem, setCustomMoiEmblem] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_MOI_EMBLEM_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [customTrafficEmblem, setCustomTrafficEmblem] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_TRAFFIC_EMBLEM_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [watermarkSize, setWatermarkSize] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(WATERMARK_SIZE_STORAGE_KEY));
      return saved >= 60 && saved <= 700 ? saved : 210;
    } catch {
      return 210;
    }
  });

  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(WATERMARK_OPACITY_STORAGE_KEY));
      return saved >= 0.04 && saved <= 0.65 ? saved : 0.13;
    } catch {
      return 0.13;
    }
  });

  const [formFontScale, setFormFontScale] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(FORM_FONT_SCALE_STORAGE_KEY));
      return saved >= 0.85 && saved <= 1.3 ? saved : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [formColorTheme, setFormColorTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(FORM_COLOR_THEME_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
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
        const savedMoi = localStorage.getItem(CUSTOM_MOI_EMBLEM_STORAGE_KEY);
        setCustomMoiEmblem(savedMoi);
        const savedTraffic = localStorage.getItem(CUSTOM_TRAFFIC_EMBLEM_STORAGE_KEY);
        setCustomTrafficEmblem(savedTraffic);
        const savedSize = Number(localStorage.getItem(WATERMARK_SIZE_STORAGE_KEY));
        if (savedSize >= 60 && savedSize <= 700) {
          setWatermarkSize(savedSize);
        }
        const savedOpacity = Number(localStorage.getItem(WATERMARK_OPACITY_STORAGE_KEY));
        if (savedOpacity >= 0.04 && savedOpacity <= 0.65) {
          setWatermarkOpacity(savedOpacity);
        }
        const savedFontScale = Number(localStorage.getItem(FORM_FONT_SCALE_STORAGE_KEY));
        if (savedFontScale >= 0.85 && savedFontScale <= 1.3) {
          setFormFontScale(savedFontScale);
        }
        const savedColorTheme = localStorage.getItem(FORM_COLOR_THEME_STORAGE_KEY);
        if (savedColorTheme === 'light' || savedColorTheme === 'dark') {
          setFormColorTheme(savedColorTheme);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('yemen_custom_emblem_updated', handleStorageUpdate);
    window.addEventListener('yemen_custom_moi_emblem_updated', handleStorageUpdate);
    window.addEventListener('yemen_custom_traffic_emblem_updated', handleStorageUpdate);
    window.addEventListener('yemen_watermark_size_updated', handleStorageUpdate);
    window.addEventListener('yemen_watermark_opacity_updated', handleStorageUpdate);
    window.addEventListener('yemen_form_font_scale_updated', handleStorageUpdate);
    window.addEventListener('yemen_form_color_theme_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('yemen_custom_emblem_updated', handleStorageUpdate);
      window.removeEventListener('yemen_custom_moi_emblem_updated', handleStorageUpdate);
      window.removeEventListener('yemen_custom_traffic_emblem_updated', handleStorageUpdate);
      window.removeEventListener('yemen_watermark_size_updated', handleStorageUpdate);
      window.removeEventListener('yemen_watermark_opacity_updated', handleStorageUpdate);
      window.removeEventListener('yemen_form_font_scale_updated', handleStorageUpdate);
      window.removeEventListener('yemen_form_color_theme_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleTrafficFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomTrafficEmblem(result);
        try {
          localStorage.setItem(CUSTOM_TRAFFIC_EMBLEM_STORAGE_KEY, result);
          window.dispatchEvent(new Event('yemen_custom_traffic_emblem_updated'));
        } catch (err) {
          console.error('Failed to save Traffic emblem in storage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetTrafficToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTrafficEmblem(null);
    try {
      localStorage.removeItem(CUSTOM_TRAFFIC_EMBLEM_STORAGE_KEY);
      window.dispatchEvent(new Event('yemen_custom_traffic_emblem_updated'));
    } catch (err) {
      console.error('Failed to remove Traffic emblem from storage:', err);
    }
  };

  const handleMoiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomMoiEmblem(result);
        try {
          localStorage.setItem(CUSTOM_MOI_EMBLEM_STORAGE_KEY, result);
          window.dispatchEvent(new Event('yemen_custom_moi_emblem_updated'));
        } catch (err) {
          console.error('Failed to save MOI emblem in storage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetMoiToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomMoiEmblem(null);
    try {
      localStorage.removeItem(CUSTOM_MOI_EMBLEM_STORAGE_KEY);
      window.dispatchEvent(new Event('yemen_custom_moi_emblem_updated'));
    } catch (err) {
      console.error('Failed to remove MOI emblem from storage:', err);
    }
  };

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

  // Color Theme definitions: Blue for خصوصي, Red for نقل (نمط غامق ورسمي هيبته عالية)
  const isDarkTone = formColorTheme !== 'light';

  const themeColors = isTransport ? (
    isDarkTone ? {
      primary: '#991b1b',       // Deep Dark Crimson (غامق ورسمي)
      primaryDark: '#7f1d1d',   // Deep Burgundy Red
      primaryDeep: '#450a0a',   // Darkest Maroon
      primaryLight: '#b91c1c',  // Red-700
      border: '#991b1b',        // Dark solid border
      boxBorder: '#991b1b',     // Dark solid box border
      outerBorder: '#7f1d1d',   // Heavy dark outer line
      bgLight: '#fee2e2',       // Rose-100 tint
      pillBg: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 100%)',
      pillText: '#ffffff',
      watermark: '#991b1b',
      plateBg: '#7f1d1d',       // Deep crimson YEM box
      plateCategoryText: '#7f1d1d',
      plateBorder: '#7f1d1d',
      accentText: '#991b1b',
      vinBorder: '#991b1b',
      vinText: '#7f1d1d',
    } : {
      primary: '#e11d48',       // Rose-600 / Bright clear crimson
      primaryDark: '#be123c',   // Rose-700
      primaryDeep: '#9f1239',   // Rose-800
      primaryLight: '#fb7185',  // Rose-400
      border: '#fca5a5',        // Rose-300
      boxBorder: '#fca5a5',     
      outerBorder: '#f43f5e',   
      bgLight: '#fff1f2',       // Rose-50
      pillBg: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
      pillText: '#ffffff',
      watermark: '#f43f5e',
      plateBg: '#e11d48',       
      plateCategoryText: '#be123c',
      plateBorder: '#f43f5e',
      accentText: '#e11d48',
      vinBorder: '#fda4af',
      vinText: '#be123c',
    }
  ) : (
    isDarkTone ? {
      primary: '#1e3a8a',       // Deep Royal Navy Blue (غامق ورسمي)
      primaryDark: '#172554',   // Deepest Midnight Blue
      primaryDeep: '#0f172a',   // Darkest Navy
      primaryLight: '#1d4ed8',  // Blue-700
      border: '#1e3a8a',        // Dark solid border
      boxBorder: '#1e3a8a',     // Dark solid box border
      outerBorder: '#172554',   // Heavy dark outer line
      bgLight: '#dbeafe',       // Blue-100 tint
      pillBg: 'linear-gradient(90deg, #172554 0%, #1e3a8a 100%)',
      pillText: '#ffffff',
      watermark: '#1e3a8a',
      plateBg: '#172554',       // Deep navy YEM box
      plateCategoryText: '#172554',
      plateBorder: '#172554',
      accentText: '#1e3a8a',
      vinBorder: '#1e3a8a',
      vinText: '#172554',
    } : {
      primary: '#2563eb',       // Royal Blue-600
      primaryDark: '#1d4ed8',   // Blue-700
      primaryDeep: '#1e40af',   // Blue-800
      primaryLight: '#60a5fa',  // Blue-400
      border: '#93c5fd',        // Blue-300
      boxBorder: '#93c5fd',     
      outerBorder: '#3b82f6',   
      bgLight: '#f0f7ff',       // Sky-50
      pillBg: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
      pillText: '#ffffff',
      watermark: '#2563eb',
      plateBg: '#2563eb',       
      plateCategoryText: '#1d4ed8',
      plateBorder: '#3b82f6',
      accentText: '#2563eb',
      vinBorder: '#93c5fd',     
      vinText: '#1d4ed8',
    }
  );

  // Vehicle type in Arabic (e.g. توسان, برادو, تريوس, شاص, هيلوكس, باص H1)
  // According to Yemeni Traffic Department and customs procedures, "نوع المركبة" records the commercial model name
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
  const vehicleTypeName = (() => {
    // 1. If explicit vehicle model/name exists (e.g. توسان, برادو, تريوس, شاص, هيلوكس, باص H1)
    const explicitModel = data.model?.trim();
    if (explicitModel && explicitModel !== '---') {
      return explicitModel;
    }
    // 2. If data.vehicleType is an Arabic specific name (e.g. توسان, برادو, تريوس, شاص, هيلوكس)
    if (data.vehicleType && !vehicleTypeMap[data.vehicleType] && data.vehicleType.trim() !== '') {
      return data.vehicleType.trim();
    }
    // 3. Fallback to mapped vehicle type
    if (data.vehicleType && vehicleTypeMap[data.vehicleType]) {
      return vehicleTypeMap[data.vehicleType];
    }
    return data.vehicleType || 'توسان';
  })();

  // Safeguard against inadvertent swap in stored records
  const displayEngine = (() => {
    const rawEng = data.engineNumber ? String(data.engineNumber).trim() : '';
    const rawTrim = data.vehicleModelTrim ? String(data.vehicleModelTrim).trim() : '';
    if (isLikelyCarModelOrTrim(rawEng) && isLikelyEngineNumber(rawTrim)) {
      return rawTrim;
    }
    return rawEng;
  })();

  const displayTrim = (() => {
    const rawEng = data.engineNumber ? String(data.engineNumber).trim() : '';
    const rawTrim = data.vehicleModelTrim ? String(data.vehicleModelTrim).trim() : '';
    if (isLikelyCarModelOrTrim(rawEng) && isLikelyEngineNumber(rawTrim)) {
      return rawEng;
    }
    return rawTrim && rawTrim.trim() !== '' ? rawTrim : (data.model || 'قياسي');
  })();

  // Fuel in Arabic
  const fuelName = data.fuelType === 'petrol' ? 'بترول' 
    : data.fuelType === 'diesel' ? 'ديزل' 
    : data.fuelType === 'hybrid' ? 'هايبرد' 
    : data.fuelType === 'electric' ? 'كهربائي' 
    : 'بترول';

  return (
    <div className="w-full flex justify-center bg-slate-100 p-1 sm:p-3 overflow-x-auto print:p-0 print:bg-white print:m-0">
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

        {/* Inner Content Wrapper */}
        <div 
          className="relative z-10 flex flex-col justify-between h-full space-y-2.5"
          style={formFontScale !== 1.0 ? ({ zoom: formFontScale } as React.CSSProperties) : undefined}
        >
          
          {/* ========================================================= */}
          {/* 1. Official Header with Emblems                           */}
          {/* ========================================================= */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-2 pt-0.5">
              
              {/* Right Side: Republic of Yemen & Official Hierarchy */}
              <div className="text-right text-[11px] leading-snug text-slate-800">
                <p className="font-extrabold text-slate-950 text-[13px]">الجمهورية اليمنية</p>
                <p className="font-bold text-[11px]">وزارة الداخلية</p>
                <p className="font-bold text-[10.5px] text-slate-700">إدارة مرور محافظة تعز</p>
                <p 
                  className="text-[11px] font-black"
                  style={{ color: themeColors.primaryDark }}
                >
                  لجنة ترقيم الجمارك
                </p>
              </div>

              {/* Center Emblems: شعار إدارة المرور (من الجهة الخلفية للطائر الجمهوري) + الطائر الجمهوري + شعار وزارة الداخلية (قدام الطائر الجمهوري) */}
              <div className="flex items-center justify-center gap-2.5 shrink-0 px-1 min-h-[74px]">
                {/* 1. Traffic Department Emblem (شعار الإدارة العامة للمرور - من الجهة الخلفية للطائر الجمهوري) */}
                <div className="relative group/traffic flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                  <input
                    ref={trafficFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleTrafficFileChange}
                    className="hidden"
                  />

                  {customTrafficEmblem ? (
                    <div
                      onClick={() => trafficFileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.03] flex items-center justify-center"
                      title="انقر لتغيير صورة شعار إدارة المرور من المعرض"
                    >
                      <img
                        src={customTrafficEmblem}
                        alt="شعار الإدارة العامة للمرور"
                        className="max-h-[70px] max-w-[80px] w-auto h-auto object-contain drop-shadow-xs select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => trafficFileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.03] flex items-center justify-center"
                      title="انقر لاختيار صورة شعار إدارة المرور من المعرض"
                    >
                      <TrafficDepartmentEmblem className="w-[68px] h-[72px] drop-shadow-xs" />
                    </div>
                  )}

                  {/* Interactive Controls Overlay for Traffic Department Emblem */}
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/traffic:opacity-100 transition-all duration-200 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full shadow-lg border border-slate-700 text-[8.5px] font-bold z-30 pointer-events-auto print:hidden whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => trafficFileInputRef.current?.click()}
                      className="flex items-center gap-0.5 hover:text-amber-300 cursor-pointer transition"
                    >
                      <ImagePlus className="w-2.5 h-2.5 text-amber-400" />
                      <span>{customTrafficEmblem ? 'تغيير شعار المرور' : 'شعار المرور من المعرض'}</span>
                    </button>

                    {customTrafficEmblem && (
                      <>
                        <span className="text-slate-500">|</span>
                        <button
                          type="button"
                          onClick={handleResetTrafficToDefault}
                          className="flex items-center gap-0.5 hover:text-rose-400 cursor-pointer text-slate-300 transition"
                          title="استعادة شعار المرور المعتمد"
                        >
                          <RotateCcw className="w-2.5 h-2.5 text-rose-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Republican Eagle (الطائر الجمهوري في المنتصف) */}
                <div className="relative group flex flex-col items-center justify-center shrink-0 min-w-[95px]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleEmblemFileChange}
                    className="hidden"
                  />

                  {customEmblem ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.02] flex items-center justify-center"
                      title="انقر لتغيير صورة الطائر الجمهوري من المعرض"
                    >
                      <img
                        src={customEmblem}
                        alt="شعار الجمهورية اليمنية المعتمد"
                        className="max-h-[72px] max-w-[115px] w-auto h-auto object-contain drop-shadow-xs select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.02] flex items-center justify-center"
                      title="انقر لإضافة صورة الطائر الجمهوري من المعرض"
                    >
                      <YemenNationalEmblem className="w-28 h-[72px] drop-shadow-xs" />
                    </div>
                  )}

                  {/* Interactive Controls Overlay for Republican Eagle */}
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full shadow-lg border border-slate-700 text-[8.5px] font-bold z-30 pointer-events-auto print:hidden whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-0.5 hover:text-amber-300 cursor-pointer transition"
                    >
                      <ImagePlus className="w-2.5 h-2.5 text-amber-400" />
                      <span>{customEmblem ? 'تغيير الشعار' : 'شعار الجمهورية'}</span>
                    </button>

                    {customEmblem && (
                      <>
                        <span className="text-slate-500">|</span>
                        <button
                          type="button"
                          onClick={handleResetToDefault}
                          className="flex items-center gap-0.5 hover:text-rose-400 cursor-pointer text-slate-300 transition"
                        >
                          <RotateCcw className="w-2.5 h-2.5 text-rose-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Ministry of Interior Emblem (شعار وزارة الداخلية قدام الطائر الجمهوري) */}
                <div className="relative group/moi flex flex-col items-center justify-center shrink-0 min-w-[74px]">
                  <input
                    ref={moiFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleMoiFileChange}
                    className="hidden"
                  />

                  {customMoiEmblem ? (
                    <div
                      onClick={() => moiFileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.03] flex items-center justify-center"
                      title="انقر لتغيير صورة شعار وزارة الداخلية من المعرض"
                    >
                      <img
                        src={customMoiEmblem}
                        alt="شعار وزارة الداخلية اليمنية"
                        className="max-h-[72px] max-w-[85px] w-auto h-auto object-contain drop-shadow-xs select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => moiFileInputRef.current?.click()}
                      className="relative cursor-pointer transition transform hover:scale-[1.03] flex items-center justify-center"
                      title="انقر لاختيار صورة شعار وزارة الداخلية من المعرض"
                    >
                      <MinistryOfInteriorEmblem className="w-[68px] h-[74px] drop-shadow-xs" />
                    </div>
                  )}

                  {/* Interactive Controls Overlay for Ministry of Interior Emblem */}
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/moi:opacity-100 transition-all duration-200 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full shadow-lg border border-slate-700 text-[8.5px] font-bold z-30 pointer-events-auto print:hidden whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => moiFileInputRef.current?.click()}
                      className="flex items-center gap-0.5 hover:text-amber-300 cursor-pointer transition"
                    >
                      <ImagePlus className="w-2.5 h-2.5 text-amber-400" />
                      <span>{customMoiEmblem ? 'تغيير شعار الداخلية' : 'صورة الداخلية من المعرض'}</span>
                    </button>

                    {customMoiEmblem && (
                      <>
                        <span className="text-slate-500">|</span>
                        <button
                          type="button"
                          onClick={handleResetMoiToDefault}
                          className="flex items-center gap-0.5 hover:text-rose-400 cursor-pointer text-slate-300 transition"
                          title="استعادة الشعار المعتمد"
                        >
                          <RotateCcw className="w-2.5 h-2.5 text-rose-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Side: Department Hierarchy & English Details */}
              <div className="text-left text-[11px] leading-snug text-slate-800">
                <p className="font-extrabold text-slate-950 text-[13px]">وزارة الداخلية</p>
                <p className="font-bold text-[11px] text-slate-700">إدارة مرور محافظة تعز</p>
                <p className="text-[11px] font-black" style={{ color: themeColors.primaryDark }}>لجنة ترقيم الجمارك</p>
                <p className="font-mono text-[8.5px] text-slate-500 font-bold tracking-tight mt-0.5">TAIZ TRAFFIC DEPARTMENT</p>
              </div>

            </div>

            {/* Official Title */}
            <div className="text-center my-0.5">
              <h1 
                className="text-[19.5px] font-black tracking-wide font-['Cairo'] inline-block relative leading-tight"
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
              <div className="col-span-3 text-right space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم تسلسلي :</span>
                  <span 
                    className="font-mono font-black text-[13px] px-2 py-0.5 rounded shadow-2xs"
                    style={{ backgroundColor: themeColors.bgLight, color: themeColors.primaryDark }}
                  >
                    {data.registrationSequenceNumber || data.serialNumber || '4-3580'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-600 whitespace-nowrap">رقم الاستمارة:</span>
                  <span className="font-mono font-black text-slate-900 text-[12px]">{data.formNumber || data.customsDeclarationNumber || 'C2006'}</span>
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
                <div className="flex items-center justify-between w-full max-w-[280px] text-[10px] font-bold text-slate-600 mt-1 px-1">
                  <span>إصدار: <span className="font-mono font-bold text-slate-900">{data.issueDate && data.issueDate !== '2026/7/7' ? data.issueDate : getCurrentDeviceDate()}</span></span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span>انتهاء: <span className="font-mono font-bold text-slate-900">{data.expiryDate || '---'}</span></span>
                </div>
              </div>

              {/* Right: Plate Photo Dashed Box - Expanded and Enlarged with Gallery Picker, Rotate & Expand */}
              <div className="col-span-3 flex justify-end relative group/platebox">
                {onUpdateData && (
                  <input
                    ref={plateFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const prepared = await preparePlateImageFile(file);
                        onUpdateData({
                          ...data,
                          vehiclePlatePhoto: prepared,
                          platePhotoRotation: 0,
                          platePhotoScale: 1,
                          platePhotoFit: 'fill',
                          platePhotoOffsetX: 0,
                          platePhotoOffsetY: 0,
                          updatedAt: new Date().toISOString(),
                        });
                      } catch (err) {
                        console.error(err);
                      }
                      e.target.value = '';
                    }}
                  />
                )}

                <div 
                  onClick={() => {
                    if (onUpdateData && !data.vehiclePlatePhoto) {
                      plateFileInputRef.current?.click();
                    }
                  }}
                  className={`w-[140px] h-[52px] border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden p-0.5 relative shadow-2xs bg-white ${
                    onUpdateData && !data.vehiclePlatePhoto ? 'cursor-pointer hover:opacity-85 transition' : ''
                  }`}
                  style={{ 
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.bgLight,
                  }}
                  title={onUpdateData ? 'صورة لوحة السيارة (مرر الماوس للتدوير والتوسيع أو التغيير من المعرض)' : undefined}
                >
                  {data.vehiclePlatePhoto ? (
                    <img 
                      src={data.vehiclePlatePhoto} 
                      alt="صورة لوحة المركبة" 
                      className={`w-full h-full rounded-lg bg-white ${
                        (data.platePhotoFit ?? 'fill') === 'fill'
                          ? 'object-fill'
                          : data.platePhotoFit === 'cover'
                          ? 'object-cover'
                          : 'object-contain'
                      }`}
                      style={{
                        transform: `translate(${data.platePhotoOffsetX ?? 0}px, ${data.platePhotoOffsetY ?? 0}px) rotate(${data.platePhotoRotation ?? 0}deg) scale(${data.platePhotoScale ?? 1})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span 
                        className="text-[11px] font-black select-none leading-tight"
                        style={{ color: themeColors.primary }}
                      >
                        صورة لوحة الرقم
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        {onUpdateData ? '(انقر للإضافة من المعرض)' : '(مرفق اللوحة)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Floating Interactive Mini-Toolbar on A4 Preview (Hidden in Print/Export) */}
                {onUpdateData && (
                  <div className="absolute -bottom-7 left-0 opacity-0 group-hover/platebox:opacity-100 transition-all duration-200 flex items-center gap-1 bg-slate-900/95 text-white px-2 py-1 rounded-full shadow-lg border border-slate-700 text-[9px] font-bold z-30 pointer-events-auto print:hidden whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => plateFileInputRef.current?.click()}
                      className="flex items-center gap-0.5 hover:text-amber-300 cursor-pointer px-1"
                      title="اختيار صورة اللوحة من المعرض"
                    >
                      <ImagePlus className="w-3 h-3 text-amber-400" />
                      <span>{data.vehiclePlatePhoto ? 'تغيير' : 'من المعرض'}</span>
                    </button>

                    {data.vehiclePlatePhoto && (
                      <>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!data.vehiclePlatePhoto) return;
                            const rotated = await rotateBase64Image(data.vehiclePlatePhoto, -90);
                            onUpdateData({
                              ...data,
                              vehiclePlatePhoto: rotated,
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="hover:text-sky-300 cursor-pointer p-0.5"
                          title="تدوير لليسار 90°"
                        >
                          <RotateCcw className="w-3 h-3 text-sky-400" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!data.vehiclePlatePhoto) return;
                            const rotated = await rotateBase64Image(data.vehiclePlatePhoto, 90);
                            onUpdateData({
                              ...data,
                              vehiclePlatePhoto: rotated,
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="hover:text-sky-300 cursor-pointer p-0.5"
                          title="تدوير لليمين 90°"
                        >
                          <RotateCw className="w-3 h-3 text-sky-400" />
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextScale = Math.min(3, Number(((data.platePhotoScale ?? 1) + 0.15).toFixed(2)));
                            onUpdateData({
                              ...data,
                              platePhotoScale: nextScale,
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="hover:text-emerald-300 cursor-pointer p-0.5"
                          title="توسيع وتكبير اللوحة (+)"
                        >
                          <ZoomIn className="w-3 h-3 text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextScale = Math.max(0.5, Number(((data.platePhotoScale ?? 1) - 0.15).toFixed(2)));
                            onUpdateData({
                              ...data,
                              platePhotoScale: nextScale,
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="hover:text-rose-300 cursor-pointer p-0.5"
                          title="تصغير اللوحة (-)"
                        >
                          <ZoomOut className="w-3 h-3 text-slate-300" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const currentFit = data.platePhotoFit ?? 'fill';
                            const nextFit = currentFit === 'fill' ? 'contain' : currentFit === 'contain' ? 'cover' : 'fill';
                            onUpdateData({
                              ...data,
                              platePhotoFit: nextFit,
                              platePhotoScale: 1,
                              platePhotoOffsetX: 0,
                              platePhotoOffsetY: 0,
                              updatedAt: new Date().toISOString(),
                            });
                          }}
                          className="hover:text-amber-300 cursor-pointer px-1 flex items-center gap-0.5"
                          title="تبديل وضع التوسيع (ملء كامل / احتواء)"
                        >
                          <Maximize2 className="w-2.5 h-2.5 text-amber-400" />
                          <span>توسيع</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. Section I: Personal Data & Address (بيانات المالك)     */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-3.5 py-1 rounded-full flex items-center justify-between text-[11px] font-extrabold shadow-xs"
              style={{ background: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white shadow-xs inline-block shrink-0" />
                البيانات الشخصية والعنوان
              </span>
              <span className="text-white/95">بيانات المالك</span>
            </div>

            {/* Content Box with Republican Eagle Watermark Centered in Owner Personal Data */}
            <div 
              className="relative border rounded-xl p-2.5 bg-white/95 backdrop-blur-xs flex items-center gap-3 overflow-visible shadow-xs"
              style={{ borderColor: themeColors.boxBorder }}
            >
              {/* 1. Top Watermark: Republican Eagle inside Owner Personal Data (علامة الطائر الجمهوري في البيانات الشخصية للمالك مع إزاحة للأسفل لمنع التداخل) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 overflow-visible mix-blend-multiply">
                <div
                  className="flex items-center justify-center translate-y-[32px]"
                  style={{
                    width: `${Math.round(watermarkSize * 1.38)}px`,
                    height: `${Math.round(watermarkSize * 0.9)}px`,
                    opacity: watermarkOpacity,
                  }}
                >
                  {customEmblem ? (
                    <img
                      src={customEmblem}
                      alt="العلامة المائية للطائر الجمهوري"
                      className="w-full h-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <YemenNationalEmblem
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                </div>
              </div>
              
              {/* Right: Personal Data Grid */}
              <div className="flex-1 space-y-1.5 text-[11px]">
                
                {/* Row 1: Full Name & Phone */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم الرباعي:</span>
                    <span className="font-black text-slate-950 text-[12px] truncate">{data.ownerFullName || 'محمد صالح مثنى راجح'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-black text-slate-900 text-[11.5px]">{data.ownerPhone || '779797629'}</span>
                  </div>
                </div>

                {/* Row 2: Birth Date & Blood Type */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">تاريخ الميلاد:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{data.ownerBirthDate || '---'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">فصيلة الدم:</span>
                    <span className="font-mono font-black text-rose-800 text-[11.5px]">{data.ownerBloodType || 'A+'}</span>
                  </div>
                </div>

                {/* Row 3: ID Type & National ID */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع الهوية:</span>
                    <span className="font-bold text-slate-900 text-[11px]">{data.ownerIdType || 'بطاقة شخصية'}</span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهوية:</span>
                    <span className="font-mono font-black text-slate-950 text-[11.5px]">{data.ownerNationalId || '04310027725'}</span>
                  </div>
                </div>

                {/* Row 4: Issue Place & Current Address */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">مكان الإصدار:</span>
                    <span className="font-bold text-slate-900 text-[10.5px] truncate">{data.ownerIdIssuePlace || `مركز سامع ${data.governorate || 'تعز'}`}</span>
                  </div>
                  <div className="col-span-8 flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان الحالي:</span>
                    <span className="font-bold text-slate-950 text-[10.5px] leading-tight truncate">
                      {data.ownerAddress || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Left: 4x6 Portrait Photo Box */}
              <div 
                className="w-[62px] h-[72px] border rounded-lg flex flex-col items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs"
                style={{ 
                  borderColor: themeColors.boxBorder,
                  backgroundColor: themeColors.bgLight,
                }}
              >
                {data.ownerPhoto ? (
                  <img src={data.ownerPhoto} alt="Owner 4x6" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="text-center text-slate-400 font-bold">
                    <span className="text-[9.5px] block">صورة 6×4</span>
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
              className="text-white px-3.5 py-1 rounded-full flex items-center justify-between text-[11px] font-extrabold shadow-xs"
              style={{ background: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white shadow-xs inline-block shrink-0" />
                البيانات الفنية للمركبة
              </span>
              <span className="text-white/95">مواصفات المركبة المسجلة</span>
            </div>

            {/* Content Box with Traffic Department Watermark Centered in Technical Vehicle Data */}
            <div 
              className="relative border rounded-xl p-2.5 bg-white/95 backdrop-blur-xs space-y-1.5 text-[10.5px] overflow-visible shadow-xs"
              style={{ borderColor: themeColors.boxBorder }}
            >
              {/* 2. Middle Watermark: Traffic Department Emblem inside Technical Vehicle Data (علامة الإدارة العامة للمرور مع إزاحة للأسفل لمنع التداخل) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 overflow-visible mix-blend-multiply">
                <div
                  className="flex items-center justify-center translate-y-[28px]"
                  style={{
                    width: `${Math.round(watermarkSize * 1.06)}px`,
                    height: `${Math.round(watermarkSize * 1.12)}px`,
                    opacity: watermarkOpacity,
                  }}
                >
                  {customTrafficEmblem ? (
                    <img
                      src={customTrafficEmblem}
                      alt="العلامة المائية لشعار الإدارة العامة للمرور"
                      className="w-full h-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <TrafficDepartmentEmblem
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                </div>
              </div>
              
              {/* Row 1: Plate Number & Plate Type */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[10.5px]">رقم اللوحة:</span>
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-bold shadow-2xs"
                    style={{ 
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.bgLight,
                    }}
                  >
                    <span 
                      className="font-black text-[11.5px]"
                      style={{ color: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-400 font-black">|</span>
                    <span className="font-mono font-black text-slate-950 text-[12.5px] tracking-wide" dir="ltr">
                      {platePrefix ? `${platePrefix} - ${cleanPlateDigits}` : cleanPlateDigits}
                    </span>
                  </div>
                </div>
                <div className="col-span-6 flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[10.5px]">نوع وفئة اللوحة:</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-2.5 py-0.5 rounded text-[10.5px] font-black text-white"
                      style={{ backgroundColor: themeColors.primaryDark }}
                    >
                      {categoryName}
                    </span>
                    <span className="text-slate-500 font-bold text-[9.5px]">
                      ({isTransport ? 'لوحة حمراء - نقل جمركي' : 'لوحة زرقاء - خصوصي'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Make & Vehicle Type */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الماركة:</span>
                  <span className="font-black text-slate-950 text-[11.5px]">{data.make || 'هونداي'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع المركبة:</span>
                  <span 
                    className="font-black text-[12px] tracking-wide"
                    style={{ color: themeColors.primaryDark }}
                  >
                    {vehicleTypeName}
                  </span>
                </div>
              </div>

              {/* Row 3: Body Shape & Color */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الشكل:</span>
                  <span className="font-bold text-slate-800 text-[10.5px]">{data.vehicleBodyShape || '---'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">اللون:</span>
                  <span className="font-black text-slate-950 text-[11px]">{data.color || 'ابيض'}</span>
                </div>
              </div>

              {/* Row 4: Manufacturing Year & Model/Trim */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">سنة الصنع:</span>
                  <span className="font-mono font-black text-slate-950 text-[11.5px]">{data.year || 2015}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">الطراز:</span>
                  <span className="font-bold text-slate-800 text-[10.5px]">
                    {displayTrim}
                  </span>
                </div>
              </div>

              {/* Row 5: VIN / Chassis with 17 Distinct Letter Boxes */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap text-[10.5px]">رقم القاعدة VIN:</span>
                  <span 
                    className="font-mono font-black tracking-widest text-[11.5px]"
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
                      className="flex-1 h-[21px] border rounded-[4px] bg-white flex items-center justify-center font-mono font-black text-[10px] shadow-2xs"
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
                  <span className="font-mono font-black text-slate-950 text-[11px]" dir="ltr">
                    {displayEngine && displayEngine.trim() !== '' ? displayEngine : '---'}
                  </span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">نوع الوقود:</span>
                  <span className="font-bold text-slate-900 text-[11px]">{fuelName}</span>
                </div>
              </div>

              {/* Row 7: Cylinders & Customs Declaration Number */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">عدد الأسطوانات:</span>
                  <span className="font-mono font-black text-slate-950 text-[11px]">{data.cylindersCount || 4}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">رقم البيان الجمركي:</span>
                  <span className="font-mono font-black text-slate-950 text-[11px]">{data.customsDeclarationNumber || data.formNumber || 'C2006'}</span>
                </div>
              </div>

              {/* Row 8: Customs Issuing Office & Customs Declaration Date */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">جهة إصدار البيان:</span>
                  <span className="font-black text-slate-950 text-[11px]">{data.customsIssuingOffice && data.customsIssuingOffice.trim() !== '' ? data.customsIssuingOffice : '---'}</span>
                </div>
                <div className="col-span-6 flex items-baseline gap-1.5">
                  <span className="text-slate-600 font-bold whitespace-nowrap">تاريخ البيان الجمركي:</span>
                  <span className="font-mono font-black text-slate-950 text-[11px]" dir="ltr">
                    {data.customsDeclarationDate && data.customsDeclarationDate !== '2026/7/7' ? data.customsDeclarationDate : '---'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. Section III: Guarantors & Witnesses (بيانات المعرفين) */}
          {/* ========================================================= */}
          <div className="space-y-1">
            
            {/* Pill Header Bar */}
            <div 
              className="text-white px-3.5 py-1 rounded-full flex items-center justify-between text-[11px] font-extrabold shadow-xs"
              style={{ background: themeColors.pillBg }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white shadow-xs inline-block shrink-0" />
                بيانات المعرفين (الضامنين والشهود)
              </span>
              <span className="text-white/95">الضمانة القانونية</span>
            </div>

            {/* Two Side-by-Side Guarantor Cards with Ministry of Interior Watermark Centered */}
            <div className="relative grid grid-cols-2 gap-2.5 overflow-visible">
              {/* 3. Bottom Watermark: Ministry of Interior Emblem inside Guarantors Section (علامة وزارة الداخلية مع إزاحة متوازنة لمنع التداخل) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20 overflow-visible mix-blend-multiply">
                <div
                  className="flex items-center justify-center translate-y-[32px]"
                  style={{
                    width: `${Math.round(watermarkSize * 1.02)}px`,
                    height: `${Math.round(watermarkSize * 1.12)}px`,
                    opacity: watermarkOpacity,
                  }}
                >
                  {customMoiEmblem ? (
                    <img
                      src={customMoiEmblem}
                      alt="العلامة المائية لوزارة الداخلية"
                      className="w-full h-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <MinistryOfInteriorEmblem
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                </div>
              </div>
              
              {/* Guarantor 1 Box */}
              <div 
                className="border rounded-xl p-2.5 bg-white/95 backdrop-blur-xs relative space-y-1.5 text-[10.5px] shadow-xs"
                style={{ borderColor: themeColors.boxBorder }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-1 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[11.5px]"
                    style={{ color: themeColors.primary }}
                  >
                    المعرف الأول
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono font-bold">GUARANTOR-01</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate text-[11px]">
                      {data.guarantor1?.fullName || 'محمد عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900 text-[11px]">
                      {data.guarantor1?.nationalId || '04110042835'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع القرابة:</span>
                    <span className="font-bold text-slate-800 text-[10.5px]">
                      {data.guarantor1?.relationship || 'معرف'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {data.guarantor1?.phone || '772112313'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[10px] leading-tight truncate">
                      {data.guarantor1?.address || 'تعز_التعزية_الحوبان_قرية قرانة_جوار مدرسة الشهيد ابو شهاب'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantor 2 Box */}
              <div 
                className="border rounded-xl p-2.5 bg-white/95 backdrop-blur-xs relative space-y-1.5 text-[10.5px] shadow-xs"
                style={{ borderColor: themeColors.boxBorder }}
              >
                {/* Header Tab */}
                <div 
                  className="flex justify-between items-center pb-1 border-b border-slate-100"
                >
                  <span 
                    className="font-black text-[11.5px]"
                    style={{ color: themeColors.primary }}
                  >
                    المعرف الثاني
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono font-bold">GUARANTOR-02</span>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الاسم:</span>
                    <span className="font-black text-slate-950 truncate text-[11px]">
                      {data.guarantor2?.fullName || 'عزالدين عبده علي علي قائد البركاني'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">الرقم الوطني:</span>
                    <span className="font-mono font-black text-slate-900 text-[11px]">
                      {data.guarantor2?.nationalId || '04610011437'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">نوع القرابة:</span>
                    <span className="font-bold text-slate-800 text-[10.5px]">
                      {data.guarantor2?.relationship || 'معرف'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {data.guarantor2?.phone || '734402762'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-600 font-bold whitespace-nowrap">العنوان:</span>
                    <span className="font-semibold text-slate-950 text-[10px] leading-tight truncate">
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
              
              {/* 3 Spacious Official Signature Columns (Specialist -> Head of Technical Section -> Director of Automated Issuance) */}
              <div className="flex-1 grid grid-cols-3 gap-2.5 items-end text-center">
                
                {/* 1. Technical Specialist (المختص الفني) */}
                <div className="flex flex-col items-center bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs">
                  <span 
                    className="text-[11.5px] font-black tracking-tight whitespace-nowrap mb-1"
                    style={{ color: themeColors.primary }}
                  >
                    المختص الفني
                  </span>
                  <div className="h-6 w-full flex items-end justify-center pb-0.5 mt-0.5">
                    <span className="text-[8.5px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[130px] border-b-[1.5px] border-slate-400 my-0.5" />
                </div>

                {/* 2. Head of Technical Section (رئيس القسم الفني) */}
                <div className="flex flex-col items-center bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs">
                  <span 
                    className="text-[11.5px] font-black tracking-tight whitespace-nowrap mb-1"
                    style={{ color: themeColors.primary }}
                  >
                    رئيس القسم الفني
                  </span>
                  <div className="h-6 w-full flex items-end justify-center pb-0.5 mt-0.5">
                    <span className="text-[8.5px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[130px] border-b-[1.5px] border-slate-400 my-0.5" />
                </div>

                {/* 3. Director of Automated Issuance (مدير الإصدار الآلي) */}
                <div className="flex flex-col items-center bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs">
                  <span 
                    className="text-[11.5px] font-black tracking-tight whitespace-nowrap mb-1"
                    style={{ color: themeColors.primary }}
                  >
                    مدير الإصدار الآلي
                  </span>
                  <div className="h-6 w-full flex items-end justify-center pb-0.5 mt-0.5">
                    <span className="text-[8.5px] text-slate-400 font-bold select-none">التوقيع: .....................</span>
                  </div>
                  <div className="w-full max-w-[130px] border-b-[1.5px] border-slate-400 my-0.5" />
                </div>

              </div>

              {/* Official Circular Seal: لجنة الترقيم بالجمارك - إدارة مرور محافظة تعز */}
              <div className="flex flex-col items-center justify-center shrink-0 select-none">
                <div className="relative rotate-[-2deg] transition-transform hover:rotate-0">
                  <CustomsCommitteeSeal primaryColor={themeColors.primary} />
                </div>
                <span 
                  className="text-[9.5px] font-black mt-0.5 tracking-tight"
                  style={{ color: themeColors.primary }}
                >
                  ختم لجنة الترقيم بالجمارك
                </span>
              </div>

            </div>

            {/* Official Bottom Credits Bar on A4 Page */}
            <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[9.5px] text-slate-500 font-bold px-1">
              <span>إدارة مرور محافظة تعز - لجنة ترقيم الجمارك</span>
              <span className="font-mono text-slate-600">مصمم ومطور النظام: المهندس / علاء القاضي</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
