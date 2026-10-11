import { REFRESH_AFTER_MS } from './constants'

/** True when the graph has never loaded or its data is older than `maxAgeMs`. */
export function shouldRefresh(
  lastFetchedAt: number,
  now: number,
  maxAgeMs: number = REFRESH_AFTER_MS,
): boolean {
  return lastFetchedAt <= 0 || now - lastFetchedAt > maxAgeMs
}
