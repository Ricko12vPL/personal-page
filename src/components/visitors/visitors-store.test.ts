import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFakeStorage, installBrowser } from './testing/browser-fakes'

const BODY = {
  hour: '2026-10-11T19',
  hours: [null, 1, 2],
  total: 1234,
  since: '2026-10-11T17',
}

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )

async function loadStore() {
  vi.resetModules()
  return import('./visitors-store')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-11T19:42:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

// The beacon is covered in seen-beacon.test.ts; mark the session as counted
// so these tests only see GET requests.
const counted = () => createFakeStorage({ 'ks-seen': '1' })

describe('visitors store', () => {
  it('starts loading on the server and before the first subscriber', async () => {
    installBrowser({ storage: counted(), fetch: () => json(BODY) })
    const store = await loadStore()
    expect(store.getServerVisitorsSnapshot()).toEqual({ status: 'loading' })
    expect(store.getVisitorsSnapshot()).toEqual({ status: 'loading' })
  })

  it('fetches once on first subscribe and publishes the data', async () => {
    const browser = installBrowser({ storage: counted(), fetch: () => json(BODY) })
    const store = await loadStore()
    const listener = vi.fn()

    store.subscribeVisitors(listener)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('ready'))

    expect(store.getVisitorsSnapshot()).toEqual({ status: 'ready', data: BODY })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(browser.fetch).toHaveBeenCalledTimes(1)
    expect(browser.fetch).toHaveBeenCalledWith('/api/seen', {
      headers: { accept: 'application/json' },
      signal: expect.any(AbortSignal),
    })
  })

  it('shares one request between widgets', async () => {
    const browser = installBrowser({ storage: counted(), fetch: () => json(BODY) })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    store.subscribeVisitors(() => undefined)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('ready'))
    expect(browser.fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['a 503', () => json({ error: 'not configured' }, 503)],
    ['a network error', () => Promise.reject(new TypeError('offline'))],
    ['a malformed body', () => json({ hour: 'x' })],
    ['invalid JSON', () => Promise.resolve(new Response('<html>', { status: 200 }))],
  ])('is unavailable after %s', async (_, fetchImpl) => {
    installBrowser({ storage: counted(), fetch: fetchImpl })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('unavailable'))
  })

  it('reads the error body so the request completes (networkidle)', async () => {
    const response = new Response(JSON.stringify({ error: 'not configured' }), { status: 503 })
    installBrowser({ storage: counted(), fetch: () => Promise.resolve(response) })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('unavailable'))
    expect(response.bodyUsed).toBe(true)
  })

  it('refetches on tab focus only when the data is older than 10 minutes', async () => {
    const browser = installBrowser({ storage: counted(), fetch: () => json(BODY) })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('ready'))

    browser.doc.setVisibility('hidden')
    vi.setSystemTime(new Date('2026-10-11T19:50:00Z'))
    browser.doc.setVisibility('visible')
    expect(browser.fetch).toHaveBeenCalledTimes(1)

    browser.doc.setVisibility('hidden')
    vi.setSystemTime(new Date('2026-10-11T19:53:00Z'))
    browser.doc.setVisibility('visible')
    expect(browser.fetch).toHaveBeenCalledTimes(2)
  })

  it('keeps the last good numbers when a refresh fails', async () => {
    let fail = false
    const browser = installBrowser({
      storage: counted(),
      fetch: () => (fail ? Promise.reject(new TypeError('offline')) : json(BODY)),
    })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    await vi.waitFor(() => expect(store.getVisitorsSnapshot().status).toBe('ready'))

    fail = true
    vi.setSystemTime(new Date('2026-10-11T20:30:00Z'))
    browser.doc.setVisibility('visible')
    await vi.waitFor(() => expect(browser.fetch).toHaveBeenCalledTimes(2))
    await vi.runAllTimersAsync()
    expect(store.getVisitorsSnapshot()).toEqual({ status: 'ready', data: BODY })
  })

  it('detaches its listeners when the last widget unmounts', async () => {
    const browser = installBrowser({ fetch: () => json(BODY) })
    const store = await loadStore()
    const unsubscribeA = store.subscribeVisitors(() => undefined)
    const unsubscribeB = store.subscribeVisitors(() => undefined)
    unsubscribeA()
    expect(browser.doc.listenerCount('visibilitychange')).toBeGreaterThan(0)
    unsubscribeB()
    expect(browser.doc.listenerCount('visibilitychange')).toBe(0)
    vi.advanceTimersByTime(5_000)
    expect(browser.sendBeacon).not.toHaveBeenCalled()
  })

  it('arms the beacon for an uncounted tab', async () => {
    const browser = installBrowser({ fetch: () => json(BODY) })
    const store = await loadStore()
    store.subscribeVisitors(() => undefined)
    vi.advanceTimersByTime(1_000)
    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
  })
})
