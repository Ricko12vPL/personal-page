import Link from 'next/link'
import type { Paper } from '#site/content'
import { summarize } from '@/lib/metadata'
import { AuthorList } from './author-list'
import { CiteBlock } from './cite-block'
import { PaperLinks } from './paper-links'
import { paperYear, statusLabel } from './status'

const EXCERPT_CHARS = 360

interface PublicationEntryProps {
  paper: Paper
  index: number
}

// One paper as a citation panel: authors · year · venue, status, title,
// abstract excerpt, links, and a collapsible BibTeX block.
export function PublicationEntry({ paper, index }: PublicationEntryProps) {
  const ref = String(index + 1).padStart(2, '0')
  const href = `/research/${paper.slug}`

  return (
    <article className="panel panel-ticks min-w-0 p-5 sm:p-6" aria-labelledby={`paper-${paper.slug}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="label min-w-0 break-words">
          <span className="text-neutral-600">[{ref}]</span> <AuthorList authors={paper.authors} />
          {' · '}
          <span className="num">{paperYear(paper.date)}</span>
          {' · '}
          {paper.venue}
        </div>
        <span className="label text-accent!">{statusLabel(paper.status)}</span>
      </div>

      <h3 id={`paper-${paper.slug}`} className="mt-4">
        <Link
          href={href}
          className="font-pixel text-neutral-100 text-lg sm:text-xl leading-snug break-words underline-offset-4 hover:text-accent focus-visible:text-accent focus-visible:underline focus-visible:outline-none transition-colors"
        >
          {paper.title}
        </Link>
      </h3>

      <p className="mt-3 text-neutral-400 text-[14px] leading-[1.8] max-sm:text-left!">
        {summarize(paper.abstract, EXCERPT_CHARS)}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t hairline pt-4">
        <PaperLinks paper={paper} />
        <Link
          href={href}
          className="text-[12px] text-neutral-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none transition-colors"
        >
          abstract &amp; details →
        </Link>
      </div>

      {paper.bibtex && (
        <details className="group mt-4">
          <summary className="label cursor-pointer select-none list-none hover:text-neutral-300! focus-visible:text-accent! focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="inline-block w-3 group-open:rotate-90 transition-transform">
              ›
            </span>
            cite · bibtex
          </summary>
          <div className="mt-3">
            <CiteBlock bibtex={paper.bibtex} />
          </div>
        </details>
      )}
    </article>
  )
}
