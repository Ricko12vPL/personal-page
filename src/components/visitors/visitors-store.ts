import { SEEN_ENDPOINT } from '@/lib/visitors/constants'
import { parseSeenResponse } from '@/lib/visitors/payload'
import { shouldRefresh } from '@/lib/visitors/refresh'
import type { SeenResponse } from '@/lib/visitors/types'
import { startSeenBeacon } from './seen-beacon'

// One shared store per tab, so the desktop and compact widgets (both may be
// mounted at once) share a single GET and a single beacon.

export type VisitorsSnapshot =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: SeenResponse }
  | { readonly status: 'unavailable' }

const LOADING: VisitorsSnapshot = { status: 'loading' }
const UNAVAILABLE: VisitorsSnapshot = { status: 'unavailable' }

let snapshot: VisitorsSnapshot = LOADING
let fetchedAt = 0
let inflight = false
let stopBeacon: (() => void) | null = null
const listeners = new Set<() => void>()

function publish(next: VisitorsSnapshot): void {
  // A failed refresh keeps the last good numbers instead of blanking them.
  if (next.status !== 'ready' && snapshot.status === 'ready') return
  snapshot = next
  listeners.forEach((listener) => listener())
}

/** Give up on a stalled GET so `inflight` clears and a later focus can retry. */
const FETCH_TIMEOUT_MS = 8_000

function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
    : undefined
}

async function loadVisitors(): Promise<VisitorsSnapshot> {
  try {
    const response = await fetch(SEEN_ENDPOINT, {
      headers: { accept: 'application/json' },
      signal: timeoutSignal(),
    })
    if (!response.ok) {
      // Drain the error body: an unread body leaves the request open, which
      // blocks `networkidle` (the CV PDF script) when the counter is unset.
      await response.text()
      return UNAVAILABLE
    }
    const data = parseSeenResponse(await response.json())
    return data ? { status: 'ready', data } : UNAVAILABLE
  } catch {
    return UNAVAILABLE
  }
}

function refresh(): void {
  if (inflight) return
  inflight = true
  fetchedAt = Date.now()
  void loadVisitors()
    .then(publish)
    .finally(() => {
      inflight = false
    })
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'visible' && shouldRefresh(fetchedAt, Date.now())) refresh()
}

function start(): void {
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (shouldRefresh(fetchedAt, Date.now())) refresh()
  stopBeacon = startSeenBeacon()
}

function stop(): void {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stopBeacon?.()
  stopBeacon = null
}

export function subscribeVisitors(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) start()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}

export function getVisitorsSnapshot(): VisitorsSnapshot {
  return snapshot
}

export function getServerVisitorsSnapshot(): VisitorsSnapshot {
  return LOADING
}
