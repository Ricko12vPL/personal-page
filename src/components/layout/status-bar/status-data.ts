// Server-only: reads Velite content through the shared helpers and reduces it
// to the small, serialisable payload the client status bar needs. Never import
// this from a 'use client' module.
import { getPapers, getProjects, getPublishedPosts } from '@/lib/content'
import type { ContentCounts, ContentEntry } from './types'

export interface StatusData {
  readonly counts: ContentCounts
  /** Ordered by resolution priority: projects, then papers, then posts. */
  readonly entries: readonly ContentEntry[]
}

export function getStatusData(): StatusData {
  const projects = getProjects()
  const papers = getPapers()
  const posts = getPublishedPosts()

  const entries: ContentEntry[] = [
    ...projects.map((p) => ({ slug: p.slug, kind: 'project' as const, href: `/projects/${p.slug}` })),
    ...papers.map((p) => ({ slug: p.slug, kind: 'paper' as const, href: `/research/${p.slug}` })),
    ...posts.map((p) => ({ slug: p.slug, kind: 'post' as const, href: `/blog/${p.slug}` })),
  ]

  return {
    counts: { projects: projects.length, papers: papers.length, posts: posts.length },
    entries,
  }
}
