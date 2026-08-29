import React from 'react';

interface YemenNationalEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Coat of Arms of the Republic of Yemen (شعار الجمهورية اليمنية المعتمد)
 * Clean, high-definition vector representation without overlapping artifacts or clutter.
 * Fully balanced heraldic composition:
 * 1. Golden Eagle (العقاب الذهبي) with outstretched wings and distinct feather levels
 * 2. Crossed Flagpoles with golden spearheads
 * 3. Flanking Yemeni National Flags (أحمر، أبيض، أسود) flowing cleanly to sides
 * 4. Central Golden Shield featuring the Coffee Plant (غصن البن) and Marib Dam (سد مأرب)
 * 5. Eagle Talons grasping the lower golden ribbon with 'الجمهورية اليمنية'
 */
export const YemenNationalEmblem: React.FC<YemenNationalEmblemProps> = ({ 
  className = '',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-11',
    md: 'w-24 h-16',
    lg: 'w-32 h-21',
    xl: 'w-44 h-28',
  };

  return (
    <svg
      viewBox="0 0 340 220"
      className={`${sizeClasses[size] || ''} ${className} select-none overflow-visible`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Rich Eagle Gold Gradient */}
        <linearGradient id="yeGoldBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Light Gold Highlights for Wing Feathers */}
        <linearGradient id="yeGoldShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Dark Gold Shadows for Depth */}
        <linearGradient id="yeGoldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Flagpole Metallic Gradient */}
        <linearGradient id="yePoleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Golden Shield Frame Gradient */}
        <linearGradient id="yeShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Ribbon Gradient */}
        <linearGradient id="yeRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Blue Water Gradient */}
        <linearGradient id="yeWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. CROSSED FLAGPOLES (ساريتا العلمين المتقاطعتان بالخلف)  */}
      {/* ======================================================== */}
      <g id="flagpoles">
        {/* Left Pole (Top Left -> Bottom Right) */}
        <line x1="65" y1="52" x2="235" y2="204" stroke="url(#yePoleGrad)" strokeWidth="4" strokeLinecap="round" />
        <line x1="65" y1="52" x2="235" y2="204" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" />
        {/* Top Left Spearhead */}
        <polygon points="65,52 54,40 70,44" fill="#FDE047" stroke="#78350F" strokeWidth="1" strokeLinejoin="round" />
        {/* Bottom Right Pole End */}
        <circle cx="235" cy="204" r="2.5" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />

        {/* Right Pole (Top Right -> Bottom Left) */}
        <line x1="275" y1="52" x2="105" y2="204" stroke="url(#yePoleGrad)" strokeWidth="4" strokeLinecap="round" />
        <line x1="275" y1="52" x2="105" y2="204" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" />
        {/* Top Right Spearhead */}
        <polygon points="275,52 286,40 270,44" fill="#FDE047" stroke="#78350F" strokeWidth="1" strokeLinejoin="round" />
        {/* Bottom Left Pole End */}
        <circle cx="105" cy="204" r="2.5" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
      </g>

      {/* ======================================================== */}
      {/* 2. DRAPING YEMENI FLAGS (العلمان الوطنيان على الجانبين)  */}
      {/* ======================================================== */}
      {/* Left Flag */}
      <g id="leftFlag">
        {/* Red Band */}
        <path
          d="M74 60 C56 74, 40 102, 48 142 C54 162, 70 180, 94 184 C80 178, 68 158, 64 138 C58 106, 72 80, 84 66 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="0.7"
        />
        {/* White Band */}
        <path
          d="M84 66 C72 80, 58 106, 64 138 C68 158, 80 178, 94 184 C86 172, 76 154, 74 132 C70 108, 82 86, 94 74 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="0.6"
        />
        {/* Black Band */}
        <path
          d="M94 74 C82 86, 70 108, 74 132 C76 154, 86 172, 94 184 C89 168, 86 150, 88 130 C90 110, 100 90, 110 82 Z"
          fill="#0F172A"
          stroke="#000000"
          strokeWidth="0.7"
        />
      </g>

      {/* Right Flag */}
      <g id="rightFlag">
        {/* Red Band */}
        <path
          d="M266 60 C284 74, 300 102, 292 142 C286 162, 270 180, 246 184 C260 178, 272 158, 276 138 C282 106, 268 80, 256 66 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="0.7"
        />
        {/* White Band */}
        <path
          d="M256 66 C268 80, 282 106, 276 138 C272 158, 260 178, 246 184 C254 172, 264 154, 266 132 C270 108, 258 86, 246 74 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="0.6"
        />
        {/* Black Band */}
        <path
          d="M246 74 C258 86, 270 108, 266 132 C264 154, 254 172, 246 184 C251 168, 254 150, 252 130 C250 110, 240 90, 230 82 Z"
          fill="#0F172A"
          stroke="#000000"
          strokeWidth="0.7"
        />
      </g>

      {/* ======================================================== */}
      {/* 3. GOLDEN EAGLE WINGS & TAIL (أجنحة وذيل العقاب الذهبي)  */}
      {/* ======================================================== */}
      {/* Tail Feathers */}
      <g fill="url(#yeGoldBase)" stroke="#78350F" strokeWidth="0.8">
        <path d="M158 135 L152 162 L162 158 L170 163 L178 158 L188 162 L182 135 Z" />
        <line x1="162" y1="137" x2="162" y2="158" />
        <line x1="170" y1="135" x2="170" y2="163" />
        <line x1="178" y1="137" x2="178" y2="158" />
      </g>

      {/* Left Wing (Main Profile) */}
      <path
        d="M170 68 C155 46, 105 36, 28 44 C20 46, 22 54, 30 55 C52 57, 76 65, 88 78 C70 72, 50 72, 42 78 C56 84, 74 92, 85 106 C70 104, 58 106, 56 112 C72 118, 92 124, 114 132 C128 112, 148 88, 170 78 Z"
        fill="url(#yeGoldBase)"
        stroke="#78350F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left Wing Feather Highlights */}
      <path
        d="M166 65 C148 48, 102 42, 34 48 C56 52, 88 60, 102 76 C122 64, 146 58, 166 65 Z"
        fill="url(#yeGoldShine)"
        stroke="#92400E"
        strokeWidth="0.5"
      />
      <path
        d="M158 76 C132 72, 100 76, 62 84 C80 90, 104 100, 118 114 C132 98, 146 84, 158 76 Z"
        fill="url(#yeGoldShine)"
        stroke="#92400E"
        strokeWidth="0.5"
      />
      {/* Left Feather Ridges */}
      <path d="M50 50 Q85 58 120 66" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M68 62 Q100 70 134 76" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M64 84 Q98 92 130 104" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M80 98 Q108 106 136 118" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />

      {/* Right Wing (Main Profile) */}
      <path
        d="M170 68 C185 46, 235 36, 312 44 C320 46, 318 54, 310 55 C288 57, 264 65, 252 78 C270 72, 290 72, 298 78 C284 84, 266 92, 255 106 C270 104, 282 106, 284 112 C268 118, 248 124, 226 132 C212 112, 192 88, 170 78 Z"
        fill="url(#yeGoldBase)"
        stroke="#78350F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right Wing Feather Highlights */}
      <path
        d="M174 65 C192 48, 238 42, 306 48 C284 52, 252 60, 238 76 C218 64, 194 58, 174 65 Z"
        fill="url(#yeGoldShine)"
        stroke="#92400E"
        strokeWidth="0.5"
      />
      <path
        d="M182 76 C208 72, 240 76, 278 84 C260 90, 236 100, 222 114 C208 98, 194 84, 182 76 Z"
        fill="url(#yeGoldShine)"
        stroke="#92400E"
        strokeWidth="0.5"
      />
      {/* Right Feather Ridges */}
      <path d="M290 50 Q255 58 220 66" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M272 62 Q240 70 206 76" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M276 84 Q242 92 210 104" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M260 98 Q232 106 204 118" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />

      {/* ======================================================== */}
      {/* 4. EAGLE HEAD & NECK (رأس العقاب الملتفت يميناً)        */}
      {/* ======================================================== */}
      {/* Neck */}
      <path
        d="M156 80 C156 60, 184 60, 184 80 C190 98, 182 110, 170 114 C158 110, 150 98, 156 80 Z"
        fill="url(#yeGoldBase)"
        stroke="#78350F"
        strokeWidth="1"
      />
      {/* Head */}
      <path
        d="M158 54 C158 38, 174 36, 184 42 C192 45, 198 48, 202 46 C204 48, 200 52, 194 54 C188 57, 186 66, 180 70 C170 74, 158 68, 158 54 Z"
        fill="url(#yeGoldShine)"
        stroke="#78350F"
        strokeWidth="1.2"
      />
      {/* Head Feather Tuft */}
      <path d="M160 46 C154 38, 162 35, 168 39 Z" fill="#D97706" />
      {/* Sharp Beak */}
      <path
        d="M194 46 C202 46, 208 50, 208 54 C202 56, 195 56, 192 54 Z"
        fill="#B45309"
        stroke="#451A03"
        strokeWidth="0.8"
      />
      {/* Eye */}
      <circle cx="180" cy="48" r="2.8" fill="#FFFFFF" stroke="#78350F" strokeWidth="0.8" />
      <circle cx="181" cy="48" r="1.4" fill="#000000" />
      <circle cx="181.5" cy="47.5" r="0.5" fill="#FFFFFF" />

      {/* ======================================================== */}
      {/* 5. CENTRAL SHIELD (الدرع الأوسط: غصن البن وسد مأرب)      */}
      {/* ======================================================== */}
      <g transform="translate(170, 108)">
        {/* Shield Frame Outer */}
        <path
          d="M0 -36 C24 -36, 36 -20, 36 4 C36 28, 0 46, 0 46 C0 46, -36 28, -36 4 C-36 -20, -24 -36, 0 -36 Z"
          fill="#FFFFFF"
          stroke="url(#yeShieldGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Shield Inner Clapped Region */}
        <clipPath id="shieldInnerClip">
          <path d="M0 -33 C22 -33, 33 -18, 33 3 C33 25, 0 42, 0 42 C0 42, -33 25, -33 3 C-33 -18, -22 -33, 0 -33 Z" />
        </clipPath>

        <g clipPath="url(#shieldInnerClip)">
          {/* Sky Backdrop */}
          <rect x="-38" y="-38" width="76" height="85" fill="#F8FAFC" />
          <circle cx="0" cy="-14" r="16" fill="#FEF08A" opacity="0.6" />

          {/* Coffee Plant Branch (غصن البن اليماني) */}
          <g transform="translate(0, -14)">
            <path d="M-16 3 Q0 -5 16 3" stroke="#15803D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M-12 1 Q-8 -4 -4 0 Q-8 4 -12 1 Z" fill="#16A34A" />
            <path d="M-5 -2 Q0 -7 4 -2 Q-1 3 -5 -2 Z" fill="#15803D" />
            <path d="M5 -2 Q10 -6 14 -1 Q9 3 5 -2 Z" fill="#16A34A" />
            <path d="M-2 3 Q3 7 8 4 Q3 0 -2 3 Z" fill="#15803D" />
            {/* Red Coffee Berries */}
            <circle cx="-9" cy="1" r="1.8" fill="#DC2626" />
            <circle cx="-2" cy="-3" r="1.8" fill="#DC2626" />
            <circle cx="3" cy="-2" r="1.8" fill="#DC2626" />
            <circle cx="8" cy="2" r="1.8" fill="#DC2626" />
          </g>

          {/* Historic Marib Dam (سد مأرب التاريخي) */}
          <g transform="translate(0, 8)">
            <path
              d="M-26 5 L-14 -4 L14 -4 L26 5 L26 13 L-26 13 Z"
              fill="#D97706"
              stroke="#78350F"
              strokeWidth="1"
            />
            {/* Dam Sluice Gates */}
            <line x1="-18" y1="0" x2="-18" y2="11" stroke="#78350F" strokeWidth="1" />
            <line x1="-9" y1="-3" x2="-9" y2="11" stroke="#78350F" strokeWidth="1" />
            <line x1="0" y1="-4" x2="0" y2="11" stroke="#78350F" strokeWidth="1" />
            <line x1="9" y1="-3" x2="9" y2="11" stroke="#78350F" strokeWidth="1" />
            <line x1="18" y1="0" x2="18" y2="11" stroke="#78350F" strokeWidth="1" />
          </g>

          {/* Dam Blue Water Lake */}
          <path
            d="M-35 21 Q0 15 35 21 L35 44 L-35 44 Z"
            fill="url(#yeWaterGrad)"
            stroke="#0284C7"
            strokeWidth="0.6"
          />
          <path d="M-18 25 Q0 22 18 25" stroke="#BAE6FD" strokeWidth="0.8" fill="none" />
          <path d="M-14 31 Q0 28 14 31" stroke="#E0F2FE" strokeWidth="0.8" fill="none" />
        </g>

        {/* Inner Gold Rim */}
        <path
          d="M0 -33 C22 -33, 33 -18, 33 3 C33 25, 0 42, 0 42 C0 42, -33 25, -33 3 C-33 -18, -22 -33, 0 -33 Z"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
        />
      </g>

      {/* ======================================================== */}
      {/* 6. EAGLE CLAWS / TALONS (مخالب العقاب)                   */}
      {/* ======================================================== */}
      <g fill="#B45309" stroke="#451A03" strokeWidth="0.8">
        {/* Left Talon */}
        <path d="M138 138 C134 144, 130 151, 138 150 C142 147, 146 142, 144 138 Z" />
        <path d="M144 138 C142 146, 140 153, 148 152 C150 147, 151 142, 148 138 Z" />
        <path d="M150 139 C150 147, 154 153, 159 151 C158 145, 155 140, 151 139 Z" />

        {/* Right Talon */}
        <path d="M202 138 C206 144, 210 151, 202 150 C198 147, 194 142, 196 138 Z" />
        <path d="M196 138 C198 146, 200 153, 192 152 C190 147, 189 142, 192 138 Z" />
        <path d="M190 139 C190 147, 186 153, 181 151 C182 145, 185 140, 189 139 Z" />
      </g>

      {/* ======================================================== */}
      {/* 7. BASE GOLDEN RIBBON (شريط الجمهورية اليمنية)           */}
      {/* ======================================================== */}
      <g transform="translate(170, 164)">
        {/* Ribbon Background Body */}
        <path
          d="M-80 -6 Q0 -16 80 -6 L74 14 Q0 6 -74 14 Z"
          fill="url(#yeRibbonGrad)"
          stroke="#78350F"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Left Swallow-tail Fold */}
        <path
          d="M-80 -6 L-96 3 L-74 14 L-78 3 Z"
          fill="#B45309"
          stroke="#78350F"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Right Swallow-tail Fold */}
        <path
          d="M80 -6 L96 3 L74 14 L78 3 Z"
          fill="#B45309"
          stroke="#78350F"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Decorative Rosettes */}
        <circle cx="-66" cy="4" r="2.2" fill="#78350F" />
        <circle cx="66" cy="4" r="2.2" fill="#78350F" />

        {/* Clear Crisp Calligraphy: الجمهورية اليمنية */}
        <text
          x="0"
          y="7"
          textAnchor="middle"
          fill="#451A03"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Cairo', 'Amiri', 'Traditional Arabic', serif"
          letterSpacing="0.6"
        >
          الجمهورية اليمنية
        </text>
      </g>
    </svg>
  );
};
