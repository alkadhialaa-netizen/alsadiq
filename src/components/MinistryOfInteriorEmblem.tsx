import React from 'react';

interface MinistryOfInteriorEmblemProps {
  className?: string;
  preserveAspectRatio?: string;
}

/**
 * High-precision SVG representation of the Yemen Ministry of Interior Emblem
 * (شعار وزارة الداخلية اليمنية):
 * - Two curved green coffee branches with red coffee berries forming an oval wreath
 * - Golden falcon/eagle in the center facing left with V-shaped raised wings
 * - Arched golden ribbon with bold Arabic text "وزارة الداخلية"
 * - The vigilant eye (العين الساهرة) with brown iris, black pupil, and radiating lower rays
 */
export const MinistryOfInteriorEmblem: React.FC<MinistryOfInteriorEmblemProps> = ({
  className = 'w-20 h-24',
  preserveAspectRatio = 'xMidYMid meet',
}) => {
  // Helper to generate leaf pairs and red coffee berry clusters along each side of the wreath
  const leftWreathNodes = [
    { x: 58, y: 175, angle: -65, scale: 0.95 },
    { x: 42, y: 145, angle: -80, scale: 0.95 },
    { x: 35, y: 112, angle: -92, scale: 0.92 },
    { x: 40, y: 80, angle: -108, scale: 0.88 },
    { x: 55, y: 52, angle: -128, scale: 0.82 },
    { x: 78, y: 31, angle: -150, scale: 0.75 },
    { x: 105, y: 20, angle: -168, scale: 0.65 },
  ];

  const rightWreathNodes = [
    { x: 182, y: 175, angle: 65, scale: 0.95 },
    { x: 198, y: 145, angle: 80, scale: 0.95 },
    { x: 205, y: 112, angle: 92, scale: 0.92 },
    { x: 200, y: 80, angle: 108, scale: 0.88 },
    { x: 185, y: 52, angle: 128, scale: 0.82 },
    { x: 162, y: 31, angle: 150, scale: 0.75 },
    { x: 135, y: 20, angle: 168, scale: 0.65 },
  ];

  // Radiating lower rays under the vigilant eye
  const eyeRays = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16; // 0 to 1
    const angleDeg = 42 - t * 84; // +42 deg to -42 deg
    const angleRad = (angleDeg * Math.PI) / 180;
    const cx = 120;
    const cy = 205;
    const rInner = 46;
    const rOuter = 64;
    const x1 = cx + rInner * Math.sin(angleRad);
    const y1 = cy + rInner * Math.cos(angleRad) * 0.78;
    const x2 = cx + rOuter * Math.sin(angleRad);
    const y2 = cy + rOuter * Math.cos(angleRad) * 0.82;
    return { x1, y1, x2, y2 };
  });

  return (
    <svg
      viewBox="0 0 240 275"
      preserveAspectRatio={preserveAspectRatio}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="moiGoldEagle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="moiRibbonGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <radialGradient id="moiEyeIris" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="55%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>

        <path id="moiBannerTextPath" d="M 56,214 Q 120,174 184,214" />
      </defs>

      {/* ============================================================ */}
      {/* 1. LEFT & RIGHT COFFEE WREATH STEMS                          */}
      {/* ============================================================ */}
      {/* Left main stem */}
      <path
        d="M 68 198 L 58 178 C 30 130 34 55 114 18"
        stroke="#1C1917"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right main stem */}
      <path
        d="M 172 198 L 182 178 C 210 130 206 55 126 18"
        stroke="#1C1917"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Wreath Leaves & Red Coffee Berries */}
      {leftWreathNodes.map((node, idx) => (
        <g
          key={`left-${idx}`}
          transform={`translate(${node.x}, ${node.y}) rotate(${node.angle}) scale(${node.scale})`}
        >
          {/* Outer Leaf */}
          <path
            d="M 0 0 C -12 -8 -18 -22 -10 -34 C -2 -24 2 -12 0 0 Z"
            fill="#22C55E"
            stroke="#14532D"
            strokeWidth="1.6"
          />
          <path d="M -1 -3 L -8 -26" stroke="#14532D" strokeWidth="1" />

          {/* Inner Leaf */}
          <path
            d="M 0 0 C 12 -8 18 -22 10 -34 C 2 -24 -2 -12 0 0 Z"
            fill="#16A34A"
            stroke="#14532D"
            strokeWidth="1.6"
          />
          <path d="M 1 -3 L 8 -26" stroke="#14532D" strokeWidth="1" />

          {/* Red Coffee Berries Cluster */}
          <circle cx="-5" cy="-6" r="3.2" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="5" cy="-6" r="3.2" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="0" cy="-11" r="3.2" fill="#EF4444" stroke="#1C1917" strokeWidth="1" />
          <circle cx="-4" cy="-14" r="2.8" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="4" cy="-14" r="2.8" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
        </g>
      ))}

      {/* Right Wreath Leaves & Red Coffee Berries */}
      {rightWreathNodes.map((node, idx) => (
        <g
          key={`right-${idx}`}
          transform={`translate(${node.x}, ${node.y}) rotate(${node.angle}) scale(${node.scale})`}
        >
          {/* Outer Leaf */}
          <path
            d="M 0 0 C -12 -8 -18 -22 -10 -34 C -2 -24 2 -12 0 0 Z"
            fill="#16A34A"
            stroke="#14532D"
            strokeWidth="1.6"
          />
          <path d="M -1 -3 L -8 -26" stroke="#14532D" strokeWidth="1" />

          {/* Inner Leaf */}
          <path
            d="M 0 0 C 12 -8 18 -22 10 -34 C 2 -24 -2 -12 0 0 Z"
            fill="#22C55E"
            stroke="#14532D"
            strokeWidth="1.6"
          />
          <path d="M 1 -3 L 8 -26" stroke="#14532D" strokeWidth="1" />

          {/* Red Coffee Berries Cluster */}
          <circle cx="-5" cy="-6" r="3.2" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="5" cy="-6" r="3.2" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="0" cy="-11" r="3.2" fill="#EF4444" stroke="#1C1917" strokeWidth="1" />
          <circle cx="-4" cy="-14" r="2.8" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
          <circle cx="4" cy="-14" r="2.8" fill="#DC2626" stroke="#1C1917" strokeWidth="1" />
        </g>
      ))}

      {/* ============================================================ */}
      {/* 2. CENTRAL GOLDEN FALCON / EAGLE IN V-FLIGHT POSE            */}
      {/* ============================================================ */}
      <g transform="translate(0, 2)">
        {/* Left Wing (Raised high to upper-left) */}
        <path
          d="M 105 128 L 62 56 L 70 60 L 64 68 L 73 72 L 67 80 L 76 84 L 71 92 L 80 96 L 76 104 L 85 108 L 82 116 L 96 124 Z"
          fill="url(#moiGoldEagle)"
          stroke="#451A03"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Right Wing (Raised high to upper-right, larger perspective) */}
        <path
          d="M 122 126 L 166 48 L 172 58 L 164 64 L 170 72 L 161 78 L 167 86 L 157 92 L 162 100 L 152 106 L 156 114 L 145 120 L 132 132 Z"
          fill="url(#moiGoldEagle)"
          stroke="#451A03"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Tail Feathers (Fanned to right-bottom) */}
        <path
          d="M 134 136 L 168 134 L 165 142 L 169 147 L 162 153 L 164 158 L 154 162 L 148 166 L 130 150 Z"
          fill="url(#moiGoldEagle)"
          stroke="#451A03"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Eagle Body & Head Facing Left */}
        <path
          d="M 105 125 C 94 118 80 118 72 124 L 63 128 L 61 133 L 68 132 L 74 135 C 86 135 95 140 106 148 C 118 154 130 154 137 144 C 136 134 126 126 105 125 Z"
          fill="url(#moiGoldEagle)"
          stroke="#451A03"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Eagle Eye */}
        <circle cx="74" cy="126" r="1.7" fill="#1C1917" />

        {/* Eagle Legs & Talons */}
        <path
          d="M 108 148 L 102 163 L 94 166 M 102 163 L 98 169 M 122 150 L 116 166 L 108 170 M 116 166 L 114 172"
          stroke="#78350F"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Internal Feather Texture Lines */}
        <path
          d="M 82 82 L 108 124 M 92 95 L 112 126 M 152 72 L 124 124 M 146 88 L 126 128 M 102 134 Q 116 142 128 136"
          stroke="#78350F"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* ============================================================ */}
      {/* 3. VIGILANT EYE & RADIATING LOWER RAYS                       */}
      {/* ============================================================ */}
      {/* Radiating Black Eyelashes / Rays at Bottom */}
      <g>
        {eyeRays.map((ray, idx) => (
          <line
            key={`ray-${idx}`}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke="#111827"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Outer Black Frame of the Lower Shield & Eye */}
      <path
        d="M 46 212 Q 120 166 194 212 L 172 234 Q 120 264 68 234 Z"
        fill="#111827"
      />

      {/* Amber/Brown Eye Contour */}
      <path
        d="M 78 225 Q 120 202 162 225 Q 120 252 78 225 Z"
        fill="#D97706"
        stroke="#111827"
        strokeWidth="2"
      />

      {/* White Sclera of the Vigilant Eye */}
      <path
        d="M 84 225 Q 120 205 156 225 Q 120 245 84 225 Z"
        fill="#FFFFFF"
      />

      {/* Central Round Iris & Black Pupil */}
      <circle cx="120" cy="226" r="14.5" fill="url(#moiEyeIris)" stroke="#111827" strokeWidth="1.5" />
      <circle cx="120" cy="226" r="5.2" fill="#111827" />

      {/* ============================================================ */}
      {/* 4. ARCHED GOLDEN BANNER: "وزارة الداخلية"                     */}
      {/* ============================================================ */}
      {/* Outer Black Border of Ribbon */}
      <path
        d="M 46 208 Q 120 160 194 208 L 180 227 Q 120 183 60 227 Z"
        fill="url(#moiRibbonGold)"
        stroke="#111827"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner Thin Black Line on Ribbon */}
      <path
        d="M 50 208 Q 120 164 190 208 L 178 223 Q 120 181 62 223 Z"
        fill="none"
        stroke="#111827"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Arabic Text "وزارة الداخلية" Along the Curved Ribbon */}
      <text
        fill="#111827"
        fontSize="17"
        fontWeight="900"
        fontFamily="'Cairo', 'Tajawal', sans-serif"
        letterSpacing="0.3"
      >
        <textPath href="#moiBannerTextPath" startOffset="50%" textAnchor="middle">
          وزارة الداخلية
        </textPath>
      </text>
    </svg>
  );
};
