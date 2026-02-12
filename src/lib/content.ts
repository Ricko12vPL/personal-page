import { projects, posts } from '#site/content'

export function getProjects() {
  return [...projects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getFeaturedProjects() {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  for (const project of projects) {
    for (const tag of project.tags) {
      tagSet.add(tag)
    }
  }
  return [...tagSet].sort()
}
