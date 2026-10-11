import { describe, expect, it } from 'vitest'
import {
  EMPTY_FILTERS,
  filterIgnoringStatus,
  filterProjects,
  isFiltered,
  matchesQuery,
  rankTags,
} from './project-filter'
import type { ProjectSummary } from './project-summary'

function project(overrides: Partial<ProjectSummary>): ProjectSummary {
  return {
    slug: 'demo',
    title: 'Demo: A Project',
    description: 'A small demo project.',
    date: '2026-01-01T00:00:00.000Z',
    status: 'completed',
    tags: [],
    stats: [],
    links: [],
    ...overrides,
  }
}

const alpha = project({
  slug: 'alpha-lab',
  title: 'Alpha Lab: Research Workstation',
  status: 'in-progress',
  tags: ['python', 'duckdb'],
})
const kelly = project({
  slug: 'kelly-pm',
  title: 'Kelly PM: Position Sizing',
  status: 'paused',
  tags: ['python', 'kelly-criterion'],
})
const maze = project({ slug: 'amazing-maze', title: 'Amazing Maze', tags: ['javascript'] })
const all = [alpha, kelly, maze]

describe('matchesQuery', () => {
  it('matches everything for an empty or whitespace query', () => {
    expect(matchesQuery(alpha, '')).toBe(true)
    expect(matchesQuery(alpha, '   ')).toBe(true)
  })

  it('matches title, slug, tag and status label case-insensitively', () => {
    expect(matchesQuery(alpha, 'WORKSTATION')).toBe(true)
    expect(matchesQuery(alpha, 'alpha-lab/')).toBe(true)
    expect(matchesQuery(alpha, 'duckdb')).toBe(true)
    expect(matchesQuery(alpha, 'in progress')).toBe(true)
  })

  it('requires every token to match', () => {
    expect(matchesQuery(alpha, 'python duckdb')).toBe(true)
    expect(matchesQuery(alpha, 'python kelly')).toBe(false)
  })

  it('ignores the leading "/" hint glyph', () => {
    expect(matchesQuery(kelly, '/kelly')).toBe(true)
  })
})

describe('filterProjects', () => {
  it('returns all projects for empty filters', () => {
    expect(filterProjects(all, EMPTY_FILTERS)).toEqual(all)
  })

  it('combines query, status and tag', () => {
    expect(filterProjects(all, { query: 'python', status: 'paused', tag: null })).toEqual([kelly])
    expect(filterProjects(all, { query: '', status: 'all', tag: 'javascript' })).toEqual([maze])
    expect(filterProjects(all, { query: 'nothing-matches', status: 'all', tag: null })).toEqual([])
  })

  it('keeps status-ignoring results for chip counts', () => {
    const filters = { query: 'python', status: 'paused' as const, tag: null }
    expect(filterIgnoringStatus(all, filters)).toEqual([alpha, kelly])
  })
})

describe('rankTags', () => {
  it('orders by frequency, then alphabetically', () => {
    expect(rankTags(all)).toEqual([
      { tag: 'python', count: 2 },
      { tag: 'duckdb', count: 1 },
      { tag: 'javascript', count: 1 },
      { tag: 'kelly-criterion', count: 1 },
    ])
  })
})

describe('isFiltered', () => {
  it('is false only for the empty filter set', () => {
    expect(isFiltered(EMPTY_FILTERS)).toBe(false)
    expect(isFiltered({ ...EMPTY_FILTERS, query: ' ' })).toBe(false)
    expect(isFiltered({ ...EMPTY_FILTERS, status: 'archived' })).toBe(true)
    expect(isFiltered({ ...EMPTY_FILTERS, tag: 'python' })).toBe(true)
  })
})
