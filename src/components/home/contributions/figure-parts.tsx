// Server-rendered pieces of fig. 1 that do not need the canvas.
import {
  LEGEND_GLYPH,
  DIM_GLYPH,
  LEVEL_COLORS,
  contributionsLabel,
  formatCount,
  legendRange,
  type ContributionStats,
  type LegendEntry,
  type MonthSummary,
  type MonthTick,
  type Streak,
} from './calendar-model'

const WEEKDAY_ROWS = [
  { row: 2, label: 'mon' },
  { row: 4, label: 'wed' },
  { row: 6, label: 'fri' },
]

export function WeekdayLabels() {
  return (
    <div
      aria-hidden="true"
      className="hidden grid-rows-7 min-[700px]:col-start-1 min-[700px]:row-start-1 min-[700px]:grid"
    >
      {WEEKDAY_ROWS.map(({ row, label }) => (
        <span key={label} className="label self-center" style={{ gridRow: row }}>
          {label}
        </span>
      ))}
    </div>
  )
}

interface MonthAxisProps {
  ticks: readonly MonthTick[]
  cols: number
  className: string
}

export function MonthAxis({ ticks, cols, className }: MonthAxisProps) {
  return (
    <div aria-hidden="true" className={`relative mt-2 h-4 ${className}`}>
      {ticks.map((tick) => (
        <span
          key={`${tick.col}-${tick.label}`}
          className="label absolute top-0"
          style={{ left: `${(tick.col / cols) * 100}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  )
}

export function Legend({ entries }: { entries: readonly LegendEntry[] }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tabular-nums">
      <dt className="label">levels</dt>
      {entries.map((entry) => (
        <dd key={entry.level} className="flex items-center gap-1.5 text-neutral-400">
          <span aria-hidden="true" style={{ color: LEVEL_COLORS[entry.level] }}>
            {entry.level === 0 ? DIM_GLYPH : LEGEND_GLYPH}
          </span>
          <span>{legendRange(entry)}</span>
        </dd>
      ))}
    </dl>
  )
}

interface StatProps {
  label: string
  value: string
  note: string
}

function Stat({ label, value, note }: StatProps) {
  return (
    <div className="min-w-0 border-t hairline pt-3">
      <dt className="label">{label}</dt>
      <dd className="mt-1.5 text-[20px] leading-none num">{value}</dd>
      <dd className="mt-1.5 truncate text-[11px] text-neutral-400">{note}</dd>
    </div>
  )
}

/** "2025-11-06 → 12-06" — the year is dropped from the end when it repeats. */
function streakRange({ from, to }: Streak): string {
  return to.slice(0, 4) === from.slice(0, 4) ? `${from} → ${to.slice(5)}` : `${from} → ${to}`
}

export function StatsRow({ stats }: { stats: ContributionStats }) {
  const share = stats.totalDays > 0 ? Math.round((stats.activeDays / stats.totalDays) * 100) : 0
  const streak = stats.longestStreak
  const busiest = stats.busiestDay
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      <Stat label="contributions" value={formatCount(stats.total)} note={`${stats.totalDays} days`} />
      <Stat
        label="active days"
        value={formatCount(stats.activeDays)}
        note={`${share}% of ${stats.totalDays}`}
      />
      <Stat
        label="longest streak"
        value={streak ? `${streak.length} d` : '—'}
        note={streak ? streakRange(streak) : 'no active days'}
      />
      <Stat
        label="busiest day"
        value={busiest ? formatCount(busiest.count) : '—'}
        note={busiest ? busiest.date : 'no active days'}
      />
    </dl>
  )
}

interface MonthlyTableProps {
  months: readonly MonthSummary[]
  login: string
  /** true = on-screen table (the no-JS fallback); default is screen-reader only. */
  visible?: boolean
}

const VISIBLE_TABLE = 'w-full text-left text-[12px] tabular-nums text-neutral-300 [&_td]:py-1 [&_th]:py-1 [&_th]:pr-4 [&_th]:font-normal [&_td]:pr-4 [&_tr]:border-b [&_tr]:border-[var(--hairline)]'

export function MonthlyTable({ months, login, visible = false }: MonthlyTableProps) {
  return (
    // Wrapped: a table ignores sr-only's 1px width and would widen the page.
    <div className={visible ? 'mt-6 overflow-x-auto' : 'sr-only'}>
      <table className={visible ? VISIBLE_TABLE : undefined}>
        <caption className={visible ? 'label mb-2 text-left' : undefined}>
          Contributions per month for GitHub user {login}
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Contributions</th>
            <th scope="col">Active days</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key}>
              <th scope="row">{month.label}</th>
              <td>{contributionsLabel(month.total)}</td>
              <td>{month.activeDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
