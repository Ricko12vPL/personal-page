import { describe, expect, it } from 'vitest'
import type { Post } from '#site/content'
import {
  findNeighbours,
  groupPostsByYear,
  isoDay,
  isoYear,
  plural,
  splitSupersededTitle,
} from './post-meta'

function post(slug: string, date: string): Post {
  return { slug, date, title: slug, description: '', published: true, tags: [], body: '' }
}

// Newest first, as getPublishedPosts() returns them.
const POSTS = [
  post('c', '2026-06-20T00:00:00.000Z'),
  post('b', '2026-02-09T00:00:00.000Z'),
  post('a', '2025-12-31T00:00:00.000Z'),
]

describe('splitSupersededTitle', () => {
  it('strips the prefix and flags the post', () => {
    expect(splitSupersededTitle('[Superseded] X_Quant v2: From ML')).toEqual({
      title: 'X_Quant v2: From ML',
      superseded: true,
    })
  })

  it('is case-insensitive', () => {
    expect(splitSupersededTitle('[superseded]Old').superseded).toBe(true)
  })

  it('leaves ordinary titles alone', () => {
    expect(splitSupersededTitle('Hello [Superseded]')).toEqual({
      title: 'Hello [Superseded]',
      superseded: false,
    })
  })
})

describe('isoDay / isoYear', () => {
  it('reads the calendar day from the ISO string without timezone shifts', () => {
    expect(isoDay('2026-02-09T00:00:00.000Z')).toBe('2026-02-09')
    expect(isoYear('2025-12-31T00:00:00.000Z')).toBe('2025')
  })
})

describe('plural', () => {
  it('pluralises everything except one', () => {
    expect(plural(1, 'post')).toBe('post')
    expect(plural(0, 'post')).toBe('posts')
    expect(plural(3, 'tag')).toBe('tags')
  })
})

describe('groupPostsByYear', () => {
  it('groups by year keeping newest-first order', () => {
    const groups = groupPostsByYear(POSTS)
    expect(groups.map((g) => g.year)).toEqual(['2026', '2025'])
    expect(groups[0].posts.map((p) => p.slug)).toEqual(['c', 'b'])
    expect(groups[1].posts.map((p) => p.slug)).toEqual(['a'])
  })

  it('returns no groups for no posts', () => {
    expect(groupPostsByYear([])).toEqual([])
  })

  it('does not mutate its input', () => {
    const input = [...POSTS]
    groupPostsByYear(input)
    expect(input).toEqual(POSTS)
  })
})

describe('findNeighbours', () => {
  it('returns the older and newer post around a middle entry', () => {
    const { older, newer } = findNeighbours(POSTS, 'b')
    expect(older?.slug).toBe('a')
    expect(newer?.slug).toBe('c')
  })

  it('has no newer post for the latest and no older post for the first', () => {
    expect(findNeighbours(POSTS, 'c').newer).toBeNull()
    expect(findNeighbours(POSTS, 'a').older).toBeNull()
  })

  it('returns nothing for a slug that is not listed (e.g. unpublished)', () => {
    expect(findNeighbours(POSTS, 'draft')).toEqual({ older: null, newer: null })
  })
})
