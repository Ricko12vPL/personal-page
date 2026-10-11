import { Redis } from '@upstash/redis'

// Server-only. The client is created lazily on first use so a missing
// configuration never throws at import time — the route answers 503 instead.
//
// Required env (Production scope only, so previews and `vercel env pull` never
// write to the production counter):
//   KV_REST_API_URL + KV_REST_API_TOKEN  (or UPSTASH_REDIS_REST_URL + _TOKEN)
//   VISITOR_SALT  a separate secret of at least 32 chars: `openssl rand -hex 32`

export interface VisitorEnv {
  url: string
  token: string
  salt: string
}

export interface VisitorStore {
  redis: Redis
  salt: string
}

type Env = Record<string, string | undefined>

const CREDENTIAL_PAIRS = [
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
] as const

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

/** Shortest VISITOR_SALT accepted (32 chars = 128 bits of hex). */
export const MIN_SALT_LENGTH = 32

/**
 * Vercel KV names first, then Upstash's own; a pair is used only if complete.
 * The salt must be its own secret: deriving it from the token would let anyone
 * holding the token (which can read the hashed keys) brute-force them to IPs.
 */
export function readVisitorEnv(env: Env = process.env): VisitorEnv | null {
  const salt = env.VISITOR_SALT?.trim()
  if (!salt || salt.length < MIN_SALT_LENGTH) return null
  for (const [urlName, tokenName] of CREDENTIAL_PAIRS) {
    const url = env[urlName]?.trim()
    const token = env[tokenName]?.trim()
    if (url && token && isHttpUrl(url)) return { url, token, salt }
  }
  return null
}

/** Per-request timeout: a stalled Upstash must not pin the function. */
const REDIS_TIMEOUT_MS = 2_500

let cached: VisitorStore | null = null

/** The shared client, or null when the counter is not configured. Never throws. */
export function getVisitorStore(): VisitorStore | null {
  if (cached) return cached
  const config = readVisitorEnv()
  if (!config) return null
  try {
    cached = {
      redis: new Redis({
        url: config.url,
        token: config.token,
        enableTelemetry: false,
        retry: { retries: 1, backoff: () => 100 },
        // A factory, so every request gets a fresh timeout signal.
        signal: () => AbortSignal.timeout(REDIS_TIMEOUT_MS),
      }),
      salt: config.salt,
    }
    return cached
  } catch {
    return null
  }
}
