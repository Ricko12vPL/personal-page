import { projects, posts, papers } from '#site/content'

type Sortable = { date: string; priority?: number }

// Pinned projects (with an explicit `priority`) come first in ascending
// priority order; everything else falls back to newest-date-first.
function byPriorityThenDate(a: Sortable, b: Sortable) {
  const ap = a.priority
  const bp = b.priority
  if (ap != null && bp != null) return ap - bp
  if (ap != null) return -1
  if (bp != null) return 1
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

export function getProjects() {
  return [...projects].sort(byPriorityThenDate)
}

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured).sort(byPriorityThenDate)
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null
}

export function getPublishedPosts() {
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null
}

export function getPapers() {
  return [...papers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPaperBySlug(slug: string) {
  return papers.find((p) => p.slug === slug) ?? null
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  for (const project of projects) {
    for (const tag of project.tags) {
      tagSet.add(tag)
    }
  }
  return [...tagSet].sort()
}
