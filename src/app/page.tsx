import { AsciiHero } from '@/components/ascii/ascii-hero'
import { Typewriter } from '@/components/ascii/typewriter'
import { TerminalWindow } from '@/components/ui/terminal-window'
import { ProjectCard } from '@/components/projects/project-card'
import { getFeaturedProjects } from '@/lib/content'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

export default function HomePage() {
  const featured = getFeaturedProjects()

  return (
    <div className="max-w-[1100px] mx-auto px-8">
      {/* Hero */}
      <section className="pt-32 pb-32 md:pt-40 md:pb-40">
        <AsciiHero />
        <Typewriter />
        <p className="text-neutral-400 text-[15px] mt-8 max-w-xl leading-relaxed">
          I build production ML systems and scalable backend infrastructure
          — from model training and institutional backtesting to real-time
          inference, monitoring and CI/CD.
        </p>
        <div className="flex items-center gap-5 mt-8">
          <a
            href={`mailto:${siteConfig.links.email}`}
            className="text-accent text-[13px] hover:opacity-70 transition-opacity"
          >
            {siteConfig.links.email}
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 text-[13px] hover:text-neutral-200 transition-colors"
          >
            GitHub
          </a>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 text-[13px] hover:text-neutral-200 transition-colors"
          >
            LinkedIn
          </a>
        </div>
        <div className="flex items-center gap-4 mt-10">
          <Link
            href="/projects"
            className="text-[13px] px-5 py-2.5 border border-accent text-accent rounded hover:bg-accent/10 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/cv"
            className="text-[13px] px-5 py-2.5 border border-neutral-700 text-neutral-400 rounded hover:border-neutral-500 hover:text-neutral-200 transition-colors"
          >
            Download CV
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="pb-32">
        <TerminalWindow>
          <p className="text-neutral-300 text-[15px] leading-[1.9]">
            Specializing in institutional-grade backtesting (CPCV, DSR, PBO)
            for quantitative trading platforms, high-performance Python
            backends, multi-agent LLM systems, and AI engineering — from
            RAG pipelines to autonomous agent architectures. Engineering
            discipline from aerospace applied to software.
          </p>
          <p className="text-neutral-500 text-[15px] mt-6 leading-[1.9]">
            BEng in Mechanical Engineering from Silesian University of
            Technology, currently pursuing a Master&apos;s in Project Management
            at Collegium Civitas while working full-time at{' '}
            <span className="text-neutral-200">Airbus Defence and Space</span>.
            Alongside work and studies, completed{' '}
            <span className="text-neutral-200">42 Warsaw</span> — a tuition-free,
            peer-to-peer programming academy with no lectures or teachers,
            focused on project-based learning 24/7.
          </p>
        </TerminalWindow>
      </section>

      {/* Featured Projects */}
      <section className="pb-32">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-pixel text-accent text-2xl sm:text-3xl tracking-tight">
            FEATURED
          </h2>
          <Link
            href="/projects"
            className="text-neutral-500 text-[13px] hover:text-accent transition-colors"
          >
            View all projects
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  )
}
