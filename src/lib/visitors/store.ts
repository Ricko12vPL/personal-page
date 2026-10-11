import type { Redis } from '@upstash/redis'
import { VISITOR_HOURS } from './constants'
import {
  DEDUPE_TTL_S,
  HOUR_TTL_S,
  RATE_LIMIT,
  RATE_TTL_S,
  SINCE_KEY,
  TOTAL_KEY,
  dedupeBucketKey,
  hourBucketKey,
  rateBucketKey,
} from './keys'
import { shapeResponse } from './shape'
import { lastHourKeys } from './time'
import type { SeenResponse } from './types'

/** The slice of the Upstash client the counter uses (lets tests fake it). */
export type VisitorRedis = Pick<Redis, 'set' | 'pipeline'>

/**
 * Per-address throttle, checked before the de-dupe marker: the de-dupe key
 * includes the (client-chosen) user agent, so without this one address could
 * rotate its UA and be counted on every request. Throws on Redis errors.
 */
export async function withinIpLimit(redis: VisitorRedis, addressHash: string): Promise<boolean> {
  const key = rateBucketKey(addressHash)
  const [count] = await redis.pipeline().incr(key).expire(key, RATE_TTL_S).exec<[number, number]>()
  return Number(count) <= RATE_LIMIT
}

/**
 * Count one visit unless this visitor hash was seen in the last 30 minutes.
 * Returns whether the visit was counted. Throws on Redis errors — the caller
 * decides how loud to be.
 */
export async function recordVisit(
  redis: VisitorRedis,
  visitorHash: string,
  hour: string,
): Promise<boolean> {
  const fresh = await redis.set(dedupeBucketKey(visitorHash), 1, { nx: true, ex: DEDUPE_TTL_S })
  if (fresh !== 'OK') return false
  const bucket = hourBucketKey(hour)
  await redis
    .pipeline()
    .incr(bucket)
    .expire(bucket, HOUR_TTL_S)
    .incr(TOTAL_KEY)
    .set(SINCE_KEY, hour, { nx: true })
    .exec()
  return true
}

/** Read the last 56 hour buckets, the total and the start hour in one round trip. */
export async function readVisitors(redis: VisitorRedis, now: Date): Promise<SeenResponse> {
  const keys = lastHourKeys(now, VISITOR_HOURS).map(hourBucketKey)
  const [counts, total, since] = await redis
    .pipeline()
    .mget(...keys)
    .get(TOTAL_KEY)
    .get(SINCE_KEY)
    .exec<[unknown[] | null, unknown, unknown]>()
  return shapeResponse(Array.isArray(counts) ? counts : [], total, since, now)
}
