// Pure command-line interpreter: text in, action out. No React, no DOM, so
// the status bar only has to perform the returned action.
import { siteConfig } from '@/config/site'
import type { ContentEntry } from './types'

export type CommandAction =
  | { readonly type: 'navigate'; readonly href: string }
  | { readonly type: 'external'; readonly href: string }
  | { readonly type: 'mailto'; readonly href: string }
  | { readonly type: 'help' }
  | { readonly type: 'close' }
  | { readonly type: 'error'; readonly message: string }

export interface CommandSpec {
  readonly name: string
  readonly usage: string
  readonly summary: string
  /** Takes a file argument (slug), completed with Tab. */
  readonly takesFile?: boolean
}

const NAV_COMMANDS: readonly CommandSpec[] = siteConfig.nav.map((item) => ({
  name: item.label.slice(1),
  usage: item.label.slice(1),
  summary: `go to ${item.label}`,
}))

export const COMMANDS: readonly CommandSpec[] = [
  ...NAV_COMMANDS,
  { name: 'pdf', usage: 'pdf', summary: 'open the CV as PDF' },
  { name: 'e', usage: 'e <slug>', summary: 'project, paper or post', takesFile: true },
  { name: 'open', usage: 'open <slug>', summary: 'same as :e', takesFile: true },
  { name: 'github', usage: 'github', summary: 'GitHub profile' },
  { name: 'linkedin', usage: 'linkedin', summary: 'LinkedIn profile' },
  { name: 'email', usage: 'email', summary: 'write an email' },
  { name: 'help', usage: 'help', summary: 'keyboard reference' },
  { name: 'q', usage: 'q', summary: 'close the command line' },
]

const FILE_COMMANDS = new Set(['e', 'edit', 'open'])
const CLOSE: CommandAction = { type: 'close' }

export function isFileCommand(name: string): boolean {
  return FILE_COMMANDS.has(name.toLowerCase())
}

/** "~/blog/x", "/blog/x" and "blog/x" name a path; "x" names a slug. */
export function isPathTarget(arg: string): boolean {
  return /^~?\//.test(arg) || arg.replace(/\/+$/, '').includes('/')
}

/** "projects/x-quant" for "/projects/x-quant". */
export function entryPath(entry: ContentEntry): string {
  return entry.href.replace(/^\/+/, '')
}

const fail = (message: string): CommandAction => ({ type: 'error', message })

function sectionHref(target: string): string | null {
  if (target === '' || target === 'home') return '/'
  return siteConfig.nav.find((item) => item.label.slice(1) === target)?.href ?? null
}

type Resolution =
  | { readonly kind: 'found'; readonly entry: ContentEntry }
  | { readonly kind: 'ambiguous' }
  | { readonly kind: 'missing' }

// Exact match first (entries arrive ordered project → paper → post, so a slug
// shared by a paper and its blog post resolves to the paper); otherwise a
// unique prefix. "blog/<slug>" style targets match against the path instead.
function resolveEntry(
  target: string,
  byPath: boolean,
  entries: readonly ContentEntry[]
): Resolution {
  const keyOf = byPath ? entryPath : (entry: ContentEntry) => entry.slug
  const exact = entries.find((entry) => keyOf(entry) === target)
  if (exact) return { kind: 'found', entry: exact }

  const matches = entries.filter((entry) => keyOf(entry).startsWith(target))
  const distinct = new Set(matches.map(keyOf))
  if (distinct.size === 1) return { kind: 'found', entry: matches[0] }
  return distinct.size > 1 ? { kind: 'ambiguous' } : { kind: 'missing' }
}

function openFile(arg: string, entries: readonly ContentEntry[]): CommandAction {
  if (arg === '') return fail('E32: No file name')
  const target = arg.replace(/^~/, '').replace(/^\/+|\/+$/g, '').toLowerCase()

  const section = sectionHref(target)
  if (section) return { type: 'navigate', href: section }

  const resolution = resolveEntry(target, isPathTarget(arg), entries)
  if (resolution.kind === 'found') return { type: 'navigate', href: resolution.entry.href }
  if (resolution.kind === 'ambiguous') return fail('E77: Too many file names')
  return fail(`E447: Can't find file "${arg}" in path`)
}

function runNamed(name: string, arg: string, entries: readonly ContentEntry[]): CommandAction | null {
  switch (name) {
    case 'pdf':
      return { type: 'external', href: siteConfig.cvPdf }
    case 'github':
      return { type: 'external', href: siteConfig.links.github }
    case 'linkedin':
      return { type: 'external', href: siteConfig.links.linkedin }
    case 'email':
      return { type: 'mailto', href: `mailto:${siteConfig.links.email}` }
    case 'help':
    case 'h':
      return { type: 'help' }
    case 'q':
    case 'quit':
      return CLOSE
    default:
      return isFileCommand(name) ? openFile(arg, entries) : null
  }
}

export function runCommand(raw: string, entries: readonly ContentEntry[]): CommandAction {
  const input = raw.trim().replace(/^:+/, '').trim()
  if (input === '') return CLOSE

  const [first, ...rest] = input.split(/\s+/)
  const name = first.toLowerCase()
  const section = sectionHref(name)
  if (section) return { type: 'navigate', href: section }
  return runNamed(name, rest.join(' '), entries) ?? fail(`E492: Not an editor command: ${input}`)
}
