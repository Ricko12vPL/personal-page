import { SEEN_ENDPOINT, SEEN_SESSION_KEY, VISIBLE_DELAY_MS } from '@/lib/visitors/constants'

// Fires one anonymous "seen" beacon per tab session, after the page has been
// continuously visible for a second (prerendered / background tabs never count).
// No cookies and no identifiers are sent — the server hashes what it needs.

let sentThisPage = false

function alreadySeen(): boolean {
  if (sentThisPage) return true
  try {
    return window.sessionStorage.getItem(SEEN_SESSION_KEY) !== null
  } catch {
    return false
  }
}

function markSeen(): void {
  sentThisPage = true
  try {
    window.sessionStorage.setItem(SEEN_SESSION_KEY, '1')
  } catch {
    // Storage blocked: the in-memory flag still prevents repeats on this page.
  }
}

function sendSeen(): void {
  markSeen()
  try {
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(SEEN_ENDPOINT)) return
  } catch {
    // Fall through to fetch.
  }
  fetch(SEEN_ENDPOINT, { method: 'POST', keepalive: true, credentials: 'same-origin' }).catch(
    () => undefined,
  )
}

const noop = () => undefined

/** Arms the beacon; returns a cleanup that cancels it if it has not fired. */
export function startSeenBeacon(delayMs: number = VISIBLE_DELAY_MS): () => void {
  if (alreadySeen()) return noop

  let timer: ReturnType<typeof setTimeout> | null = null

  const cancelTimer = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  const stop = () => {
    cancelTimer()
    document.removeEventListener('visibilitychange', arm)
  }

  function arm(): void {
    cancelTimer()
    if (document.visibilityState !== 'visible') return
    timer = setTimeout(() => {
      stop()
      if (!alreadySeen()) sendSeen()
    }, delayMs)
  }

  document.addEventListener('visibilitychange', arm)
  arm()
  return stop
}
