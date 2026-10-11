import { SectionLabel } from './section-label'

export function AboutPanel() {
  return (
    <section aria-labelledby="home-about">
      <SectionLabel id="home-about" index="03" name="about" command="cat about.md" />
      <div className="panel panel-ticks">
        <div className="border-b hairline px-4 py-2.5 sm:px-6">
          <span className="label">~/about.md</span>
        </div>
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2 md:gap-0">
          <p className="text-[15px] leading-[1.8] text-neutral-300 md:pr-10">
            Specializing in validation methodology for quantitative research
            (CPCV, DSR, PBO, pre-registration), high-performance Python
            backends, multi-agent LLM systems, and AI engineering — from
            RAG pipelines to autonomous agent architectures. Engineering
            discipline from aerospace applied to software.
          </p>
          <p className="text-[15px] leading-[1.8] text-neutral-400 md:border-l md:border-[var(--hairline)] md:pl-10">
            BEng in Mechanical Engineering from Silesian University of
            Technology and a Master&apos;s programme in Project &amp; Process
            Management at Collegium Civitas (2024–2026), alongside full-time
            work at{' '}
            <span className="text-neutral-200">Airbus Defence and Space</span>.
            Alongside work and studies, completed{' '}
            <span className="text-neutral-200">42 Warsaw</span> — a tuition-free,
            peer-to-peer programming academy with no lectures or teachers,
            focused on project-based learning 24/7.
          </p>
        </div>
      </div>
    </section>
  )
}
