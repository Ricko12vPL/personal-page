import { describe, expect, it } from 'vitest'
import { homePath, pathAfterHome } from './path'

describe('pathAfterHome', () => {
  it.each([
    [null, ''],
    ['', ''],
    ['/', ''],
    ['/projects', '/projects'],
    ['/projects/x-quant', '/projects/x-quant'],
    ['/blog/', '/blog'],
    ['/blog///', '/blog'],
  ])('%j → %j', (input, expected) => {
    expect(pathAfterHome(input)).toBe(expected)
  })

  it('hides the internal prerender route of the 404', () => {
    expect(pathAfterHome('/_not-found')).toBe('')
  })

  it('decodes percent-encoding', () => {
    expect(pathAfterHome('/blog/caf%C3%A9')).toBe('/blog/café')
  })

  it('keeps malformed percent-encoding as-is instead of throwing', () => {
    expect(pathAfterHome('/blog/%E0%A4%A')).toBe('/blog/%E0%A4%A')
  })
})

describe('homePath', () => {
  it.each([
    [null, '~'],
    ['/', '~'],
    ['/cv', '~/cv'],
    ['/research/validation-crisis/', '~/research/validation-crisis'],
  ])('%j → %j', (input, expected) => {
    expect(homePath(input)).toBe(expected)
  })
})
