import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MIN_SALT_LENGTH, readVisitorEnv } from './redis'

const mocks = vi.hoisted(() => ({ Redis: vi.fn() }))
vi.mock('@upstash/redis', () => ({ Redis: mocks.Redis }))

const SALT = 'f'.repeat(64)
const KV = {
  KV_REST_API_URL: 'https://kv.example.upstash.io',
  KV_REST_API_TOKEN: 'kv-token',
  VISITOR_SALT: SALT,
}
const UPSTASH = {
  UPSTASH_REDIS_REST_URL: 'https://up.example.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'up-token',
  VISITOR_SALT: SALT,
}

describe('readVisitorEnv', () => {
  it('returns null without credentials', () => {
    expect(readVisitorEnv({})).toBeNull()
  })

  it('reads the Vercel KV names', () => {
    expect(readVisitorEnv(KV)).toEqual({
      url: KV.KV_REST_API_URL,
      token: 'kv-token',
      salt: SALT,
    })
  })

  it('reads the Upstash names', () => {
    expect(readVisitorEnv(UPSTASH)?.url).toBe(UPSTASH.UPSTASH_REDIS_REST_URL)
  })

  it('prefers the KV pair when both are present', () => {
    expect(readVisitorEnv({ ...UPSTASH, ...KV })?.token).toBe('kv-token')
  })

  it('never mixes a URL from one pair with a token from the other', () => {
    expect(
      readVisitorEnv({
        KV_REST_API_URL: KV.KV_REST_API_URL,
        UPSTASH_REDIS_REST_TOKEN: 'up-token',
        VISITOR_SALT: SALT,
      }),
    ).toBeNull()
  })

  it('skips an incomplete or invalid pair and falls back to the next', () => {
    expect(readVisitorEnv({ KV_REST_API_URL: 'not a url', KV_REST_API_TOKEN: 't', ...UPSTASH })?.token).toBe(
      'up-token',
    )
    expect(readVisitorEnv({ ...KV, KV_REST_API_TOKEN: '  ' })).toBeNull()
    expect(readVisitorEnv({ ...KV, KV_REST_API_URL: 'ftp://kv.example' })).toBeNull()
  })

  it('trims whitespace from values', () => {
    const env = readVisitorEnv({
      KV_REST_API_URL: ` ${KV.KV_REST_API_URL}\n`,
      KV_REST_API_TOKEN: ' kv-token ',
      VISITOR_SALT: ` ${SALT} `,
    })
    expect(env?.url).toBe(KV.KV_REST_API_URL)
    expect(env?.token).toBe('kv-token')
    expect(env?.salt).toBe(SALT)
  })

  it('requires a separate VISITOR_SALT of at least 32 chars (never derived from the token)', () => {
    const withoutSalt = { KV_REST_API_URL: KV.KV_REST_API_URL, KV_REST_API_TOKEN: KV.KV_REST_API_TOKEN }
    expect(readVisitorEnv(withoutSalt)).toBeNull()
    expect(readVisitorEnv({ ...KV, VISITOR_SALT: '  ' })).toBeNull()
    expect(readVisitorEnv({ ...KV, VISITOR_SALT: 'p'.repeat(MIN_SALT_LENGTH - 1) })).toBeNull()
    expect(readVisitorEnv({ ...KV, VISITOR_SALT: 'p'.repeat(MIN_SALT_LENGTH) })?.salt).toBe(
      'p'.repeat(MIN_SALT_LENGTH),
    )
  })
})

describe('getVisitorStore', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.Redis.mockReset()
    for (const name of [...Object.keys(KV), ...Object.keys(UPSTASH), 'VISITOR_SALT']) {
      vi.stubEnv(name, '')
    }
  })

  it('returns null and creates no client when unconfigured', async () => {
    const { getVisitorStore } = await import('./redis')
    expect(getVisitorStore()).toBeNull()
    expect(mocks.Redis).not.toHaveBeenCalled()
  })

  it('creates one client lazily and reuses it', async () => {
    vi.stubEnv('KV_REST_API_URL', KV.KV_REST_API_URL)
    vi.stubEnv('KV_REST_API_TOKEN', KV.KV_REST_API_TOKEN)
    vi.stubEnv('VISITOR_SALT', SALT)
    const { getVisitorStore } = await import('./redis')

    const first = getVisitorStore()
    const second = getVisitorStore()

    expect(first).not.toBeNull()
    expect(second).toBe(first)
    expect(first?.salt).toBe(SALT)
    expect(mocks.Redis).toHaveBeenCalledTimes(1)
    expect(mocks.Redis).toHaveBeenCalledWith(
      expect.objectContaining({ url: KV.KV_REST_API_URL, token: 'kv-token', enableTelemetry: false }),
    )
  })

  it('retries at most once with a short backoff, so a beacon never hangs', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH.UPSTASH_REDIS_REST_URL)
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', UPSTASH.UPSTASH_REDIS_REST_TOKEN)
    vi.stubEnv('VISITOR_SALT', SALT)
    const { getVisitorStore } = await import('./redis')
    getVisitorStore()
    const { retry } = mocks.Redis.mock.calls[0][0]
    expect(retry.retries).toBe(1)
    expect(retry.backoff(1)).toBeLessThanOrEqual(200)
  })

  it('gives every request its own timeout signal', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', UPSTASH.UPSTASH_REDIS_REST_URL)
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', UPSTASH.UPSTASH_REDIS_REST_TOKEN)
    vi.stubEnv('VISITOR_SALT', SALT)
    const { getVisitorStore } = await import('./redis')
    getVisitorStore()
    const { signal } = mocks.Redis.mock.calls[0][0]
    expect(typeof signal).toBe('function')
    const first = signal()
    const second = signal()
    expect(first).toBeInstanceOf(AbortSignal)
    expect(second).not.toBe(first)
    expect(first.aborted).toBe(false)
  })

  it('stays unconfigured without VISITOR_SALT, even with credentials', async () => {
    vi.stubEnv('KV_REST_API_URL', KV.KV_REST_API_URL)
    vi.stubEnv('KV_REST_API_TOKEN', KV.KV_REST_API_TOKEN)
    const { getVisitorStore } = await import('./redis')
    expect(getVisitorStore()).toBeNull()
    expect(mocks.Redis).not.toHaveBeenCalled()
  })

  it('returns null instead of throwing when the client cannot be created', async () => {
    vi.stubEnv('KV_REST_API_URL', KV.KV_REST_API_URL)
    vi.stubEnv('KV_REST_API_TOKEN', KV.KV_REST_API_TOKEN)
    vi.stubEnv('VISITOR_SALT', SALT)
    mocks.Redis.mockImplementation(() => {
      throw new Error('bad config')
    })
    const { getVisitorStore } = await import('./redis')
    expect(getVisitorStore()).toBeNull()
  })
})
