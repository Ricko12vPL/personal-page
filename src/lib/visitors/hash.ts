import { createHash } from 'node:crypto'

// Server-only: never import from a client component.
const SEPARATOR = '\u0000'

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

/**
 * One-way visitor fingerprint for the 30-minute de-dupe window. The salt is a
 * separate secret (VISITOR_SALT), never derived from the Redis credentials, so
 * whoever can read the keys cannot also brute-force them back to an IP; the day
 * rotates it daily so even the hash cannot link visits across days. Raw IP / UA
 * are never stored.
 */
export function dedupeKey(ip: string, userAgent: string, day: string, salt: string): string {
  return sha256Hex([salt, day, ip, userAgent].join(SEPARATOR))
}

/** Salted, daily-rotating hash of the address alone, for the per-address throttle. */
export function addressKey(ip: string, day: string, salt: string): string {
  return sha256Hex([salt, 'rate', day, ip].join(SEPARATOR))
}
