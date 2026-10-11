import { describe, expect, it } from 'vitest'
import {
  DAYS_PER_WEEK,
  buildWeeks,
  computeStats,
  contributionsLabel,
  dayReadout,
  formatCount,
  lastWeeks,
  legendEntries,
  legendRange,
  monthTicks,
  monthlySummary,
} from './calendar-model'
import type { ContributionDay } from './snapshot'

function day(date: string, count: number, level = count === 0 ? 0 : 1): ContributionDay {
  return { date, count, level }
}

/** Consecutive days starting at `start` (UTC), one count per entry. */
function series(start: string, counts: readonly number[]): ContributionDay[] {
  const base = new Date(`${start}T00:00:00Z`).getTime()
  return counts.map((count, i) => day(new Date(base + i * 86_400_000).toISOString().slice(0, 10), count))
}

describe('formatting', () => {
  it('uses en-US thousands separators', () => {
    expect(formatCount(4282)).toBe('4,282')
  })

  it('pluralises contributions', () => {
    expect(contributionsLabel(1)).toBe('1 contribution')
    expect(contributionsLabel(0)).toBe('0 contributions')
    expect(dayReadout(day('2026-10-11', 20))).toBe('2026-10-11 · 20 contributions')
  })
})

describe('buildWeeks', () => {
  it('returns nothing for no days', () => {
    expect(buildWeeks([])).toEqual([])
  })

  it('puts Sunday on row 0 and pads the edges with nulls', () => {
    // 2026-10-07 is a Wednesday; 2026-10-11 a Sunday.
    const weeks = buildWeeks(series('2026-10-07', [1, 2, 3, 4, 5]))
    expect(weeks).toHaveLength(2)
    expect(weeks.every((week) => week.length === DAYS_PER_WEEK)).toBe(true)
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null])
    expect(weeks[0][3]?.date).toBe('2026-10-07')
    expect(weeks[1][0]?.date).toBe('2026-10-11')
    expect(weeks[1].slice(1)).toEqual(Array(6).fill(null))
  })

  it('lays a 365-day year starting on a Sunday out in 53 columns', () => {
    const weeks = buildWeeks(series('2025-10-12', Array(365).fill(0)))
    expect(weeks).toHaveLength(53)
  })
})

describe('lastWeeks', () => {
  it('keeps the trailing weeks', () => {
    const weeks = buildWeeks(series('2025-10-12', Array(365).fill(1)))
    const tail = lastWeeks(weeks, 26)
    expect(tail).toHaveLength(26)
    expect(tail[25]).toBe(weeks[52])
  })

  it('pads short input with empty weeks at the start', () => {
    const weeks = buildWeeks(series('2026-10-11', [3]))
    const padded = lastWeeks(weeks, 3)
    expect(padded).toHaveLength(3)
    expect(padded[0].every((cell) => cell === null)).toBe(true)
    expect(padded[2]).toBe(weeks[0])
  })
})

describe('computeStats', () => {
  it('derives totals, active days, the longest streak and the busiest day', () => {
    const days = series('2026-01-01', [1, 2, 0, 5, 5, 1, 0, 9])
    expect(computeStats(days)).toEqual({
      total: 23,
      totalDays: 8,
      activeDays: 6,
      longestStreak: { length: 3, from: '2026-01-04', to: '2026-01-06' },
      busiestDay: days[7],
    })
  })

  it('keeps the earliest busiest day on ties', () => {
    const days = series('2026-01-01', [4, 4])
    expect(computeStats(days).busiestDay?.date).toBe('2026-01-01')
  })

  it('breaks a streak across a gap in the dates', () => {
    const days = [day('2026-01-01', 1), day('2026-01-02', 1), day('2026-01-05', 1)]
    expect(computeStats(days).longestStreak).toEqual({ length: 2, from: '2026-01-01', to: '2026-01-02' })
  })

  it('reports no streak or busiest day without activity', () => {
    const stats = computeStats(series('2026-01-01', [0, 0]))
    expect(stats.longestStreak).toBeNull()
    expect(stats.busiestDay).toBeNull()
    expect(stats.activeDays).toBe(0)
  })
})

describe('legendEntries', () => {
  it('reports the real count range of every level present', () => {
    const days = [
      day('2026-01-01', 0, 0),
      day('2026-01-02', 1, 1),
      day('2026-01-03', 3, 1),
      day('2026-01-04', 40, 4),
    ]
    const entries = legendEntries(days)
    expect(entries).toEqual([
      { level: 0, min: 0, max: 0 },
      { level: 1, min: 1, max: 3 },
      { level: 4, min: 40, max: 40 },
    ])
    expect(entries.map(legendRange)).toEqual(['0', '1–3', '40'])
  })
})

describe('monthTicks', () => {
  it('labels columns holding the 1st and the leading partial month when it fits', () => {
    // Starts Sunday 2025-10-12; Nov 1 2025 falls in column 2 (too close for "Oct").
    const ticks = monthTicks(buildWeeks(series('2025-10-12', Array(365).fill(0))))
    expect(ticks[0]).toEqual({ col: 2, label: 'Nov' })
    expect(ticks.map((tick) => tick.label)).toEqual([
      'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
    ])
  })

  it('adds the first month when the first full month starts later', () => {
    const ticks = monthTicks(buildWeeks(series('2026-01-04', Array(60).fill(0))))
    expect(ticks[0]).toEqual({ col: 0, label: 'Jan' })
    expect(ticks[1].label).toBe('Feb')
  })
})

describe('monthlySummary', () => {
  it('groups totals and active days by month', () => {
    const days = [day('2026-01-30', 2), day('2026-01-31', 0), day('2026-02-01', 5)]
    expect(monthlySummary(days)).toEqual([
      { key: '2026-01', label: 'Jan 2026', total: 2, activeDays: 1 },
      { key: '2026-02', label: 'Feb 2026', total: 5, activeDays: 1 },
    ])
  })
})
