import { describe, expect, it } from 'vitest'
import { shouldRefresh } from './refresh'

const MIN = 60_000

describe('shouldRefresh', () => {
  it('refreshes when nothing was fetched yet', () => {
    expect(shouldRefresh(0, 1_000)).toBe(true)
  })

  it('does not refresh within 10 minutes', () => {
    expect(shouldRefresh(1_000, 1_000 + 10 * MIN)).toBe(false)
  })

  it('refreshes after 10 minutes', () => {
    expect(shouldRefresh(1_000, 1_000 + 10 * MIN + 1)).toBe(true)
  })

  it('honours a custom max age', () => {
    expect(shouldRefresh(1_000, 1_500, 100)).toBe(true)
  })
})
