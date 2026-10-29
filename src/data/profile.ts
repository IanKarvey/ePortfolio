/* Public facts about Ian, kept in line with his CV. The AI chat answers only from these and the
   project files; the CV (src/data/cv.ts) reads its skill groups from here so they never drift.
   Deliberately excludes private CV fields (birth date, sex, marital status). */
export const profile = {
  name: 'Ian Karvey L. Manimtim',
  goesBy: 'Ian',
  location: 'Talisay, Batangas, Philippines',
  headline: 'BSIT student at De La Salle Lipa, majoring in System Development.',
  availability: 'Open to OJT & Internship Opportunities',
  availabilityDetail: 'Ian is actively looking for an OJT (on-the-job training) or internship placement as part of his BSIT degree at De La Salle Lipa (Class of 2027), and is happy to discuss schedules and requirements.',
  /* the CV's Professional Summary */
  summary:
    'Aspiring full-stack developer and fourth-year BSIT student majoring in System Development at De La Salle Lipa, based in Talisay, Batangas. Driven to build software that solves real problems for real people — including Barangay Safety, an incident-reporting platform built solo with Flutter and Supabase for barangays in Lipa City, and two Python desktop applications delivered to clients. Detail-oriented, quick to learn and comfortable owning a project from start to finish. Seeking a Full-Stack or Software Developer OJT placement with opportunities to learn and grow, while open to other software, systems, web or mobile roles.',
  education: [
    'Bachelor of Science in Information Technology, Major in System Development — De La Salle Lipa, 2023–2027 (currently 4th year)',
    'Senior High School — San Guillermo Academy, 2021–2023 — awards: With Honors; Best in Research; With Honors in Work Immersion',
  ],
  certifications: [
    'Cyber Threat Management — Cisco Networking Academy (April 2026)',
    'Python Essentials 2 — Cisco × OpenEDG Python Institute (April 2026)',
    'Python Essentials 1 — Cisco × OpenEDG Python Institute (April 2026)',
    'Skills to Succeed Academy, 58 modules — Accenture (March 2026)',
    'DevRoutes: Learning How to Learn with Roadmaps — JPCS, De La Salle chapter (January 2026)',
  ],
  /* the CV's Key Skills, group by group */
  skillGroups: [
    ['Mobile Development', 'Flutter, Dart, Provider, maps and geolocation, push notifications'],
    ['Backend & Database', 'Supabase, PostgreSQL, SQL, Edge Functions, Node.js, REST APIs, error handling'],
    ['Desktop & Data', 'Python, C++, Tkinter, Matplotlib and CSV data handling'],
    ['Web Development', 'HTML, CSS, JavaScript, Astro, Tailwind CSS, Next.js, Bootstrap, responsive design, Vercel and Firebase Hosting'],
    ['Data, Tools & Design', 'Power BI, Visual Studio, Git and GitHub, Adobe tools and Figma'],
    ['AI Tools', 'ChatGPT, Microsoft Copilot, Claude, Gemini (used for automation, SQL/query support, and system development)'],
  ] as [string, string][],
  strengths: ['Quick learner', 'Team player', 'Detail-oriented', 'Creative problem solver'],
  languages: ['Tagalog', 'English'],
  contact: {
    personalEmail: 'ianmanimtim07.4@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ian-karvey-manimtim/',
    schoolEmail: 'ian_karvey_manimtim@dlsl.edu.ph',
    phone: '+63 993 867 3884',
    facebook: 'https://www.facebook.com/IanKarveyM/',
  },
};
