import { describe, expect, it } from 'vitest'
import { formatCount, sinceLabel, visitorsAriaLabel, visitorsTooltip } from './format'
import type { SeenResponse } from './types'

const DATA: SeenResponse = {
  hour: '2026-10-11T19',
  hours: [null, 4, 1234],
  total: 142967,
  since: '2026-09-26T00',
}

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1,000'],
    [142967, '142,967'],
    [1234567, '1,234,567'],
  ])('formats %d as %s with en-US commas', (value, expected) => {
    expect(formatCount(value)).toBe(expected)
  })
})

describe('sinceLabel', () => {
  it('returns MM-DD', () => {
    expect(sinceLabel('2026-09-26T00')).toBe('09-26')
  })
})

describe('visitorsTooltip', () => {
  it('matches the reference tooltip', () => {
    expect(visitorsTooltip(DATA)).toBe(
      'visitors per hour · 142,967 since 09-26\nno cookies · IPs hashed, never stored',
    )
  })

  it('says loading while the first fetch is in flight', () => {
    expect(visitorsTooltip(null, 'loading')).toBe('visitors per hour · loading\nno cookies · IPs hashed, never stored')
  })

  it('still states the privacy note when unavailable', () => {
    expect(visitorsTooltip(null)).toBe('visitors per hour · unavailable\nno cookies · IPs hashed, never stored')
  })
})

describe('visitorsAriaLabel', () => {
  it('includes the total, the start day and the latest hour', () => {
    expect(visitorsAriaLabel(DATA, 56)).toBe(
      'Visitors: 142,967 since 09-26; 1,234 in the current hour; graph of the last 56 hours',
    )
  })

  it('treats a null latest hour as 0', () => {
    expect(visitorsAriaLabel({ ...DATA, hours: [null] }, 28)).toContain('0 in the current hour')
  })

  it('says unavailable without data', () => {
    expect(visitorsAriaLabel(null, 56)).toBe('Visitors: unavailable')
    expect(visitorsAriaLabel(null, 56, 'unavailable')).toBe('Visitors: unavailable')
  })

  it('says loading (not unavailable) while the first fetch is in flight', () => {
    expect(visitorsAriaLabel(null, 56, 'loading')).toBe('Visitors: loading')
  })
})
