// Pure Tab-completion and history stepping for the command line.
import { COMMANDS, entryPath, isFileCommand, isPathTarget } from './commands'
import type { ContentEntry } from './types'

export interface WildMenu {
  /** Text kept in front of the completed token, e.g. "e ". */
  readonly head: string
  readonly candidates: readonly string[]
  /** -1 = candidates listed, none selected yet. */
  readonly index: number
  /** The input value this menu produced; any other value invalidates it. */
  readonly applied: string
}

export interface CompletionStep {
  readonly value: string
  readonly wild: WildMenu | null
}

interface Completion {
  readonly head: string
  /** The token being completed, normalised (lower case, no leading "~/"). */
  readonly token: string
  readonly candidates: readonly string[]
  readonly kind: 'command' | 'file'
}

const unique = (values: readonly string[]): string[] => [...new Set(values)]

export function longestCommonPrefix(values: readonly string[]): string {
  if (values.length === 0) return ''
  return values.reduce((prefix, value) => {
    let i = 0
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i += 1
    return prefix.slice(0, i)
  })
}

// Bare slugs complete to the slug; a slug shared by two kinds (a paper and its
// blog post) completes to the unambiguous "research/…" / "blog/…" path.
function fileCandidates(token: string, entries: readonly ContentEntry[]): string[] {
  const t = token.replace(/^~?\/+/, '').toLowerCase()
  if (isPathTarget(token)) return unique(entries.map(entryPath).filter((p) => p.startsWith(t)))

  const slugUses = entries.reduce<Record<string, number>>(
    (acc, entry) => ({ ...acc, [entry.slug]: (acc[entry.slug] ?? 0) + 1 }),
    {}
  )
  return unique(
    entries
      .filter((entry) => entry.slug.startsWith(t))
      .map((entry) => (slugUses[entry.slug] > 1 ? entryPath(entry) : entry.slug))
  )
}

function complete(input: string, entries: readonly ContentEntry[]): Completion | null {
  const commandMatch = /^(\s*:*\s*)(\S*)$/.exec(input)
  if (commandMatch) {
    const [, head, token] = commandMatch
    const t = token.toLowerCase()
    const candidates = COMMANDS.map((c) => c.name).filter((name) => name.startsWith(t))
    return { head, token: t, candidates, kind: 'command' }
  }
  const fileMatch = /^(\s*:*\s*(\S+)\s+)(\S*)$/.exec(input)
  if (fileMatch && isFileCommand(fileMatch[2])) {
    const [, head, , token] = fileMatch
    const t = token.replace(/^~?\/+/, '').toLowerCase()
    return { head, token: t, candidates: fileCandidates(token, entries), kind: 'file' }
  }
  return null
}

function cycle(wild: WildMenu, backwards: boolean): CompletionStep {
  const n = wild.candidates.length
  const index =
    wild.index < 0 ? (backwards ? n - 1 : 0) : (wild.index + (backwards ? n - 1 : 1)) % n
  const value = wild.head + wild.candidates[index]
  return { value, wild: { ...wild, index, applied: value } }
}

function uniqueSuffix(completion: Completion, candidate: string): string {
  if (completion.kind !== 'command') return ''
  return COMMANDS.some((c) => c.name === candidate && c.takesFile) ? ' ' : ''
}

/** One Tab (or Shift+Tab) press: complete, extend to the common prefix, or cycle. */
export function stepCompletion(
  value: string,
  wild: WildMenu | null,
  entries: readonly ContentEntry[],
  backwards: boolean
): CompletionStep {
  if (wild && wild.applied === value && wild.candidates.length > 1) return cycle(wild, backwards)

  const completion = complete(value, entries)
  if (!completion || completion.candidates.length === 0) return { value, wild: null }

  const { head, token, candidates } = completion
  if (candidates.length === 1) {
    return { value: head + candidates[0] + uniqueSuffix(completion, candidates[0]), wild: null }
  }
  const prefix = longestCommonPrefix(candidates)
  if (prefix.length > token.length && prefix.startsWith(token)) {
    const extended = head + prefix
    return { value: extended, wild: { head, candidates, index: -1, applied: extended } }
  }
  return cycle({ head, candidates, index: -1, applied: value }, backwards)
}

export interface HistoryCursor {
  /** Position in history while recalling; null = editing a fresh line. */
  readonly index: number | null
  /** What was typed before the first Up, restored after the last Down. */
  readonly draft: string
}

export const FRESH_CURSOR: HistoryCursor = { index: null, draft: '' }

export function stepHistory(
  history: readonly string[],
  cursor: HistoryCursor,
  value: string,
  direction: 'older' | 'newer'
): { readonly cursor: HistoryCursor; readonly value: string } | null {
  if (history.length === 0) return null
  if (direction === 'older') {
    const index = cursor.index === null ? history.length - 1 : Math.max(0, cursor.index - 1)
    const draft = cursor.index === null ? value : cursor.draft
    return { cursor: { index, draft }, value: history[index] }
  }
  if (cursor.index === null) return null
  if (cursor.index >= history.length - 1) {
    return { cursor: FRESH_CURSOR, value: cursor.draft }
  }
  const index = cursor.index + 1
  return { cursor: { ...cursor, index }, value: history[index] }
}

export function appendHistory(
  history: readonly string[],
  entry: string,
  limit: number
): readonly string[] {
  if (entry === '' || history[history.length - 1] === entry) return history
  return [...history, entry].slice(-limit)
}
