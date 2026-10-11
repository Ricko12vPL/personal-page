import { describe, expect, it } from 'vitest'
import { isSameOrigin } from './origin'

const HOST = 'kacpersaks.dev'
const h = (init: Record<string, string>) => new Headers(init)

describe('isSameOrigin', () => {
  it('accepts a browser-asserted same-origin request', () => {
    expect(isSameOrigin(h({ 'sec-fetch-site': 'same-origin' }), HOST)).toBe(true)
  })

  it.each(['cross-site', 'same-site', 'none'])(
    'rejects Sec-Fetch-Site: %s even with a matching Origin',
    (site) => {
      const headers = h({ 'sec-fetch-site': site, origin: 'https://kacpersaks.dev' })
      expect(isSameOrigin(headers, HOST)).toBe(false)
    },
  )

  it('accepts a matching Origin when Sec-Fetch-Site is absent', () => {
    expect(isSameOrigin(h({ origin: 'https://kacpersaks.dev' }), HOST)).toBe(true)
  })

  it('compares hosts case-insensitively', () => {
    expect(isSameOrigin(h({ origin: 'https://KacperSaks.dev' }), 'KACPERSAKS.DEV')).toBe(true)
  })

  it('includes the port in the comparison', () => {
    expect(isSameOrigin(h({ origin: 'http://localhost:3000' }), 'localhost:3000')).toBe(true)
    expect(isSameOrigin(h({ origin: 'http://localhost:4000' }), 'localhost:3000')).toBe(false)
  })

  it('falls back to the Referer when there is no Origin', () => {
    expect(isSameOrigin(h({ referer: 'https://kacpersaks.dev/projects?x=1' }), HOST)).toBe(true)
  })

  it('trusts the Origin over the Referer', () => {
    const headers = h({ origin: 'https://evil.example', referer: 'https://kacpersaks.dev/' })
    expect(isSameOrigin(headers, HOST)).toBe(false)
  })

  it.each([
    'https://kacpersaks.dev.evil.com',
    'https://evil-kacpersaks.dev',
    'https://evil.com/kacpersaks.dev',
    'https://evil.com/?kacpersaks.dev',
    'https://kacpersaks.dev@evil.com',
    'https://www.kacpersaks.dev',
    'ftp://kacpersaks.dev',
    'null',
    'kacpersaks.dev',
    '',
  ])('rejects a spoofed or opaque Origin %j', (origin) => {
    expect(isSameOrigin(h({ origin }), HOST)).toBe(false)
  })

  it.each(['https://kacpersaks.dev.evil.com/', 'https://evil.com/https://kacpersaks.dev/', 'garbage'])(
    'rejects a spoofed Referer %j',
    (referer) => {
      expect(isSameOrigin(h({ referer }), HOST)).toBe(false)
    },
  )

  it('rejects a request with no provenance headers at all', () => {
    expect(isSameOrigin(h({}), HOST)).toBe(false)
  })

  it.each([null, undefined, '', '  '])('rejects when the request host is %j', (host) => {
    expect(isSameOrigin(h({ 'sec-fetch-site': 'same-origin' }), host)).toBe(false)
    expect(isSameOrigin(h({ origin: 'https://kacpersaks.dev' }), host)).toBe(false)
  })
})
