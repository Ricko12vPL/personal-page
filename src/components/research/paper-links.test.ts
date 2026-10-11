import { describe, expect, it } from 'vitest'
import { doiId, paperLinks } from './paper-links'
import { paperDay, paperYear, statusLabel } from './status'

describe('paperLinks', () => {
  it('lists only the links present in frontmatter, in reading order', () => {
    const links = paperLinks({
      code: 'https://github.com/x/y',
      doi: 'https://doi.org/10.5281/zenodo.1',
      website: 'https://zenodo.org/records/1',
    })
    expect(links.map((l) => l.label)).toEqual(['read online', 'doi', 'repo'])
  })

  it('returns no links for a paper without any', () => {
    expect(paperLinks({})).toEqual([])
  })

  it('marks the pdf as a download', () => {
    expect(paperLinks({ pdf: '/papers/p.pdf' })).toEqual([
      { key: 'pdf', label: 'pdf', href: '/papers/p.pdf', glyph: '↓' },
    ])
  })
})

describe('doiId', () => {
  it('strips the resolver prefix', () => {
    expect(doiId('https://doi.org/10.5281/zenodo.20645678')).toBe('10.5281/zenodo.20645678')
    expect(doiId('http://dx.doi.org/10.1/x')).toBe('10.1/x')
  })

  it('leaves a bare identifier unchanged', () => {
    expect(doiId('10.1/x')).toBe('10.1/x')
  })
})

describe('status helpers', () => {
  it('labels known statuses and passes unknown ones through', () => {
    expect(statusLabel('working-paper')).toBe('Working Paper')
    expect(statusLabel('preprint')).toBe('Preprint')
    expect(statusLabel('retracted')).toBe('retracted')
  })

  it('reads day and year from the ISO string', () => {
    expect(paperDay('2026-06-09T00:00:00.000Z')).toBe('2026-06-09')
    expect(paperYear('2026-06-09T00:00:00.000Z')).toBe('2026')
  })
})
