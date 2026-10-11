import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { SectionHeading } from '@/components/ui/section-heading'
import { Timeline } from '@/components/cv/timeline'
import { SkillSection } from '@/components/cv/skill-section'
import { LeetcodeStats } from '@/components/cv/leetcode-stats'
import { PrintButton } from '@/components/cv/print-button'
import Link from 'next/link'
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

const research = [
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

export default function CvPage() {
  return (
    <div className="max-w-[800px] mx-auto px-8 py-24">
      <div className="print-hidden flex justify-end items-center gap-3 mb-6">
        <a
          href="/cv/kacper-saks-cv.pdf"
          download="Kacper-Saks-CV.pdf"
          className="inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
        >
          Download PDF &darr;
        </a>
        <PrintButton />
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
      <section className="mb-32">
        <SectionHeading title="summary" />
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
      <section className="mb-32">
        <SectionHeading title="experience" />
        <Timeline items={experience} />
      </section>

      {/* Research */}
      <section className="mb-32">
        <SectionHeading title="research & publications" />
        <div className="space-y-8">
          {research.map((item) => (
            <div key={item.title} className="border-l-2 border-accent/30 pl-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-100 text-[15px] font-medium hover:text-accent transition-colors"
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-neutral-100 text-[15px] font-medium hover:text-accent transition-colors"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
              <p className="text-accent/60 text-[12px] uppercase tracking-wider mb-2">
                {'metaHref' in item && item.metaHref ? (
                  <a
                    href={item.metaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="print-no-url hover:text-accent transition-colors"
                  >
                    {item.meta}
                  </a>
                ) : (
                  item.meta
                )}
                {'repoHref' in item && item.repoHref && (
                  <>
                    {' · '}
                    <a
                      href={item.repoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="print-no-url hover:text-accent transition-colors"
                    >
                      GitHub ({item.repoHref.replace(/^https?:\/\//, '')})
                    </a>
                  </>
                )}
              </p>
              <p className="text-neutral-400 text-[14px] leading-[1.8]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-32">
        <SectionHeading title="skills" />
        <SkillSection categories={skillCategories} />
      </section>

      {/* Education */}
      <section className="mb-32">
        <SectionHeading title="education" />
        <Timeline items={education} />
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

      {/* Languages & Eligibility */}
      <section className="mb-32">
        <SectionHeading title="languages & eligibility" />
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
      <section className="mb-32 print-hidden">
        <SectionHeading title="leetcode" />
        <LeetcodeStats />
      </section>

      {/* Contact */}
      <section className="print-hidden">
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
