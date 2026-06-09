import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPapers, getPaperBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { TechTag } from '@/components/projects/tech-tag'
import { CiteBlock } from '@/components/research/cite-block'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

const STATUS_LABEL: Record<string, string> = {
  preprint: 'Preprint',
  published: 'Published',
  'working-paper': 'Working Paper',
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
  return {
    title: paper.title,
    description: paper.abstract.slice(0, 200),
  }
}

export default async function PaperPage({ params }: PageProps) {
  const { slug } = await params
  const paper = getPaperBySlug(slug)
  if (!paper) notFound()

  const statusLabel = STATUS_LABEL[paper.status] ?? paper.status

  return (
    <div className="max-w-[820px] mx-auto px-8 py-24">
      <Link
        href="/research"
        className="text-neutral-500 text-[13px] hover:text-accent transition-colors mb-12 inline-block"
      >
        &larr; Back to research
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] tracking-wider uppercase text-accent">
            {statusLabel}
          </span>
          <span className="text-neutral-600 text-[12px]">{paper.venue}</span>
          <span className="text-neutral-600 text-[12px]">·</span>
          <span className="text-neutral-600 text-[12px]">
            {formatDate(paper.date)}
            {paper.updated && ` — rev. ${formatDate(paper.updated)}`}
          </span>
        </div>

        <h1 className="font-pixel text-neutral-100 text-2xl sm:text-3xl leading-tight mb-6 tracking-tight">
          {paper.title}
        </h1>

        <p className="text-neutral-300 text-[15px] mb-8">
          {paper.authors.map((author, i) => (
            <span key={author}>
              <span
                className={
                  author === 'Kacper Saks' ? 'font-medium text-neutral-100' : undefined
                }
              >
                {author}
              </span>
              {i < paper.authors.length - 1 && ', '}
            </span>
          ))}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {paper.website && (
            <a
              href={paper.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] rounded-md bg-accent text-background hover:opacity-90 transition-opacity"
            >
              Read online &rarr;
            </a>
          )}
          {paper.pdf && (
            <a
              href={paper.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] rounded-md border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
            >
              Download PDF &darr;
            </a>
          )}
          {paper.arxiv && (
            <a
              href={paper.arxiv}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-[13px] hover:opacity-70 transition-opacity"
            >
              arXiv &rarr;
            </a>
          )}
          {paper.code && (
            <a
              href={paper.code}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-[13px] hover:opacity-70 transition-opacity"
            >
              Code &rarr;
            </a>
          )}
          {paper.doi && (
            <a
              href={paper.doi}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-[13px] hover:opacity-70 transition-opacity"
            >
              DOI &rarr;
            </a>
          )}
        </div>
      </header>

      <section className="mb-16 border border-neutral-800 rounded-lg bg-neutral-900/30 p-6 sm:p-8">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-4">
          Abstract
        </h2>
        <p className="text-neutral-300 text-[15px] leading-[1.85]">
          {paper.abstract}
        </p>
      </section>

      <MDXContent code={paper.body} />

      {paper.bibtex && (
        <section className="mt-20">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-5">
            Cite this work
          </h2>
          <CiteBlock bibtex={paper.bibtex} />
        </section>
      )}

      <div className="flex flex-wrap gap-2 mt-16">
        {paper.tags.map((tag) => (
          <TechTag key={tag} tag={tag} />
        ))}
      </div>
    </div>
  )
}
