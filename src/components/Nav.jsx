import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { sections, profile } from '../data/resume.js';
import { setSoundEnabled, unsheath } from '../lib/sound.js';

export default function Nav() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [solid, setSolid] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      setSolid(window.scrollY > 40);
      if (window.scrollY < window.innerHeight * 0.4) setActive('');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const toggleSound = () => {
    const next = setSoundEnabled(!sound);
    setSound(next);
    if (next) unsheath();
  };

  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      <nav className={`nav ${solid ? 'nav--solid' : ''}`} aria-label="Primary">
        <a href="#top" className="nav-logo" aria-label="Kamal Krishna — back to top">
          <span className="nav-logo-mark">KK</span>
          <span className="nav-logo-text">Kamal Krishna</span>
        </a>
        <ul className="nav-links">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={active === s.id ? 'is-active' : ''} aria-current={active === s.id ? 'true' : undefined}>
                {s.label}
                {active === s.id && <motion.span layoutId="nav-blade" className="nav-blade" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <button
            type="button"
            className={`sound-toggle ${sound ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Mute sword sounds' : 'Enable sword sounds'}
            title={sound ? 'Sound on' : 'Sound off'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
              {sound ? (
                <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              ) : (
                <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
            <span className="mono">{sound ? 'SFX ON' : 'SFX OFF'}</span>
          </button>
          <a className="nav-resume mono" href={profile.resume} target="_blank" rel="noreferrer">
            Résumé
          </a>
          <button type="button" className="nav-burger" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <motion.div className="nav-progress" style={{ scaleX: bar }} aria-hidden="true" />
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }}
            animate={{ clipPath: 'polygon(-40% 0, 100% 0, 100% 100%, -40% 100%)' }}
            exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul>
              {sections.map((s, i) => (
                <motion.li key={s.id} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.04 }}>
                  <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                    <span className="mono">{String(i + 2).padStart(2, '0')}</span>
                    {s.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a className="mobile-resume mono" href={profile.resume} target="_blank" rel="noreferrer">
              Download résumé (PDF)
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
