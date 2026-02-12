interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-16">
      <h2 className="font-pixel text-accent text-3xl sm:text-4xl tracking-tight">
        {title.toUpperCase()}
      </h2>
      {subtitle && (
        <p className="text-neutral-500 text-base mt-4 leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}
