import { VISITOR_HOURS } from './constants'
import { hourKey, isHourKey, lastHourKeys } from './time'
import type { SeenResponse } from './types'

/** Redis hands back numbers, numeric strings or null; anything else is 0. */
export function toCount(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
}

/**
 * Turn raw Redis values into the public GET /api/seen body.
 * `rawCounts[i]` belongs to `lastHourKeys(now, hours)[i]`. Hours before the
 * first recorded hour are null so the graph can tell "no data yet" from "0".
 */
export function shapeResponse(
  rawCounts: readonly unknown[],
  total: unknown,
  since: unknown,
  now: Date,
  hours: number = VISITOR_HOURS,
): SeenResponse {
  const hour = hourKey(now)
  const start = isHourKey(since) && since <= hour ? since : hour
  return {
    hour,
    hours: lastHourKeys(now, hours).map((key, i) => (key < start ? null : toCount(rawCounts[i]))),
    total: toCount(total),
    since: start,
  }
}
