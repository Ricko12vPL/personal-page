// Pure functions over the contribution snapshot. Shared by the server figure
// (stats, legend, axis, sr-only table) and the client canvas (grid, colours).
import type { ContributionDay } from './snapshot'

export type Week = readonly (ContributionDay | null)[]

export const DAYS_PER_WEEK = 7
export const DESKTOP_WEEKS = 53
export const MOBILE_WEEKS = 26
export const MIN_DESKTOP_WIDTH = 700

/** Level 0 is the dim dot; 1–4 climb in green intensity up to the accent. */
export const LEVEL_COLORS = [
  '#262626',
  'rgba(0, 255, 65, 0.30)',
  'rgba(0, 255, 65, 0.50)',
  'rgba(0, 255, 65, 0.74)',
  '#00ff41',
] as const

export const DIM_GLYPH = '·'
export const LEGEND_GLYPH = 'ｱ'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86_400_000
const MIN_TICK_GAP = 3

const numberFormat = new Intl.NumberFormat('en-US')

export function formatCount(value: number): string {
  return numberFormat.format(value)
}

export function contributionsLabel(count: number): string {
  return `${formatCount(count)} contribution${count === 1 ? '' : 's'}`
}

export function dayReadout(day: ContributionDay): string {
  return `${day.date} · ${contributionsLabel(day.count)}`
}

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

/** GitHub layout: one column per week, Sunday on row 0, nulls outside the range. */
export function buildWeeks(days: readonly ContributionDay[]): Week[] {
  if (days.length === 0) return []
  const leading = utc(days[0].date).getUTCDay()
  const trailing = (DAYS_PER_WEEK - ((leading + days.length) % DAYS_PER_WEEK)) % DAYS_PER_WEEK
  const cells: (ContributionDay | null)[] = [
    ...Array<null>(leading).fill(null),
    ...days,
    ...Array<null>(trailing).fill(null),
  ]
  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_, col) =>
    cells.slice(col * DAYS_PER_WEEK, (col + 1) * DAYS_PER_WEEK)
  )
}

/** The trailing `count` weeks, padded with empty weeks at the start if short. */
export function lastWeeks(weeks: readonly Week[], count: number): Week[] {
  const tail = weeks.slice(Math.max(0, weeks.length - count))
  const empty: Week = Array<null>(DAYS_PER_WEEK).fill(null)
  return [...Array.from({ length: count - tail.length }, () => empty), ...tail]
}

export interface MonthTick {
  col: number
  label: string
}

/** A label over every column that contains the 1st of a month (+ the first column). */
export function monthTicks(weeks: readonly Week[]): MonthTick[] {
  const ticks = weeks.flatMap((week, col) => {
    const first = week.find((day) => day !== null && utc(day.date).getUTCDate() === 1)
    return first ? [{ col, label: MONTHS[utc(first.date).getUTCMonth()] }] : []
  })
  const firstDay = weeks[0]?.find((day) => day !== null)
  const leadFits = ticks.length === 0 || ticks[0].col >= MIN_TICK_GAP
  if (!firstDay || ticks[0]?.col === 0 || !leadFits) return ticks
  return [{ col: 0, label: MONTHS[utc(firstDay.date).getUTCMonth()] }, ...ticks]
}

export interface Streak {
  length: number
  from: string
  to: string
}

export interface ContributionStats {
  total: number
  totalDays: number
  activeDays: number
  longestStreak: Streak | null
  busiestDay: ContributionDay | null
}

function isNextDay(prev: ContributionDay, next: ContributionDay): boolean {
  return utc(next.date).getTime() - utc(prev.date).getTime() === DAY_MS
}

function longestStreak(days: readonly ContributionDay[]): Streak | null {
  const best = days.reduce<{ best: Streak | null; run: Streak | null; prev: ContributionDay | null }>(
    (acc, day) => {
      if (day.count === 0) return { ...acc, run: null, prev: day }
      const continues = acc.run !== null && acc.prev !== null && isNextDay(acc.prev, day)
      const run: Streak = continues && acc.run
        ? { ...acc.run, length: acc.run.length + 1, to: day.date }
        : { length: 1, from: day.date, to: day.date }
      const bestSoFar = acc.best === null || run.length > acc.best.length ? run : acc.best
      return { best: bestSoFar, run, prev: day }
    },
    { best: null, run: null, prev: null }
  )
  return best.best
}

export function computeStats(days: readonly ContributionDay[]): ContributionStats {
  const busiestDay = days.reduce<ContributionDay | null>(
    (best, day) => (day.count > 0 && (best === null || day.count > best.count) ? day : best),
    null
  )
  return {
    total: days.reduce((sum, day) => sum + day.count, 0),
    totalDays: days.length,
    activeDays: days.filter((day) => day.count > 0).length,
    longestStreak: longestStreak(days),
    busiestDay,
  }
}

export interface LegendEntry {
  level: number
  min: number
  max: number
}

/** The count range GitHub actually assigned to each level in this snapshot. */
export function legendEntries(days: readonly ContributionDay[]): LegendEntry[] {
  return LEVEL_COLORS.flatMap((_, level) => {
    const counts = days.filter((day) => day.level === level).map((day) => day.count)
    return counts.length === 0
      ? []
      : [{ level, min: Math.min(...counts), max: Math.max(...counts) }]
  })
}

export function legendRange({ min, max }: LegendEntry): string {
  return min === max ? formatCount(min) : `${formatCount(min)}–${formatCount(max)}`
}

export interface MonthSummary {
  key: string
  label: string
  total: number
  activeDays: number
}

export function monthlySummary(days: readonly ContributionDay[]): MonthSummary[] {
  const keys = [...new Set(days.map((day) => day.date.slice(0, 7)))]
  return keys.map((key) => {
    const inMonth = days.filter((day) => day.date.startsWith(key))
    const [year, month] = key.split('-')
    return {
      key,
      label: `${MONTHS[Number(month) - 1]} ${year}`,
      total: inMonth.reduce((sum, day) => sum + day.count, 0),
      activeDays: inMonth.filter((day) => day.count > 0).length,
    }
  })
}
