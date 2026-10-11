import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'
import { isPathTarget, runCommand } from './commands'
import type { ContentEntry } from './types'

// Mirrors the real collision: a paper and its announcement post share a slug.
const ENTRIES: readonly ContentEntry[] = [
  { slug: 'x-quant', kind: 'project', href: '/projects/x-quant' },
  { slug: 'alpha-lab', kind: 'project', href: '/projects/alpha-lab' },
  { slug: 'amazing-maze', kind: 'project', href: '/projects/amazing-maze' },
  { slug: 'executable-gate', kind: 'paper', href: '/research/executable-gate' },
  { slug: 'validation-crisis', kind: 'paper', href: '/research/validation-crisis' },
  { slug: 'executable-gate', kind: 'post', href: '/blog/executable-gate' },
  { slug: 'hello-world', kind: 'post', href: '/blog/hello-world' },
]

const run = (line: string) => runCommand(line, ENTRIES)

describe('runCommand — built-ins', () => {
  it.each([
    ['home', '/'],
    ['projects', '/projects'],
    [':research', '/research'],
    ['  BLOG ', '/blog'],
    ['cv', '/cv'],
  ])('%s navigates to %s', (line, href) => {
    expect(run(line)).toEqual({ type: 'navigate', href })
  })

  it('opens external targets and mail', () => {
    expect(run('pdf')).toEqual({ type: 'external', href: siteConfig.cvPdf })
    expect(run('github')).toEqual({ type: 'external', href: siteConfig.links.github })
    expect(run('linkedin')).toEqual({ type: 'external', href: siteConfig.links.linkedin })
    expect(run('email')).toEqual({ type: 'mailto', href: `mailto:${siteConfig.links.email}` })
  })

  it('handles help, quit and an empty line', () => {
    expect(run('help')).toEqual({ type: 'help' })
    expect(run('q')).toEqual({ type: 'close' })
    expect(run('')).toEqual({ type: 'close' })
    expect(run(':')).toEqual({ type: 'close' })
  })

  it('reports unknown commands like vim', () => {
    expect(run('wq now')).toEqual({ type: 'error', message: 'E492: Not an editor command: wq now' })
  })
})

describe('runCommand — e / open', () => {
  it('opens by exact slug and by unique prefix', () => {
    expect(run('e x-quant')).toEqual({ type: 'navigate', href: '/projects/x-quant' })
    expect(run('open hello')).toEqual({ type: 'navigate', href: '/blog/hello-world' })
  })

  it('prefers the paper when a paper and a post share a slug', () => {
    expect(run('e executable-gate')).toEqual({ type: 'navigate', href: '/research/executable-gate' })
  })

  it('accepts kind-qualified and ~/ paths', () => {
    expect(run('e blog/executable-gate')).toEqual({ type: 'navigate', href: '/blog/executable-gate' })
    expect(run('e ~/research/val')).toEqual({ type: 'navigate', href: '/research/validation-crisis' })
    expect(run('e ~/projects/')).toEqual({ type: 'navigate', href: '/projects' })
    expect(run('e ~')).toEqual({ type: 'navigate', href: '/' })
  })

  it('reports missing, ambiguous and absent file names', () => {
    expect(run('e')).toEqual({ type: 'error', message: 'E32: No file name' })
    expect(run('e a')).toEqual({ type: 'error', message: 'E77: Too many file names' })
    expect(run('e nope')).toEqual({
      type: 'error',
      message: 'E447: Can\'t find file "nope" in path',
    })
  })
})

describe('isPathTarget', () => {
  it.each([
    ['x-quant', false],
    ['~', false],
    ['blog/', false],
    ['blog/x', true],
    ['/blog', true],
    ['~/res', true],
  ])('%s → %s', (arg, expected) => {
    expect(isPathTarget(arg)).toBe(expected)
  })
})
