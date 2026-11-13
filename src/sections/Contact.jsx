import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SlashSection, { SectionHead } from '../components/SlashSection.jsx';
import { BladeMark } from '../components/Katana.jsx';
import { profile } from '../data/resume.js';

const VIEW = { once: true, margin: '0px 0px -20% 0px' };

function FinalSheathing() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.75'] });
  const inkS = useTransform(scrollYProgress, [0.46, 0.72], [0.05, 1]);
  const inkO = useTransform(scrollYProgress, [0.46, 0.52, 0.9, 1], [0, 0.95, 0.85, 0.7]);
  const dusk = useTransform(scrollYProgress, [0.5, 1], [1, 0]);
  const h1 = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const h1y = useTransform(scrollYProgress, [0.42, 0.58], [24, 0]);
  const h2 = useTransform(scrollYProgress, [0.6, 0.76], [0, 1]);
  const h2c = useTransform(scrollYProgress, [0.6, 0.78], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  const st = reduce ? {} : undefined;

  return (
    <div className="final-stage" ref={ref}>
      <motion.div className="final-dusk" style={st ?? { opacity: dusk }} aria-hidden="true" />
      <div className="final-ink-wrap" aria-hidden="true">
        <motion.div className="final-ink" style={st ?? { scale: inkS, opacity: inkO }}>
          <svg viewBox="0 0 400 400">
            <defs>
              <filter id="inkfx" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
                <feDisplacementMap in="SourceGraphic" scale="26" />
              </filter>
              <radialGradient id="inkfill" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#8B0000" />
                <stop offset="0.7" stopColor="#52101D" />
                <stop offset="1" stopColor="#52101D" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="200" r="170" fill="url(#inkfill)" filter="url(#inkfx)" />
            <circle cx="200" cy="200" r="186" fill="none" stroke="#DC143C" strokeWidth="2" strokeDasharray="300 40 120 30" filter="url(#inkfx)" opacity="0.7" />
          </svg>
        </motion.div>
      </div>

      <div className="final-copy">
        <motion.h2 className="final-h1" style={st ?? { opacity: h1, y: h1y }}>
          EVERY GREAT SYSTEM BEGINS WITH AN IDEA.
        </motion.h2>
        <motion.p className="final-h2" style={st ?? { opacity: h2, clipPath: h2c }}>
          LET&rsquo;S BUILD SOMETHING MEANINGFUL.
        </motion.p>
      </div>

    </div>
  );
}

function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const on = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${f.name}`);
    const body = encodeURIComponent(`${f.message}\n\n— ${f.name} (${f.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <form className="cform" onSubmit={submit}>
      <div className="cfield">
        <label htmlFor="cf-name" className="mono">Name</label>
        <input id="cf-name" required autoComplete="name" value={f.name} onChange={on('name')} />
      </div>
      <div className="cfield">
        <label htmlFor="cf-email" className="mono">Email</label>
        <input id="cf-email" type="email" required autoComplete="email" value={f.email} onChange={on('email')} />
      </div>
      <div className="cfield">
        <label htmlFor="cf-msg" className="mono">Message</label>
        <textarea id="cf-msg" rows={5} required value={f.message} onChange={on('message')} />
      </div>
      <button type="submit" className="btn btn--blade">
        <span>Send message</span>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
      </button>
      <p className="cform-note mono" role="status">
        {sent ? 'Your mail app should now be open with the message ready to send.' : 'Opens your mail app with the message pre-filled.'}
      </p>
    </form>
  );
}

export default function Contact() {
  const links = [
    { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
    { k: 'GitHub', v: profile.githubHandle, href: profile.github },
    { k: 'LinkedIn', v: profile.linkedinHandle, href: profile.linkedin },
    { k: 'Résumé', v: 'Download PDF', href: profile.resume },
  ];
  return (
    <SlashSection id="contact" cut="final" label="Contact">
      <div className="wrap">
        <SectionHead index={9} kicker="The Final Sheathing" title="" align="center">
          <span className="sr-only">Contact</span>
        </SectionHead>
      </div>
      <FinalSheathing />
      <div className="wrap contact-grid">
        <motion.ul className="clinks" initial="h" whileInView="s" viewport={VIEW} variants={{ s: { transition: { staggerChildren: 0.08 } } }}>
          {links.map((l) => (
            <motion.li key={l.k} variants={{ h: { opacity: 0, x: -30 }, s: { opacity: 1, x: 0 } }}>
              <a href={l.href} target={l.href.startsWith('http') || l.k === 'Résumé' ? '_blank' : undefined} rel="noreferrer">
                <span className="mono">{l.k}</span>
                <b>{l.v}</b>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 17 L17 7 M9 7 h8 v8" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
              </a>
            </motion.li>
          ))}
        </motion.ul>
        <ContactForm />
      </div>
      <footer className="signature">
        <p>KAMAL KRISHNA — ENGINEERING BEYOND THE INTERFACE.</p>
        <BladeMark className="signature-blade" />
        <p className="mono signature-small">Kochi, Kerala, India · © {new Date().getFullYear()}</p>
      </footer>
    </SlashSection>
  );
}
