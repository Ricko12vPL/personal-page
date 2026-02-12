'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print-hidden float-right text-[12px] text-neutral-500 border border-neutral-700 rounded px-3 py-1.5 hover:text-accent hover:border-accent transition-colors cursor-pointer"
    >
      Save as PDF
    </button>
  )
}
