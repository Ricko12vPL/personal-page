import type { Post } from '#site/content'
import { MetaStrip, type MetaItem } from '@/components/ui/meta-strip'
import { isoDay, isoYear } from './post-meta'
import { readingMinutes } from './reading-time'

interface BlogStatsProps {
  posts: readonly Post[]
}

function yearSpan(years: readonly string[]): string {
  if (years.length === 0) return '—'
  const sorted = [...years].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return first === last ? first : `${first}–${last}`
}

function computeStats(posts: readonly Post[]): MetaItem[] {
  const years = Array.from(new Set(posts.map((post) => isoYear(post.date))))
  const minutes = posts.reduce((total, post) => total + readingMinutes(post.body), 0)
  const latest = posts.reduce<string | null>(
    (max, post) => (max === null || post.date > max ? post.date : max),
    null,
  )
  return [
    { label: 'posts', value: posts.length.toLocaleString('en-US') },
    { label: years.length === 1 ? 'year' : 'years', value: yearSpan(years) },
    { label: 'latest', value: latest ? isoDay(latest) : '—' },
    { label: 'reading', value: `≈${minutes.toLocaleString('en-US')} min` },
  ]
}

// Counts line under the blog heading; every value is computed from content.
export function BlogStats({ posts }: BlogStatsProps) {
  return <MetaStrip items={computeStats(posts)} />
}
