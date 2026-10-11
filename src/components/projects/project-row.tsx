import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'
import { isoDay, splitTitle, yearMonth, type ProjectSummary } from './project-summary'

const MAX_TAGS = 3

// ls -l columns: status · date · path/title/tags · arrow. Mobile stacks the
// path, title and tags under the status/date line so nothing scrolls sideways.
// (No `grid` here so the header can combine it with `hidden sm:grid`.)
export const ROW_COLS =
  'grid-cols-[auto_auto_minmax(0,1fr)_16px] sm:grid-cols-[104px_56px_minmax(0,1fr)_16px] gap-x-3'

interface ProjectRowProps {
  project: ProjectSummary
  selected: boolean
  onSelect: (slug: string) => void
}

function RowTags({ tags }: { tags: string[] }) {
  const extra = tags.length - MAX_TAGS
  return (
    <span className="col-span-4 row-start-4 flex min-w-0 flex-wrap gap-x-3 text-[11px] leading-5 text-neutral-500 sm:col-span-2 sm:col-start-3 sm:row-start-3">
      {tags.slice(0, MAX_TAGS).map((tag) => (
        <span key={tag}>{tag.toLowerCase()}</span>
      ))}
      {extra > 0 && <span className="text-neutral-600">+{extra}</span>}
    </span>
  )
}

export function ProjectRow({ project, selected, onSelect }: ProjectRowProps) {
  const { name, subtitle } = splitTitle(project.title)
  const select = () => {
    if (!selected) onSelect(project.slug)
  }

  return (
    <li className="border-b border-[var(--hairline)]">
      <Link
        href={`/projects/${project.slug}`}
        data-slug={project.slug}
        tabIndex={selected ? 0 : -1}
        aria-current={selected ? 'true' : undefined}
        onFocus={select}
        onMouseMove={select}
        className={cn(
          ROW_COLS,
          'group grid gap-y-0.5 overflow-hidden border-l-2 px-3 py-2 text-[12px] leading-5 transition-colors motion-reduce:transition-none',
          'scroll-mb-[calc(var(--statusbar-h)+1rem)] scroll-mt-24',
          'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent/60',
          selected ? 'border-accent bg-neutral-900' : 'border-transparent hover:bg-neutral-900/60'
        )}
      >
        <StatusBadge status={project.status} className="col-start-1 row-start-1" />
        <time
          dateTime={isoDay(project.date)}
          className="col-start-2 row-start-1 tabular-nums text-neutral-500"
        >
          {yearMonth(project.date)}
        </time>
        <span
          className={cn(
            'col-span-4 row-start-2 min-w-0 truncate sm:col-span-1 sm:col-start-3 sm:row-start-1',
            selected ? 'text-accent' : 'text-neutral-300 group-hover:text-neutral-100'
          )}
        >
          {project.slug}
          <span className="text-neutral-600">/</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'col-start-4 row-start-1 justify-self-end transition-transform motion-reduce:transition-none',
            selected ? 'translate-x-0.5 text-accent' : 'text-neutral-600'
          )}
        >
          →
        </span>
        <span className="col-span-4 row-start-3 min-w-0 truncate text-[13px] sm:col-span-2 sm:col-start-3 sm:row-start-2">
          <span className="text-neutral-100">{name}</span>
          {subtitle && <span className="text-neutral-500">: {subtitle}</span>}
        </span>
        <RowTags tags={project.tags} />
      </Link>
    </li>
  )
}
