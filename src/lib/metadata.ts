import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'

// Next replaces nested metadata objects per route segment instead of merging
// them, so every page builds its own openGraph / twitter / canonical here.
interface PageMetadataInput {
  title?: string
  description: string
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
}

export function summarize(text: string, max = 200): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.—–-]+$/, '')}…`
}

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const image = {
    url: siteConfig.ogImage,
    width: 1200,
    height: 630,
    alt: siteConfig.title,
  }
  return {
    ...(title ? { title } : { title: { absolute: siteConfig.title } }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: 'en_US',
      images: [image],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [siteConfig.ogImage],
    },
  }
}
