import { MotionConfig } from 'framer-motion';
import Nav from './components/Nav.jsx';
import KatanaStage from './three/KatanaStage.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Skills from './sections/Skills.jsx';
import Experience from './sections/Experience.jsx';
import Projects from './sections/Projects.jsx';
import Education from './sections/Education.jsx';
import Achievements from './sections/Achievements.jsx';
import Certifications from './sections/Certifications.jsx';
import Contact from './sections/Contact.jsx';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <KatanaStage />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Achievements />
        <Certifications />
        <Contact />
      </main>
    </MotionConfig>
  );
}
