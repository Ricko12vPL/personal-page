import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { NavLink } from './nav-link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-neutral-800/50">
      <div className="max-w-[1100px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-pixel text-accent text-lg tracking-tight hover:opacity-70 transition-opacity"
        >
          KS
        </Link>
        <nav className="flex items-center gap-8">
          {siteConfig.nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </div>
    </header>
  )
}
