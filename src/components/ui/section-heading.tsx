interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <h2 className="font-pixel text-accent text-2xl sm:text-3xl tracking-tight">
        {title.toUpperCase()}
      </h2>
      {subtitle && (
        <p className="text-neutral-500 text-[15px] mt-3">{subtitle}</p>
      )}
    </div>
  )
}
