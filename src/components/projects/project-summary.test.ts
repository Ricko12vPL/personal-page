import { describe, expect, it } from 'vitest'
import {
  countByStatus,
  isoDay,
  latestChange,
  projectLinks,
  splitTitle,
  statRows,
  yearMonth,
} from './project-summary'

describe('statRows', () => {
  it('returns no rows without stats', () => {
    expect(statRows(undefined)).toEqual([])
  })

  it('keeps defined values and formats numbers with en-US separators', () => {
    expect(statRows({ lines: '9.7K', stars: 1200, sources: undefined })).toEqual([
      { label: 'lines', value: '9.7K' },
      { label: 'stars', value: '1,200' },
    ])
  })
})

describe('projectLinks', () => {
  it('lists only links present in frontmatter, in live/paper/github order', () => {
    expect(projectLinks({ github: 'https://github.com/x/y', live: 'https://x.dev' })).toEqual([
      { kind: 'live', href: 'https://x.dev', label: 'live', arrow: '↗' },
      { kind: 'github', href: 'https://github.com/x/y', label: 'github', arrow: '↗' },
    ])
  })

  it('marks PDF papers as downloads', () => {
    expect(projectLinks({ paper: '/papers/a.PDF' })).toEqual([
      { kind: 'paper', href: '/papers/a.PDF', label: 'paper (pdf)', arrow: '↓' },
    ])
  })
})

describe('splitTitle', () => {
  it('splits on the first ": "', () => {
    expect(splitTitle('X_Quant: A Program: v2')).toEqual({ name: 'X_Quant', subtitle: 'A Program: v2' })
  })

  it('returns the whole title when there is no subtitle', () => {
    expect(splitTitle('Amazing Maze')).toEqual({ name: 'Amazing Maze', subtitle: '' })
  })
})

describe('dates', () => {
  it('slices ISO strings without timezone conversion', () => {
    expect(yearMonth('2024-06-15T00:00:00.000Z')).toBe('2024-06')
    expect(isoDay('2024-06-15T00:00:00.000Z')).toBe('2024-06-15')
  })

  it('finds the latest of date/updated', () => {
    expect(
      latestChange([
        { date: '2024-01-01T00:00:00.000Z', updated: '2026-10-11T00:00:00.000Z' },
        { date: '2026-09-29T00:00:00.000Z' },
      ])
    ).toBe('2026-10-11')
    expect(latestChange([])).toBe('')
  })
})

describe('countByStatus', () => {
  it('counts every status in display order, including zeros', () => {
    expect(
      countByStatus([{ status: 'paused' }, { status: 'completed' }, { status: 'paused' }])
    ).toEqual([
      { status: 'completed', count: 1 },
      { status: 'in-progress', count: 0 },
      { status: 'paused', count: 2 },
      { status: 'archived', count: 0 },
    ])
  })
})
