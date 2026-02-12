interface TechTagProps {
  tag: string
}

export function TechTag({ tag }: TechTagProps) {
  return (
    <span className="text-neutral-500 text-[11px] px-2.5 py-1 rounded bg-neutral-800/60">
      {tag.toLowerCase()}
    </span>
  )
}
