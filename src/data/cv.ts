/* Ian's CV — the source for /cv/ and /Ian-Karvey-Manimtim-CV.pdf.
   Layout follows the resume format Ian chose (summary → skills → experience → projects →
   education → certifications → references). Edit here, then regenerate the PDF from /cv/. */
import { profile } from './profile';

export const cv = {
  name: profile.name,
  photo: '/Picture%20of%20Me/ian-professional-700.jpg',
  contact: [
    ['Email', profile.contact.personalEmail],
    ['Phone', profile.contact.phone],
    ['Location', 'Talisay, Batangas'],
  ],
  links: [
    ['LinkedIn', 'linkedin.com/in/ian-karvey-manimtim'],
    ['Portfolio', 'karveyportfolio.vercel.app'],
  ],

  summary: profile.summary,

  /* same groups as the website's Skills section — edit them in profile.ts */
  skills: [
    ...profile.skillGroups,
    ['Soft Skills & Languages', `${profile.strengths.join(', ').toLowerCase().replace(/^./, c => c.toUpperCase())} · ${profile.languages.join(', ')}`],
  ] as [string, string][],

  experience: [
    {
      role: 'Freelance Software Developer — Client Commissions',
      points: [] as string[],
      sub: [
        {
          title: 'GMD Bakery — Order and Production Planner',
          date: 'October 2026',
          href: '/projects/gmd-bakery-planner/',
          points: [
            'Replaced handwritten order slips with a Python/Tkinter app for orders, inventory, daily sales, reports and Matplotlib charts.',
            'Built a production plan that computes, per day, the pieces still to bake after subtracting stock on hand, with a printable bake sheet.',
            'Packaged as a portable Windows program with PyInstaller — runs from a USB drive with nothing to install; auto-saves with backups.',
          ],
        },
        {
          title: 'Failed Delivery & Redelivery Pattern Analyzer',
          date: 'October 2026',
          href: '/projects/failed-delivery-analyzer/',
          points: [
            'Built desktop and terminal versions on one shared engine that track delivery attempts and redeliveries, success rate by area, top failure reasons and trends, with four Matplotlib charts.',
            'Enforced data-integrity rules (e.g. no attempts after a successful delivery) and covered them with 79 automated tests.',
          ],
        },
      ],
    },
  ],

  projects: [
    {
      title: 'Barangay Safety — Incident Reporting with Geo-Tagging and Interactive Maps',
      date: 'September 2025 – October 2026',
      points: [
        'Capstone project: sole developer of a Flutter mobile app and web dashboard on Supabase (PostgreSQL) for five high-density barangays in Lipa City.',
        'GPS geo-tagged incident reports with photos, live incident map, heatmaps and real-time responder tracking.',
        'Server-side auto-escalation of unanswered reports at 5, 10 and 15 minutes using pg_cron, with push alerts via Edge Functions and Firebase Cloud Messaging.',
        'Row-level security on every table, private photo storage with signed URLs, duplicate-photo detection, audit logs, and PDF/Excel exports.',
      ],
    },
  ],

  /* [degree, school, years, honors?] */
  education: [
    ['Bachelor of Science in Information Technology — Major in System Development', 'De La Salle Lipa', '2023 – 2027 (Ongoing, 4th Year)'],
    ['Senior High School', 'San Guillermo Academy', '2021 – 2023', 'With Honors · Best in Research · With Honors in Work Immersion'],
  ],

  certifications: [
    'Cyber Threat Management — Cisco Networking Academy (2026)',
    'Python Essentials 1 & 2 — Cisco × OpenEDG Python Institute (2026)',
    'Skills to Succeed Academy, 58 modules — Accenture (2026)',
    'DevRoutes: Learning How to Learn with Roadmaps — JPCS, De La Salle Chapter (2026)',
  ],

  /* add real references here as { name, title, email, phone } — until then the CV says "available upon request" */
  references: [] as { name: string; title: string; email: string; phone: string }[],
};
