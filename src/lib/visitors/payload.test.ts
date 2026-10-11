import { describe, expect, it } from 'vitest'
import { parseSeenResponse } from './payload'

const VALID = {
  hour: '2026-10-11T19',
  hours: [null, null, 0, 3, 12],
  total: 142967,
  since: '2026-09-26T00',
}

describe('parseSeenResponse', () => {
  it('accepts a valid body and returns a copy', () => {
    const parsed = parseSeenResponse(VALID)
    expect(parsed).toEqual(VALID)
    expect(parsed?.hours).not.toBe(VALID.hours)
  })

  it('drops unknown fields', () => {
    expect(parseSeenResponse({ ...VALID, extra: 1 })).toEqual(VALID)
  })

  it.each([
    ['null', null],
    ['a string', 'ok'],
    ['an array', []],
    ['the 503 body', { error: 'not configured' }],
    ['a bad hour', { ...VALID, hour: '2026-10-11' }],
    ['a bad since', { ...VALID, since: null }],
    ['a negative total', { ...VALID, total: -1 }],
    ['a fractional total', { ...VALID, total: 1.5 }],
    ['a string total', { ...VALID, total: '142967' }],
    ['empty hours', { ...VALID, hours: [] }],
    ['non-array hours', { ...VALID, hours: '1,2,3' }],
    ['a string inside hours', { ...VALID, hours: [1, '2'] }],
    ['a negative hour', { ...VALID, hours: [1, -2] }],
    ['NaN inside hours', { ...VALID, hours: [1, Number.NaN] }],
    ['an absurdly long series', { ...VALID, hours: Array.from({ length: 1000 }, () => 0) }],
  ])('rejects %s', (_, value) => {
    expect(parseSeenResponse(value)).toBeNull()
  })
})
