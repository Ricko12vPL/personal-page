import { siteConfig } from '@/config/site'

/** Window for the second key of a `g <key>` chord. */
export const CHORD_TIMEOUT_MS = 1000
/** How long a command-line message (e.g. E492) stays in the bar. */
export const MESSAGE_MS = 2500
/** Session-only command history cap. */
export const HISTORY_LIMIT = 50
/** Input the `/` key focuses when the current page exposes one. */
export const PROJECT_FILTER_ID = 'project-filter'

export interface ChordJump {
  readonly key: string
  readonly href: string
  readonly label: string
}

// `g h` → /home, `g p` → /projects … derived from the nav so the two never drift.
export const CHORD_JUMPS: readonly ChordJump[] = siteConfig.nav.map((item) => ({
  key: item.label.charAt(1),
  href: item.href,
  label: item.label,
}))

export function chordHref(key: string): string | null {
  return CHORD_JUMPS.find((jump) => jump.key === key)?.href ?? null
}
