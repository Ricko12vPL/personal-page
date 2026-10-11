// Client-safe constants shared by the API route and the status-bar widget.
export const SEEN_ENDPOINT = '/api/seen'

/** Hours shown by the desktop status bar, and returned by GET /api/seen. */
export const VISITOR_HOURS = 56
/** Hours shown on narrow screens (the newest slice of the same data). */
export const COMPACT_HOURS = 28

/** sessionStorage flag: the beacon fires once per tab session. */
export const SEEN_SESSION_KEY = 'ks-seen'
/** A page must stay visible this long before it counts as a visit. */
export const VISIBLE_DELAY_MS = 1_000
/** Refetch the graph on tab focus when the last fetch is older than this. */
export const REFRESH_AFTER_MS = 10 * 60 * 1_000

export const PRIVACY_NOTE = 'no cookies · IPs hashed, never stored'
