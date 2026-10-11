import { isBot } from '@/lib/visitors/bot'
import { addressKey, dedupeKey } from '@/lib/visitors/hash'
import { clientIp } from '@/lib/visitors/ip'
import { isSameOrigin } from '@/lib/visitors/origin'
import { getVisitorStore } from '@/lib/visitors/redis'
import { readVisitors, recordVisit, withinIpLimit } from '@/lib/visitors/store'
import { dayKey, hourKey } from '@/lib/visitors/time'

// Privacy-first visitor counter: no cookies; IPs are only hashed (salted,
// rotated daily), never stored. POST is the page-view beacon, GET feeds the
// status-bar sparkline.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Upper bound if Upstash stalls (each Redis call also times out at 2.5 s).
export const maxDuration = 10

const PUBLIC_CACHE = 'public, s-maxage=300, stale-while-revalidate=600'
const NO_STORE = 'no-store'

function noContent(): Response {
  return new Response(null, { status: 204, headers: { 'Cache-Control': NO_STORE } })
}

function unavailable(error: string): Response {
  return Response.json({ error }, { status: 503, headers: { 'Cache-Control': NO_STORE } })
}

// Request.url is always absolute, so the fallback cannot throw.
function requestHost(request: Request): string {
  return request.headers.get('host') || new URL(request.url).host
}

/** Previews and local runs with pulled env must never write production keys. */
function isNonProductionDeploy(): boolean {
  const env = process.env.VERCEL_ENV
  return Boolean(env) && env !== 'production'
}

export async function POST(request: Request): Promise<Response> {
  if (isNonProductionDeploy()) return noContent()
  const store = getVisitorStore()
  if (!store) return unavailable('not configured')

  const { headers } = request
  const userAgent = headers.get('user-agent') ?? ''
  if (isBot(userAgent) || !isSameOrigin(headers, requestHost(request))) return noContent()
  const ip = clientIp(headers)
  if (!ip) return noContent()

  try {
    const now = new Date()
    const day = dayKey(now)
    if (!(await withinIpLimit(store.redis, addressKey(ip, day, store.salt)))) return noContent()
    await recordVisit(store.redis, dedupeKey(ip, userAgent, day, store.salt), hourKey(now))
  } catch {
    // A beacon must never fail visibly; losing one count is acceptable.
  }
  return noContent()
}

export async function GET(request: Request): Promise<Response> {
  // The client always asks for the bare URL; a query string would only be a
  // way around the CDN cache (each miss costs a Redis round trip).
  if (new URL(request.url).search !== '') {
    return new Response(null, { status: 400, headers: { 'Cache-Control': NO_STORE } })
  }
  const store = getVisitorStore()
  if (!store) return unavailable('not configured')

  try {
    const body = await readVisitors(store.redis, new Date())
    return Response.json(body, { headers: { 'Cache-Control': PUBLIC_CACHE } })
  } catch {
    return unavailable('unavailable')
  }
}
