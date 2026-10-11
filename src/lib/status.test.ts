import { describe, expect, it } from 'vitest'
import { projectStatus } from './status'

// Only label / className / fallback are asserted, so extra presentational
// fields on the style object do not break these tests.
describe('projectStatus', () => {
  it.each([
    ['completed', 'Completed', 'text-accent'],
    ['in-progress', 'In Progress', 'text-amber-400'],
    ['paused', 'Paused', 'text-neutral-400'],
    ['archived', 'Archived', 'text-neutral-500'],
  ])('maps %s to its label and colour', (status, label, className) => {
    const style = projectStatus(status)
    expect(style.label).toBe(label)
    expect(style.className).toBe(className)
  })

  it('falls back to In Progress for an unknown status', () => {
    const style = projectStatus('shipped')
    expect(style.label).toBe('In Progress')
    expect(style.className).toBe('text-amber-400')
  })

  it('falls back for an empty status', () => {
    expect(projectStatus('').label).toBe('In Progress')
  })

  it.each(['toString', 'constructor', '__proto__', 'hasOwnProperty'])(
    'falls back for the inherited key %s instead of returning a prototype member',
    (status) => {
      const style = projectStatus(status)
      expect(style.label).toBe('In Progress')
      expect(typeof style.className).toBe('string')
    },
  )

  it('is case sensitive (content uses lowercase slugs)', () => {
    expect(projectStatus('Completed').label).toBe('In Progress')
  })
})
