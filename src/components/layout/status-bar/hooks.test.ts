import { describe, expect, it } from 'vitest'
import { scrollRuler } from './hooks'

// vim's ruler for the status bar: Top / NN% / Bot, nothing when there is no scroll.
describe('scrollRuler', () => {
  it('is null when the page fits the viewport', () => {
    expect(scrollRuler(0, 900, 900)).toBeNull()
    expect(scrollRuler(0, 900, 901)).toBeNull()
    expect(scrollRuler(0, 900, 600)).toBeNull()
  })

  it('reads Top at the start and Bot at the end', () => {
    expect(scrollRuler(0, 900, 3000)).toBe('Top')
    expect(scrollRuler(2100, 900, 3000)).toBe('Bot')
    expect(scrollRuler(2099.5, 900, 3000)).toBe('Bot')
  })

  it('reads a rounded percentage in between', () => {
    expect(scrollRuler(1050, 900, 3000)).toBe('50%')
    expect(scrollRuler(21, 900, 3000)).toBe('1%')
    expect(scrollRuler(2000, 900, 3000)).toBe('95%')
  })
})
