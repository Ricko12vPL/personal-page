import type { ReactNode } from 'react'

interface TerminalWindowProps {
  title?: string
  children: ReactNode
}

// Hairline panel with corner ticks and a small tracked title, matching the
// site's instrument primitives (.panel / .panel-ticks / .label).
export function TerminalWindow({ title, children }: TerminalWindowProps) {
  return (
    <div className="panel panel-ticks">
      {title && (
        <div className="label border-b hairline px-4 py-2">{title}</div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}
