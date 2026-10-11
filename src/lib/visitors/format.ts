import { PRIVACY_NOTE } from './constants'
import type { SeenResponse } from './types'

// Client-safe text for the visitors widget. en-US grouping on purpose
// (142,967), never locale-dependent, so server and client render the same.
const COUNT_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** Where the widget is: still fetching, showing data, or given up. */
export type VisitorsStatus = 'loading' | 'ready' | 'unavailable'

export function formatCount(value: number): string {
  return COUNT_FORMAT.format(value)
}

/** "2026-09-26T00" → "09-26". */
export function sinceLabel(since: string): string {
  return since.slice(5, 10)
}

function missingWord(status: VisitorsStatus): string {
  return status === 'loading' ? 'loading' : 'unavailable'
}

export function visitorsTooltip(data: SeenResponse | null, status: VisitorsStatus = 'unavailable'): string {
  const head = data
    ? `visitors per hour · ${formatCount(data.total)} since ${sinceLabel(data.since)}`
    : `visitors per hour · ${missingWord(status)}`
  return `${head}\n${PRIVACY_NOTE}`
}

export function visitorsAriaLabel(
  data: SeenResponse | null,
  hours: number,
  status: VisitorsStatus = 'unavailable',
): string {
  if (!data) return `Visitors: ${missingWord(status)}`
  const latest = data.hours[data.hours.length - 1] ?? 0
  return (
    `Visitors: ${formatCount(data.total)} since ${sinceLabel(data.since)}; ` +
    `${formatCount(latest)} in the current hour; graph of the last ${hours} hours`
  )
}
