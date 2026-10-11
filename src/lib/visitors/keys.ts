// Redis key layout for the visitor counter (server-only).
export const TOTAL_KEY = 'seen:total'
export const SINCE_KEY = 'seen:since'

/** De-dupe marker lifetime: one visit per visitor per 30 minutes. */
export const DEDUPE_TTL_S = 1_800
/** Hour buckets live 60 h, a little longer than the 56 h graph needs. */
export const HOUR_TTL_S = 216_000

/** Per-address throttle: at most this many beacons per address per window. */
export const RATE_LIMIT = 10
export const RATE_TTL_S = 3_600

export function hourBucketKey(hour: string): string {
  return `seen:h:${hour}`
}

export function dedupeBucketKey(visitorHash: string): string {
  return `seen:d:${visitorHash}`
}

export function rateBucketKey(addressHash: string): string {
  return `seen:r:${addressHash}`
}
