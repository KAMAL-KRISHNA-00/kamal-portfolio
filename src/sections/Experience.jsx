import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { experience } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -30% 0px' };

function Entry({ e, i }) {
  return (
    <li className={`path-entry ${e.featured ? 'path-entry--featured' : ''}`}>
      <motion.div className="path-marker" initial="off" whileInView="on" viewport={VIEW} aria-hidden="true">
        <motion.span className="pm-core" variants={{ off: { scale: 0.4, backgroundColor: '#1A1A1A' }, on: { scale: 1, backgroundColor: '#DC143C', transition: { delay: 0.25 } } }} />
        <motion.span className="pm-ring" variants={{ off: { scale: 0.5, opacity: 0 }, on: { scale: [0.5, 2.6], opacity: [0.9, 0], transition: { delay: 0.3, duration: 0.9 } } }} />
        <motion.span className="pm-strike" variants={{ off: { scaleX: 0, opacity: 1 }, on: { scaleX: [0, 1, 1], opacity: [1, 1, 0], transition: { duration: 0.5, times: [0, 0.5, 1] } } }} />
      </motion.div>

      <motion.article
        className="path-card"
        initial={{ clipPath: 'polygon(0 0, 0 0, -25% 100%, -25% 100%)', opacity: 0.4 }}
        whileInView={{ clipPath: 'polygon(0 0, 125% 0, 100% 100%, -25% 100%)', opacity: 1 }}
        viewport={VIEW}
        transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1], delay: 0.2 }}
      >
        {e.featured && (
          <div className="isro-label">
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <circle cx="10" cy="10" r="3" fill="#DC143C" />
              <ellipse cx="10" cy="10" rx="8.5" ry="3.6" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-30 10 10)" />
            </svg>
            <span className="mono">ISRO-connected project</span>
            <span className="isro-note">via internship at FCOOS Technologies Pvt Ltd</span>
          </div>
        )}
        <header className="path-head">
          <div>
            <h3>{e.role}</h3>
            <p className="path-org">
              {e.org} <span>· {e.place}</span>
            </p>
          </div>
          <time className="path-date mono">{e.dates}</time>
        </header>
        <ul className="path-bullets">
          {e.bullets.map((b, j) => (
            <motion.li key={j} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ delay: 0.5 + j * 0.08 }}>
              {b}
            </motion.li>
          ))}
        </ul>
        <ul className="tags" aria-label="Technologies">
          {e.stack.map((t, j) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={VIEW}
              transition={{ delay: 0.7 + j * 0.07, type: 'spring', stiffness: 400, damping: 24 }}
            >
              {t}
            </motion.li>
          ))}
        </ul>
        {e.featured && (
          <div className="fcoos-stack" aria-label="Mail platform components">
            {['SMTP / IMAP · Stalwart', 'LDAP · OpenLDAP', 'TCP LB · HAProxy', 'Reverse proxy · Nginx', 'Replication · PostgreSQL 16', 'Monitoring · Zabbix 7.0'].map((c, j) => (
              <motion.span key={c} className="mono" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ delay: 0.9 + j * 0.06 }}>
                {c}
              </motion.span>
            ))}
          </div>
        )}
      </motion.article>
      <span className="path-index mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
    </li>
  );
}

export default function Experience() {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.7', 'end 0.6'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <SlashSection id="experience" cut="path" label="Experience">
      <div className="wrap">
        <SectionHead index={4} kicker="The Path of the Sword">
          <motion.h2 className="sec-title path-title" initial="h" whileInView="s" viewport={VIEW}>
            <motion.span variants={{ h: { y: '-100%', opacity: 0 }, s: { y: 0, opacity: 1 } }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
              BUILT THROUGH
            </motion.span>
            <motion.span variants={{ h: { y: '100%', opacity: 0 }, s: { y: 0, opacity: 1 } }} transition={{ duration: 0.7, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}>
              EXPERIENCE.
            </motion.span>
          </motion.h2>
        </SectionHead>

        <div className="path" ref={listRef}>
          <div className="path-rail" aria-hidden="true">
            <motion.div className="path-rail-fill" style={{ scaleY: line }} />
            <span className="path-pulse" />
          </div>
          <ol className="path-list">
            {experience.map((e, i) => (
              <Entry key={e.id} e={e} i={i} />
            ))}
          </ol>
        </div>
      </div>
    </SlashSection>
  );
}
