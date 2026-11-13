// Single source of truth. Everything here is taken from the résumé
// (VASTRA details come from the project's own README, as it post-dates the résumé).

export const profile = {
  name: 'Kamal Krishna',
  role: 'Computer Science Engineer',
  location: 'Kochi, Kerala, India',
  email: 'kamalkrishna428@gmail.com',
  github: 'https://github.com/KAMAL-KRISHNA-00',
  githubHandle: 'KAMAL-KRISHNA-00',
  linkedin: 'https://www.linkedin.com/in/kamal-krishna-a66027291',
  linkedinHandle: 'kamal-krishna-a66027291',
  resume: '/Kamal_Krishna_Resume.pdf',
  summary:
    'B.Tech Computer Science student specializing in Linux infrastructure, distributed mail systems, and full-stack development, with hands-on experience deploying a high-availability mail platform across five integrated components during an ISRO-connected cloud internship at FCOOS Technologies.',
};

export const skills = [
  {
    key: 'lang',
    title: 'Languages',
    kicker: 'The Core Steel',
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C'],
  },
  {
    key: 'infra',
    title: 'Infrastructure',
    kicker: 'The Fortress',
    items: ['Linux (Ubuntu)', 'Nginx', 'HAProxy', 'OpenLDAP', 'Stalwart', 'Zabbix (SNMP)', 'Docker', 'PostgreSQL (Streaming Replication)'],
  },
  {
    key: 'web',
    title: 'Web & Frameworks',
    kicker: 'The Interface',
    items: ['Next.js', 'React.js', 'Django', 'Flask', 'Express', 'Socket.IO', 'Tailwind CSS'],
  },
  {
    key: 'db',
    title: 'Databases',
    kicker: 'The Vault',
    items: ['PostgreSQL', 'MongoDB', 'Supabase', 'MySQL'],
  },
  {
    key: 'tools',
    title: 'Tools',
    kicker: 'The Kit',
    items: ['ESP32', 'Git', 'Postman', 'Windows API (winreg, subprocess)', 'WSL2'],
  },
];

export const experience = [
  {
    id: 'fcoos',
    role: 'Cloud Infrastructure Intern',
    org: 'FCOOS Technologies Pvt Ltd',
    place: 'ISRO-connected Project',
    dates: 'Jun – Jul 2026',
    featured: true,
    stack: ['Linux', 'Stalwart', 'OpenLDAP', 'HAProxy', 'Nginx', 'PostgreSQL', 'Zabbix'],
    bullets: [
      'Configured a two-node mail cluster supporting SMTP, IMAP, LDAP authentication, reverse proxying, TCP load balancing, and streaming database replication – covering the full delivery and storage stack on Ubuntu 24.04.',
      'Deployed OpenLDAP as the centralized credential backend; configured HAProxy for TCP load balancing, Nginx as a reverse proxy for the admin console and Bulwark webmail, and PostgreSQL 16 streaming replication with failover tested by promoting the replica and verifying write access.',
      'Deployed Zabbix 7.0 with SNMP monitoring and threshold-based alerting across all infrastructure nodes.',
      'Diagnosed a webmail login failure caused by a JMAP endpoint misconfiguration combined with an auto-triggered IP block; resolved both independently and restored access.',
      'Authored a 37-item test case document with CLI output as evidence for each component, prepared for client-side review.',
    ],
  },
  {
    id: 'ict',
    role: 'MERN Stack Developer Intern',
    org: 'ICT Infopark, Koratty',
    place: 'Remote',
    dates: 'Jun – Jul 2024',
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    bullets: [
      'Built “NursaLink,” a nurse-booking web app with scheduling, contact management, and review features using the MERN stack.',
    ],
  },
  {
    id: 'facein',
    role: 'Backend Developer Intern',
    org: 'FACEin Academy',
    place: 'Remote',
    dates: 'Jun – Jul 2023',
    stack: ['Python', 'Django'],
    bullets: ['Implemented user authentication, database models, and REST API endpoints in Django.'],
  },
];

export const projects = [
  {
    id: 'dwc',
    name: 'Deep Work Concierge',
    tagline: 'IoT Productivity System',
    context: 'Independent',
    year: '2024',
    stack: ['Python', 'Flask', 'React', 'Socket.IO', 'ESP32', 'C++'],
    summary: 'Detects live virtual meetings on Windows and shows your status on an OLED display outside the room.',
    bullets: [
      'Monitors Windows audio sessions via PyCaw to detect active virtual meetings; signals an ESP32 over serial, which updates an OLED display outside the room with live status.',
      'Packaged as a Windows installer (Inno Setup) with an automated setup wizard and a React dashboard for configuration.',
    ],
  },
  {
    id: 'soc',
    name: 'HURISTI SOC',
    alias: 'Ghost-Sentry',
    tagline: 'Cybersecurity Dashboard',
    context: 'Hackathon, Team of 4',
    year: '2024',
    award: '2nd Prize — Inter-college Hackathon',
    stack: ['Next.js', 'Python', 'Supabase', 'Windows API'],
    summary: 'A SOC dashboard fed by a Python agent that watches the Windows Registry for unauthorized webcam and microphone access.',
    bullets: [
      'Built a SOC dashboard in Next.js and a Python agent that monitors the Windows Registry for unauthorized webcam/microphone access, syncing alerts to the dashboard via Supabase WebSockets.',
      'Used PowerShell for executable signature verification to classify potential threats. Won 2nd prize at an inter-college hackathon.',
    ],
  },
  {
    id: 'digitrove',
    name: 'Digitrove',
    tagline: 'Digital Library Platform',
    context: 'Academic, Team Project',
    stack: ['Next.js', 'TypeScript', 'Supabase'],
    summary: 'A library platform that tells you if a book is available — and exactly which rack it sits on.',
    bullets: [
      'Library platform with book search, real-time availability, rack location display, Manglish search support, and integrated e-book flipbooks.',
    ],
  },
  {
    id: 'nursalink',
    name: 'NursaLink',
    tagline: 'Nurse-Booking Web App',
    context: 'MERN Stack Developer Intern · ICT Infopark, Koratty',
    year: '2024',
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    summary: 'A nurse-booking web app built end-to-end on the MERN stack.',
    bullets: [
      'Built “NursaLink,” a nurse-booking web app with scheduling, contact management, and review features using the MERN stack.',
    ],
  },
  {
    id: 'vastra',
    name: 'VASTRA',
    tagline: 'Vision-Aware Smart Tailoring and Recommendation Assistant',
    context: 'B.Tech Final-Year Project',
    ongoing: true,
    stack: ['Python', 'MediaPipe', 'FastAPI', 'SQLite', 'React', 'Vite'],
    summary: 'Body measurement from smartphone photos, wardrobe management, outfit recommendation and size/fit assistance.',
    bullets: [
      'Estimates body measurements from smartphone photos using MediaPipe pose estimation and person segmentation — a research prototype whose estimates are not yet validated against tape measurements.',
      'Adds wardrobe management, rule-based outfit recommendation, and size/fit assistance through a FastAPI + SQLite backend and a React frontend.',
    ],
  },
];

export const education = [
  {
    school: 'Adi Shankara Institute of Engineering & Technology',
    place: 'Kalady, Kerala',
    degree: 'B.Tech, Computer Science & Engineering',
    dates: '2023 – 2027',
    score: 'CGPA 8.11',
  },
  {
    school: 'Kendriya Vidyalaya No:2 Naval Base',
    place: 'Kochi, Kerala',
    degree: 'XII CBSE, Computer Science',
    dates: '2023',
    score: '85.00%',
  },
];

export const leadership = [
  { role: 'Game Dev IG Lead', org: 'muLearn ASIET', seal: 'μL' },
  { role: 'Technical Co-Lead', org: 'CSI ASIET', seal: 'CSI' },
  { role: 'Animation Head', org: 'Design & Animation Club', seal: 'DAC' },
  { role: 'Technical Member', org: 'GDG ASIET', seal: 'GDG' },
];

export const certifications = [
  { title: 'Cloud Infrastructure Internship', issuer: 'FCOOS Technologies', note: 'Linked to the Cloud Infrastructure internship, Jun – Jul 2026.' },
  { title: 'Full Stack MERN', issuer: 'ICT Academy of Kerala', grade: 'Grade A', note: 'MongoDB · Express · React · Node.js' },
  { title: 'Python Django Internship', issuer: 'Facein Technologies', note: 'Linked to the Backend Developer internship, Jun – Jul 2023.' },
  { title: 'Software Engineering & Java', issuer: 'Infosys Springboard', note: 'Software engineering fundamentals and Java.' },
  { title: 'Career Essentials in Software Development', issuer: 'Microsoft & LinkedIn Learning', note: 'Professional certificate path.' },
  { title: 'Fundamentals of AI', issuer: 'NPTEL', note: 'National Programme on Technology Enhanced Learning.' },
];

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Arsenal' },
  { id: 'experience', label: 'Path' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Foundation' },
  { id: 'achievements', label: 'Marks' },
  { id: 'certifications', label: 'Archive' },
  { id: 'contact', label: 'Contact' },
];
