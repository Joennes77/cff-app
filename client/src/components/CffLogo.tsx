export function CffLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (320 / 280)}
      viewBox="0 0 280 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CFF Championship Football Factory"
    >
      <defs>
        <clipPath id="sc">
          <path d="M 18,22 L 262,22 L 262,208 Q 262,272 140,302 Q 18,272 18,208 Z"/>
        </clipPath>
        <linearGradient id="shieldBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0c1525"/>
          <stop offset="100%" stopColor="#060c18"/>
        </linearGradient>
        <linearGradient id="almeloBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1565c0"/>
          <stop offset="100%" stopColor="#0d47a1"/>
        </linearGradient>
        <linearGradient id="felBlauw" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#42a5f5"/>
          <stop offset="100%" stopColor="#1e88e5"/>
        </linearGradient>
        <linearGradient id="heraclesDark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a1020"/>
          <stop offset="50%"  stopColor="#0f1a30"/>
          <stop offset="100%" stopColor="#0a1020"/>
        </linearGradient>
        <filter id="cffShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.7"/>
        </filter>
        <filter id="cffGlow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer glow rings */}
      <ellipse cx="140" cy="165" rx="126" ry="147" fill="none" stroke="#42a5f5" strokeWidth="1" opacity="0.22"/>
      <ellipse cx="140" cy="165" rx="120" ry="141" fill="none" stroke="#1565c0" strokeWidth="0.5" opacity="0.15"/>

      {/* Main shield */}
      <path d="M 18,22 L 262,22 L 262,208 Q 262,272 140,302 Q 18,272 18,208 Z"
            fill="url(#shieldBg)" filter="url(#cffShadow)"/>

      {/* Almeloos blauw border */}
      <path d="M 18,22 L 262,22 L 262,208 Q 262,272 140,302 Q 18,272 18,208 Z"
            fill="none" stroke="url(#felBlauw)" strokeWidth="4"/>
      <path d="M 28,30 L 252,30 L 252,206 Q 252,264 140,292 Q 28,264 28,206 Z"
            fill="none" stroke="#42a5f580" strokeWidth="1"/>

      {/* Top band */}
      <rect x="18" y="22" width="244" height="46" fill="url(#almeloBlue)" clipPath="url(#sc)"/>
      <rect x="18" y="64" width="244" height="3" fill="#42a5f5" opacity="0.7" clipPath="url(#sc)"/>
      <text x="140" y="52" textAnchor="middle" fontSize="14"
            fill="white" fontFamily="serif" letterSpacing="14" opacity="0.95">★ ★ ★</text>

      {/* Heracles dark stripe */}
      <rect x="18" y="67" width="244" height="8" fill="url(#heraclesDark)" clipPath="url(#sc)"/>

      {/* Vertical split */}
      <rect x="18"  y="75" width="122" height="130" fill="#0d1a2e" opacity="0.6" clipPath="url(#sc)"/>
      <rect x="140" y="75" width="122" height="130" fill="#080f1c" opacity="0.6" clipPath="url(#sc)"/>
      <line x1="140" y1="75" x2="140" y2="200" stroke="#42a5f5" strokeWidth="1.5" opacity="0.25"/>

      {/* Football icon */}
      <circle cx="140" cy="100" r="19" fill="#0a1525" stroke="url(#felBlauw)" strokeWidth="2.5"/>
      <polygon points="140,86 149,93 146,103 134,103 131,93"
               fill="none" stroke="white" strokeWidth="1.4" opacity="0.9"/>
      <line x1="140" y1="86"  x2="140" y2="81"  stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="149" y1="93"  x2="154" y2="91"  stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="146" y1="103" x2="149" y2="108" stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="134" y1="103" x2="131" y2="108" stroke="white" strokeWidth="1" opacity="0.5"/>
      <line x1="131" y1="93"  x2="126" y2="91"  stroke="white" strokeWidth="1" opacity="0.5"/>

      {/* CFF letters */}
      <text x="143" y="183" textAnchor="middle"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="108" fontWeight="900" letterSpacing="-4"
            fill="#1565c0" opacity="0.25">CFF</text>
      <text x="140" y="180" textAnchor="middle"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="108" fontWeight="900" letterSpacing="-4"
            fill="white" opacity="0.97">CFF</text>

      {/* Divider */}
      <line x1="35" y1="197" x2="245" y2="197" stroke="#42a5f5" strokeWidth="1.5" opacity="0.7"/>

      {/* Bottom banner */}
      <rect x="18" y="197" width="244" height="40" fill="url(#almeloBlue)" opacity="0.85" clipPath="url(#sc)"/>
      <text x="140" y="214" textAnchor="middle"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="11.5" fontWeight="900" letterSpacing="3.5"
            fill="white">CHAMPIONSHIP</text>
      <text x="140" y="224" textAnchor="middle" fontSize="6"
            fill="#90caf9" opacity="0.8" letterSpacing="7">· · · · · · ·</text>
      <text x="140" y="235" textAnchor="middle"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="10" fontWeight="900" letterSpacing="2.5"
            fill="#bbdefb" opacity="0.92">FOOTBALL FACTORY</text>

      {/* Corner ornaments */}
      <text x="45"  y="188" fontSize="9" fill="#42a5f5" opacity="0.55" fontFamily="serif">✦</text>
      <text x="224" y="188" fontSize="9" fill="#42a5f5" opacity="0.55" fontFamily="serif">✦</text>

      {/* Outer glow */}
      <path d="M 18,22 L 262,22 L 262,208 Q 262,272 140,302 Q 18,272 18,208 Z"
            fill="none" stroke="#42a5f5" strokeWidth="2" opacity="0.15" filter="url(#cffGlow)"/>
    </svg>
  );
}
