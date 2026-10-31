import React from 'react';

interface TrafficDepartmentEmblemProps {
  className?: string;
  preserveAspectRatio?: string;
}

/**
 * High-precision SVG replica of the Yemen General Traffic Department Emblem
 * (شعار الإدارة العامة للمرور - الجمهورية اليمنية) matching the official badge:
 * 1. Outer circular ring in Yemeni flag colors: Red (outer), White (middle), Black (inner)
 * 2. Top White/Silver Falcon with outstretched V-wings overlapping the upper crest
 * 3. Two curved green olive/laurel branches with crossed stems at the bottom
 * 4. Central Red Octagon ("قف" Stop sign) with white Arabic letters "قـ" (right) and "ـف" (left)
 * 5. Upright White Palm/Hand in the center holding a vertical 3-color Traffic Light (Red, Yellow, Green)
 * 6. Lower wrist plate with 3 circles, striped black pedestal, and base plate
 * 7. Bottom curved white scroll ribbon with black outline and bold Arabic text "الإدارة العامة للمرور"
 */
export const TrafficDepartmentEmblem: React.FC<TrafficDepartmentEmblemProps> = ({
  className = 'w-20 h-20',
  preserveAspectRatio = 'xMidYMid meet',
}) => {
  // Left & Right Laurel Leaf Pairs along the curved green branches
  const leftBranchLeaves = [
    { x: 74, y: 186, angle: -42, scale: 0.95 },
    { x: 58, y: 164, angle: -62, scale: 0.95 },
    { x: 49, y: 138, angle: -82, scale: 0.92 },
    { x: 48, y: 112, angle: -100, scale: 0.88 },
    { x: 55, y: 86, angle: -118, scale: 0.82 },
    { x: 68, y: 65, angle: -136, scale: 0.72 },
  ];

  const rightBranchLeaves = [
    { x: 166, y: 186, angle: 42, scale: 0.95 },
    { x: 182, y: 164, angle: 62, scale: 0.95 },
    { x: 191, y: 138, angle: 82, scale: 0.92 },
    { x: 192, y: 112, angle: 100, scale: 0.88 },
    { x: 185, y: 86, angle: 118, scale: 0.82 },
    { x: 172, y: 65, angle: 136, scale: 0.72 },
  ];

  return (
    <svg
      viewBox="0 0 240 255"
      preserveAspectRatio={preserveAspectRatio}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="trafficRedOctagon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        <linearGradient id="trafficEagleSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Path for the curved bottom scroll text "الإدارة العامة للمرور" */}
        <path id="trafficScrollTextArc" d="M 42,208 Q 120,256 198,208" />
      </defs>

      {/* ============================================================ */}
      {/* 1. OUTER CIRCULAR YEMEN FLAG RINGS (RED - WHITE - BLACK)     */}
      {/* ============================================================ */}
      {/* Outer Red Ring */}
      <circle
        cx="120"
        cy="124"
        r="104"
        fill="#FFFFFF"
        stroke="#DC2626"
        strokeWidth="8"
      />
      {/* Thin dark border separating Red and White */}
      <circle
        cx="120"
        cy="124"
        r="99.5"
        fill="none"
        stroke="#450A0A"
        strokeWidth="1.2"
      />
      {/* White Middle Ring */}
      <circle
        cx="120"
        cy="124"
        r="95"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7.5"
      />
      {/* Inner Black Ring */}
      <circle
        cx="120"
        cy="124"
        r="88.5"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="6.5"
      />

      {/* ============================================================ */}
      {/* 2. GREEN OLIVE / LAUREL WREATH WITH CROSSED STEMS            */}
      {/* ============================================================ */}
      {/* Left Stem with crossed bottom */}
      <path
        d="M 134 206 C 110 196 86 194 66 172 C 42 144 42 96 74 56"
        stroke="#15803D"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right Stem with crossed bottom */}
      <path
        d="M 106 206 C 130 196 154 194 174 172 C 198 144 198 96 166 56"
        stroke="#15803D"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Laurel Leaves */}
      {leftBranchLeaves.map((node, idx) => (
        <g
          key={`l-leaf-${idx}`}
          transform={`translate(${node.x}, ${node.y}) rotate(${node.angle}) scale(${node.scale})`}
        >
          <path
            d="M 0 0 C -10 -7 -14 -20 -6 -30 C 1 -20 3 -10 0 0 Z"
            fill="#16A34A"
            stroke="#14532D"
            strokeWidth="1.1"
          />
          <path
            d="M 0 0 C 10 -7 14 -20 6 -30 C -1 -20 -3 -10 0 0 Z"
            fill="#22C55E"
            stroke="#14532D"
            strokeWidth="1.1"
          />
        </g>
      ))}
      {/* Top Tip Leaf Left */}
      <path
        d="M 74 56 C 68 46 74 36 84 36 C 82 46 78 52 74 56 Z"
        fill="#16A34A"
        stroke="#14532D"
        strokeWidth="1.1"
      />

      {/* Right Laurel Leaves */}
      {rightBranchLeaves.map((node, idx) => (
        <g
          key={`r-leaf-${idx}`}
          transform={`translate(${node.x}, ${node.y}) rotate(${node.angle}) scale(${node.scale})`}
        >
          <path
            d="M 0 0 C -10 -7 -14 -20 -6 -30 C 1 -20 3 -10 0 0 Z"
            fill="#22C55E"
            stroke="#14532D"
            strokeWidth="1.1"
          />
          <path
            d="M 0 0 C 10 -7 14 -20 6 -30 C -1 -20 -3 -10 0 0 Z"
            fill="#16A34A"
            stroke="#14532D"
            strokeWidth="1.1"
          />
        </g>
      ))}
      {/* Top Tip Leaf Right */}
      <path
        d="M 166 56 C 172 46 166 36 156 36 C 158 46 162 52 166 56 Z"
        fill="#16A34A"
        stroke="#14532D"
        strokeWidth="1.1"
      />

      {/* ============================================================ */}
      {/* 3. TOP WHITE/SILVER EAGLE AT 12 O'CLOCK                      */}
      {/* ============================================================ */}
      <g>
        {/* Eagle Outstretched V-Wings & Body */}
        <path
          d="M 118 40 L 84 13 C 88 22 95 29 104 34 L 100 40 L 105 42 C 108 46 112 52 115 57 L 109 62 L 118 63 L 120 58 L 123 64 L 130 62 L 126 55 C 128 49 132 43 137 37 L 156 15 C 144 18 131 27 122 40 Z"
          fill="url(#trafficEagleSilver)"
          stroke="#334155"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Wing tip dark feather accents */}
        <path d="M 86 15 L 102 24 L 98 28 L 88 20 Z" fill="#334155" />
        <path d="M 154 17 L 138 25 L 142 29 L 151 22 Z" fill="#334155" />
      </g>

      {/* ============================================================ */}
      {/* 4. CENTRAL RED STOP OCTAGON ("قف")                           */}
      {/* ============================================================ */}
      <polygon
        points="99,76 141,76 164,99 164,135 141,158 99,158 76,135 76,99"
        fill="url(#trafficRedOctagon)"
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* White "قـ" on the right side of the octagon & "ـف" on the left side */}
      {/* Right side: قـ */}
      <path
        d="M 138 119 L 155 119 L 155 109 C 155 104 148 104 148 109 L 148 114"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="147" cy="98" r="2.6" fill="#FFFFFF" />
      <circle cx="154" cy="98" r="2.6" fill="#FFFFFF" />

      {/* Left side: ـف */}
      <path
        d="M 102 119 L 84 119 C 80 119 80 112 84 110"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="91" cy="103" r="2.8" fill="#FFFFFF" />

      {/* ============================================================ */}
      {/* 5. CENTRAL WHITE UPRIGHT HAND & TRAFFIC LIGHT                */}
      {/* ============================================================ */}
      {/* Upright White Palm & 4 Fingers + Thumb */}
      <path
        d="M 94 150
           C 89 142 89 126 91 114
           C 92 107 97 107 99 113
           L 99 120
           L 99 78
           C 99 72 108 72 108 78
           L 108 108
           L 108 71
           C 108 65 118 65 118 71
           L 118 108
           L 118 75
           C 118 69 128 69 128 75
           L 128 112
           L 128 86
           C 128 80 137 80 137 86
           L 137 138
           C 137 148 133 154 128 158
           L 99 158
           Z"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Finger separator lines */}
      <line x1="108" y1="76" x2="108" y2="102" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="118" y1="72" x2="118" y2="102" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="128" y1="78" x2="128" y2="105" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />

      {/* Central Black Traffic Light Housing inside the Palm */}
      <polygon
        points="107,93 123,93 119,127 111,127"
        fill="#111827"
        stroke="#0F172A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Traffic Light Visor Flaps on Sides */}
      <path
        d="M 105 95 L 109 95 M 106 105 L 110 105 M 107 116 L 111 116
           M 121 95 L 125 95 M 120 105 L 124 105 M 119 116 L 123 116"
        stroke="#111827"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Red Signal (Top) */}
      <circle cx="115" cy="99" r="4.2" fill="#DC2626" />
      {/* Yellow Signal (Middle) */}
      <circle cx="115" cy="110" r="4.2" fill="#FACC15" />
      {/* Green Signal (Bottom) */}
      <circle cx="115" cy="121" r="4.2" fill="#16A34A" />

      {/* Horizontal Wrist Plate with 3 Circular Nodes */}
      <rect
        x="98"
        y="132"
        width="34"
        height="13"
        rx="2"
        fill="#F8FAFC"
        stroke="#334155"
        strokeWidth="2"
      />
      <circle cx="105" cy="138.5" r="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="115" cy="138.5" r="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="125" cy="138.5" r="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.5" />

      {/* Black Trapezoidal Pedestal with 4 Vertical Gold/Cream Stripes */}
      <polygon
        points="103,146 127,146 133,172 97,172"
        fill="#111827"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="106" y1="154" x2="106" y2="169" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="112" y1="154" x2="112" y2="169" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="118" y1="154" x2="118" y2="169" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="124" y1="154" x2="124" y2="169" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" />

      {/* Lower Trapezoidal Base Plate */}
      <polygon
        points="92,172 138,172 134,183 96,183"
        fill="#FFFFFF"
        stroke="#334155"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 101 178 L 129 178"
        stroke="#334155"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* ============================================================ */}
      {/* 6. BOTTOM WHITE SCROLL BANNER: "الإدارة العامة للمرور"         */}
      {/* ============================================================ */}
      {/* Left Scroll Fold */}
      <path
        d="M 48 175 L 36 194 L 48 202 L 62 186 Z"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Right Scroll Fold */}
      <path
        d="M 192 175 L 204 194 L 192 202 L 178 186 Z"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Main Curved White Banner */}
      <path
        d="M 55 186 Q 120 232 185 186 L 196 208 Q 120 260 44 208 Z"
        fill="#FFFFFF"
        stroke="#111827"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />

      {/* Bold Black Arabic Text: الإدارة العامة للمرور */}
      <text
        fill="#111827"
        fontSize="16.5"
        fontWeight="900"
        fontFamily="'Cairo', 'Tajawal', sans-serif"
        letterSpacing="0.2"
      >
        <textPath href="#trafficScrollTextArc" startOffset="50%" textAnchor="middle">
          الإدارة العامة للمرور
        </textPath>
      </text>
    </svg>
  );
};
