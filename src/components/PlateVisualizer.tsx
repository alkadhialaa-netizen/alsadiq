import React from 'react';
import { PlateCategory } from '../types';

interface PlateVisualizerProps {
  plateNumber: string;
  plateLetter?: string;
  plateCategory?: PlateCategory;
  category?: PlateCategory;
  prefix?: string;
  country?: string;
  governorate?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showDownloadBtn?: boolean;
}

export const PlateVisualizer: React.FC<PlateVisualizerProps> = ({
  plateNumber = '68742',
  plateLetter = 'خصوصي',
  plateCategory,
  category,
  prefix = '4',
  country = 'اليمن',
  governorate = 'تعز',
  size = 'md',
}) => {
  const activeCategory = plateCategory || category || 'private';

  // Styles based on plate category
  const getCategoryStyles = () => {
    switch (activeCategory) {
      case 'commercial':
        return {
          bg: 'bg-white',
          border: 'border-red-600',
          text: 'text-slate-950',
          headerBg: 'bg-red-700',
          categoryLabel: 'نقل',
          subLabel: 'تسجيل نقل',
          categoryBg: 'bg-red-50 text-red-900',
          numberColor: 'text-red-900',
          countryBg: 'bg-red-700 text-white',
          badgeBorder: 'border-red-600',
        };
      case 'taxi':
        return {
          bg: 'bg-white',
          border: 'border-amber-500',
          text: 'text-slate-950',
          headerBg: 'bg-amber-500',
          categoryLabel: 'أجرة',
          subLabel: 'تسجيل أجرة',
          categoryBg: 'bg-amber-50 text-amber-950',
          numberColor: 'text-amber-950',
          countryBg: 'bg-amber-500 text-slate-950',
          badgeBorder: 'border-amber-500',
        };
      case 'government':
        return {
          bg: 'bg-white',
          border: 'border-emerald-800',
          text: 'text-slate-950',
          headerBg: 'bg-emerald-800',
          categoryLabel: 'حكومي',
          subLabel: 'تسجيل حكومي',
          categoryBg: 'bg-emerald-50 text-emerald-950',
          numberColor: 'text-emerald-950',
          countryBg: 'bg-emerald-800 text-white',
          badgeBorder: 'border-emerald-800',
        };
      case 'temporary':
        return {
          bg: 'bg-white',
          border: 'border-orange-600',
          text: 'text-slate-950',
          headerBg: 'bg-orange-600',
          categoryLabel: 'مؤقت',
          subLabel: 'تسجيل مؤقت',
          categoryBg: 'bg-orange-50 text-orange-950',
          numberColor: 'text-orange-950',
          countryBg: 'bg-orange-600 text-white',
          badgeBorder: 'border-orange-600',
        };
      case 'private':
      default:
        return {
          bg: 'bg-white',
          border: 'border-blue-700',
          text: 'text-slate-950',
          headerBg: 'bg-blue-800',
          categoryLabel: 'خصوصي',
          subLabel: 'تسجيل خصوصي',
          categoryBg: 'bg-blue-50 text-blue-900',
          numberColor: 'text-blue-900',
          countryBg: 'bg-blue-800 text-white',
          badgeBorder: 'border-blue-700',
        };
    }
  };

  const style = getCategoryStyles();

  const sizeClasses = {
    sm: 'max-w-[280px] h-[52px] text-xs',
    md: 'max-w-[380px] h-[72px] text-sm',
    lg: 'max-w-[480px] h-[88px] text-base',
    full: 'w-full h-[80px] text-base',
  }[size];

  const numberFontSize = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    full: 'text-xl sm:text-2xl',
  }[size];

  return (
    <div
      id="vehicle-plate-preview"
      className={`relative select-none mx-auto rounded-xl border-[2.5px] ${style.badgeBorder} ${style.bg} ${style.text} shadow-md overflow-hidden flex items-stretch transition-all duration-200 ${sizeClasses}`}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Embossed inner border line */}
      <div className="absolute inset-[2px] rounded-lg border border-black/10 pointer-events-none" />

      {/* Screw Rivets */}
      <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner flex items-center justify-center pointer-events-none">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute bottom-1.5 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner flex items-center justify-center pointer-events-none">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner flex items-center justify-center pointer-events-none">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45"></div>
      </div>
      <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner flex items-center justify-center pointer-events-none">
        <div className="w-1 h-0.5 bg-slate-600 rotate-45"></div>
      </div>

      {/* 1. Category Section (Right side in RTL or Left in Arabic visual) */}
      <div className={`w-[26%] border-l-[2px] ${style.badgeBorder} ${style.categoryBg} flex items-center justify-center px-1 text-center select-none`}>
        <span className="font-black text-xs sm:text-sm md:text-base leading-tight">
          {style.categoryLabel}
        </span>
      </div>

      {/* 2. Plate Digits & Prefix with Distinct Separator */}
      <div className="flex-1 flex items-center justify-center px-2 font-mono font-black relative bg-gradient-to-b from-white via-slate-50 to-white" dir="ltr">
        {prefix && (
          <span className="font-black text-xs sm:text-base text-blue-700 tracking-tight">
            {prefix}
          </span>
        )}

        {/* Clear, Bold Separator */}
        <span className="mx-1.5 px-1.5 py-0.5 rounded-md bg-slate-200 border border-slate-300 text-slate-800 font-black text-[10px] sm:text-xs select-none shadow-2xs leading-none">
          -
        </span>

        {/* Sequential Number */}
        <span className={`tracking-widest font-black ${numberFontSize} ${style.numberColor} drop-shadow-2xs`}>
          {plateNumber || '00000'}
        </span>
      </div>

      {/* 3. Yemen Country & Authority Section */}
      <div className={`w-[22%] ${style.countryBg} border-r-[2px] ${style.badgeBorder} flex flex-col items-center justify-center py-1 leading-none select-none text-center`}>
        <span className="font-mono font-black text-[9px] sm:text-xs tracking-wider">YEM</span>
        <span className="font-black text-[10px] sm:text-xs mt-0.5">اليمن</span>
        <span className="text-[7px] opacity-85 mt-0.5 truncate max-w-[90%] font-bold">{governorate}</span>
      </div>
    </div>
  );
};
