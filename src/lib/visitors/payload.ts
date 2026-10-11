import { isHourKey } from './time'
import type { SeenResponse } from './types'

// Client-safe validation of a GET /api/seen body before it is rendered.
const MAX_HOURS = 24 * 14

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isHourSeries(value: unknown): value is (number | null)[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_HOURS &&
    value.every((entry) => entry === null || isCount(entry))
  )
}

export function parseSeenResponse(value: unknown): SeenResponse | null {
  if (typeof value !== 'object' || value === null) return null
  const { hour, hours, total, since } = value as Record<string, unknown>
  if (!isHourKey(hour) || !isHourKey(since) || !isCount(total) || !isHourSeries(hours)) {
    return null
  }
  return { hour, hours: [...hours], total, since }
}
