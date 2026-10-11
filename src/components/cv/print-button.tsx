'use client'

import { cn } from '@/lib/utils'

export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        'print-hidden inline-flex cursor-pointer items-center gap-2 border border-neutral-700 px-3 py-1.5 text-[12px] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200',
        className
      )}
    >
      Save as PDF
    </button>
  )
}
