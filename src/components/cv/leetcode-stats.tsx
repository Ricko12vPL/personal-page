import { siteConfig } from '@/config/site'

const stats = {
  total: 32,
  easy: 20,
  medium: 10,
  hard: 2,
  acceptance: 85,
} as const

const difficulties = [
  { label: 'Easy', count: stats.easy, color: 'bg-accent' },
  { label: 'Medium', count: stats.medium, color: 'bg-amber-400' },
  { label: 'Hard', count: stats.hard, color: 'bg-red-500' },
] as const

export function LeetcodeStats() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div className="flex items-baseline gap-4">
          <span className="font-pixel text-neutral-100 text-3xl">
            {stats.total}
          </span>
          <span className="text-neutral-500 text-[13px]">problems solved</span>
        </div>
        <a
          href={siteConfig.links.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 text-[12px] hover:text-accent transition-colors"
        >
          View profile &rarr;
        </a>
      </div>

      <div className="space-y-4">
        {difficulties.map((diff) => (
          <div key={diff.label} className="flex items-center gap-4">
            <span className="text-neutral-500 text-[13px] w-16 text-right">
              {diff.label}
            </span>
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`${diff.color}/60 h-full rounded-full`}
                style={{ width: `${(diff.count / stats.total) * 100}%` }}
              />
            </div>
            <span className="text-neutral-400 text-[13px] w-8 text-right tabular-nums">
              {diff.count}
            </span>
          </div>
        ))}
      </div>

      <p className="text-neutral-600 text-[12px] mt-4">
        {stats.acceptance}% acceptance rate
      </p>
    </div>
  )
}
