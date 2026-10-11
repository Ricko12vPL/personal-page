import { describe, expect, it } from 'vitest'
import { proseFromCompiledMdx, readingMinutes } from './reading-time'

// Shape of Velite's compiled `s.mdx()` output (minified function body).
const COMPILED =
  'const{Fragment:e,jsx:t,jsxs:r}=arguments[0];function _createMdxContent(i){' +
  'const n={a:"a",code:"code",h2:"h2",p:"p",...i.components};' +
  'return r(e,{children:[t(n.h2,{children:"Why This Site"}),"\\n",' +
  't(n.p,{children:["I needed a ",t(n.code,{children:\'say "hi"\'})," place."]})]})}'

describe('proseFromCompiledMdx', () => {
  it('keeps prose literals and drops component identifiers', () => {
    const prose = proseFromCompiledMdx(COMPILED)
    expect(prose).toContain('Why This Site')
    expect(prose).toContain('I needed a')
    expect(prose).toContain('say "hi"')
    expect(prose.split(/\s+/)).not.toContain('h2')
    expect(prose.split(/\s+/)).not.toContain('code')
  })

  it('turns escaped newlines into whitespace', () => {
    expect(proseFromCompiledMdx('t({children:"one\\ntwo"})')).toBe('one two')
  })

  it('returns an empty string when there is no prose', () => {
    expect(proseFromCompiledMdx('const n={p:"p"}')).toBe('')
  })
})

describe('readingMinutes', () => {
  it('is at least one minute', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes(COMPILED)).toBe(1)
  })

  it('rounds up at 200 words per minute', () => {
    const words = Array.from({ length: 401 }, () => 'Word').join(' ')
    expect(readingMinutes(`t({children:"${words}"})`)).toBe(3)
  })
})
