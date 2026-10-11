import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeRedis } from '@/lib/visitors/testing/fake-redis'

const mocks = vi.hoisted(() => ({ getVisitorStore: vi.fn() }))
vi.mock('@/lib/visitors/redis', () => ({ getVisitorStore: mocks.getVisitorStore }))

import { GET, POST, dynamic, maxDuration, runtime } from './route'

const NOW = new Date('2026-10-11T19:42:00Z')
const URL_ = 'https://kacpersaks.dev/api/seen'
const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'

function beacon(overrides: Record<string, string | null> = {}): Request {
  const base: Record<string, string | null> = {
    host: 'kacpersaks.dev',
    'user-agent': CHROME,
    'sec-fetch-site': 'same-origin',
    origin: 'https://kacpersaks.dev',
    'x-forwarded-for': '203.0.113.7, 10.0.0.1',
  }
  const merged = Object.entries({ ...base, ...overrides }).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  )
  return new Request(URL_, { method: 'POST', headers: new Headers(merged) })
}

let fake: FakeRedis

function configure(redis: FakeRedis | null): void {
  mocks.getVisitorStore.mockReturnValue(
    redis ? { redis: redis.asRedis(), salt: 'test-salt' } : null,
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  fake = new FakeRedis()
  configure(fake)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

function getRequest(query = ''): Request {
  return new Request(URL_ + query)
}

describe('route config', () => {
  it('is dynamic, runs on node and has a short maxDuration', () => {
    expect(dynamic).toBe('force-dynamic')
    expect(runtime).toBe('nodejs')
    expect(maxDuration).toBeLessThanOrEqual(10)
  })
})

describe('POST /api/seen', () => {
  it('counts a same-origin browser visit once and answers 204', async () => {
    const res = await POST(beacon())
    expect(res.status).toBe(204)
    expect(await res.text()).toBe('')
    expect(fake.getSync('seen:total')).toBe(1)
    expect(fake.getSync('seen:h:2026-10-11T19')).toBe(1)
    expect(fake.getSync('seen:since')).toBe('2026-10-11T19')
  })

  it('de-dupes a second beacon from the same visitor', async () => {
    await POST(beacon())
    const res = await POST(beacon())
    expect(res.status).toBe(204)
    expect(fake.getSync('seen:total')).toBe(1)
  })

  it('counts a different visitor separately', async () => {
    await POST(beacon())
    await POST(beacon({ 'x-forwarded-for': '198.51.100.9' }))
    expect(fake.getSync('seen:total')).toBe(2)
  })

  it('never stores the raw IP or user agent', async () => {
    await POST(beacon())
    const keys = fake.keys().join(' ')
    expect(keys).not.toContain('203.0.113.7')
    expect(keys).not.toContain('Mozilla')
    expect(fake.keys().find((k) => k.startsWith('seen:d:'))).toMatch(/^seen:d:[0-9a-f]{64}$/)
  })

  it.each([
    ['a crawler', { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }],
    ['curl', { 'user-agent': 'curl/8.7.1' }],
    ['an empty user agent', { 'user-agent': null }],
  ])('ignores %s', async (_, overrides) => {
    const res = await POST(beacon(overrides))
    expect(res.status).toBe(204)
    expect(fake.commands).toEqual([])
  })

  it.each([
    ['a cross-site fetch', { 'sec-fetch-site': 'cross-site', origin: 'https://evil.example' }],
    ['a spoofed origin', { 'sec-fetch-site': null, origin: 'https://kacpersaks.dev.evil.com' }],
    ['no provenance at all', { 'sec-fetch-site': null, origin: null }],
  ])('ignores %s', async (_, overrides) => {
    const res = await POST(beacon(overrides))
    expect(res.status).toBe(204)
    expect(fake.commands).toEqual([])
  })

  it('accepts a matching Origin from a browser without Sec-Fetch-Site', async () => {
    await POST(beacon({ 'sec-fetch-site': null }))
    expect(fake.getSync('seen:total')).toBe(1)
  })

  it('falls back to the request URL host when there is no Host header', async () => {
    await POST(beacon({ host: null, 'sec-fetch-site': null }))
    expect(fake.getSync('seen:total')).toBe(1)
    await POST(beacon({ host: null, 'sec-fetch-site': null, origin: 'https://evil.example' }))
    expect(fake.getSync('seen:total')).toBe(1)
  })

  it('caps one address at 10 counted visits however often it rotates its user agent', async () => {
    for (let i = 0; i < 50; i += 1) {
      const res = await POST(
        beacon({ 'user-agent': `Mozilla/5.0 (X11; Linux x86_64; rv:${100 + i}.0) Gecko/20100101 Firefox/${100 + i}.0` }),
      )
      expect(res.status).toBe(204)
    }
    expect(fake.getSync('seen:total')).toBe(10)
    expect(fake.keys().filter((k) => k.startsWith('seen:d:'))).toHaveLength(10)
  })

  it('stores only salted hashes for the throttle as well', async () => {
    await POST(beacon())
    const rate = fake.keys().filter((k) => k.startsWith('seen:r:'))
    expect(rate).toHaveLength(1)
    expect(rate[0]).toMatch(/^seen:r:[0-9a-f]{64}$/)
  })

  it('ignores a beacon with no client address', async () => {
    const res = await POST(beacon({ 'x-forwarded-for': null }))
    expect(res.status).toBe(204)
    expect(fake.commands).toEqual([])
  })

  it.each(['preview', 'development'])('never writes from a %s deployment', async (env) => {
    vi.stubEnv('VERCEL_ENV', env)
    const res = await POST(beacon())
    expect(res.status).toBe(204)
    expect(fake.commands).toEqual([])
  })

  it('counts on the production deployment', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    await POST(beacon())
    expect(fake.getSync('seen:total')).toBe(1)
  })

  it('still answers 204 when Redis fails', async () => {
    fake.failure = new Error('redis down')
    const res = await POST(beacon())
    expect(res.status).toBe(204)
  })

  it('answers 503 not configured without env', async () => {
    configure(null)
    const res = await POST(beacon())
    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toEqual({ error: 'not configured' })
  })
})

describe('GET /api/seen', () => {
  it('returns the documented shape with a public CDN cache header', async () => {
    await POST(beacon())
    const res = await GET(getRequest())
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=600',
    )
    const body = await res.json()
    expect(Object.keys(body)).toEqual(['hour', 'hours', 'total', 'since'])
    expect(body.hour).toBe('2026-10-11T19')
    expect(body.hours).toHaveLength(56)
    expect(body.hours[55]).toBe(1)
    expect(body.hours[54]).toBeNull()
    expect(body.total).toBe(1)
    expect(body.since).toBe('2026-10-11T19')
  })

  it('answers 503 not configured without env', async () => {
    configure(null)
    const res = await GET(getRequest())
    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toEqual({ error: 'not configured' })
  })

  it.each(['?r=123', '?', '?x=1&y=2'])('rejects a query string (%s) with 400 and no Redis call', async (query) => {
    const res = await GET(getRequest(query))
    if (query === '?') {
      // `new URL('…?').search` is '' — an empty query is the same cache key.
      expect(res.status).toBe(200)
      return
    }
    expect(res.status).toBe(400)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(fake.commands).toEqual([])
  })

  it('answers 503 (not cached) when Redis fails', async () => {
    fake.failure = new Error('redis down')
    const res = await GET(getRequest())
    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})
