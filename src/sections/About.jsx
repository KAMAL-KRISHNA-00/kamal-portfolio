import { motion } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { profile, education } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -30% 0px' };

const lines = [
  'I work where software meets the machines it runs on.',
  'Most recently, that meant standing up a high-availability mail platform — SMTP, IMAP, LDAP, load balancing, and streaming replication — during an ISRO-connected cloud internship at FCOOS Technologies.',
  'On the other side of the stack, I build full-stack and IoT systems: a meeting-aware status display on an ESP32, a SOC dashboard that won 2nd prize at an inter-college hackathon, and web platforms on MERN and Next.js.',
];

const facts = [
  ['Based in', profile.location],
  ['Studying', 'B.Tech CSE · ASIET, Kalady'],
  ['Batch', education[0].dates],
  ['CGPA', '8.11'],
  ['Focus', 'Linux infrastructure · Mail systems · Full-stack'],
];

export default function About() {
  return (
    <SlashSection id="about" cut="ink" label="About">
      <div className="washi" aria-hidden="true" />
      <div className="about-pattern" aria-hidden="true">
        <svg viewBox="0 0 800 800">
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx="400" cy="400" r={60 + i * 42} fill="none" stroke="#1A1A1A" strokeDasharray={i % 2 ? '2 10' : '40 14'} />
          ))}
        </svg>
      </div>
      <div className="wrap about-grid">
        <div className="about-copy">
          <SectionHead index={2} kicker="The Ink Reveal">
            <h2 className="sec-title brush-title">
              <svg className="brush-stroke" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true">
                <motion.path
                  d="M8,58 C90,30 180,66 280,44 C380,24 470,62 592,36"
                  stroke="#52101D"
                  strokeWidth="46"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={VIEW}
                  transition={{ duration: 0.9, ease: [0.6, 0, 0.2, 1] }}
                />
              </svg>
              <motion.span
                className="brush-text"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                viewport={VIEW}
                transition={{ duration: 0.9, ease: [0.6, 0, 0.2, 1], delay: 0.25 }}
              >
                BEYOND THE CODE.
              </motion.span>
            </h2>
          </SectionHead>

          <div className="about-lines">
            {lines.map((l, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)' }}
                whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                viewport={VIEW}
                transition={{ duration: 0.8, delay: 0.45 + i * 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                className={i === 0 ? 'lead' : ''}
              >
                {l}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="about-side">
          <div className="about-portrait" aria-hidden="true">
            <motion.div
              className="ink-circle"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={VIEW}
              transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
            />
            <svg className="enso" viewBox="0 0 200 200">
              <motion.path
                d="M100,22 C150,20 182,58 180,102 C178,150 138,180 96,178 C52,176 20,140 22,98 C24,62 48,34 84,26"
                fill="none"
                stroke="#DC143C"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={VIEW}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.5 }}
              />
            </svg>
            <div className="portrait-kk">
              <span>K</span>
              <span>K</span>
            </div>
            <span className="portrait-caption mono">Kamal Krishna</span>
          </div>

          <dl className="about-facts">
            {facts.map(([k, v], i) => (
              <motion.div
                key={k}
                initial={{ x: 60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={VIEW}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SlashSection>
  );
}
