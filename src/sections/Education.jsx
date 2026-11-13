import { motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { education } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -30% 0px' };
const piece = (d) => ({
  initial: { pathLength: 0 },
  whileInView: { pathLength: 1 },
  viewport: VIEW,
  transition: { duration: 0.7, delay: d, ease: [0.6, 0, 0.2, 1] },
});

function Torii() {
  return (
    <svg className="torii" viewBox="0 0 300 240" aria-hidden="true">
      {/* pillars rise first */}
      <motion.path d="M78 236 V70" {...piece(0)} />
      <motion.path d="M222 236 V70" {...piece(0.08)} />
      {/* nuki (tie beam) */}
      <motion.path d="M54 92 H246" {...piece(0.45)} />
      {/* gakuzuka (centre strut) */}
      <motion.path d="M150 50 V92" {...piece(0.7)} />
      {/* shimaki + kasagi (top lintel) with upswept ends */}
      <motion.path d="M40 50 H260" {...piece(0.85)} />
      <motion.path className="torii-kasagi" d="M14 26 C70 38 230 38 286 26" {...piece(1.0)} />
      {/* kamebara bases */}
      <motion.path d="M70 236 H86 M214 236 H230" {...piece(1.2)} />
    </svg>
  );
}

export default function Education() {
  return (
    <SlashSection id="education" cut="rise" label="Education">
      <div className="edu-frame" aria-hidden="true">
        <span className="ef ef--t" />
        <span className="ef ef--b" />
        <span className="ef ef--l" />
        <span className="ef ef--r" />
      </div>
      <div className="wrap edu-grid">
        <div className="edu-left">
          <SectionHead index={6} kicker="The Discipline">
            <motion.h2 className="sec-title edu-title" initial="h" whileInView="s" viewport={VIEW} aria-label="The foundation.">
              {['THE', 'FOUNDATION.'].map((word, w) => (
                <span className="edu-word" key={word} aria-hidden="true">
                  {word.split('').map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={{ h: { y: '100%', opacity: 0 }, s: { y: '0%', opacity: 1 } }}
                      transition={{ delay: (w * 4 + i) * 0.03, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h2>
          </SectionHead>
          <Torii />
        </div>

        <div className="edu-track">
          <motion.span
            className="edu-line"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={VIEW}
            transition={{ duration: 1.2, ease: [0.6, 0, 0.2, 1], delay: 0.3 }}
            aria-hidden="true"
          />
          {education.map((e, i) => (
            <motion.article
              key={e.school}
              className="edu-card"
              initial={{ clipPath: 'inset(100% 0 0 0)', y: 30 }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)', y: 0 }}
              viewport={VIEW}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.25, ease: [0.7, 0, 0.2, 1] }}
            >
              <span className="edu-node" aria-hidden="true" />
              <div className="edu-top mono">
                <span>{e.dates}</span>
                <span>{e.place}</span>
              </div>
              <h3>{e.school}</h3>
              <p>{e.degree}</p>
              <p className="edu-score">
                <span className="mono">{e.score.startsWith('CGPA') ? 'CGPA' : 'Score'}</span>
                <b>{e.score.replace('CGPA ', '')}</b>
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </SlashSection>
  );
}
