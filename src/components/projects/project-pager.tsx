import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'
import { splitTitle } from './project-summary'

interface PagerProject {
  slug: string
  title: string
  status: string
}

interface ProjectPagerProps {
  prev: PagerProject | null
  next: PagerProject | null
}

// `.panel` draws its border outside Tailwind's layers, so state colours need `!`.
const CARD = cn(
  'panel group block min-w-0 p-4 transition-colors',
  'hover:border-neutral-700! focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/60'
)

function PagerLink({ project, direction }: { project: PagerProject; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next'
  return (
    <Link
      href={`/projects/${project.slug}`}
      rel={direction}
      className={cn(CARD, isNext && 'sm:col-start-2 sm:text-right')}
    >
      <span className="label group-hover:text-accent-dim!">{isNext ? 'next →' : '← prev'}</span>
      <span className="mt-2 block truncate text-[14px] leading-snug text-neutral-200 transition-colors group-hover:text-accent group-focus-visible:text-accent">
        {splitTitle(project.title).name}
      </span>
      <span className="mt-1 block truncate text-[12px] text-neutral-500">
        {project.slug}/ · <StatusBadge status={project.status} />
      </span>
    </Link>
  )
}

/** Previous / next project in the same order as the /projects index. */
export function ProjectPager({ prev, next }: ProjectPagerProps) {
  return (
    <nav aria-label="More projects" className="print-hidden mt-16 border-t hairline pt-8">
      {(prev || next) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {prev && <PagerLink project={prev} direction="prev" />}
          {next && <PagerLink project={next} direction="next" />}
        </div>
      )}
      <Link
        href="/projects"
        className="mt-6 inline-block text-[12px] text-neutral-500 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        <span className="prompt-caret">›</span> cd ~/projects
      </Link>
    </nav>
  )
}

export function adjacentProjects<T extends { slug: string }>(
  projects: readonly T[],
  slug: string
): { prev: T | null; next: T | null } {
  const index = projects.findIndex((p) => p.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return { prev: projects[index - 1] ?? null, next: projects[index + 1] ?? null }
}
