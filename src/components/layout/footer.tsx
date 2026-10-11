import { siteConfig } from '@/config/site'
import { PRIVACY_NOTE } from '@/lib/visitors/constants'

const LINKS = [
  { label: 'GitHub', href: siteConfig.links.github, external: true },
  { label: 'LinkedIn', href: siteConfig.links.linkedin, external: true },
  { label: 'Email', href: `mailto:${siteConfig.links.email}`, external: false },
] as const

export function Footer() {
  return (
    <footer className="mt-auto border-t hairline">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
        <span className="text-[12px] text-neutral-400">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <span className="label">visitor counts: {PRIVACY_NOTE}</span>
        <ul className="flex items-center gap-6">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="chrome-focus text-[12px] text-neutral-400 transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
