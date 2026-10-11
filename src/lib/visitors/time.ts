// Hour buckets are keyed by UTC so the count never depends on where the
// server (or the visitor) is. Format: "YYYY-MM-DDTHH" — fixed width, so plain
// string comparison orders keys chronologically.
const HOUR_MS = 3_600_000
const MAX_WINDOW_HOURS = 24 * 366
const HOUR_KEY = /^\d{4}-\d{2}-\d{2}T\d{2}$/

export function hourKey(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new RangeError('hourKey: invalid date')
  return date.toISOString().slice(0, 13)
}

export function dayKey(date: Date): string {
  return hourKey(date).slice(0, 10)
}

export function isHourKey(value: unknown): value is string {
  return typeof value === 'string' && HOUR_KEY.test(value)
}

/** The last `n` hour keys, oldest → newest; the final key is `now`'s hour. */
export function lastHourKeys(now: Date, n: number): string[] {
  if (!Number.isFinite(n) || n < 1) return []
  const count = Math.min(Math.floor(n), MAX_WINDOW_HOURS)
  const currentHour = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS
  return Array.from({ length: count }, (_, i) =>
    hourKey(new Date(currentHour - (count - 1 - i) * HOUR_MS)),
  )
}
