import { describe, expect, it } from 'vitest'
import { SPARK, sparklineBars, sparklineWidth } from './sparkline'

describe('sparklineWidth', () => {
  it('is n × 2px bars + (n − 1) × 1px gaps', () => {
    expect(sparklineWidth(56)).toBe(167)
    expect(sparklineWidth(28)).toBe(83)
    expect(sparklineWidth(1)).toBe(2)
  })

  it.each([0, -1, Number.NaN])('is 0 for %s bars', (n) => {
    expect(sparklineWidth(n)).toBe(0)
  })
})

describe('sparklineBars', () => {
  it('scales bars to the busiest hour, 14px tall', () => {
    const bars = sparklineBars([7, 14, 3])
    expect(bars.map((b) => b.height)).toEqual([7, 14, 3])
    expect(bars.map((b) => b.y)).toEqual([7, 0, 11])
    expect(bars.map((b) => b.x)).toEqual([0, 3, 6])
    expect(bars.every((b) => b.y + b.height === SPARK.height)).toBe(true)
  })

  it('accents only the newest hour', () => {
    expect(sparklineBars([1, 2, 3]).map((b) => b.kind)).toEqual(['bar', 'bar', 'latest'])
  })

  it('draws hours before `since` as 1px baseline dots', () => {
    const [dot] = sparklineBars([null, 5])
    expect(dot).toEqual({ x: 0, y: 13, width: 1, height: 1, kind: 'baseline' })
  })

  it('keeps a real zero visible as a 1px bar', () => {
    const [zero] = sparklineBars([0, 100])
    expect(zero).toMatchObject({ width: 2, height: 1, y: 13, kind: 'bar' })
  })

  it('handles an all-zero or all-null window without dividing by zero', () => {
    expect(sparklineBars([0, 0]).map((b) => b.height)).toEqual([1, 1])
    expect(sparklineBars([null, null]).map((b) => b.kind)).toEqual(['baseline', 'baseline'])
  })

  it('never draws a bar taller than the canvas', () => {
    expect(Math.max(...sparklineBars([1, 1e9]).map((b) => b.height))).toBe(14)
  })

  it('returns no bars for an empty series', () => {
    expect(sparklineBars([])).toEqual([])
  })
})
