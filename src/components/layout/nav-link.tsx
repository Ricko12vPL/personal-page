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
      className={cn(
        'text-[14px] transition-colors',
        isActive
          ? 'text-accent'
          : 'text-neutral-500 hover:text-neutral-200'
      )}
    >
      {label}
    </Link>
  )
}
