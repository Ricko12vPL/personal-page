import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPapers, getPaperBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { CiteBlock } from '@/components/research/cite-block'
import { AuthorList } from '@/components/research/author-list'
import { PaperMetaPanel } from '@/components/research/paper-meta-panel'
import { DETAIL_TITLE, DetailLayout } from '@/components/ui/detail-layout'
import { PathCrumb } from '@/components/ui/path-crumb'
import { pageMetadata, summarize } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPapers().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const paper = getPaperBySlug(slug)
  if (!paper) return {}
  return pageMetadata({
    title: paper.title,
    description: summarize(paper.abstract, 200),
    path: `/research/${paper.slug}`,
    type: 'article',
    publishedTime: paper.date,
    modifiedTime: paper.pageUpdated ?? paper.updated ?? paper.date,
  })
}

export default async function PaperPage({ params }: PageProps) {
  const { slug } = await params
  const paper = getPaperBySlug(slug)
  if (!paper) notFound()

  return (
    <DetailLayout
      header={
        <>
          <PathCrumb segments={[{ label: 'research', href: '/research' }]} leaf={paper.slug} />
          <h1 className={DETAIL_TITLE}>{paper.title}</h1>
          <p className="text-neutral-300 text-[15px] text-left">
            <AuthorList authors={paper.authors} />
          </p>
        </>
      }
      record={<PaperMetaPanel paper={paper} />}
    >
      <section aria-labelledby="abstract-heading" className="panel mb-14 p-5 sm:p-6">
        <h2 id="abstract-heading" className="label mb-3">
          Abstract
        </h2>
        <p className="text-neutral-300 text-[15px] leading-[1.85]">{paper.abstract}</p>
      </section>

      <MDXContent code={paper.body} />

      {paper.bibtex && (
        <section aria-labelledby="cite-heading" className="mt-20">
          <h2 id="cite-heading" className="label mb-4">
            Cite this work
          </h2>
          <CiteBlock bibtex={paper.bibtex} />
        </section>
      )}

      {paper.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t hairline pt-4">
          <span className="label">tags</span>
          {paper.tags.map((tag) => (
            <span key={tag} className="text-[12px] text-neutral-400">
              {tag.toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </DetailLayout>
  )
}
