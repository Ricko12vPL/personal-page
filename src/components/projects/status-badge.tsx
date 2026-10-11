import { projectStatus } from '@/lib/status'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

/** Status glyph + lowercase label in the status colour (from projectStatus). */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = projectStatus(status)
  return (
    <span className={cn('whitespace-nowrap', style.className, className)}>
      <span aria-hidden="true">{style.glyph}</span> {style.label.toLowerCase()}
    </span>
  )
}
