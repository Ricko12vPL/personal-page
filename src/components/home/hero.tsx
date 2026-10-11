import Link from 'next/link'
import type { ReactNode } from 'react'
import { siteConfig } from '@/config/site'

const BUTTON_BASE =
  'inline-flex items-center gap-3 border px-5 py-2.5 text-[13px] transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="chrome-focus text-neutral-400 transition-colors hover:text-neutral-200"
    >
      {children}
    </a>
  )
}

export function HeroIntro() {
  return (
    <div className="min-w-0">
      <p className="label mb-5 text-left">
        <span className="text-accent/80">01</span> / whoami
      </p>
      <h1 className="font-pixel text-[48px] leading-[0.95] tracking-tight text-accent sm:text-[72px] xl:text-[80px]">
        KACPER SAKS
      </h1>
      <p className="mt-5 text-left text-[15px] text-neutral-200">
        ML &amp; Backend Engineer <span className="text-neutral-600">·</span> Warsaw, Poland
      </p>
      <p className="mt-6 max-w-[560px] text-left text-[15px] leading-[1.8] text-neutral-400">
        I build production ML systems and scalable backend infrastructure
        — from model training and rigorous backtest validation to real-time
        inference, monitoring and CI/CD.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
        <a
          href={`mailto:${siteConfig.links.email}`}
          className="chrome-focus text-accent transition-opacity hover:opacity-70"
        >
          {siteConfig.links.email}
        </a>
        <ExternalLink href={siteConfig.links.github}>GitHub</ExternalLink>
        <ExternalLink href={siteConfig.links.linkedin}>LinkedIn</ExternalLink>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/projects"
          className={`${BUTTON_BASE} border-accent/70 text-accent hover:bg-accent/10`}
        >
          View Projects
          <span aria-hidden="true" className="hidden gap-1 sm:inline-flex">
            <span className="kbd">g</span>
            <span className="kbd">p</span>
          </span>
        </Link>
        <a
          href="/cv/kacper-saks-cv.pdf"
          download="Kacper-Saks-CV.pdf"
          className={`${BUTTON_BASE} border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200`}
        >
          Download CV
          <span aria-hidden="true" className="text-[11px] text-neutral-600">
            pdf
          </span>
        </a>
      </div>
    </div>
  )
}
