import type { MetadataRoute } from 'next'
import { getProjects, getPublishedPosts } from '@/lib/content'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().map((p) => ({
    url: `${siteConfig.url}/projects/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }))

  const posts = getPublishedPosts().map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }))

  return [
    { url: siteConfig.url, lastModified: new Date() },
    { url: `${siteConfig.url}/projects`, lastModified: new Date() },
    { url: `${siteConfig.url}/blog`, lastModified: new Date() },
    { url: `${siteConfig.url}/cv`, lastModified: new Date() },
    ...projects,
    ...posts,
  ]
}
