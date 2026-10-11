import Link from 'next/link'

interface PathCrumbProps {
  /** Linked parent segments, e.g. [{ label: 'blog', href: '/blog' }]. */
  segments: ReadonlyArray<{ label: string; href: string }>
  /** Current, unlinked leaf, e.g. 'hello-world.mdx'. */
  leaf?: string
}

const LINK = 'hover:text-accent focus-visible:text-accent focus-visible:outline-none transition-colors'

// Shell-style breadcrumb: `~/blog/hello-world.mdx`. `~` links home.
export function PathCrumb({ segments, leaf }: PathCrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="print-hidden text-[12px] text-neutral-500 break-all">
      <Link href="/" className={LINK} aria-label="Home">
        ~
      </Link>
      {segments.map((segment) => (
        <span key={segment.href}>
          <span aria-hidden="true">/</span>
          <Link href={segment.href} className={LINK}>
            {segment.label}
          </Link>
        </span>
      ))}
      {leaf && (
        <span aria-current="page" className="text-neutral-300">
          <span aria-hidden="true" className="text-neutral-500">
            /
          </span>
          {leaf}
        </span>
      )}
    </nav>
  )
}
