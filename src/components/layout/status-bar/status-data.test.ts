import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/content', () => ({
  getProjects: () => [{ slug: 'x-quant' }, { slug: 'alpha-lab' }],
  getPapers: () => [{ slug: 'validation-crisis' }],
  getPublishedPosts: () => [{ slug: 'starting-alpha-lab' }, { slug: 'closing-x-quant' }],
}))

import { getStatusData } from './status-data'

describe('getStatusData', () => {
  it('counts published content for the status bar', () => {
    expect(getStatusData().counts).toEqual({ projects: 2, papers: 1, posts: 2 })
  })

  it('lists entries projects first, then papers, then posts, with their paths', () => {
    expect(getStatusData().entries).toEqual([
      { slug: 'x-quant', kind: 'project', href: '/projects/x-quant' },
      { slug: 'alpha-lab', kind: 'project', href: '/projects/alpha-lab' },
      { slug: 'validation-crisis', kind: 'paper', href: '/research/validation-crisis' },
      { slug: 'starting-alpha-lab', kind: 'post', href: '/blog/starting-alpha-lab' },
      { slug: 'closing-x-quant', kind: 'post', href: '/blog/closing-x-quant' },
    ])
  })
})
