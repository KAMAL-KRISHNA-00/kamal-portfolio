import { motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { certifications } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -20% 0px' };

export default function Certifications() {
  return (
    <SlashSection id="certifications" cut="scan" label="Certifications">
      <div className="wrap">
        <SectionHead index={8} kicker="The Archive">
          <h2 className="sec-title archive-title">
            <motion.span
              initial={{ backgroundSize: '0% 0.32em' }}
              whileInView={{ backgroundSize: '100% 0.32em' }}
              viewport={VIEW}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.2, 1] }}
            >
              PROOF OF LEARNING.
            </motion.span>
          </h2>
        </SectionHead>

        <div className="archive">
          {certifications.map((c, i) => (
            <motion.article
              key={c.title}
              className="doc"
              tabIndex={0}
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
              viewport={VIEW}
              transition={{ duration: 0.7, delay: (i % 3) * 0.12, ease: [0.6, 0, 0.2, 1] }}
            >
              <motion.span
                className="doc-scan"
                aria-hidden="true"
                initial={{ top: '0%', opacity: 1 }}
                whileInView={{ top: ['0%', '100%'], opacity: [1, 1, 0] }}
                viewport={VIEW}
                transition={{ duration: 0.9, delay: (i % 3) * 0.12 + 0.3, ease: 'easeInOut' }}
              />
              <span className="doc-corner doc-corner--tl" aria-hidden="true" />
              <span className="doc-corner doc-corner--br" aria-hidden="true" />
              <div className="doc-top mono">
                <span>No. {String(i + 1).padStart(3, '0')}</span>
                {c.grade && <span className="doc-grade">{c.grade}</span>}
              </div>
              <h3>{c.title}</h3>
              <div className="doc-sep" aria-hidden="true" />
              <p className="doc-issuer">{c.issuer}</p>
              <p className="doc-more">{c.note}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </SlashSection>
  );
}
