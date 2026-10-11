import { beforeEach, describe, expect, it, vi } from 'vitest'
import { interpretKey, type KeyState } from './keys'

// Node has no DOM: stub just enough of HTMLElement / document for dom.ts.
class FakeElement {
  tagName = 'DIV'
  isContentEditable = false
}

class FakeInput extends FakeElement {
  tagName = 'INPUT'
}

let filterInput: FakeInput | null = null

beforeEach(() => {
  filterInput = null
  vi.stubGlobal('HTMLElement', FakeElement)
  vi.stubGlobal('HTMLInputElement', FakeInput)
  vi.stubGlobal('document', {
    getElementById: (id: string) => (id === 'project-filter' ? filterInput : null),
  })
})

const IDLE: KeyState = { chordPending: false, helpOpen: false }
const CHORD: KeyState = { chordPending: true, helpOpen: false }
const HELP: KeyState = { chordPending: false, helpOpen: true }

function key(name: string, overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: name,
    target: new FakeElement(),
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    isComposing: false,
    defaultPrevented: false,
    ...overrides,
  } as unknown as KeyboardEvent
}

function element(props: Partial<FakeElement>): FakeElement {
  return Object.assign(new FakeElement(), props)
}

describe('interpretKey: typing guard', () => {
  it.each(['INPUT', 'TEXTAREA', 'SELECT'])('ignores keys typed into a %s', (tagName) => {
    expect(interpretKey(key('g', { target: element({ tagName }) as never }), IDLE)).toEqual({ type: 'ignore' })
    expect(interpretKey(key(':', { target: element({ tagName }) as never }), IDLE)).toEqual({ type: 'ignore' })
  })

  it('ignores keys typed into a contentEditable element', () => {
    const target = element({ isContentEditable: true }) as never
    expect(interpretKey(key('?', { target }), IDLE)).toEqual({ type: 'ignore' })
  })

  it('ignores keys typed into a field even mid-chord', () => {
    const target = element({ tagName: 'INPUT' }) as never
    expect(interpretKey(key('p', { target }), CHORD)).toEqual({ type: 'ignore' })
  })

  it('treats a non-element target (window) as the page', () => {
    expect(interpretKey(key('?', { target: null }), IDLE)).toEqual({ type: 'help' })
  })
})

describe('interpretKey: modifiers and composition', () => {
  it.each(['ctrlKey', 'metaKey', 'altKey'] as const)('ignores g with %s held', (modifier) => {
    expect(interpretKey(key('g', { [modifier]: true }), IDLE)).toEqual({ type: 'ignore' })
    expect(interpretKey(key('p', { [modifier]: true }), CHORD)).toEqual({ type: 'ignore' })
  })

  it('ignores IME composition and already-handled events', () => {
    expect(interpretKey(key('g', { isComposing: true }), IDLE)).toEqual({ type: 'ignore' })
    expect(interpretKey(key('g', { defaultPrevented: true }), IDLE)).toEqual({ type: 'ignore' })
  })

  it('ignores auto-repeat for single keys', () => {
    expect(interpretKey(key('g', { repeat: true }), IDLE)).toEqual({ type: 'ignore' })
  })
})

describe('interpretKey: help dialog open', () => {
  it('only lets ? through (to close it)', () => {
    expect(interpretKey(key('?'), HELP)).toEqual({ type: 'help' })
    expect(interpretKey(key('g'), HELP)).toEqual({ type: 'ignore' })
    expect(interpretKey(key(':'), HELP)).toEqual({ type: 'ignore' })
    expect(interpretKey(key('p'), { chordPending: true, helpOpen: true })).toEqual({ type: 'ignore' })
  })
})

describe('interpretKey: single keys', () => {
  it('g starts a chord, ? opens help, : opens the command line', () => {
    expect(interpretKey(key('g'), IDLE)).toEqual({ type: 'start-chord' })
    expect(interpretKey(key('?'), IDLE)).toEqual({ type: 'help' })
    expect(interpretKey(key(':'), IDLE)).toEqual({ type: 'command' })
  })

  it('/ focuses the project filter only when the page has one', () => {
    expect(interpretKey(key('/'), IDLE)).toEqual({ type: 'ignore' })
    filterInput = new FakeInput()
    expect(interpretKey(key('/'), IDLE)).toEqual({ type: 'filter', input: filterInput })
  })

  it('/ ignores an element with the filter id that is not an input', () => {
    filterInput = new FakeElement() as FakeInput
    expect(interpretKey(key('/'), IDLE)).toEqual({ type: 'ignore' })
  })

  it('ignores unrelated keys', () => {
    expect(interpretKey(key('x'), IDLE)).toEqual({ type: 'ignore' })
    expect(interpretKey(key('Enter'), IDLE)).toEqual({ type: 'ignore' })
  })
})

describe('interpretKey: g chords', () => {
  it.each([
    ['h', '/'],
    ['p', '/projects'],
    ['r', '/research'],
    ['b', '/blog'],
    ['c', '/cv'],
  ])('g %s navigates to %s', (second, href) => {
    expect(interpretKey(key(second), CHORD)).toEqual({ type: 'navigate', href })
  })

  it('g g goes to the top', () => {
    expect(interpretKey(key('g'), CHORD)).toEqual({ type: 'top' })
  })

  it('any other second key cancels the chord', () => {
    expect(interpretKey(key('x'), CHORD)).toEqual({ type: 'cancel-chord' })
    expect(interpretKey(key('?'), CHORD)).toEqual({ type: 'cancel-chord' })
  })

  it('a repeated second key still completes the chord', () => {
    expect(interpretKey(key('p', { repeat: true }), CHORD)).toEqual({ type: 'navigate', href: '/projects' })
  })
})
