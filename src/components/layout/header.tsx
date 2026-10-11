import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { NavLink } from './nav-link'

const HOST = new URL(siteConfig.url).host

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="chrome-focus group flex shrink-0 items-center gap-2.5"
        >
          <span className="font-pixel text-[17px] leading-none tracking-tight text-accent transition-opacity group-hover:opacity-70">
            KS
          </span>
          <span className="hidden text-[12px] text-neutral-400 transition-colors group-hover:text-neutral-200 sm:inline">
            {HOST}
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="chrome-scroll-x flex min-w-0 items-center gap-3 overflow-x-auto whitespace-nowrap sm:gap-6"
        >
          {siteConfig.nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </div>
    </header>
  )
}
