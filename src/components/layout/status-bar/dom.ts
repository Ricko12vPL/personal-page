import { PROJECT_FILTER_ID } from './keymap'

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/** True when a key press belongs to a text field, not to the page shortcuts. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || TYPING_TAGS.has(target.tagName)
}

/** The focused element worth returning to later (never <body>). */
export function activeHTMLElement(): HTMLElement | null {
  const el = document.activeElement
  return el instanceof HTMLElement && el !== document.body ? el : null
}

export function restoreFocus(el: HTMLElement | null): void {
  if (el && el.isConnected) el.focus({ preventScroll: true })
}

export function findProjectFilter(): HTMLInputElement | null {
  const el = document.getElementById(PROJECT_FILTER_ID)
  return el instanceof HTMLInputElement ? el : null
}
