'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'chrome-focus py-1 text-[12px] transition-colors sm:text-[13px]',
        isActive ? 'text-accent' : 'text-neutral-400 hover:text-neutral-100'
      )}
    >
      {label}
    </Link>
  )
}
