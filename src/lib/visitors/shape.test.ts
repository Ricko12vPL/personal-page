import { describe, expect, it } from 'vitest'
import { shapeResponse, toCount } from './shape'

const NOW = new Date('2026-10-11T19:42:00Z')

describe('toCount', () => {
  it.each([
    [5, 5],
    ['17', 17],
    [' 3 ', 3],
    [2.9, 2],
    [0, 0],
    [-4, 0],
    [null, 0],
    [undefined, 0],
    ['', 0],
    ['abc', 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [{}, 0],
    [true, 0],
  ])('coerces %j to %j', (value, expected) => {
    expect(toCount(value)).toBe(expected)
  })
})

describe('shapeResponse', () => {
  it('returns the documented JSON shape for a full window', () => {
    const raw = Array.from({ length: 56 }, (_, i) => i)
    const body = shapeResponse(raw, 142967, '2026-09-26T00', NOW)
    expect(body).toEqual({
      hour: '2026-10-11T19',
      hours: raw,
      total: 142967,
      since: '2026-09-26T00',
    })
    expect(Object.keys(body)).toEqual(['hour', 'hours', 'total', 'since'])
  })

  it('accepts numeric strings and nulls as Redis returns them', () => {
    const raw = Array.from({ length: 56 }, (_, i) => (i % 2 ? String(i) : null))
    const body = shapeResponse(raw, '99', '2026-09-26T00', NOW)
    expect(body.hours[0]).toBe(0)
    expect(body.hours[1]).toBe(1)
    expect(body.total).toBe(99)
  })

  it('marks hours before `since` as null and counts from `since` on', () => {
    const raw = Array.from({ length: 56 }, () => 2)
    const body = shapeResponse(raw, 6, '2026-10-11T17', NOW)
    expect(body.hours.slice(0, 53)).toEqual(Array.from({ length: 53 }, () => null))
    expect(body.hours.slice(53)).toEqual([2, 2, 2])
  })

  it('handles `since` across a day boundary', () => {
    const now = new Date('2026-10-12T01:10:00Z')
    const body = shapeResponse([], 1, '2026-10-11T23', now)
    expect(body.hours.slice(-3)).toEqual([0, 0, 0])
    expect(body.hours[52]).toBeNull()
  })

  it('without a recorded `since` starts the window at the current hour', () => {
    const body = shapeResponse([], null, null, NOW)
    expect(body.since).toBe('2026-10-11T19')
    expect(body.total).toBe(0)
    expect(body.hours.filter((h) => h === null)).toHaveLength(55)
    expect(body.hours[55]).toBe(0)
  })

  it.each(['garbage', '2026-09-26', 42, { since: 'x' }])('treats an invalid `since` (%j) as unset', (since) => {
    expect(shapeResponse([], 0, since, NOW).since).toBe('2026-10-11T19')
  })

  it('clamps a `since` in the future to the current hour', () => {
    expect(shapeResponse([], 0, '2027-01-01T00', NOW).since).toBe('2026-10-11T19')
  })

  it('pads missing counts with 0 and ignores extra ones', () => {
    const short = shapeResponse([4], 4, '2026-01-01T00', NOW)
    expect(short.hours).toHaveLength(56)
    expect(short.hours[0]).toBe(4)
    expect(short.hours[55]).toBe(0)
    const long = shapeResponse(Array.from({ length: 80 }, () => 1), 80, '2026-01-01T00', NOW)
    expect(long.hours).toHaveLength(56)
  })

  it('supports other window sizes', () => {
    expect(shapeResponse([], 0, '2026-01-01T00', NOW, 3).hours).toEqual([0, 0, 0])
  })
})
