import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { projects } from '../data/resume.js';
import { DeepWorkArt, SocArt, DigitroveArt, NursaArt, VastraArt } from './ProjectArt.jsx';

const VIEW = { once: true, margin: '0px 0px -25% 0px' };
const ART = { dwc: DeepWorkArt, soc: SocArt, digitrove: DigitroveArt, nursalink: NursaArt, vastra: VastraArt };

// a distinct entrance per project
const REVEAL = {
  dwc: {
    initial: { clipPath: 'polygon(0 0, 0 0, -40% 100%, -40% 100%)' },
    whileInView: { clipPath: 'polygon(0 0, 140% 0, 100% 100%, -40% 100%)' },
    transition: { duration: 1.0, ease: [0.8, 0, 0.15, 1] },
  },
  soc: {
    initial: { clipPath: 'inset(0 0 100% 0)' },
    whileInView: { clipPath: 'inset(0 0 0% 0)' },
    transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] },
  },
  digitrove: { initial: {}, whileInView: {}, transition: {} }, // slats handle it
  nursalink: {
    initial: { x: 120, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] },
  },
  vastra: {
    initial: { clipPath: 'inset(0 0 100% 0)', opacity: 0.6 },
    whileInView: { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
    transition: { duration: 1.3, ease: 'linear' },
  },
};

function Project({ p, i }) {
  const [open, setOpen] = useState(false);
  const Art = ART[p.id];
  const r = REVEAL[p.id];
  const flip = i % 2 === 1;

  return (
    <motion.article
      className={`proj proj--${p.id} ${flip ? 'proj--flip' : ''}`}
      initial={r.initial}
      whileInView={r.whileInView}
      viewport={VIEW}
      transition={r.transition}
    >
      {p.id === 'digitrove' && (
        <div className="slats" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <motion.span
              key={k}
              initial={{ x: '0%' }}
              whileInView={{ x: k % 2 ? '102%' : '-102%' }}
              viewport={VIEW}
              transition={{ duration: 0.7, delay: 0.1 + k * 0.08, ease: [0.8, 0, 0.2, 1] }}
            />
          ))}
        </div>
      )}
      {p.id === 'soc' && <motion.span className="soc-reveal-line" initial={{ top: '0%' }} whileInView={{ top: ['0%', '100%'], opacity: [1, 1, 0] }} viewport={VIEW} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }} aria-hidden="true" />}
      {p.id === 'nursalink' && <motion.span className="nursa-panel" initial={{ scaleX: 1 }} whileInView={{ scaleX: 0 }} viewport={VIEW} transition={{ duration: 0.7, delay: 0.25, ease: [0.8, 0, 0.2, 1] }} aria-hidden="true" />}

      <div className="proj-art">
        <Art />
        <span className="proj-art-note mono">Concept illustration · based on documented functionality</span>
      </div>

      <div className="proj-body">
        <div className="proj-meta mono">
          <span>{String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
          <span>{p.context}</span>
          {p.year && <span>{p.year}</span>}
          {p.ongoing && <span className="badge-ongoing"><i /> Ongoing</span>}
        </div>
        <h3 className="proj-name">
          {p.name}
          {p.alias && <small> ({p.alias})</small>}
        </h3>
        <p className="proj-tag">{p.tagline}</p>
        {p.award && (
          <div className="proj-award">
            <span className="award-seal" aria-hidden="true">II</span>
            <span>{p.award}</span>
          </div>
        )}
        <p className="proj-summary">{p.summary}</p>
        <ul className="tags">
          {p.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <button type="button" className="proj-toggle" aria-expanded={open} aria-controls={`proj-${p.id}-details`} onClick={() => setOpen((v) => !v)}>
          <span className="mono">{open ? 'Sheathe details' : 'Draw details'}</span>
          <motion.svg viewBox="0 0 24 24" width="16" height="16" animate={{ rotate: open ? 45 : 0 }} aria-hidden="true">
            <path d="M12 4 v16 M4 12 h16" stroke="currentColor" strokeWidth="1.8" />
          </motion.svg>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`proj-${p.id}-details`}
              className="proj-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
            >
              <ul>
                {p.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              {p.id === 'vastra' && <p className="proj-foot mono">Status: in active development as a B.Tech final-year project.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  return (
    <SlashSection id="projects" cut="strike" label="Projects">
      <div className="seigaiha seigaiha--faint" aria-hidden="true" />
      <div className="wrap">
        <SectionHead index={5} kicker="The Art of the Strike">
          <h2 className="sec-title strike-title">
            <motion.span
              initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              viewport={VIEW}
              transition={{ duration: 0.6, ease: [0.8, 0, 0.2, 1] }}
            >
              CREATED WITH
            </motion.span>
            <motion.span
              className="accent"
              initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
              whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              viewport={VIEW}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.8, 0, 0.2, 1] }}
            >
              PURPOSE.
            </motion.span>
          </h2>
        </SectionHead>
        <p className="sec-lede">Five builds — hardware to hackathon. Open any card to read the full brief.</p>
        <div className="proj-list">
          {projects.map((p, i) => (
            <Project key={p.id} p={p} i={i} />
          ))}
        </div>
      </div>
    </SlashSection>
  );
}
