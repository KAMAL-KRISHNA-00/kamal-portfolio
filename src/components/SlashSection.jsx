import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { clamp, lerp } from '../lib/useMedia.js';

/*
  Every section is revealed by the cut that the travelling katana makes.
  The mask is scroll-linked over the same window KatanaTravel uses
  (section top from 95% → 35% of the viewport), and each section has its own
  mask geometry so no two boundaries feel alike.
*/

// fixed jitter so the ink edge is irregular but stable
const JITTER = [0, 14, -9, 22, -4, 17, -15, 8, 25, -11, 6, -18, 12];

function clipFor(cut, p) {
  const r = clamp((p - 0.3) / 0.45);
  if (r >= 1) return 'none';
  if (r <= 0) return 'inset(0 0 100% 0)';
  const H = window.innerHeight;
  const px = (v) => `${v.toFixed(1)}px`;

  switch (cut) {
    case 'ink': {
      // brush-edged diagonal travelling downward (right side leads)
      const c = lerp(-0.35 * H, 1.45 * H, r);
      const pts = ['0 0', '100% 0'];
      for (let i = 12; i >= 0; i--) {
        const f = i / 12;
        pts.push(`${(f * 100).toFixed(2)}% ${px(c + f * 0.3 * H + JITTER[i] * (1 - r * 0.5))}`);
      }
      return `polygon(${pts.join(',')})`;
    }
    case 'matrix': {
      // four horizontal strips cut right → left, one after another
      const h = 0.36 * H;
      const xl = [0, 1, 2, 3].map((i) => `${((1 - clamp(r * 1.6 - i * 0.2)) * 100).toFixed(2)}%`);
      return `polygon(100% 0, 100% ${px(4 * h)}, ${xl[3]} ${px(4 * h)}, ${xl[3]} ${px(3 * h)}, ${xl[2]} ${px(3 * h)}, ${xl[2]} ${px(2 * h)}, ${xl[1]} ${px(2 * h)}, ${xl[1]} ${px(h)}, ${xl[0]} ${px(h)}, ${xl[0]} 0)`;
    }
    case 'path': {
      // a vertical cut that opens like a sliding shoji
      const hw = r * 60;
      const y = lerp(0.2, 1.5, r) * H;
      return `polygon(${50 - hw}% 0, ${50 + hw}% 0, ${50 + hw}% ${px(y)}, ${50 - hw}% ${px(y)})`;
    }
    case 'strike': {
      // the widest, steepest diagonal on the page
      const c = lerp(-0.7 * H, 1.45 * H, r);
      return `polygon(0 0, 100% 0, 100% ${px(c + 0.65 * H)}, 0 ${px(c)})`;
    }
    case 'rise': {
      // rising cut from the lower left
      const X = lerp(-30, 110, r);
      return `polygon(0 0, ${X + 30}% 0, ${X}% ${px(1.5 * H)}, 0 ${px(1.5 * H)})`;
    }
    case 'seal': {
      // the red sun opens
      const R = r * 1.25 * Math.max(window.innerWidth, H);
      return `circle(${px(R)} at 50% ${px(0.45 * H)})`;
    }
    case 'scan': {
      const X = lerp(0, 112, r);
      return `polygon(0 0, ${X}% 0, ${X - 7}% ${px(1.5 * H)}, 0 ${px(1.5 * H)})`;
    }
    default:
      return 'none';
  }
}

export default function SlashSection({ id, cut, className = '', children, label }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.35'] });
  const clip = useTransform(scrollYProgress, (p) => clipFor(cut, p));
  const edge = useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0, 1, 0]);

  return (
    <section id={id} ref={ref} data-slash={cut} className={`sec sec--${id} ${className}`} aria-label={label}>
      {!reduce && cut !== 'final' && (
        <motion.div className={`cut-edge cut-edge--${cut}`} style={{ opacity: edge }} aria-hidden="true" />
      )}
      <motion.div className="sec-inner" style={reduce || cut === 'final' ? undefined : { clipPath: clip, WebkitClipPath: clip }}>
        {children}
      </motion.div>
    </section>
  );
}

export function SectionHead({ index, kicker, title, children, align = 'left' }) {
  return (
    <header className={`sec-head sec-head--${align}`}>
      <div className="sec-index">
        <span className="mono">{String(index).padStart(2, '0')}</span>
        <span className="sec-index-line" />
        <span className="mono">{kicker}</span>
      </div>
      {children || <h2 className="sec-title">{title}</h2>}
    </header>
  );
}
