import { vi } from 'vitest'

// Minimal browser globals for the client-side visitor modules in a node test
// environment (no jsdom). Test-only.

export interface FakeDocument {
  visibilityState: 'visible' | 'hidden'
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
  listenerCount: (type: string) => number
  setVisibility: (state: 'visible' | 'hidden') => void
}

export function createFakeDocument(initial: 'visible' | 'hidden' = 'visible'): FakeDocument {
  const listeners = new Map<string, Set<() => void>>()
  const doc: FakeDocument = {
    visibilityState: initial,
    addEventListener: (type, listener) => {
      listeners.set(type, new Set([...(listeners.get(type) ?? []), listener]))
    },
    removeEventListener: (type, listener) => {
      const next = new Set(listeners.get(type) ?? [])
      next.delete(listener)
      listeners.set(type, next)
    },
    listenerCount: (type) => listeners.get(type)?.size ?? 0,
    setVisibility: (state) => {
      doc.visibilityState = state
      listeners.get('visibilitychange')?.forEach((listener) => listener())
    },
  }
  return doc
}

export function createFakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
  }
}

export function createBlockedStorage() {
  const blocked = () => {
    throw new DOMException('blocked', 'SecurityError')
  }
  return { getItem: vi.fn(blocked), setItem: vi.fn(blocked) }
}

export function installBrowser(options: {
  document?: FakeDocument
  storage?: ReturnType<typeof createFakeStorage> | ReturnType<typeof createBlockedStorage>
  sendBeacon?: ((url: string) => boolean) | undefined
  fetch?: (...args: unknown[]) => Promise<unknown>
}) {
  const doc = options.document ?? createFakeDocument()
  const storage = options.storage ?? createFakeStorage()
  const sendBeacon = 'sendBeacon' in options ? options.sendBeacon : vi.fn(() => true)
  const fetchMock = vi.fn(options.fetch ?? (() => Promise.resolve(new Response(null, { status: 204 }))))
  vi.stubGlobal('document', doc)
  vi.stubGlobal('window', { sessionStorage: storage })
  vi.stubGlobal('navigator', sendBeacon ? { sendBeacon } : {})
  vi.stubGlobal('fetch', fetchMock)
  return { doc, storage, sendBeacon, fetch: fetchMock }
}
