import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'
import { pageMetadata, summarize } from './metadata'

describe('summarize', () => {
  it('collapses whitespace and trims', () => {
    expect(summarize('  a\n\n b\t  c  ')).toBe('a b c')
  })

  it('returns short text unchanged', () => {
    expect(summarize('hello world', 11)).toBe('hello world')
  })

  it('cuts at the last word boundary and appends an ellipsis', () => {
    expect(summarize('hello world foo', 11)).toBe('hello world…')
    expect(summarize('one two three four', 10)).toBe('one two…')
  })

  it('strips trailing punctuation before the ellipsis', () => {
    expect(summarize('hello world, foo bar', 13)).toBe('hello world…')
    expect(summarize('alpha beta — gamma delta', 12)).toBe('alpha beta…')
  })

  it('hard-cuts a single long word', () => {
    expect(summarize('abcdefghij', 4)).toBe('abcd…')
  })

  it('defaults to 200 characters and never exceeds max + ellipsis', () => {
    const long = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')
    const out = summarize(long)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBeLessThanOrEqual(201)
  })

  it('returns an empty string for blank input', () => {
    expect(summarize('   \n ')).toBe('')
  })
})

describe('pageMetadata', () => {
  it('uses the absolute site title when no page title is given', () => {
    const meta = pageMetadata({ description: 'Home page', path: '/' })
    expect(meta.title).toEqual({ absolute: siteConfig.title })
    expect(meta.openGraph).toMatchObject({ title: siteConfig.title, type: 'website', url: '/' })
  })

  it('suffixes the site name for page titles', () => {
    const meta = pageMetadata({ title: 'Projects', description: 'All projects', path: '/projects' })
    expect(meta.title).toBe('Projects')
    expect(meta.openGraph).toMatchObject({ title: `Projects | ${siteConfig.name}` })
    expect(meta.twitter).toMatchObject({ title: `Projects | ${siteConfig.name}` })
  })

  it('sets canonical, description, locale, site name and OG image', () => {
    const meta = pageMetadata({ title: 'Blog', description: 'Posts', path: '/blog' })
    expect(meta.description).toBe('Posts')
    expect(meta.alternates).toEqual({ canonical: '/blog' })
    expect(meta.openGraph).toMatchObject({
      description: 'Posts',
      siteName: siteConfig.name,
      locale: 'en_US',
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.title }],
    })
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      description: 'Posts',
      images: [siteConfig.ogImage],
    })
  })

  it('adds article timestamps only for articles', () => {
    const article = pageMetadata({
      title: 'Post',
      description: 'd',
      path: '/blog/post',
      type: 'article',
      publishedTime: '2026-08-09',
      modifiedTime: '2026-10-11',
    })
    expect(article.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-08-09',
      modifiedTime: '2026-10-11',
    })

    const website = pageMetadata({
      description: 'd',
      path: '/',
      publishedTime: '2026-08-09',
      modifiedTime: '2026-10-11',
    })
    expect(website.openGraph).not.toHaveProperty('publishedTime')
    expect(website.openGraph).not.toHaveProperty('modifiedTime')
  })

  it('omits missing article timestamps', () => {
    const meta = pageMetadata({ title: 'Post', description: 'd', path: '/p', type: 'article' })
    expect(meta.openGraph).not.toHaveProperty('publishedTime')
    expect(meta.openGraph).not.toHaveProperty('modifiedTime')
  })
})
