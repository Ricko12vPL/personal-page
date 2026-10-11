import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RecordPanelProps {
  /** Accessible name of the panel, e.g. "Paper metadata". */
  label: string
  /** Header caption on the left. */
  title?: string
  /** Header note on the right, e.g. the source file "x-quant.mdx". */
  source?: string
  /** RecordRow elements. */
  children: ReactNode
  /** Optional strip under the rows (links, actions). */
  footer?: ReactNode
  className?: string
}

/**
 * The one metadata panel every detail page uses (project, paper, post, CV):
 * a ticked hairline box with a tracked header and label/value rows. Pages put
 * it in their right rail on desktop and above the prose below lg.
 */
export function RecordPanel({ label, title = 'record', source, children, footer, className }: RecordPanelProps) {
  return (
    <section aria-label={label} className={cn('panel panel-ticks min-w-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b hairline px-4 py-2">
        <span className="label shrink-0">{title}</span>
        {source && <span className="label min-w-0 truncate">{source}</span>}
      </div>
      <dl className="px-4 py-1">{children}</dl>
      {footer && <div className="border-t hairline px-4 py-3">{footer}</div>}
    </section>
  )
}

interface RecordRowProps {
  label: string
  children: ReactNode
}

export function RecordRow({ label, children }: RecordRowProps) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 border-b hairline py-2 last:border-b-0">
      <dt className="label pt-px">{label}</dt>
      <dd className="min-w-0 break-words text-[12px] leading-relaxed text-neutral-300">{children}</dd>
    </div>
  )
}

/** An ISO day (`YYYY-MM-DD`) inside a record row. */
export function RecordDay({ day }: { day: string }) {
  return (
    <time dateTime={day} className="tabular-nums">
      {day}
    </time>
  )
}
