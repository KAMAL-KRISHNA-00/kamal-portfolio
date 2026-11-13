import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimate, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import MatrixSphere from '../three/MatrixSphere.jsx';
import { katanaStore, INTRO } from '../three/store.js';
import { profile } from '../data/resume.js';
import { unsheath, swish } from '../lib/sound.js';

const seen = () => {
  try {
    return sessionStorage.getItem('kk-intro') === '1';
  } catch {
    return false;
  }
};

/* ---------- THE UNSHEATHING: a ~2s cinematic that any input skips ----------
   The 3D blade itself lives on the shared WebGL stage (KatanaStage) and reads the
   same INTRO timeline; this component only drives the DOM layers around it. */
function Unsheathing({ onReveal, onDone }) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let alive = true;
    const timers = [];
    const finish = () => {
      if (!alive) return;
      alive = false;
      timers.forEach(clearTimeout);
      katanaStore.endIntro();
      onReveal();
      onDone();
    };
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchstart', finish, { passive: true });
    window.addEventListener('keydown', finish);

    katanaStore.startIntro();
    const at = (sec, fn) => timers.push(setTimeout(() => alive && fn(), sec * 1000));
    animate('.io-glint', { x: ['-40vw', '140vw'], opacity: [0, 1, 0] }, { duration: 0.9, ease: 'easeInOut' });
    at(INTRO.draw[0], () => unsheath());
    at(INTRO.slash[0], () => swish(1));
    at(INTRO.reveal, () => {
      onReveal();
      animate('.io-half--a', { x: '-5%', y: '-104%' }, { duration: 0.95, ease: [0.75, 0, 0.2, 1] });
      animate('.io-half--b', { x: '5%', y: '104%' }, { duration: 0.95, ease: [0.75, 0, 0.2, 1] });
    });
    at(INTRO.end, finish);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchstart', finish);
      window.removeEventListener('keydown', finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    katanaStore.endIntro();
    onReveal();
    onDone();
  };

  return (
    <motion.div ref={scope} className="intro" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
      <div className="io-half io-half--a" />
      <div className="io-half io-half--b" />
      <div className="io-glint" />
      <button type="button" className="io-skip mono" onClick={skip}>
        Skip intro ↵
      </button>
    </motion.div>
  );
}

const L = (d) => ({ delay: d });

export default function Hero() {
  const reduce = useReducedMotion();
  const [intro, setIntro] = useState(() => !reduce && !seen());
  const [ready, setReady] = useState(!intro);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const markY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0.15]);

  const done = () => {
    setIntro(false);
    try {
      sessionStorage.setItem('kk-intro', '1');
    } catch {
      /* private mode */
    }
  };

  return (
    <header id="top" className="hero" ref={ref}>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-ink" />
        <div className="seigaiha seigaiha--hero" />
        <div className="hero-shoji" />
        <svg className="hero-lines" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path d="M0 720 L1440 180" stroke="#52101D" strokeWidth="1" />
          <path d="M0 760 L1440 220" stroke="#1A1A1A" strokeWidth="1" />
          <path d="M260 0 L260 900 M1180 0 L1180 900" stroke="#141414" />
        </svg>
      </div>

      <motion.div className="hero-grid wrap" style={reduce ? undefined : { opacity: fade }}>
        <motion.div className="hero-copy" style={reduce ? undefined : { y: copyY }}>
          <motion.p
            className="status mono"
            initial={{ opacity: 0, x: -20 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ...L(0.15) }}
          >
            <span className="status-dot" aria-hidden="true" />
            Computer Science Engineer / Kerala, India
          </motion.p>

          <h1 className="hero-title" aria-label="Engineering beyond the interface.">
            <motion.span
              className="ht-line ht-1"
              aria-hidden="true"
              initial={{ opacity: 0, filter: 'blur(16px)', y: 10 }}
              animate={ready ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], ...L(0.2) }}
            >
              ENGINEERING
            </motion.span>
            <span className="ht-line ht-2" aria-hidden="true">
              <motion.span
                className="ht-2-text"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={ready ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                transition={{ duration: 0.55, ease: [0.8, 0, 0.2, 1], ...L(0.55) }}
              >
                BEYOND THE
              </motion.span>
              <motion.span
                className="ht-2-bar"
                initial={{ scaleX: 0, x: '0%' }}
                animate={ready ? { scaleX: [0, 1, 1, 0], x: ['0%', '0%', '0%', '100%'] } : {}}
                transition={{ duration: 0.9, times: [0, 0.55, 0.6, 1], ease: [0.8, 0, 0.2, 1], ...L(0.5) }}
              />
            </span>
            <span className="ht-line ht-3" aria-hidden="true">
              <motion.span
                className="ht-3-text"
                initial={{ y: '110%' }}
                animate={ready ? { y: '0%', backgroundPosition: ['160% 0', '-60% 0'] } : {}}
                transition={{
                  y: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.9 },
                  backgroundPosition: { duration: 1.4, ease: 'easeInOut', delay: 1.25 },
                }}
              >
                INTERFACE.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ...L(1.25) }}
          >
            B.Tech Computer Science student specializing in <strong>Linux infrastructure</strong>,{' '}
            <strong>distributed mail systems</strong>, and <strong>full-stack development</strong>.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 14 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ...L(1.4) }}
          >
            <a href="#projects" className="btn btn--blade">
              <span>View the work</span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
            </a>
            <a href="#contact" className="btn btn--ghost">Get in touch</a>
          </motion.div>

          <motion.ul
            className="hero-facts mono"
            initial="h"
            animate={ready ? 's' : 'h'}
            variants={{ s: { transition: { staggerChildren: 0.08, delayChildren: 1.55 } } }}
          >
            {[
              ['ISRO-connected', 'cloud internship · FCOOS'],
              ['2nd Prize', 'HURISTI SOC hackathon'],
              ['CGPA 8.11', 'B.Tech CSE · ASIET'],
            ].map(([a, b]) => (
              <motion.li key={a} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }}>
                <b>{a}</b>
                <span>{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div className="hero-mark" style={reduce ? undefined : { y: markY }} aria-hidden="true">
          <motion.div
            className="mark-mask"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={ready ? { clipPath: 'circle(72% at 50% 50%)' } : {}}
            transition={{ duration: 1.3, ease: [0.7, 0, 0.2, 1], delay: 0.35 }}
          >
            <MatrixSphere active={ready} />
          </motion.div>
          <ul className="mark-orbit mono">
            <li>Linux Infrastructure</li>
            <li>Distributed Mail Systems</li>
            <li>Full-Stack Development</li>
          </ul>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        className="scroll-cue mono"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.9 }}
      >
        <span>Scroll — draw the blade</span>
        <i aria-hidden="true" />
      </motion.a>

      <AnimatePresence>{intro && <Unsheathing onReveal={() => setReady(true)} onDone={done} />}</AnimatePresence>
      <span className="sr-only">{profile.name}</span>
    </header>
  );
}
