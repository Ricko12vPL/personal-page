export interface MetaItem {
  label: string
  value: string
}

interface MetaStripProps {
  items: readonly MetaItem[]
}

/**
 * The counts line under every index heading: tracked label over an accent
 * value, e.g. `POSTS 11  YEAR 2026  LATEST 2026-09-29`. Every value must be
 * computed from content by the caller.
 */
export function MetaStrip({ items }: MetaStripProps) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="label">{item.label}</dt>
          <dd className="num text-[13px]">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
