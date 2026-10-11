import { estimateReadingTime } from '@/lib/utils'

// Velite's `s.mdx()` field is compiled, minified JS, not prose. The prose
// lives in its string literals (`children:"…"`), so the word count comes from
// those, minus bare identifiers such as the component map (`p:"p"`, `h2:"h2"`).
const STRING_LITERAL = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g
const IDENTIFIER = /^[a-z][a-z0-9]*$/
const ESCAPED_WHITESPACE = /\\[nrt]/g

export function proseFromCompiledMdx(code: string): string {
  return Array.from(code.matchAll(STRING_LITERAL), (m) => m[1] ?? m[2] ?? m[3] ?? '')
    .filter((literal) => literal.length > 0 && !IDENTIFIER.test(literal))
    .join(' ')
    .replace(ESCAPED_WHITESPACE, ' ')
}

/** Estimated minutes to read a compiled MDX body (200 wpm, minimum 1). */
export function readingMinutes(compiledMdx: string): number {
  return estimateReadingTime(proseFromCompiledMdx(compiledMdx))
}
