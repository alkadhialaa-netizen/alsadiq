import React from 'react';
import { PlateCategory } from '../types';

interface PlateVisualizerProps {
  plateNumber: string;
  plateLetter: string;
  plateCategory: PlateCategory;
  country?: string;
  governorate?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showDownloadBtn?: boolean;
}

export const PlateVisualizer: React.FC<PlateVisualizerProps> = ({
  plateNumber = '12345',
  plateLetter = 'أ',
  plateCategory = 'private',
  country = 'العراق',
  governorate = 'بغداد',
  size = 'md',
}) => {
  // Styles based on plate category
  const getCategoryStyles = () => {
    switch (plateCategory) {
      case 'taxi':
        return {
          bg: 'bg-amber-400',
          border: 'border-slate-900',
          text: 'text-slate-950',
          accent: 'bg-amber-500',
          categoryLabel: 'أجرة - TAXI',
          badgeBg: 'bg-slate-950 text-amber-400',
        };
      case 'commercial':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-900',
          text: 'text-white',
          accent: 'bg-blue-700',
          categoryLabel: 'نقل عام - COMMERCIAL',
          badgeBg: 'bg-white text-blue-800',
        };
      case 'government':
        return {
          bg: 'bg-emerald-800',
          border: 'border-emerald-950',
          text: 'text-white',
          accent: 'bg-emerald-900',
          categoryLabel: 'حكومي - GOV',
          badgeBg: 'bg-white text-emerald-900',
        };
      case 'temporary':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-950',
          text: 'text-slate-950',
          accent: 'bg-orange-600',
          categoryLabel: 'فحص مؤقت - TEMP',
          badgeBg: 'bg-slate-950 text-orange-400',
        };
      case 'motorcycle':
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-800',
          text: 'text-slate-900',
          accent: 'bg-slate-200',
          categoryLabel: 'دراجة - MOTORCYCLE',
          badgeBg: 'bg-slate-800 text-white',
        };
      case 'diplomatic':
        return {
          bg: 'bg-rose-700',
          border: 'border-rose-950',
          text: 'text-white',
          accent: 'bg-rose-800',
          categoryLabel: 'هيئة دبلوماسية - CD',
          badgeBg: 'bg-white text-rose-800',
        };
      case 'private':
      default:
        return {
          bg: 'bg-white',
          border: 'border-slate-900',
          text: 'text-slate-950',
          accent: 'bg-slate-100',
          categoryLabel: 'خصوصي - PRIVATE',
          badgeBg: 'bg-blue-700 text-white',
        };
    }
  };

  const style = getCategoryStyles();

  const sizeClasses = {
    sm: 'max-w-[240px] text-xs p-1.5',
    md: 'max-w-[340px] text-sm p-2',
    lg: 'max-w-[440px] text-base p-3',
    full: 'w-full text-base p-3',
  }[size];

  const numberFontSize = {
    sm: 'text-xl tracking-wider',
    md: 'text-3xl tracking-widest',
    lg: 'text-4xl tracking-widest',
    full: 'text-3xl sm:text-4xl tracking-widest',
  }[size];

  return (
    <div
      id="vehicle-plate-preview"
      className={`relative select-none mx-auto rounded-xl border-4 ${style.border} ${style.bg} ${style.text} shadow-md overflow-hidden transition-transform duration-200 ${sizeClasses}`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15)',
      }}
    >
      {/* Embossed inner border line */}
      <div className="absolute inset-1 rounded-lg border-2 border-dashed border-black/20 pointer-events-none" />

      {/* Screw Rivets */}
      <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute bottom-2 left-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute bottom-2 right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div>
      </div>

      <div className="flex items-stretch justify-between gap-2 px-3 py-1 relative z-10">
        {/* Left section: Country & Governorate Badge */}
        <div className="flex flex-col justify-between items-center text-center border-l-2 border-black/20 pl-2 pr-1 min-w-[70px]">
          <span className="font-extrabold text-[11px] leading-tight uppercase opacity-90">{country}</span>
          <span className="font-bold text-[13px] text-blue-900 leading-tight">{governorate}</span>
          <span className="text-[9px] font-semibold opacity-75">{style.categoryLabel.split('-')[0]}</span>
        </div>

        {/* Center: Main Plate Number and Letter */}
        <div className="flex-1 flex items-center justify-center gap-3 text-center py-1">
          <div className="flex items-baseline gap-2">
            <span className={`font-black font-plate font-mono ${numberFontSize} drop-shadow-sm`}>
              {plateNumber || '00000'}
            </span>
            {plateLetter && (
              <span className="font-extrabold text-2xl sm:text-3xl px-2 py-0.5 rounded bg-black/5 border border-black/10">
                {plateLetter}
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Security Seal / Flag simulation */}
        <div className="flex flex-col justify-center items-center border-r-2 border-black/20 pr-2 pl-1 min-w-[50px]">
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${style.badgeBg} shadow-xs`}>
            IRAQ
          </div>
          <div className="mt-1 w-6 h-6 rounded-full border border-amber-600/40 bg-amber-400/20 flex items-center justify-center">
            <div className="text-[8px] font-bold text-amber-900">★</div>
          </div>
        </div>
      </div>

      {/* Bottom bar with category */}
      <div className="text-center text-[10px] font-bold tracking-wider uppercase border-t border-black/15 pt-0.5 pb-0.5 opacity-80">
        {style.categoryLabel} • {plateCountryCode(country)}
      </div>
    </div>
  );
};

function plateCountryCode(country: string): string {
  if (country.includes('عراق') || country.includes('العراق')) return 'IRQ';
  if (country.includes('سعود') || country.includes('المملكة')) return 'KSA';
  if (country.includes('مصر')) return 'EGY';
  if (country.includes('أردن') || country.includes('الاردن')) return 'JOR';
  if (country.includes('سوري')) return 'SYR';
  if (country.includes('يمن')) return 'YEM';
  if (country.includes('إمارات') || country.includes('الامارات')) return 'UAE';
  if (country.includes('كويت')) return 'KWT';
  return 'AUTO';
}
