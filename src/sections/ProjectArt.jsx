import { motion } from 'framer-motion';

// Concept illustrations drawn only from documented functionality — no fake screenshots or metrics.
const VIEW = { once: true, margin: '0px 0px -25% 0px' };
const draw = (d = 0, dur = 0.9) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: VIEW,
  transition: { duration: dur, delay: d, ease: 'easeInOut' },
});

function Node({ x, y, w = 120, h = 34, label, sub, accent, delay = 0 }) {
  return (
    <motion.g initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ delay, duration: 0.5 }}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#141414" stroke={accent ? '#DC143C' : '#3a3a3f'} />
      <text x={x + 10} y={y + (sub ? 15 : 21)} className="art-t">{label}</text>
      {sub && <text x={x + 10} y={y + 27} className="art-s">{sub}</text>}
    </motion.g>
  );
}

export function DeepWorkArt() {
  return (
    <svg viewBox="0 0 440 300" className="art" role="img" aria-label="Architecture: PyCaw audio monitoring on Windows signals an ESP32 over serial which drives an OLED status display; a React dashboard configures the system.">
      <text x="14" y="22" className="art-layer">SOFTWARE · WINDOWS HOST</text>
      <rect x="8" y="30" width="424" height="140" rx="4" fill="none" stroke="#1A1A1A" strokeDasharray="4 6" />
      <text x="426" y="22" textAnchor="end" className="art-s">PACKAGED · INNO SETUP INSTALLER</text>
      <Node x={22} y={46} w={150} label="Windows audio sessions" sub="watched via PyCaw" delay={0.1} />
      <Node x={250} y={46} w={168} label="Python + Flask" sub="meeting detection" accent delay={0.2} />
      <Node x={250} y={112} w={168} label="React dashboard" sub="configuration" delay={0.3} />
      <Node x={22} y={112} w={150} label="Socket.IO" sub="live link" delay={0.35} />

      <text x="14" y="200" className="art-layer">HARDWARE · OUTSIDE THE ROOM</text>
      <rect x="8" y="208" width="424" height="84" rx="4" fill="none" stroke="#1A1A1A" strokeDasharray="4 6" />
      <Node x={250} y={226} w={168} h={48} label="ESP32" sub="C++ firmware" accent delay={0.45} />
      <g>
        <motion.rect x="40" y="222" width="140" height="56" rx="3" fill="#080808" stroke="#A1A1AA" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ delay: 0.55 }} />
        <text x="52" y="240" className="art-s">OLED DISPLAY</text>
        <motion.text x="52" y="263" className="art-oled" initial={{ opacity: 0 }} whileInView={{ opacity: [0, 1, 0.4, 1] }} viewport={VIEW} transition={{ delay: 1.2, duration: 1.2 }}>
          IN A MEETING
        </motion.text>
      </g>

      {/* connections */}
      <motion.path d="M172 63 H250" className="art-wire" {...draw(0.6)} />
      <motion.path d="M334 80 V112" className="art-wire" {...draw(0.7)} />
      <motion.path d="M250 129 H172" className="art-wire" {...draw(0.8)} />
      <motion.path d="M418 63 C436 63 436 160 436 200 C436 230 430 250 418 250" className="art-wire art-wire--hot" {...draw(0.9, 1.1)} />
      <text x="372" y="196" className="art-s">serial</text>
      <motion.path d="M250 250 H180" className="art-wire art-wire--hot" {...draw(1.3)} />
      <path d="M172 63 H250 M418 63 C436 63 436 160 436 200 C436 230 430 250 418 250 M250 250 H180" className="art-flow" />
    </svg>
  );
}

export function SocArt() {
  return (
    <div className="soc-art" role="img" aria-label="Illustration: a Python agent watches the Windows Registry for webcam and microphone access, verifies executable signatures with PowerShell, and syncs alerts to a Next.js SOC dashboard over Supabase.">
      <div className="soc-scan" aria-hidden="true" />
      <div className="soc-grid" aria-hidden="true" />
      <div className="soc-top mono">
        <span className="soc-live"><i /> MONITOR</span>
        <span>GHOST-SENTRY</span>
      </div>
      <div className="soc-flow mono">
        <span>Windows Registry</span>
        <b>→</b>
        <span>Python agent</span>
        <b>→</b>
        <span>Supabase</span>
        <b>→</b>
        <span>Next.js SOC</span>
      </div>
      <ul className="soc-watch">
        {[
          ['WEBCAM', 'Registry access watched'],
          ['MICROPHONE', 'Registry access watched'],
          ['EXECUTABLE', 'Signature checked · PowerShell'],
        ].map(([a, b], i) => (
          <motion.li key={a} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ delay: 0.6 + i * 0.2 }}>
            <span className={`soc-led ${i === 2 ? 'soc-led--warn' : ''}`} />
            <span className="mono">{a}</span>
            <span>{b}</span>
          </motion.li>
        ))}
      </ul>
      <div className="soc-alert">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3 L22 20 H2 Z" fill="none" stroke="#FF304F" strokeWidth="1.6" /><path d="M12 9 v5 M12 16.5 v.5" stroke="#FF304F" strokeWidth="1.8" strokeLinecap="round" /></svg>
        <span>Unauthorized access attempts surface as alerts in real time via Supabase WebSockets.</span>
      </div>
    </div>
  );
}

export function DigitroveArt() {
  const shelves = [
    [7, 5, 9, 6, 8, 4, 7, 6, 9, 5],
    [6, 8, 5, 9, 7, 6, 8, 5, 6, 9],
    [9, 6, 7, 5, 8, 9, 6, 7, 5, 8],
  ];
  return (
    <svg viewBox="0 0 440 300" className="art" role="img" aria-label="Concept illustration of a digital library: search with Manglish support, real-time availability, rack location and e-book flipbook.">
      <rect x="14" y="14" width="412" height="40" rx="3" fill="#141414" stroke="#3a3a3f" />
      <circle cx="36" cy="34" r="7" fill="none" stroke="#A1A1AA" strokeWidth="1.5" />
      <path d="M41 39 l5 5" stroke="#A1A1AA" strokeWidth="1.5" />
      <text x="54" y="38" className="art-s">Search title, author… English or Manglish</text>
      <motion.rect x="330" y="22" width="86" height="24" rx="2" fill="#52101D" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ delay: 0.6 }} style={{ originX: 1 }} />
      <text x="342" y="38" className="art-t">MANGLISH ✓</text>

      {shelves.map((row, r) => (
        <g key={r} transform={`translate(14 ${78 + r * 62})`}>
          <text x="0" y="-4" className="art-s">RACK {String.fromCharCode(65 + r)}</text>
          <rect x="0" y="44" width="250" height="3" fill="#3a3a3f" />
          {row.map((h, i) => (
            <motion.rect
              key={i}
              x={4 + i * 24}
              y={44 - h * 4.2}
              width="18"
              height={h * 4.2}
              fill={r === 1 && i === 3 ? '#DC143C' : i % 3 === 0 ? '#1A1A1A' : '#141414'}
              stroke={r === 1 && i === 3 ? '#FF304F' : '#3a3a3f'}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={VIEW}
              transition={{ delay: 0.2 + r * 0.12 + i * 0.03 }}
              style={{ originY: 1 }}
            />
          ))}
        </g>
      ))}
      <motion.path d="M100 158 C150 150 220 120 284 108" className="art-wire art-wire--hot" {...draw(1.1)} />
      <g transform="translate(284 78)">
        <rect width="142" height="70" rx="3" fill="#141414" stroke="#DC143C" />
        <text x="10" y="18" className="art-s">LOCATION</text>
        <text x="10" y="38" className="art-t">Rack B · Shelf 2</text>
        <circle cx="14" cy="54" r="4" fill="#FF304F" />
        <text x="24" y="58" className="art-s">available now</text>
      </g>
      <g transform="translate(284 166)">
        <text x="0" y="-4" className="art-s">E-BOOK FLIPBOOK</text>
        <rect width="142" height="96" rx="3" fill="#101010" stroke="#3a3a3f" />
        <path d="M71 10 V86" stroke="#3a3a3f" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="12" y={18 + i * 13} width="48" height="3" fill="#3a3a3f" />
            <rect x="82" y={18 + i * 13} width="48" height="3" fill="#3a3a3f" />
          </g>
        ))}
        <motion.path
          d="M71 10 Q100 6 130 12 L130 86 Q100 80 71 86 Z"
          fill="#1A1A1A"
          stroke="#A1A1AA"
          initial={{ scaleX: 1 }}
          whileInView={{ scaleX: [1, -1] }}
          viewport={VIEW}
          transition={{ delay: 1.4, duration: 1.1, ease: 'easeInOut' }}
          style={{ originX: '71px' }}
        />
      </g>
    </svg>
  );
}

export function NursaArt() {
  const tiers = [
    ['React', 'Client · booking UI'],
    ['Express', 'REST routes'],
    ['Node.js', 'Runtime'],
    ['MongoDB', 'Nurses · bookings · reviews'],
  ];
  return (
    <div className="nursa-art" role="img" aria-label="MERN architecture: React client, Express API on Node.js, MongoDB data store; features scheduling, contact management and reviews.">
      <div className="nursa-stack">
        {tiers.map(([a, b], i) => (
          <motion.div
            key={a}
            className="nursa-tier"
            initial={{ x: i % 2 ? 60 : -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={VIEW}
            transition={{ delay: 0.25 + i * 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="nursa-letter">{a[0]}</span>
            <div>
              <b>{a}</b>
              <span>{b}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="nursa-features">
        {['Scheduling', 'Contact management', 'Reviews'].map((f, i) => (
          <motion.span key={f} className="mono" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ delay: 0.8 + i * 0.1 }}>
            {f}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function VastraArt() {
  const pts = [
    [220, 46], [190, 92], [250, 92], [176, 150], [264, 150], [168, 200], [272, 200],
    [200, 196], [240, 196], [198, 268], [242, 268], [196, 330], [244, 330],
  ];
  return (
    <svg viewBox="0 0 440 360" className="art art--vastra" role="img" aria-label="Concept illustration: body landmarks from pose estimation with shoulder and hip width measured from the segmentation mask.">
      <defs>
        <linearGradient id="vscan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DC143C" stopOpacity="0" />
          <stop offset="1" stopColor="#DC143C" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* silhouette (segmentation mask) */}
      <path
        d="M220 24 c16 0 24 12 24 26 c0 14 -8 26 -24 26 c-16 0 -24 -12 -24 -26 c0 -14 8 -26 24 -26 Z M186 86 h68 c14 0 22 8 24 20 l10 92 c1 8 -10 10 -12 2 l-14 -74 v84 l6 152 c0 10 -16 10 -17 0 l-15 -130 l-15 130 c-1 10 -17 10 -17 0 l6 -152 v-84 l-14 74 c-2 8 -13 6 -12 -2 l10 -92 c2 -12 10 -20 24 -20 Z"
        fill="#141414"
        stroke="#3a3a3f"
      />
      {/* skeleton */}
      <motion.path d="M220 46 V92 M190 92 H250 M190 92 L176 150 L168 200 M250 92 L264 150 L272 200 M220 92 V196 M200 196 H240 M200 196 L198 268 L196 330 M240 196 L242 268 L244 330" stroke="#A1A1AA" strokeWidth="1" fill="none" {...draw(0.4, 1.2)} />
      {pts.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="4" fill="#080808" stroke="#FF304F" strokeWidth="1.6" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={VIEW} transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 500, damping: 20 }} />
      ))}
      {/* shoulder width */}
      <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ delay: 1.4 }}>
        <path d="M184 72 H256 M184 66 V78 M256 66 V78" stroke="#DC143C" strokeWidth="1.2" />
        <text x="270" y="76" className="art-s">SHOULDER WIDTH</text>
        <path d="M188 222 H252 M188 216 V228 M252 216 V228" stroke="#DC143C" strokeWidth="1.2" />
        <text x="270" y="226" className="art-s">HIP WIDTH</text>
        <text x="40" y="160" className="art-s">POSE · MEDIAPIPE</text>
        <path d="M128 156 L170 152" stroke="#3a3a3f" />
        <text x="40" y="300" className="art-s">SEGMENTATION MASK</text>
        <path d="M150 296 L196 290" stroke="#3a3a3f" />
      </motion.g>
      {/* corner brackets */}
      <path d="M120 14 h-16 v16 M320 14 h16 v16 M120 346 h-16 v-16 M320 346 h16 v-16" stroke="#A1A1AA" fill="none" />
      <rect className="vastra-scan" x="104" y="0" width="232" height="40" fill="url(#vscan)" />
    </svg>
  );
}
