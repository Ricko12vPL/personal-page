// Presentational pieces of the status bar. No hooks: rendered by StatusBar.
import type { MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { pathAfterHome } from './path'
import type { ContentCounts } from './types'

const keepInputFocus = (event: MouseEvent) => event.preventDefault()

export function Separator() {
  return (
    <span aria-hidden="true" className="text-neutral-700">
      ·
    </span>
  )
}

interface ModeBlockProps {
  /** Until hydration the toggle cannot do anything, so it is disabled. */
  readonly hydrated: boolean
  readonly commandOpen: boolean
  readonly controls: string
  readonly onToggle: () => void
}

export function ModeBlock({ hydrated, commandOpen, controls, onToggle }: ModeBlockProps) {
  return (
    <button
      type="button"
      disabled={!hydrated}
      onMouseDown={keepInputFocus}
      onClick={onToggle}
      aria-expanded={commandOpen}
      aria-controls={commandOpen ? controls : undefined}
      aria-label={commandOpen ? 'Close command line' : 'Open command line'}
      className="chrome-mode flex shrink-0 cursor-pointer items-center self-stretch bg-accent px-2.5 font-medium tracking-[0.12em] text-black disabled:cursor-default"
    >
      {commandOpen ? 'COMMAND' : 'NORMAL'}
    </button>
  )
}

interface PathSegmentProps {
  readonly pathname: string | null
  readonly hydrated: boolean
  readonly message: string | null
  readonly chordPending: boolean
  /** "Top" / "NN%" / "Bot", or null when the page does not scroll. */
  readonly ruler: string | null
}

export function PathSegment({ pathname, hydrated, message, chordPending, ruler }: PathSegmentProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
      {message ? (
        <span className="truncate text-neutral-100">{message}</span>
      ) : (
        <span className="flex min-w-0 items-center">
          <span className="text-accent-dim">~</span>
          {/* Statically prerendered pages (the 404) can SSR a different pathname
              than the browser URL; remount after hydration to show the real one. */}
          <span
            key={hydrated ? 'client' : 'server'}
            suppressHydrationWarning
            className="truncate text-neutral-300"
          >
            {pathAfterHome(pathname)}
          </span>
        </span>
      )}
      {chordPending && (
        <span aria-hidden="true" className="shrink-0 text-accent">
          g-
        </span>
      )}
      {/* Hidden where the counters and hints leave the path too little room. */}
      {ruler && (
        <span
          aria-hidden="true"
          className="ml-auto hidden shrink-0 tabular-nums text-neutral-400 min-[480px]:inline min-[900px]:max-[1099px]:hidden"
        >
          {ruler}
        </span>
      )}
    </div>
  )
}

export function Counters({ counts }: { readonly counts: ContentCounts }) {
  const items = [
    { label: 'Projects', value: counts.projects },
    { label: 'Papers', value: counts.papers },
    { label: 'Posts', value: counts.posts },
  ]
  return (
    <div className="hidden shrink-0 items-center gap-2 border-l hairline px-3 min-[900px]:flex">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <Separator />}
          <span className="label">{item.label}</span>
          <span className="num">{item.value}</span>
        </span>
      ))}
    </div>
  )
}

// `g h` only shows on wide bars; between 900 and 1100px it would squeeze the path.
const HINTS = [
  { keys: 'g h', wideOnly: true },
  { keys: 'g p', wideOnly: false },
  { keys: 'g r', wideOnly: false },
  { keys: 'g b', wideOnly: false },
  { keys: 'g c', wideOnly: false },
  { keys: ':', wideOnly: false },
] as const

interface KeyHintsProps {
  readonly hydrated: boolean
  readonly onHelp: () => void
}

// Hints only mean something once the shortcuts are wired up, so they stay
// invisible (space reserved, no layout shift) until hydration — no-JS visitors
// just get the path and the regular nav.
export function KeyHints({ hydrated, onHelp }: KeyHintsProps) {
  return (
    <div
      role="group"
      aria-label="Keyboard shortcuts"
      className={cn(
        'hidden shrink-0 items-center gap-1.5 border-l hairline px-3 min-[900px]:flex',
        !hydrated && 'invisible'
      )}
    >
      {HINTS.map((hint) => (
        <span
          key={hint.keys}
          className={cn('items-center gap-1.5', hint.wideOnly ? 'hidden min-[1100px]:flex' : 'flex')}
        >
          <kbd className="kbd">{hint.keys}</kbd>
          <Separator />
        </span>
      ))}
      <button
        type="button"
        onClick={onHelp}
        aria-label="Keyboard help"
        className="chrome-help-btn chrome-focus cursor-pointer"
      >
        <kbd className="kbd">?</kbd>
      </button>
    </div>
  )
}
