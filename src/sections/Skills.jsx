import { motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { skills } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -20% 0px' };

const glyph = (name) => {
  const clean = name.replace(/\(.*\)/, '').trim();
  const map = {
    Python: 'Py', JavaScript: 'JS', TypeScript: 'TS', Java: 'Jv', C: 'C',
    'Linux': 'Lx', Nginx: 'Nx', HAProxy: 'HA', OpenLDAP: 'LD', Stalwart: 'St', Zabbix: 'Zb', Docker: 'Dk', PostgreSQL: 'Pg',
    'Next.js': 'Nx', 'React.js': 'Re', Django: 'Dj', Flask: 'Fl', Express: 'Ex', 'Socket.IO': 'IO', 'Tailwind CSS': 'Tw',
    MongoDB: 'Mg', Supabase: 'Sb', MySQL: 'My',
    ESP32: '32', Git: 'Gt', Postman: 'Pm', 'Windows API': 'Wn', WSL2: 'WS',
  };
  return map[clean] || clean.slice(0, 2);
};

const icon = {
  lang: (
    <svg viewBox="0 0 32 32"><path d="M11 9 L4 16 L11 23 M21 9 L28 16 L21 23 M18 6 L14 26" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
  ),
  infra: (
    <svg viewBox="0 0 32 32"><rect x="5" y="5" width="22" height="7" rx="1.5" stroke="currentColor" fill="none" strokeWidth="1.6" /><rect x="5" y="14" width="22" height="7" rx="1.5" stroke="currentColor" fill="none" strokeWidth="1.6" /><path d="M9 26 h14 M16 21 v5" stroke="currentColor" strokeWidth="1.6" /><circle cx="22" cy="8.5" r="1.3" fill="#DC143C" /><circle cx="22" cy="17.5" r="1.3" fill="#DC143C" /></svg>
  ),
  web: (
    <svg viewBox="0 0 32 32"><rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" fill="none" strokeWidth="1.6" /><path d="M4 11 h24" stroke="currentColor" strokeWidth="1.6" /><path d="M9 16 h8 M9 20 h12" stroke="#DC143C" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  db: (
    <svg viewBox="0 0 32 32"><ellipse cx="16" cy="8" rx="10" ry="3.5" stroke="currentColor" fill="none" strokeWidth="1.6" /><path d="M6 8 v16 c0 2 4.5 3.5 10 3.5 s10 -1.5 10 -3.5 V8 M6 16 c0 2 4.5 3.5 10 3.5 s10 -1.5 10 -3.5" stroke="currentColor" fill="none" strokeWidth="1.6" /></svg>
  ),
  tools: (
    <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" stroke="currentColor" fill="none" strokeWidth="1.6" /><circle cx="16" cy="16" r="3" fill="#DC143C" /><path d="M16 3 v5 M16 24 v5 M3 16 h5 M24 16 h5" stroke="currentColor" strokeWidth="1.6" /></svg>
  ),
};

// each forged panel slides out from behind a different diagonal cut
const cuts = [
  { from: 'polygon(0 0, 0 0, 0 100%, 0 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: -40 },
  { from: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: 40 },
  { from: 'polygon(0 0, 0 0, 0 100%, 0 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: -40 },
  { from: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: 40 },
  { from: 'polygon(0 0, 0 0, 0 100%, 0 100%)', to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: -40 },
];

function Panel({ group, i }) {
  const c = cuts[i % cuts.length];
  return (
    <motion.article
      className={`forge forge--${group.key}`}
      initial={{ clipPath: c.from, x: c.x }}
      whileInView={{ clipPath: c.to, x: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.75, ease: [0.75, 0, 0.2, 1], delay: (i % 2) * 0.12 }}
    >
      <motion.span
        className="forge-slash"
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 1 }}
        whileInView={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        viewport={VIEW}
        transition={{ duration: 0.8, times: [0, 0.5, 1], delay: (i % 2) * 0.12 }}
      />
      <svg className="forge-trace" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        <motion.rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          fill="none"
          stroke="#DC143C"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.5 + (i % 2) * 0.12 }}
        />
      </svg>
      <header className="forge-head">
        <span className="forge-icon">{icon[group.key]}</span>
        <div>
          <p className="mono forge-kicker">{group.kicker}</p>
          <h3>{group.title}</h3>
        </div>
        <span className="forge-count mono">{String(group.items.length).padStart(2, '0')}</span>
      </header>
      <ul className="forge-items">
        {group.items.map((it, j) => (
          <motion.li
            key={it}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ delay: 0.55 + j * 0.05, duration: 0.4 }}
          >
            <span className="tech-glyph mono" aria-hidden="true">{glyph(it)}</span>
            <span className="tech-name">{it}</span>
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}

export default function Skills() {
  return (
    <SlashSection id="skills" cut="matrix" label="Technical skills">
      <div className="shoji" aria-hidden="true" />
      <div className="wrap">
        <SectionHead index={3} kicker="The Blade Matrix">
          <motion.h2 className="sec-title matrix-title" initial="h" whileInView="s" viewport={VIEW}>
            {['MY', 'TECHNICAL', 'ARSENAL.'].map((w, i) => (
              <span className="mt-word" key={w}>
                <motion.span
                  variants={{ h: { x: i % 2 ? '-105%' : '105%' }, s: { x: '0%' } }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.8, 0, 0.2, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.h2>
        </SectionHead>
        <p className="sec-lede">Forged across infrastructure work, internships and hackathons. Listed as on my résumé — no invented proficiency bars.</p>
        <div className="forge-grid">
          {skills.map((g, i) => (
            <Panel key={g.key} group={g} i={i} />
          ))}
        </div>
      </div>
    </SlashSection>
  );
}
