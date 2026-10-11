import type { MetadataRoute } from 'next'
import { getProjects, getPublishedPosts, getPapers } from '@/lib/content'
import { siteConfig } from '@/config/site'

// Bump when the CV content changes.
const CV_UPDATED = '2026-10-11'

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().map((p) => ({
    url: `${siteConfig.url}/projects/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }))

  const posts = getPublishedPosts().map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }))

  const research = getPapers().map((p) => ({
    url: `${siteConfig.url}/research/${p.slug}`,
    lastModified: new Date(p.pageUpdated ?? p.updated ?? p.date),
  }))

  // Listing pages change when their newest item changes; a build date would
  // mark them as modified on every deploy.
  const newest = (items: { lastModified: Date }[]) =>
    new Date(Math.max(...items.map((i) => i.lastModified.getTime())))
  const all = [...projects, ...research, ...posts]

  return [
    { url: siteConfig.url, lastModified: newest(all) },
    { url: `${siteConfig.url}/projects`, lastModified: newest(projects) },
    { url: `${siteConfig.url}/research`, lastModified: newest(research) },
    { url: `${siteConfig.url}/blog`, lastModified: newest(posts) },
    { url: `${siteConfig.url}/cv`, lastModified: new Date(CV_UPDATED) },
    ...projects,
    ...research,
    ...posts,
  ]
}
