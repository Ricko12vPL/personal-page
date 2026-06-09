import type { Metadata } from 'next'
import { getPapers } from '@/lib/content'
import { SectionHeading } from '@/components/ui/section-heading'
import { PublicationEntry } from '@/components/research/publication-entry'

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Publications and preprints by Kacper Saks — quantitative methods, statistical validation, and AI forecasting.',
}

export default function ResearchPage() {
  const papers = getPapers()

  return (
    <div className="max-w-[820px] mx-auto px-8 py-24">
      <SectionHeading
        title="research"
        subtitle="Publications and preprints — quantitative methods, statistical validation, and the methodology of forecasting."
      />

      <div className="border-l-2 border-accent/30 pl-6 mb-20">
        <p className="text-neutral-400 text-[15px] leading-[1.85]">
          I work at the intersection of quantitative finance, statistics, and
          machine learning. My research interest is{' '}
          <span className="text-neutral-200">validation methodology</span> — the
          discipline of separating a real result from an artifact of search, and
          importing the tools one field paid for in hard lessons into another
          that has not yet learned them. Every result below ships with
          reproducible code and explicit epistemic labeling.
        </p>
      </div>

      {papers.length === 0 ? (
        <p className="text-neutral-500 text-sm">No publications yet.</p>
      ) : (
        <>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-12">
            Publications ({papers.length})
          </h2>
          <div className="space-y-16">
            {papers.map((paper, index) => (
              <PublicationEntry key={paper.slug} paper={paper} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
