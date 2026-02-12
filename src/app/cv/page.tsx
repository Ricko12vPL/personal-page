import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { SectionHeading } from '@/components/ui/section-heading'
import { Timeline } from '@/components/cv/timeline'
import { SkillSection } from '@/components/cv/skill-section'
import { LeetcodeStats } from '@/components/cv/leetcode-stats'
import { PrintButton } from '@/components/cv/print-button'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: 'CV',
    description:
      'Curriculum Vitae of Kacper Saks - ML/Backend Engineer specializing in quantitative finance, institutional-grade backtesting, and production ML systems.',
  }
}

const experience = [
  {
    period: 'Jan 2024 — Present',
    title: 'Junior Process Engineer',
    organization: 'Airbus Defence and Space',
    location: 'Warsaw, Poland',
    current: true,
    description: [
      'Led cross-team process optimization; automated documentation flow and reduced assembly time by 30% (~€50K/yr) via standardized procedures and scripts',
      'Created standardized technical documentation ensuring compliance across production workflows',
      'Applied rigorous aerospace engineering discipline to software development and system design',
    ],
  },
  {
    period: 'Sep 2023 — Jan 2024',
    title: 'Process Engineering Intern',
    organization: 'Airbus Defence and Space',
    location: 'Warsaw, Poland',
    description: [
      'Assisted in documentation optimization and cross-functional collaboration',
    ],
  },
]

const education = [
  {
    period: 'Oct 2024 — Aug 2026',
    title: 'MSc Project and Process Management',
    organization: 'Collegium Civitas',
    location: 'Warsaw',
    current: true,
  },
  {
    period: 'Jan 2024 — Jun 2024',
    title: '42 School Warsaw',
    organization: 'Peer-to-Peer Coding Program',
    location: 'Warsaw',
    description: [
      'Intensive C programming, algorithms, Unix systems while working full-time and pursuing Master\'s',
    ],
  },
  {
    period: 'Oct 2018 — Feb 2022',
    title: 'BEng Mechanical Engineering',
    organization: 'Silesian University of Technology',
    location: 'Gliwice',
    description: ['GPA: 4.17 / 5.00'],
  },
]

const skillCategories = [
  {
    name: 'Languages',
    skills: ['Python (Expert)', 'JavaScript/TypeScript', 'SQL', 'C'],
  },
  {
    name: 'ML / AI',
    skills: [
      'TensorFlow',
      'PyTorch',
      'scikit-learn',
      'XGBoost',
      'LightGBM',
      'CatBoost',
      'Multi-agent LLM',
      'RAG',
    ],
  },
  {
    name: 'Quantitative Finance',
    skills: [
      'Institutional Backtesting',
      'CPCV/DSR/PBO',
      'VectorBT',
      'Financial ML',
      'Algorithmic Trading',
    ],
  },
  {
    name: 'Data Science',
    skills: ['NumPy', 'Pandas', 'SciPy', 'Statistical Analysis', 'Tableau', 'R'],
  },
  {
    name: 'Backend / DevOps',
    skills: [
      'FastAPI',
      'asyncio',
      'multiprocessing',
      'PostgreSQL',
      'Docker',
      'CI/CD',
      'pytest',
      'Git',
    ],
  },
  {
    name: 'Optimization',
    skills: [
      'Optuna',
      'Genetic Algorithms',
      'Bayesian Optimization',
      'Sobol Sampling',
      'HPC (Google Cloud)',
    ],
  },
]

const certifications = [
  { name: 'Project Management', source: 'Google', year: '2025' },
  { name: 'Data Analytics', source: 'Google', year: '2025' },
  { name: 'Python Data Structures', source: 'Univ. of Michigan', year: '2024' },
  { name: 'Python for Everybody', source: 'Univ. of Michigan', year: '2024' },
  { name: 'Orbital Mechanics', source: 'Udemy', year: '' },
  { name: 'Spacecraft Engineering', source: 'Udemy', year: '' },
  { name: 'FEM Analysis', source: 'Coursera', year: '' },
  { name: 'Certified User: Inventor', source: 'Autodesk', year: '' },
]

export default function CvPage() {
  return (
    <div className="max-w-[800px] mx-auto px-8 py-24">
      <PrintButton />

      {/* Summary */}
      <section className="mb-32">
        <SectionHeading title="summary" />
        <p className="text-neutral-300 text-[15px] leading-[1.9] max-w-2xl">
          ML / Backend Engineer with experience building production ML
          pipelines, institutional backtesting systems and secure offline AI
          tools. Strong discipline from aerospace engineering applied to system
          design, testing and CI/CD.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <span className="text-neutral-600 text-[12px] uppercase tracking-wider self-center">
            Selected projects:
          </span>
          <Link
            href="/projects/x-quant"
            className="text-accent text-[13px] hover:opacity-70 transition-opacity"
          >
            X_QUANT
          </Link>
          <Link
            href="/projects/esg-compliance-agent"
            className="text-accent text-[13px] hover:opacity-70 transition-opacity"
          >
            ESG Agent
          </Link>
          <Link
            href="/projects/airbus-document-analyzer"
            className="text-accent text-[13px] hover:opacity-70 transition-opacity"
          >
            Airbus Analyzer
          </Link>
        </div>
      </section>

      {/* Experience */}
      <section className="mb-32">
        <SectionHeading title="experience" />
        <Timeline items={experience} />
      </section>

      {/* Education */}
      <section className="mb-32">
        <SectionHeading title="education" />
        <Timeline items={education} />
      </section>

      {/* Skills */}
      <section className="mb-32">
        <SectionHeading title="skills" />
        <SkillSection categories={skillCategories} />
      </section>

      {/* Certifications */}
      <section className="mb-32">
        <SectionHeading title="certifications" />
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={`${cert.source}-${cert.name}`}
              className="flex items-baseline justify-between py-2 border-b border-neutral-800/50"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-neutral-200 text-[14px]">
                  {cert.name}
                </span>
                <span className="text-accent/50 text-[12px]">
                  {cert.source}
                </span>
              </div>
              {cert.year && (
                <span className="text-neutral-600 text-[12px]">
                  {cert.year}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LeetCode */}
      <section className="mb-32">
        <SectionHeading title="leetcode" />
        <LeetcodeStats />
      </section>

      {/* Contact */}
      <section>
        <SectionHeading title="contact" />
        <div className="flex flex-wrap gap-8">
          {[
            { label: 'Email', href: `mailto:${siteConfig.links.email}`, text: siteConfig.links.email },
            { label: 'GitHub', href: siteConfig.links.github, text: 'Ricko12vPL' },
            { label: 'LinkedIn', href: siteConfig.links.linkedin, text: 'kacpersakspe' },
            { label: 'LeetCode', href: siteConfig.links.leetcode, text: 'ricko12vpl' },
          ].map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.label === 'Email' ? undefined : '_blank'}
              rel={contact.label === 'Email' ? undefined : 'noopener noreferrer'}
              className="group"
            >
              <span className="text-neutral-600 text-[11px] uppercase tracking-wider block mb-1">
                {contact.label}
              </span>
              <span className="text-accent text-[13px] group-hover:opacity-70 transition-opacity">
                {contact.text}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
