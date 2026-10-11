import type { ReactNode } from 'react'

interface DetailLayoutProps {
  /** Crumb, title and lede. */
  header: ReactNode
  /** The RecordPanel: sticky right rail on desktop, above the prose below lg. */
  record: ReactNode
  /** Prose and anything that follows it (cite block, tags, pager). */
  children: ReactNode
}

/**
 * Shared template for every detail page (project, paper, post): one 1100px
 * grid with the prose on the left and an 18rem record rail on the right, so the
 * three page types read as one system.
 */
export function DetailLayout({ header, record, children }: DetailLayoutProps) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-12 pb-24 sm:px-8 sm:pt-16">
      <article className="grid gap-y-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-12">
        <header className="min-w-0 lg:col-start-1 lg:row-start-1">{header}</header>
        <aside className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="lg:sticky lg:top-24">{record}</div>
        </aside>
        {/* MDX bodies open with an h2; drop its top margin so the first section
            sits one rhythm step under the header / record. */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2 [&_.mdx-content>h2:first-child]:mt-0!">
          {children}
        </div>
      </article>
    </div>
  )
}

/** Detail-page H1: title-case pixel type, the same size on all three page types. */
export const DETAIL_TITLE =
  'font-pixel text-neutral-100 text-2xl sm:text-3xl leading-tight mt-6 mb-5 tracking-tight break-words'
