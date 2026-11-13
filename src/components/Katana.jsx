import { motion } from 'framer-motion';

// Geometry (viewBox units). The guard (tsuba) centre is the rotation pivot.
export const KATANA = { w: 600, h: 40, guardX: 156, guardY: 20, tipX: 597, tipY: 9.5 };
export const BLADE_REACH = Math.hypot(KATANA.tipX - KATANA.guardX, KATANA.tipY - KATANA.guardY); // ≈ 441

const BLADE =
  'M176,14.5 C300,13.6 452,10.2 566,5.6 Q588,5 597,9.5 Q584,15 560,16.8 C452,20.6 300,24.4 176,25.5 Z';

// hamon — the wavy temper line, generated once
const HAMON = (() => {
  let d = '';
  for (let x = 180; x <= 556; x += 6) {
    const k = (x - 176) / 384;
    const edge = 25.3 - 8.6 * Math.pow(k, 1.55);
    const y = edge - 2.7 - Math.sin(x * 0.19) * 0.9 - Math.sin(x * 0.07) * 0.5;
    d += `${d ? 'L' : 'M'}${x},${y.toFixed(2)} `;
  }
  return d;
})();

const WRAP = Array.from({ length: 9 }, (_, i) => 22 + i * 14.5);

export function Katana({ id = 'k', sheen, glow, className, style }) {
  return (
    <svg
      viewBox="0 0 600 40"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d5d63" />
          <stop offset="0.28" stopColor="#d9d9de" />
          <stop offset="0.5" stopColor="#8a8a92" />
          <stop offset="0.72" stopColor="#F5F5F5" />
          <stop offset="1" stopColor="#c3c3c9" />
        </linearGradient>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5F5F5" />
          <stop offset="0.5" stopColor="#A1A1AA" />
          <stop offset="1" stopColor="#3a3a3f" />
        </linearGradient>
        <linearGradient id={`${id}-guard`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="0.5" stopColor="#0c0c0d" />
          <stop offset="1" stopColor="#1A1A1A" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-bladeclip`}>
          <path d={BLADE} />
        </clipPath>
      </defs>

      {/* crimson aura around the edge */}
      {glow && (
        <motion.path
          d={BLADE}
          fill="none"
          stroke="#DC143C"
          strokeWidth="5"
          strokeLinejoin="round"
          style={{ opacity: glow }}
          className="katana-aura"
        />
      )}

      {/* kashira (pommel) */}
      <rect x="4" y="11" width="10" height="18" rx="4" fill="#141414" stroke="#A1A1AA" strokeWidth="0.8" />
      {/* tsuka (handle) */}
      <rect x="12" y="12" width="136" height="16" rx="3" fill="#1A1A1A" />
      {WRAP.map((x) => (
        <g key={x}>
          <path d={`M${x - 5},20 L${x},14.6 L${x + 5},20 L${x},25.4 Z`} fill="#52101D" />
          <path d={`M${x - 0.8},17 L${x + 0.8},17`} stroke="#8B0000" strokeWidth="0.6" />
          <path d={`M${x - 7.2},12.4 L${x + 7.2},27.6 M${x - 7.2},27.6 L${x + 7.2},12.4`} stroke="#0a0a0a" strokeWidth="1.1" />
        </g>
      ))}
      <rect x="12" y="12" width="136" height="16" rx="3" fill="none" stroke="#080808" strokeWidth="1" />
      {/* menuki */}
      <path d="M66,18.6 q4,-3 8,0 q4,-3 8,0" fill="none" stroke="#A1A1AA" strokeWidth="1" strokeLinecap="round" />
      {/* fuchi */}
      <rect x="144" y="11" width="6" height="18" rx="1" fill={`url(#${id}-guard)`} stroke="#A1A1AA" strokeWidth="0.6" />
      {/* tsuba (guard) */}
      <ellipse cx="156" cy="20" rx="6.2" ry="17" fill={`url(#${id}-guard)`} stroke="#A1A1AA" strokeWidth="0.9" />
      <ellipse cx="156" cy="20" rx="3.6" ry="13" fill="none" stroke="#3a3a3f" strokeWidth="0.6" />
      <circle cx="156" cy="9" r="1.1" fill="#52101D" />
      <circle cx="156" cy="31" r="1.1" fill="#52101D" />
      {/* seppa */}
      <rect x="161.5" y="12.5" width="2.2" height="15" fill="#A1A1AA" />
      {/* habaki (collar) */}
      <path d="M163.5,12.8 L178,13.8 L178,26.2 L163.5,27.2 Z" fill={`url(#${id}-silver)`} />
      <path d="M166,16 L176,16.4" stroke="#F5F5F5" strokeWidth="0.6" opacity="0.7" />

      {/* blade */}
      <path d={BLADE} fill={`url(#${id}-steel)`} />
      {/* shinogi ridge */}
      <path d="M178,18.6 C300,17.6 452,13.8 566,8.8 L590,8.6" fill="none" stroke="#F5F5F5" strokeWidth="0.55" opacity="0.55" />
      {/* hamon */}
      <path d={HAMON} fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.65" />
      {/* crimson reflection along the cutting edge */}
      <path
        d="M178,25 C300,23.9 452,20.1 560,16.4 Q582,14.6 596,10"
        fill="none"
        stroke="#DC143C"
        strokeWidth="0.9"
        opacity="0.55"
      />
      {/* travelling metallic glint */}
      {sheen && (
        <g clipPath={`url(#${id}-bladeclip)`}>
          <motion.rect
            x="-40"
            y="0"
            width="60"
            height="40"
            fill={`url(#${id}-sheen)`}
            style={{ x: sheen }}
          />
        </g>
      )}
    </svg>
  );
}

export function Saya({ id = 's', className, style }) {
  return (
    <svg viewBox="0 0 440 30" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-lac`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="0.35" stopColor="#141414" />
          <stop offset="1" stopColor="#080808" />
        </linearGradient>
      </defs>
      <path d="M4,7.5 C140,7 300,4.6 420,2.6 Q438,3 438,12 Q437,20 418,20.8 C300,22 140,23.6 4,23.4 Z" fill={`url(#${id}-lac)`} stroke="#1A1A1A" />
      <path d="M8,10 C140,9.6 300,7.2 418,5.4" stroke="#DC143C" strokeWidth="0.8" opacity="0.45" fill="none" />
      {/* koiguchi */}
      <rect x="0" y="6.5" width="8" height="18" rx="1.5" fill="#1A1A1A" stroke="#A1A1AA" strokeWidth="0.8" />
      {/* kurikata + sageo cord */}
      <path d="M44,23 q6,5 12,0" fill="#141414" stroke="#A1A1AA" strokeWidth="0.6" />
      <path d="M48,23 C46,30 60,30 70,26" stroke="#8B0000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <rect x="62" y="6.6" width="3" height="17" fill="#8B0000" opacity="0.85" />
      <rect x="68" y="6.4" width="3" height="17.2" fill="#8B0000" opacity="0.85" />
      {/* kojiri */}
      <path d="M418,2.8 Q438,3 438,12 Q437,20 418,20.8 Z" fill="#1A1A1A" stroke="#A1A1AA" strokeWidth="0.8" />
    </svg>
  );
}

// Small blade glyph used as UI marks
export function BladeMark({ className, style }) {
  return (
    <svg viewBox="0 0 120 12" className={className} style={style} aria-hidden="true" focusable="false">
      <rect x="0" y="4" width="26" height="4" rx="1" fill="#52101D" />
      <rect x="26" y="1.5" width="2.5" height="9" fill="#A1A1AA" />
      <path d="M29,4 C60,4 95,3 118,1.5 Q114,6.5 108,7.4 C90,8 60,8 29,8 Z" fill="#DC143C" />
    </svg>
  );
}
