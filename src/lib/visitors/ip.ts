import type { HeaderReader } from './headers'

/**
 * The visitor's address as reported by the platform proxy. Used only as hash
 * input for de-duplication — it is never stored or logged.
 */
export function clientIp(headers: HeaderReader): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  return headers.get('x-real-ip')?.trim() ?? ''
}
