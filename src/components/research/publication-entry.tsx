import Link from 'next/link'
import { TechTag } from '@/components/projects/tech-tag'

export interface Publication {
  slug: string
  title: string
  authors: string[]
  date: string
  venue: string
  status: string
  abstract: string
  tags: string[]
  pdf?: string
  arxiv?: string
  code?: string
}

const STATUS_LABEL: Record<string, string> = {
  preprint: 'Preprint',
  published: 'Published',
  'working-paper': 'Working Paper',
}

interface PublicationEntryProps {
  paper: Publication
  index: number
}

export function PublicationEntry({ paper, index }: PublicationEntryProps) {
  const year = new Date(paper.date).getFullYear()
  const statusLabel = STATUS_LABEL[paper.status] ?? paper.status

  return (
    <article className="relative pl-10 sm:pl-14">
      <span className="absolute left-0 top-1 font-pixel text-neutral-700 text-sm tabular-nums">
        [{String(index + 1).padStart(2, '0')}]
      </span>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] tracking-wider uppercase text-accent">
          {statusLabel}
        </span>
        <span className="text-neutral-600 text-[12px]">{year}</span>
        <span className="text-neutral-600 text-[12px]">·</span>
        <span className="text-neutral-500 text-[12px]">{paper.venue}</span>
      </div>

      <h3 className="mb-2">
        <Link
          href={`/research/${paper.slug}`}
          className="font-pixel text-neutral-100 text-lg sm:text-xl leading-snug hover:text-accent transition-colors"
        >
          {paper.title}
        </Link>
      </h3>

      <p className="text-neutral-400 text-[14px] mb-4">
        {paper.authors.map((author, i) => (
          <span key={author}>
            <span
              className={
                author === 'Kacper Saks'
                  ? 'text-neutral-100 font-medium'
                  : undefined
              }
            >
              {author}
            </span>
            {i < paper.authors.length - 1 && ', '}
          </span>
        ))}
      </p>

      <p className="text-neutral-400 text-[15px] leading-[1.8] mb-5">
        {paper.abstract}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 text-[13px]">
        {paper.pdf && (
          <a
            href={paper.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-70 transition-opacity"
          >
            PDF &darr;
          </a>
        )}
        {paper.arxiv && (
          <a
            href={paper.arxiv}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-70 transition-opacity"
          >
            arXiv &rarr;
          </a>
        )}
        {paper.code && (
          <a
            href={paper.code}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-70 transition-opacity"
          >
            Code &rarr;
          </a>
        )}
        <Link
          href={`/research/${paper.slug}`}
          className="text-neutral-300 hover:text-accent transition-colors"
        >
          Abstract &amp; details &rarr;
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {paper.tags.slice(0, 6).map((tag) => (
          <TechTag key={tag} tag={tag} />
        ))}
      </div>
    </article>
  )
}
