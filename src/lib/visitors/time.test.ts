import { describe, expect, it } from 'vitest'
import { dayKey, hourKey, isHourKey, lastHourKeys } from './time'

describe('hourKey', () => {
  it('formats the UTC hour as YYYY-MM-DDTHH', () => {
    expect(hourKey(new Date('2026-10-11T19:42:07.123Z'))).toBe('2026-10-11T19')
  })

  it('uses UTC, not the local offset', () => {
    expect(hourKey(new Date('2026-10-11T23:30:00+02:00'))).toBe('2026-10-11T21')
  })

  it('zero-pads single-digit hours', () => {
    expect(hourKey(new Date('2026-01-02T03:00:00Z'))).toBe('2026-01-02T03')
  })

  it('throws on an invalid date', () => {
    expect(() => hourKey(new Date('nope'))).toThrow(RangeError)
  })
})

describe('dayKey', () => {
  it('is the UTC calendar day', () => {
    expect(dayKey(new Date('2026-10-11T23:59:59Z'))).toBe('2026-10-11')
    expect(dayKey(new Date('2026-10-12T00:00:00Z'))).toBe('2026-10-12')
  })
})

describe('isHourKey', () => {
  it.each(['2026-10-11T19', '1999-12-31T00'])('accepts %s', (value) => {
    expect(isHourKey(value)).toBe(true)
  })

  it.each([
    '2026-10-11',
    '2026-10-11T9',
    '2026-10-11T19:00',
    ' 2026-10-11T19',
    '',
    null,
    undefined,
    2026,
    { hour: '2026-10-11T19' },
  ])('rejects %j', (value) => {
    expect(isHourKey(value)).toBe(false)
  })
})

describe('lastHourKeys', () => {
  const now = new Date('2026-10-11T19:42:00Z')

  it('returns n keys oldest → newest ending with the current hour', () => {
    expect(lastHourKeys(now, 3)).toEqual(['2026-10-11T17', '2026-10-11T18', '2026-10-11T19'])
  })

  it('returns the 56-hour window used by the status bar', () => {
    const keys = lastHourKeys(now, 56)
    expect(keys).toHaveLength(56)
    expect(keys[55]).toBe('2026-10-11T19')
    expect(keys[0]).toBe('2026-10-09T12')
    expect(new Set(keys).size).toBe(56)
  })

  it('rolls over midnight into the previous day', () => {
    expect(lastHourKeys(new Date('2026-10-12T01:05:00Z'), 4)).toEqual([
      '2026-10-11T22',
      '2026-10-11T23',
      '2026-10-12T00',
      '2026-10-12T01',
    ])
  })

  it('rolls over month and year boundaries', () => {
    expect(lastHourKeys(new Date('2027-01-01T00:10:00Z'), 2)).toEqual([
      '2026-12-31T23',
      '2027-01-01T00',
    ])
    expect(lastHourKeys(new Date('2028-03-01T00:00:00Z'), 2)).toEqual([
      '2028-02-29T23',
      '2028-03-01T00',
    ])
  })

  it('is stable at the exact start of an hour', () => {
    expect(lastHourKeys(new Date('2026-10-11T19:00:00.000Z'), 1)).toEqual(['2026-10-11T19'])
  })

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('returns [] for n = %s', (n) => {
    expect(lastHourKeys(now, n)).toEqual([])
  })

  it('floors fractional n', () => {
    expect(lastHourKeys(now, 2.9)).toHaveLength(2)
  })

  it('caps very large windows', () => {
    expect(lastHourKeys(now, 1e9).length).toBeLessThanOrEqual(24 * 366)
  })
})
