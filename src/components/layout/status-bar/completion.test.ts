import { describe, expect, it } from 'vitest'
import {
  FRESH_CURSOR,
  appendHistory,
  longestCommonPrefix,
  stepCompletion,
  stepHistory,
  type CompletionStep,
} from './completion'
import type { ContentEntry } from './types'

const ENTRIES: readonly ContentEntry[] = [
  { slug: 'x-quant', kind: 'project', href: '/projects/x-quant' },
  { slug: 'alpha-lab', kind: 'project', href: '/projects/alpha-lab' },
  { slug: 'amazing-maze', kind: 'project', href: '/projects/amazing-maze' },
  { slug: 'executable-gate', kind: 'paper', href: '/research/executable-gate' },
  { slug: 'validation-crisis', kind: 'paper', href: '/research/validation-crisis' },
  { slug: 'executable-gate', kind: 'post', href: '/blog/executable-gate' },
  { slug: 'hello-world', kind: 'post', href: '/blog/hello-world' },
]

const tab = (value: string, previous: CompletionStep | null = null, backwards = false) =>
  stepCompletion(value, previous?.wild ?? null, ENTRIES, backwards)

describe('stepCompletion — commands', () => {
  it('completes a unique command', () => {
    expect(tab('pr')).toEqual({ value: 'projects', wild: null })
  })

  it('adds a space after commands that take a file', () => {
    expect(tab('op').value).toBe('open ')
  })

  it('cycles through ambiguous commands, forwards and backwards', () => {
    const first = tab('h')
    expect(first.value).toBe('home')
    expect(first.wild?.candidates).toEqual(['home', 'help'])
    const second = tab(first.value, first)
    expect(second.value).toBe('help')
    expect(tab(second.value, second).value).toBe('home')
    expect(tab(second.value, second, true).value).toBe('home')
  })

  it('leaves text it cannot complete alone', () => {
    expect(tab('zz')).toEqual({ value: 'zz', wild: null })
    expect(tab('pdf extra words')).toEqual({ value: 'pdf extra words', wild: null })
  })
})

describe('stepCompletion — files', () => {
  it('completes a unique slug', () => {
    expect(tab('e x').value).toBe('e x-quant')
  })

  it('offers kind-qualified paths for a shared slug', () => {
    const first = tab('open exe')
    expect(first.wild?.candidates).toEqual(['research/executable-gate', 'blog/executable-gate'])
    expect(first.value).toBe('open research/executable-gate')
    expect(tab(first.value, first).value).toBe('open blog/executable-gate')
  })

  it('extends to the longest common prefix before cycling', () => {
    const first = tab('e ~/pro')
    expect(first.value).toBe('e projects/')
    expect(first.wild?.index).toBe(-1)
    expect(tab(first.value, first).value).toBe('e projects/x-quant')
  })

  it('forgets the menu once the text changes', () => {
    const first = tab('h')
    expect(tab('he', first).value).toBe('help')
  })
})

describe('history', () => {
  const history = appendHistory(appendHistory(appendHistory([], 'cv', 50), 'pdf', 50), 'pdf', 50)

  it('skips empty lines and consecutive duplicates, and caps length', () => {
    expect(history).toEqual(['cv', 'pdf'])
    expect(appendHistory(history, '', 50)).toBe(history)
    const full = Array.from({ length: 50 }, (_, i) => `c${i}`)
    expect(appendHistory(full, 'new', 50)).toHaveLength(50)
  })

  it('walks older, clamps at the oldest, and restores the draft', () => {
    const a = stepHistory(history, FRESH_CURSOR, 'dra', 'older')
    expect(a?.value).toBe('pdf')
    const b = stepHistory(history, a!.cursor, a!.value, 'older')
    expect(b?.value).toBe('cv')
    const c = stepHistory(history, b!.cursor, b!.value, 'older')
    expect(c?.value).toBe('cv')
    const d = stepHistory(history, c!.cursor, c!.value, 'newer')
    expect(d?.value).toBe('pdf')
    const e = stepHistory(history, d!.cursor, d!.value, 'newer')
    expect(e).toEqual({ cursor: FRESH_CURSOR, value: 'dra' })
    expect(stepHistory(history, FRESH_CURSOR, 'x', 'newer')).toBeNull()
    expect(stepHistory([], FRESH_CURSOR, 'x', 'older')).toBeNull()
  })
})

describe('longestCommonPrefix', () => {
  it('finds the shared prefix', () => {
    expect(longestCommonPrefix(['alpha', 'alps'])).toBe('alp')
    expect(longestCommonPrefix(['a', 'b'])).toBe('')
    expect(longestCommonPrefix([])).toBe('')
  })
})
