import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { SectionHeading } from '@/components/ui/section-heading'
import { Timeline } from '@/components/cv/timeline'
import { SkillSection } from '@/components/cv/skill-section'
import { LeetcodeStats } from '@/components/cv/leetcode-stats'
import { CV_CONTACTS } from '@/components/cv/contacts'
import { CvActions } from '@/components/cv/cv-actions'
import { CvRail, type CvSection } from '@/components/cv/cv-rail'
import { ResearchList, type CvResearchItem } from '@/components/cv/research-list'
import { PathCrumb } from '@/components/ui/path-crumb'
import { pageMetadata } from '@/lib/metadata'

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'CV',
    description:
      'Curriculum Vitae of Kacper Saks — aerospace process engineer at Airbus Defence and Space with an independent applied-AI/ML research track in modelling, verification and validation.',
    path: '/cv',
  })
}

const experience = [
  {
    period: 'Sep 2023 — Present',
    title: 'Process Engineer',
    organization: 'Airbus Defence and Space',
    location: 'Warsaw, Poland',
    current: true,
    description: [
      'Progression: Intern (Sep 2023) → Junior Process Engineer (Jan 2024) → Process Engineer (May 2026)',
      'Develop technological processes, assembly sequences and control cards for parts and subassemblies in prototype and serial aircraft production (Airbus Poland and CASA/Airbus cooperative programmes)',
      'Optimised production workflows and material/fastener allocation — up to 30% efficiency improvement and ~€50K annual cost savings',
      'Verify processes against new technical developments, inspection-monitor workstation compliance, and implement design-office changes',
      'Define tooling, fixture and metrology assumptions; select tools on techno-economic criteria; normalise working time',
      'Deliver internal training on design & technological documentation; apply Lean standardisation and FOD discipline daily (CATIA V5, SAP ERP, GD&T)',
    ],
  },
  {
    period: '2024 — Present',
    title: 'Co-founder & CTO',
    organization: 'K&S Venture Group — Clashpoint.me',
    location: 'Warsaw, Poland',
    current: true,
    description: [
      'Designed, built and operate an AI-driven sales-coaching platform end to end — FastAPI, PostgreSQL, Next.js/React, LLM features',
    ],
  },
]

const research: readonly CvResearchItem[] = [
  {
    title: 'The Validation Crisis in AI Forecasting',
    meta: 'Self-archived preprint · 2026',
    description:
      'Deflated Sharpe ratio, a sequential adaptation of PBO (probability of forecast overfitting) and walk-forward retrodiction applied to published AGI capability forecasts — a pre-registered pipeline that reports its own failed prediction.',
    href: `${siteConfig.url}/research/validation-crisis`,
    external: false,
  },
  {
    title: 'worldclass-research-org — 39-role autonomous research organisation',
    meta: 'Open source · Zenodo DOI 10.5281/zenodo.20645678 (v0.2.0)',
    metaHref: 'https://doi.org/10.5281/zenodo.20645678',
    repoHref: 'https://github.com/Ricko12vPL/worldclass-research-org',
    description:
      'Multi-agent pipeline enforcing pre-registration and reproducibility across the research lifecycle; centrepiece pre-registered gate-calibration study, with a public erratum (v0.2.1) downgrading its cross-arm results to exploratory.',
    href: `${siteConfig.url}/research/executable-gate-research-org`,
    external: false,
  },
  {
    title: 'X_Quant — solo quantitative research program',
    meta: 'Solo research · 2024–2026',
    description:
      'v1 (≈274K LOC) was retired in Aug 2026; its published metrics are withdrawn. v2 rebuilt the process under a written research constitution — pre-registration, an append-only decision register, a permanent attempts ledger and separate build/verify sessions. No strategy it tested was validated for trading, and none is recorded as reaching paper or live trading.',
    href: `${siteConfig.url}/projects/x-quant`,
    external: false,
  },
  {
    title: 'Alpha Lab — local research workstation for alpha research',
    meta: 'Private · in progress · 2026',
    description:
      'Successor to X_Quant: point-in-time data, a fast vectorised backtest engine, a signal lab and a research-integrity engine (hash-chained trial ledger, sealed holdouts, DSR / PBO / SPA). Key phases close with an independent AI-agent review, and the integrity statistics are mutation-tested; no real-return results yet.',
    href: `${siteConfig.url}/projects/alpha-lab`,
    external: false,
  },
  {
    title: 'neo-triage — hierarchical Bayesian classification',
    meta: 'Manuscript in preparation',
    description:
      'NumPyro hierarchical Bayesian classifier with a LightGBM baseline for near-Earth-object triage; calibration, uncertainty quantification and a reproducible training pipeline.',
    href: 'https://github.com/Ricko12vPL/neo-triage',
    external: true,
  },
]

const education = [
  {
    period: 'Oct 2024 — Aug 2026',
    title: 'Master’s programme — Project & Process Management',
    keepCase: true,
    organization: 'Collegium Civitas',
    location: 'Warsaw',
    current: false,
  },
  {
    period: 'Project-based',
    title: 'Software Engineering — 42 Warsaw',
    organization: 'Peer-to-peer coding program',
    location: 'Warsaw',
    description: [
      'Project-based, peer-to-peer software engineering — C, algorithms, Unix systems',
    ],
  },
  {
    period: 'Oct 2018 — Feb 2022',
    title: 'BEng Mechanical Engineering',
    keepCase: true,
    organization: 'Silesian University of Technology',
    location: 'Gliwice',
    description: [
      'Thesis: feed mechanism of mining rigs and bolting machines · Major GPA 4.17 / 5.00',
    ],
  },
]

const skillCategories = [
  {
    name: 'Verification & Validation',
    skills: [
      'Combinatorial Purged CV',
      'Deflated Metrics (DSR)',
      'PBO / CSCV',
      'Walk-Forward',
      'Calibration & UQ',
      'Pre-registration',
      'Reproducible Pipelines',
      'SPC / Control Cards',
    ],
  },
  {
    name: 'AI / ML',
    skills: [
      'Bayesian Modelling (NumPyro)',
      'LightGBM / Gradient Boosting',
      'scikit-learn',
      'PyTorch',
      'SHAP',
      'LLM & Multi-agent Pipelines',
      'RAG',
    ],
  },
  {
    name: 'Modelling & Simulation',
    skills: [
      'FEM — Linear & Nonlinear (certified)',
      'Convergence / Mesh-independence',
      'CATIA V5',
      'Autodesk Inventor',
      'Python numerical stack',
    ],
  },
  {
    name: 'Manufacturing Engineering',
    skills: [
      'Technological Process Design',
      'Assembly Sequencing',
      'Tooling & Metrology',
      'GD&T',
      'SAP ERP',
      'Lean / Continuous Improvement',
      'FOD',
    ],
  },
  {
    name: 'Backend & Programming',
    skills: [
      'Python',
      'SQL',
      'TypeScript / JavaScript',
      'FastAPI',
      'PostgreSQL',
      'Next.js / React',
      'Docker',
      'Git',
    ],
  },
]

const certifications = [
  { name: 'FEA Convergence & Mesh Independence', source: 'Coursera', year: '' },
  { name: 'FEM — Linear, Nonlinear Analysis & Post-Processing', source: 'Coursera', year: '' },
  { name: 'Certified User: Inventor', source: 'Autodesk', year: '' },
  { name: 'Introduction to Orbital Mechanics', source: 'Udemy', year: '' },
  { name: 'Interplanetary Spacecraft & Satellite Engineering', source: 'Udemy', year: '' },
  { name: 'Google Data Analytics', source: 'Google', year: '' },
  { name: 'Python for Everybody', source: 'Univ. of Michigan', year: '' },
]

const SECTIONS: readonly CvSection[] = [
  { id: 'summary', label: 'summary' },
  { id: 'experience', label: 'experience' },
  { id: 'research', label: 'research & publications' },
  { id: 'skills', label: 'skills' },
  { id: 'education', label: 'education' },
  { id: 'certifications', label: 'certifications' },
  { id: 'languages', label: 'languages & eligibility' },
  { id: 'leetcode', label: 'leetcode' },
  { id: 'contact', label: 'contact' },
]

// Screen layout: the site's 1100px grid with a sticky record rail at lg.
// Print: `.cv-frame` and the grid collapse (globals.css), the rail is
// print-hidden, and the inner column keeps its literal `max-w-[800px] py-24`
// classes because the print stylesheet keys on them — so the PDF is unchanged.
// Screen-only spacing overrides are safe: the print rules for `.mb-32`, `.mb-16`
// and `.max-w-[800px]` are !important and win over any (non-important) utility.
export default function CvPage() {
  return (
    <div className="cv-frame mx-auto max-w-[1100px] px-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-12">
      <div className="max-w-[800px] min-w-0 py-24 max-lg:pt-12 lg:pt-16">
        <div className="print-hidden mb-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <PathCrumb segments={[]} leaf="cv" />
          <CvActions className="lg:hidden" />
        </div>

        {/* Name block — only in print / PDF, where the site header is hidden */}
        <div className="hidden print:block mb-4">
          <p className="cv-print-name font-pixel text-neutral-100">Kacper Saks</p>
          <p className="cv-print-contact text-neutral-400 text-[13px]">
            Warsaw, Poland · {siteConfig.links.email} ·{' '}
            {[siteConfig.url, siteConfig.links.github, siteConfig.links.linkedin].map((url, i) => (
              <span key={url}>
                {i > 0 && ' · '}
                <a href={url}>{url.replace(/^https?:\/\//, '')}</a>
              </span>
            ))}
          </p>
        </div>

        {/* Summary */}
        <section id="summary" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="summary" className="max-lg:mb-8 lg:mb-10" />
          <p className="text-accent/80 text-[13px] uppercase tracking-wider mb-5">
            Process &amp; Manufacturing Engineer (Aerospace) · Applied AI/ML — Modelling, Verification &amp; Validation
          </p>
          <p className="text-neutral-300 text-[15px] leading-[1.9] max-w-2xl">
            Aerospace process engineer at Airbus Defence and Space with an
            independent applied-AI/ML research track centred on verification and
            validation. Three years developing technological processes, assembly
            sequences and control documentation for prototype and serial aircraft
            production; in parallel, building probabilistic models and reproducible
            validation pipelines — deflated performance metrics, combinatorial
            purged cross-validation, calibration and uncertainty quantification —
            and publishing the results (a self-archived preprint; an open-source research artifact with a Zenodo DOI). FEM-certified;
            CATIA V5, SAP ERP and Python in daily use.
          </p>
        </section>

        {/* Experience */}
        <section id="experience" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="experience" className="max-lg:mb-8 lg:mb-10" />
          <Timeline items={experience} />
        </section>

        {/* Research */}
        <section id="research" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="research & publications" className="max-lg:mb-8 lg:mb-10" />
          <ResearchList items={research} />
        </section>

        {/* Skills */}
        <section id="skills" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="skills" className="max-lg:mb-8 lg:mb-10" />
          <SkillSection categories={skillCategories} />
        </section>

        {/* Education */}
        <section id="education" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="education" className="max-lg:mb-8 lg:mb-10" />
          <Timeline items={education} />
        </section>

        {/* Certifications */}
        <section id="certifications" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="certifications" className="max-lg:mb-8 lg:mb-10" />
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

        {/* Languages & Eligibility */}
        <section id="languages" className="mb-32 max-lg:mb-20 lg:mb-24">
          <SectionHeading title="languages & eligibility" className="max-lg:mb-8 lg:mb-10" />
          <p className="text-neutral-300 text-[14px] leading-[1.9] max-w-2xl">
            <span className="text-neutral-100">Polish</span> (native) ·{' '}
            <span className="text-neutral-100">English</span> (professional working
            proficiency — daily working language at Airbus). Polish national (EU /
            ESA Member State). Holder of a Polish national personnel security
            clearance; experienced with export-control and classified-information
            regimes.
          </p>
        </section>

        {/* LeetCode */}
        <section id="leetcode" className="mb-32 max-lg:mb-20 lg:mb-24 print-hidden">
          <SectionHeading title="leetcode" className="max-lg:mb-8 lg:mb-10" />
          <LeetcodeStats />
        </section>

        {/* Contact */}
        <section id="contact" className="print-hidden">
          <SectionHeading title="contact" className="max-lg:mb-8 lg:mb-10" />
          <div className="flex flex-wrap gap-8">
            {CV_CONTACTS.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.external ? '_blank' : undefined}
                rel={contact.external ? 'noopener noreferrer' : undefined}
                className="group"
              >
                <span className="label block mb-1">
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
      <CvRail sections={SECTIONS} />
    </div>
  )
}
