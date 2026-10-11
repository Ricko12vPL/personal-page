import type { Metadata } from 'next'
import type { Paper } from '#site/content'
import { getPapers } from '@/lib/content'
import { SectionHeading } from '@/components/ui/section-heading'
import { MetaStrip, type MetaItem } from '@/components/ui/meta-strip'
import { PromptLine } from '@/components/ui/prompt-line'
import { PublicationEntry } from '@/components/research/publication-entry'
import { paperDay } from '@/components/research/status'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Research',
  description:
    'Publications and preprints by Kacper Saks — quantitative methods, statistical validation, and AI forecasting.',
  path: '/research',
})

// Counts line under the heading, computed from the papers' frontmatter.
function researchStats(papers: readonly Paper[]): MetaItem[] {
  const latest = papers.reduce<string | null>(
    (max, paper) => (max === null || paper.date > max ? paper.date : max),
    null,
  )
  const withDoi = papers.filter((paper) => Boolean(paper.doi)).length
  return [
    { label: papers.length === 1 ? 'paper' : 'papers', value: papers.length.toLocaleString('en-US') },
    { label: 'latest', value: latest ? paperDay(latest) : '—' },
    { label: 'with doi', value: withDoi.toLocaleString('en-US') },
  ]
}

export default function ResearchPage() {
  const papers = getPapers()

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 pt-16 pb-24 sm:pt-20">
      <SectionHeading
        as="h1"
        title="research"
        subtitle="Publications and preprints — quantitative methods, statistical validation, and the methodology of forecasting."
        meta={papers.length > 0 ? <MetaStrip items={researchStats(papers)} /> : undefined}
      />

      <div className="border-l border-accent/40 pl-6 mb-16 max-w-[720px]">
        <p className="text-neutral-400 text-[15px] leading-[1.85] text-left">
          I work at the intersection of quantitative finance, statistics, and
          machine learning. My research interest is{' '}
          <span className="text-neutral-200">validation methodology</span> — the
          discipline of separating a real result from an artifact of search, and
          importing the tools one field paid for in hard lessons into another
          that has not yet learned them. Every result below carries explicit
          epistemic labeling and says what is reproducible and what is not
          yet public.
        </p>
      </div>

      {papers.length === 0 ? (
        <p className="text-neutral-500 text-sm">No publications yet.</p>
      ) : (
        <section aria-labelledby="publications-heading">
          <div className="mb-4">
            <PromptLine path="~/research" command="ls papers/" />
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 id="publications-heading" className="label">
              Publications
            </h2>
            <span aria-hidden="true" className="dotted-leader" />
            <span className="num text-[13px]">{papers.length}</span>
          </div>
          <div className="space-y-6">
            {papers.map((paper, index) => (
              <PublicationEntry key={paper.slug} paper={paper} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
