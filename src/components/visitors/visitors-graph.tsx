'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { COMPACT_HOURS, VISITOR_HOURS } from '@/lib/visitors/constants'
import { formatCount, visitorsAriaLabel, visitorsTooltip } from '@/lib/visitors/format'
import { SPARK, sparklineWidth } from '@/lib/visitors/sparkline'
import { SparklineCanvas } from './sparkline-canvas'
import {
  getServerVisitorsSnapshot,
  getVisitorsSnapshot,
  subscribeVisitors,
} from './visitors-store'

export interface VisitorsGraphProps {
  /** 'bar' = desktop status bar (56 h), 'compact' = narrow screens (28 h). */
  variant?: 'bar' | 'compact'
}

// 12px label row + 1px gap + 14px sparkline = 27px, centred in the 34px status
// bar (33px inside its top hairline) so it clears both edges by 3px.
const ROW_STYLE = { lineHeight: '12px', height: 12 } as const

/**
 * Status-bar visitor counter: label + all-time total over a per-hour
 * sparkline. Renders "—" (no canvas) until data arrives or when the counter
 * is unavailable; the footprint stays the same so the bar never reflows.
 */
export function VisitorsGraph({ variant = 'bar' }: VisitorsGraphProps) {
  const snapshot = useSyncExternalStore(
    subscribeVisitors,
    getVisitorsSnapshot,
    getServerVisitorsSnapshot,
  )
  const compact = variant === 'compact'
  const bars = compact ? COMPACT_HOURS : VISITOR_HOURS
  const width = sparklineWidth(bars)
  const data = snapshot.status === 'ready' ? snapshot.data : null
  const hours = useMemo(() => (data ? data.hours.slice(-bars) : null), [data, bars])

  return (
    <span
      role="group"
      aria-label={visitorsAriaLabel(data, bars, snapshot.status)}
      title={visitorsTooltip(data, snapshot.status)}
      data-variant={variant}
      className="print-hidden inline-flex flex-col gap-px align-middle"
      style={{ minWidth: width }}
    >
      <span className="flex items-baseline justify-between gap-3" style={ROW_STYLE} aria-hidden="true">
        <span className="label whitespace-nowrap" style={ROW_STYLE}>
          {compact ? 'VISITORS' : `VISITORS · ${VISITOR_HOURS} H`}
        </span>
        <span className={`text-[10px] ${data ? 'num' : 'text-neutral-400'}`} style={ROW_STYLE}>
          {data ? formatCount(data.total) : '—'}
        </span>
      </span>
      {hours ? (
        <SparklineCanvas hours={hours} width={width} />
      ) : (
        <span aria-hidden="true" className="block" style={{ width, height: SPARK.height }} />
      )}
    </span>
  )
}
