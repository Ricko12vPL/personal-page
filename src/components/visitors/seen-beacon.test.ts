import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createBlockedStorage,
  createFakeDocument,
  createFakeStorage,
  installBrowser,
} from './testing/browser-fakes'

async function loadBeacon() {
  vi.resetModules()
  return import('./seen-beacon')
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('startSeenBeacon', () => {
  it('sends one beacon after the page has been visible for 1s', async () => {
    const browser = installBrowser({})
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(999)
    expect(browser.sendBeacon).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)

    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
    expect(browser.sendBeacon).toHaveBeenCalledWith('/api/seen')
    expect(browser.storage.setItem).toHaveBeenCalledWith('ks-seen', '1')
    expect(browser.fetch).not.toHaveBeenCalled()
    expect(browser.doc.listenerCount('visibilitychange')).toBe(0)
  })

  it('waits for a hidden (background / prerendered) tab to become visible', async () => {
    const browser = installBrowser({ document: createFakeDocument('hidden') })
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(5_000)
    expect(browser.sendBeacon).not.toHaveBeenCalled()

    browser.doc.setVisibility('visible')
    vi.advanceTimersByTime(1_000)
    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
  })

  it('requires 1s of continuous visibility', async () => {
    const browser = installBrowser({})
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(800)
    browser.doc.setVisibility('hidden')
    vi.advanceTimersByTime(5_000)
    browser.doc.setVisibility('visible')
    vi.advanceTimersByTime(800)
    expect(browser.sendBeacon).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
  })

  it('does nothing when this tab session was already counted', async () => {
    const browser = installBrowser({ storage: createFakeStorage({ 'ks-seen': '1' }) })
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(5_000)
    expect(browser.sendBeacon).not.toHaveBeenCalled()
    expect(browser.doc.listenerCount('visibilitychange')).toBe(0)
  })

  it('sends only once when two widgets arm it at the same time', async () => {
    const browser = installBrowser({})
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
  })

  it('falls back to a keepalive fetch when sendBeacon is missing', async () => {
    const browser = installBrowser({ sendBeacon: undefined })
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    expect(browser.fetch).toHaveBeenCalledWith('/api/seen', {
      method: 'POST',
      keepalive: true,
      credentials: 'same-origin',
    })
  })

  it('falls back to fetch when sendBeacon refuses or throws', async () => {
    const refused = installBrowser({ sendBeacon: vi.fn(() => false) })
    const first = await loadBeacon()
    first.startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    expect(refused.fetch).toHaveBeenCalledTimes(1)

    const throwing = installBrowser({
      sendBeacon: vi.fn(() => {
        throw new TypeError('illegal invocation')
      }),
    })
    const second = await loadBeacon()
    second.startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    expect(throwing.fetch).toHaveBeenCalledTimes(1)
  })

  it('swallows a failing fallback fetch', async () => {
    const browser = installBrowser({
      sendBeacon: undefined,
      fetch: () => Promise.reject(new TypeError('offline')),
    })
    const { startSeenBeacon } = await loadBeacon()
    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    await vi.runAllTimersAsync()
    expect(browser.fetch).toHaveBeenCalledTimes(1)
  })

  it('still sends once when sessionStorage is blocked', async () => {
    const browser = installBrowser({ storage: createBlockedStorage() })
    const { startSeenBeacon } = await loadBeacon()

    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    startSeenBeacon()
    vi.advanceTimersByTime(1_000)
    expect(browser.sendBeacon).toHaveBeenCalledTimes(1)
  })

  it('can be cancelled before it fires', async () => {
    const browser = installBrowser({})
    const { startSeenBeacon } = await loadBeacon()

    const stop = startSeenBeacon()
    vi.advanceTimersByTime(500)
    stop()
    vi.advanceTimersByTime(5_000)
    expect(browser.sendBeacon).not.toHaveBeenCalled()
    expect(browser.doc.listenerCount('visibilitychange')).toBe(0)
  })
})
