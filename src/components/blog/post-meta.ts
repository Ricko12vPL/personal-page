import type { Post } from '#site/content'

const SUPERSEDED_PREFIX = /^\[superseded\]\s*/i

export interface DisplayTitle {
  title: string
  superseded: boolean
}

/** Splits a "[Superseded] …" title into the bare title plus a flag. */
export function splitSupersededTitle(title: string): DisplayTitle {
  const superseded = SUPERSEDED_PREFIX.test(title)
  return { title: superseded ? title.replace(SUPERSEDED_PREFIX, '') : title, superseded }
}

/** `YYYY-MM-DD` straight from the ISO string, so no timezone can shift the day. */
export function isoDay(date: string): string {
  return date.slice(0, 10)
}

export function isoYear(date: string): string {
  return date.slice(0, 4)
}

export function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`
}

export interface YearGroup {
  year: string
  posts: readonly Post[]
}

/** Groups newest-first posts by year, preserving order within each year. */
export function groupPostsByYear(posts: readonly Post[]): YearGroup[] {
  const years = Array.from(new Set(posts.map((post) => isoYear(post.date))))
  return years.map((year) => ({
    year,
    posts: posts.filter((post) => isoYear(post.date) === year),
  }))
}

export interface PostNeighbours {
  older: Post | null
  newer: Post | null
}

/** Adjacent posts in a newest-first list; none when the slug is not listed. */
export function findNeighbours(posts: readonly Post[], slug: string): PostNeighbours {
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return { older: null, newer: null }
  return {
    older: posts[index + 1] ?? null,
    newer: index > 0 ? posts[index - 1] : null,
  }
}
