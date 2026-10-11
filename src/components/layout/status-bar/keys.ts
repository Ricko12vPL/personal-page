// Pure key interpretation for the page-wide shortcuts.
import { findProjectFilter, isTypingTarget } from './dom'
import { chordHref } from './keymap'

export type KeyIntent =
  | { readonly type: 'ignore' }
  | { readonly type: 'cancel-chord' }
  | { readonly type: 'start-chord' }
  | { readonly type: 'navigate'; readonly href: string }
  | { readonly type: 'top' }
  | { readonly type: 'help' }
  | { readonly type: 'command' }
  | { readonly type: 'filter'; readonly input: HTMLInputElement }

export interface KeyState {
  readonly chordPending: boolean
  readonly helpOpen: boolean
}

const IGNORE: KeyIntent = { type: 'ignore' }

function chordIntent(key: string): KeyIntent {
  if (key === 'g') return { type: 'top' }
  const href = chordHref(key)
  return href ? { type: 'navigate', href } : { type: 'cancel-chord' }
}

function singleKeyIntent(key: string): KeyIntent {
  switch (key) {
    case 'g':
      return { type: 'start-chord' }
    case '?':
      return { type: 'help' }
    case ':':
      return { type: 'command' }
    case '/': {
      const input = findProjectFilter()
      return input ? { type: 'filter', input } : IGNORE
    }
    default:
      return IGNORE
  }
}

export function interpretKey(event: KeyboardEvent, state: KeyState): KeyIntent {
  if (event.defaultPrevented || event.isComposing) return IGNORE
  if (event.ctrlKey || event.metaKey || event.altKey) return IGNORE
  if (isTypingTarget(event.target)) return IGNORE
  if (state.helpOpen) return event.key === '?' ? { type: 'help' } : IGNORE
  if (state.chordPending) return chordIntent(event.key)
  if (event.repeat) return IGNORE
  return singleKeyIntent(event.key)
}
