import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activeHTMLElement, restoreFocus } from './dom'

class FakeElement {
  isConnected = true
  focus = vi.fn()
}

const body = new FakeElement()
let active: unknown = null

beforeEach(() => {
  active = null
  vi.stubGlobal('HTMLElement', FakeElement)
  vi.stubGlobal('document', {
    body,
    get activeElement() {
      return active
    },
  })
})

describe('activeHTMLElement', () => {
  it('returns the focused element', () => {
    const el = new FakeElement()
    active = el
    expect(activeHTMLElement()).toBe(el)
  })

  it('never returns <body> or a non-element', () => {
    active = body
    expect(activeHTMLElement()).toBeNull()
    active = null
    expect(activeHTMLElement()).toBeNull()
    active = { focus() {} }
    expect(activeHTMLElement()).toBeNull()
  })
})

describe('restoreFocus', () => {
  it('focuses a still-connected element without scrolling', () => {
    const el = new FakeElement()
    restoreFocus(el as unknown as HTMLElement)
    expect(el.focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('does nothing for a detached element or null', () => {
    const el = new FakeElement()
    el.isConnected = false
    restoreFocus(el as unknown as HTMLElement)
    expect(el.focus).not.toHaveBeenCalled()
    expect(() => restoreFocus(null)).not.toThrow()
  })
})
