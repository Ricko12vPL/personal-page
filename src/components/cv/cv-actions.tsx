import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { PrintButton } from './print-button'

/** Download / print actions for the CV. Screen only: never part of the PDF. */
export function CvActions({ className }: { className?: string }) {
  return (
    <div className={cn('print-hidden flex flex-wrap items-center gap-3', className)}>
      <a
        href={siteConfig.cvPdf}
        download="Kacper-Saks-CV.pdf"
        className="inline-flex items-center gap-2 border border-accent/70 px-3 py-1.5 text-[12px] text-accent transition-colors hover:bg-accent/10"
      >
        Download PDF <span aria-hidden="true">↓</span>
      </a>
      <PrintButton />
    </div>
  )
}
