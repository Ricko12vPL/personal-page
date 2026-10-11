import type { HeaderReader } from './headers'

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.host.toLowerCase()
      : null
  } catch {
    return null
  }
}

/**
 * Only count beacons sent by this site's own pages.
 * - A browser that sends Sec-Fetch-Site has the final word: same-origin passes,
 *   anything else (cross-site, same-site, none) is rejected.
 * - Otherwise the Origin, or failing that the Referer, must name this host.
 * Non-browser clients can forge all of this; the check only keeps other sites
 * from embedding the counter, it is not authentication.
 */
export function isSameOrigin(headers: HeaderReader, host: string | null | undefined): boolean {
  const expected = host?.trim().toLowerCase()
  if (!expected) return false

  const site = headers.get('sec-fetch-site')
  if (site !== null) return site.trim().toLowerCase() === 'same-origin'

  const origin = headers.get('origin')
  if (origin !== null) return hostOf(origin) === expected

  const referer = headers.get('referer')
  return referer !== null && hostOf(referer) === expected
}
