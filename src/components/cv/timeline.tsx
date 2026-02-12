import { cn } from '@/lib/utils'

interface TimelineItem {
  period: string
  title: string
  organization: string
  location: string
  description?: string[]
  current?: boolean
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-10">
      {items.map((item) => (
        <div
          key={`${item.organization}-${item.period}`}
          className="flex gap-8"
        >
          {/* Dot + line */}
          <div className="flex flex-col items-center pt-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                item.current
                  ? 'bg-accent shadow-[0_0_8px_rgba(0,255,65,0.4)]'
                  : 'bg-neutral-700'
              )}
            />
            <div className="w-px flex-1 bg-neutral-800 mt-2" />
          </div>

          {/* Content */}
          <div className="pb-2 min-w-0">
            <span className="text-neutral-600 text-[12px]">
              {item.period}
            </span>
            <h3 className="font-pixel text-neutral-100 text-[14px] mt-1">
              {item.title.toUpperCase()}
            </h3>
            <p className="text-accent/70 text-[13px] mt-1">
              {item.organization}
            </p>
            <p className="text-neutral-600 text-[12px] mt-0.5">
              {item.location}
            </p>

            {item.description && item.description.length > 0 && (
              <ul className="mt-4 space-y-2">
                {item.description.map((line, i) => (
                  <li
                    key={i}
                    className="text-neutral-400 text-[13px] leading-relaxed pl-4 relative"
                  >
                    <span className="absolute left-0 text-neutral-600">
                      —
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
