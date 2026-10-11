import type { Redis } from '@upstash/redis'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEDUPE_TTL_S, HOUR_TTL_S, RATE_LIMIT, RATE_TTL_S, SINCE_KEY, TOTAL_KEY } from './keys'
import { readVisitors, recordVisit, withinIpLimit } from './store'
import { FakeRedis } from './testing/fake-redis'

const HASH = 'a'.repeat(64)
const NOW = new Date('2026-10-11T19:42:00Z')

describe('recordVisit', () => {
  let fake: FakeRedis

  beforeEach(() => {
    fake = new FakeRedis()
    fake.clock = () => NOW.getTime()
  })

  it('counts a new visitor in the hour bucket and the total', async () => {
    await expect(recordVisit(fake.asRedis(), HASH, '2026-10-11T19')).resolves.toBe(true)
    expect(fake.getSync('seen:h:2026-10-11T19')).toBe(1)
    expect(fake.getSync(TOTAL_KEY)).toBe(1)
    expect(fake.getSync(SINCE_KEY)).toBe('2026-10-11T19')
  })

  it('sets the de-dupe marker with a 30-minute TTL and the bucket with 60 h', async () => {
    await recordVisit(fake.asRedis(), HASH, '2026-10-11T19')
    expect(fake.ttl(`seen:d:${HASH}`)).toBe(DEDUPE_TTL_S)
    expect(fake.ttl('seen:h:2026-10-11T19')).toBe(HOUR_TTL_S)
    expect(fake.ttl(TOTAL_KEY)).toBe(-1)
  })

  it('stores only the hash, never anything else about the visitor', async () => {
    await recordVisit(fake.asRedis(), HASH, '2026-10-11T19')
    expect(fake.keys().sort()).toEqual(
      [`seen:d:${HASH}`, 'seen:h:2026-10-11T19', SINCE_KEY, TOTAL_KEY].sort(),
    )
  })

  it('does not count the same visitor twice inside the window', async () => {
    await recordVisit(fake.asRedis(), HASH, '2026-10-11T19')
    await expect(recordVisit(fake.asRedis(), HASH, '2026-10-11T19')).resolves.toBe(false)
    expect(fake.getSync(TOTAL_KEY)).toBe(1)
  })

  it('counts the same visitor again once the marker expires', async () => {
    await recordVisit(fake.asRedis(), HASH, '2026-10-11T19')
    fake.clock = () => NOW.getTime() + (DEDUPE_TTL_S + 1) * 1000
    await expect(recordVisit(fake.asRedis(), HASH, '2026-10-11T20')).resolves.toBe(true)
    expect(fake.getSync(TOTAL_KEY)).toBe(2)
  })

  it('keeps the first `since` forever', async () => {
    await recordVisit(fake.asRedis(), HASH, '2026-10-11T19')
    await recordVisit(fake.asRedis(), 'b'.repeat(64), '2026-10-11T20')
    expect(fake.getSync(SINCE_KEY)).toBe('2026-10-11T19')
  })

  it('propagates Redis errors to the caller', async () => {
    fake.failure = new Error('redis down')
    await expect(recordVisit(fake.asRedis(), HASH, '2026-10-11T19')).rejects.toThrow('redis down')
  })
})

describe('readVisitors', () => {
  it('reads the 56-hour window, total and since in one pipeline', async () => {
    const fake = new FakeRedis()
    fake.setSync('seen:h:2026-10-11T19', 5)
    fake.setSync('seen:h:2026-10-11T18', 2)
    fake.setSync(TOTAL_KEY, 1234)
    fake.setSync(SINCE_KEY, '2026-10-10T00')

    const body = await readVisitors(fake.asRedis(), NOW)

    expect(fake.commands).toEqual(['exec'])
    expect(body.hour).toBe('2026-10-11T19')
    expect(body.hours).toHaveLength(56)
    expect(body.hours.slice(-2)).toEqual([2, 5])
    expect(body.total).toBe(1234)
    expect(body.since).toBe('2026-10-10T00')
    // Window starts 2026-10-09T12; the 12 hours before `since` are null.
    expect(body.hours.slice(0, 12).every((h) => h === null)).toBe(true)
    expect(body.hours[12]).toBe(0)
  })

  it('tolerates a null MGET result', async () => {
    const stub = {
      pipeline: () => {
        const chain = {
          mget: () => chain,
          get: () => chain,
          exec: async () => [null, 7, '2026-10-11T00'],
        }
        return chain
      },
    }
    const body = await readVisitors(stub as unknown as Redis, NOW)
    expect(body.total).toBe(7)
    expect(body.hours[55]).toBe(0)
  })

  it('returns an empty-but-valid body on a fresh database', async () => {
    const body = await readVisitors(new FakeRedis().asRedis(), NOW)
    expect(body.total).toBe(0)
    expect(body.since).toBe('2026-10-11T19')
    expect(body.hours[55]).toBe(0)
  })
})

describe('withinIpLimit', () => {
  let fake: FakeRedis

  beforeEach(() => {
    fake = new FakeRedis()
    fake.clock = () => NOW.getTime()
  })

  it(`allows ${RATE_LIMIT} beacons per address, then refuses`, async () => {
    const results: boolean[] = []
    for (let i = 0; i < RATE_LIMIT + 2; i += 1) results.push(await withinIpLimit(fake.asRedis(), HASH))
    expect(results.filter(Boolean)).toHaveLength(RATE_LIMIT)
    expect(results.slice(-2)).toEqual([false, false])
  })

  it('keeps the counter under seen:r:<hash> with a one-hour TTL', async () => {
    await withinIpLimit(fake.asRedis(), HASH)
    expect(fake.getSync(`seen:r:${HASH}`)).toBe(1)
    expect(fake.ttl(`seen:r:${HASH}`)).toBe(RATE_TTL_S)
  })

  it('counts each address separately', async () => {
    for (let i = 0; i < RATE_LIMIT; i += 1) await withinIpLimit(fake.asRedis(), HASH)
    await expect(withinIpLimit(fake.asRedis(), 'b'.repeat(64))).resolves.toBe(true)
  })

  it('propagates Redis errors to the caller', async () => {
    fake.failure = new Error('redis down')
    await expect(withinIpLimit(fake.asRedis(), HASH)).rejects.toThrow('redis down')
  })
})
