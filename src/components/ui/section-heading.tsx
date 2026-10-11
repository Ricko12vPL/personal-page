import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  /** Heading level. Page titles pass 'h1'; CV sections keep the default 'h2'. */
  as?: 'h1' | 'h2'
  /** Optional data line under the subtitle (e.g. computed counts). Screen only. */
  meta?: ReactNode
  /** Extra classes on the wrapper, for screen-only spacing tweaks (md/lg or max-sm). */
  className?: string
}

// The default markup (title + subtitle) is deliberately unchanged: the /cv
// print stylesheet keys on `.mb-16` and `.font-pixel`, so new chrome only
// appears through the optional slots and always carries `print-hidden`.
export function SectionHeading({
  title,
  subtitle,
  as: Heading = 'h2',
  meta,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-16', className)}>
      <Heading className="font-pixel text-accent text-3xl sm:text-4xl tracking-tight">
        {title.toUpperCase()}
      </Heading>
      {subtitle && (
        <p className="text-neutral-400 text-base mt-4 leading-relaxed text-left">{subtitle}</p>
      )}
      {meta && <div className="print-hidden mt-6">{meta}</div>}
    </div>
  )
}
