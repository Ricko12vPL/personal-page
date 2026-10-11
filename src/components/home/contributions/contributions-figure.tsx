// fig. 1 — the GitHub contribution calendar in the site's matrix-glyph motif.
// Everything shown is derived from the committed snapshot; nothing is typed in.
import {
  DESKTOP_WEEKS,
  MOBILE_WEEKS,
  buildWeeks,
  computeStats,
  contributionsLabel,
  formatCount,
  lastWeeks,
  legendEntries,
  monthTicks,
  monthlySummary,
  type ContributionStats,
  type Week,
} from './calendar-model'
import { GlyphCalendar } from './glyph-calendar'
import { Legend, MonthAxis, MonthlyTable, StatsRow, WeekdayLabels } from './figure-parts'
import type { GithubSnapshot } from './snapshot'

const HINT = 'hover or tap a glyph · arrow keys when focused'

function ariaSummary(snapshot: GithubSnapshot, stats: ContributionStats): string {
  const { from, to } = snapshot.contributions
  const streak = stats.longestStreak ? `longest streak ${stats.longestStreak.length} days` : ''
  const busiest = stats.busiestDay
    ? `busiest day ${stats.busiestDay.date} with ${contributionsLabel(stats.busiestDay.count)}`
    : ''
  return [
    `GitHub contribution calendar for ${snapshot.login}, ${from} to ${to}`,
    `${contributionsLabel(stats.total)} on ${formatCount(stats.activeDays)} of ${stats.totalDays} days`,
    streak,
    busiest,
  ]
    .filter(Boolean)
    .join('; ')
}

/** First real day in a run of weeks (the oldest week may start mid-week). */
function firstDay(weeks: readonly Week[]): string | null {
  for (const week of weeks) {
    const day = week.find((d) => d !== null)
    if (day) return day.date
  }
  return null
}

function FigureCaption({ snapshot }: { snapshot: GithubSnapshot }) {
  const profileUrl = `https://github.com/${snapshot.login}`
  return (
    <figcaption className="mt-3 text-left text-[11px] leading-relaxed text-neutral-400">
      <span className="text-neutral-300">fig. 1</span> — contributions, last 12 months · 1 glyph = 1
      day · source:{' '}
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
      >
        GitHub public calendar for {snapshot.login}
      </a>
      , snapshot {snapshot.checkedAt}
    </figcaption>
  )
}

export function ContributionsFigure({ snapshot }: { snapshot: GithubSnapshot | null }) {
  if (!snapshot) {
    return (
      <figure className="panel panel-ticks p-6">
        <p className="text-left text-[13px] text-neutral-400">
          fig. 1 — contribution snapshot unavailable.
        </p>
      </figure>
    )
  }

  const { days, from, to } = snapshot.contributions
  const weeks = lastWeeks(buildWeeks(days), DESKTOP_WEEKS)
  const mobileWeeks = lastWeeks(weeks, MOBILE_WEEKS)
  const mobileFrom = firstDay(mobileWeeks) ?? from
  const stats = computeStats(days)

  return (
    <figure>
      <div className="panel panel-ticks p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="label text-left">
            <span className="text-accent">fig. 1</span> · github activity · {snapshot.login}
          </p>
          <p className="label hidden text-left tabular-nums min-[700px]:block">
            {from} → {to}
          </p>
          {/* Narrow screens draw only the newest 26 weeks; the stats stay 12 months. */}
          <p className="label text-left tabular-nums min-[700px]:hidden">
            {mobileFrom} → {to} · grid {MOBILE_WEEKS} wk · stats 12 mo
          </p>
        </div>
        <GlyphCalendar
          weeks={weeks}
          label={ariaSummary(snapshot, stats)}
          hint={HINT}
          weekdays={<WeekdayLabels />}
          axis={
            <>
              <MonthAxis
                ticks={monthTicks(weeks)}
                cols={DESKTOP_WEEKS}
                className="hidden min-[700px]:col-start-2 min-[700px]:row-start-2 min-[700px]:block"
              />
              <MonthAxis ticks={monthTicks(mobileWeeks)} cols={MOBILE_WEEKS} className="min-[700px]:hidden" />
            </>
          }
          legend={<Legend entries={legendEntries(days)} />}
        />
        <div className="mt-6">
          <StatsRow stats={stats} />
        </div>
        <MonthlyTable months={monthlySummary(days)} login={snapshot.login} />
        {/* Without JavaScript the canvas stays blank: show the same numbers as a table. */}
        <noscript>
          <MonthlyTable months={monthlySummary(days)} login={snapshot.login} visible />
        </noscript>
      </div>
      <FigureCaption snapshot={snapshot} />
    </figure>
  )
}
