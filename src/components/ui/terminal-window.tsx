interface TerminalWindowProps {
  title?: string
  children: React.ReactNode
}

export function TerminalWindow({
  title,
  children,
}: TerminalWindowProps) {
  return (
    <div className="border border-neutral-800 rounded-lg p-8 bg-neutral-900/50">
      {title && (
        <p className="font-pixel text-neutral-600 text-[11px] tracking-wider mb-6 uppercase">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}
