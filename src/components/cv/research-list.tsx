import Link from 'next/link'

export interface CvResearchItem {
  title: string
  meta: string
  metaHref?: string
  repoHref?: string
  description: string
  href: string
  external: boolean
}

const TITLE = 'text-neutral-100 text-[15px] font-medium hover:text-accent transition-colors'
const META_LINK = 'print-no-url hover:text-accent transition-colors'

// Markup is load-bearing for the CV PDF (the print stylesheet keys on
// `.border-l-2`, `.space-y-*` and `.print-no-url`): change it only together
// with a PDF re-check.
function ResearchTitle({ item }: { item: CvResearchItem }) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={TITLE}>
      {item.title}
    </a>
  ) : (
    <Link href={item.href} className={TITLE}>
      {item.title}
    </Link>
  )
}

function ResearchMeta({ item }: { item: CvResearchItem }) {
  return (
    <p className="text-accent/60 text-[12px] uppercase tracking-wider mb-2">
      {item.metaHref ? (
        <a href={item.metaHref} target="_blank" rel="noopener noreferrer" className={META_LINK}>
          {item.meta}
        </a>
      ) : (
        item.meta
      )}
      {item.repoHref && (
        <>
          {' · '}
          <a href={item.repoHref} target="_blank" rel="noopener noreferrer" className={META_LINK}>
            GitHub ({item.repoHref.replace(/^https?:\/\//, '')})
          </a>
        </>
      )}
    </p>
  )
}

export function ResearchList({ items }: { items: readonly CvResearchItem[] }) {
  return (
    <div className="space-y-8">
      {items.map((item) => (
        <div key={item.title} className="border-l-2 border-accent/30 pl-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <ResearchTitle item={item} />
          </div>
          <ResearchMeta item={item} />
          <p className="text-neutral-400 text-[14px] leading-[1.8]">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
