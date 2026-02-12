import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 mt-auto">
      <div className="max-w-[1100px] mx-auto px-8 py-8 flex items-center justify-between">
        <p className="text-neutral-600 text-[12px]">
          &copy; 2025 Kacper Saks
        </p>
        <div className="flex items-center gap-6">
          {[
            { label: 'GitHub', href: siteConfig.links.github },
            { label: 'LinkedIn', href: siteConfig.links.linkedin },
            { label: 'Email', href: `mailto:${siteConfig.links.email}` },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.label === 'Email' ? undefined : '_blank'}
              rel={link.label === 'Email' ? undefined : 'noopener noreferrer'}
              className="text-neutral-600 hover:text-accent text-[12px] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
