interface SectionLabelProps {
  id: string
  index: string
  name: string
  command: string
}

/** "03 / about ──────── › cat about.md" — the heading row of every home section. */
export function SectionLabel({ id, index, name, command }: SectionLabelProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 id={id} className="label shrink-0">
        <span className="text-accent/80">{index}</span> / {name}
      </h2>
      <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-[var(--hairline)]" />
      <code aria-hidden="true" className="min-w-0 truncate text-[12px] text-neutral-500">
        <span className="prompt-caret">›</span> {command}
      </code>
    </div>
  )
}
