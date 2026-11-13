import { motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { leadership } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -25% 0px' };

function Seal({ text, big, delay = 0 }) {
  return (
    <motion.span
      className={`seal ${big ? 'seal--big' : ''}`}
      initial={{ scale: 2.4, opacity: 0, rotate: -22 }}
      whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
      viewport={VIEW}
      transition={{ delay, type: 'spring', stiffness: 520, damping: 22, mass: 0.8 }}
      aria-hidden="true"
    >
      <span>{text}</span>
    </motion.span>
  );
}

function SlashCard({ children, className, delay = 0 }) {
  return (
    <motion.article
      className={className}
      initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }}
      whileInView={{ clipPath: 'polygon(-60% 0, 100% 0, 100% 160%, -60% 160%)' }}
      viewport={VIEW}
      transition={{ duration: 0.55, delay, ease: [0.8, 0, 0.2, 1] }}
    >
      <motion.span
        className="card-slash"
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 1 }}
        whileInView={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        viewport={VIEW}
        transition={{ duration: 0.7, delay, times: [0, 0.45, 1] }}
      />
      {children}
    </motion.article>
  );
}

export default function Achievements() {
  return (
    <SlashSection id="achievements" cut="seal" label="Achievements and leadership">
      <div className="sun-motif" aria-hidden="true" />
      <div className="wrap">
        <SectionHead index={7} kicker="The Red Seal" align="center">
          <h2 className="sec-title seal-title">
            <motion.span initial={{ letterSpacing: '0.5em', opacity: 0 }} whileInView={{ letterSpacing: '0.02em', opacity: 1 }} viewport={VIEW} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
              MARKS OF PROGRESS.
            </motion.span>
          </h2>
        </SectionHead>

        <SlashCard className="honour honour--prize">
          <div className="honour-body">
            <p className="mono honour-kicker">Hackathon recognition</p>
            <h3>
              2nd Prize <span>— Inter-college Hackathon</span>
            </h3>
            <p>
              Awarded for <b>HURISTI SOC (Ghost-Sentry)</b> — a Next.js SOC dashboard and Python agent that watches the Windows Registry for unauthorized webcam and microphone access. Built in a team of four.
            </p>
          </div>
          <Seal text="II" big delay={0.45} />
        </SlashCard>

        <p className="mono honour-sub">Leadership</p>
        <div className="honour-grid">
          {leadership.map((l, i) => (
            <SlashCard key={l.role} className="honour" delay={0.1 + i * 0.12}>
              <Seal text={l.seal} delay={0.45 + i * 0.12} />
              <div className="honour-body">
                <h3>{l.role}</h3>
                <p>{l.org}</p>
              </div>
            </SlashCard>
          ))}
        </div>
      </div>
    </SlashSection>
  );
}
