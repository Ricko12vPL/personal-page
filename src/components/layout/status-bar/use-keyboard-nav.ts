'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import { CHORD_TIMEOUT_MS } from './keymap'
import { interpretKey, type KeyIntent } from './keys'

export interface KeyboardNavOptions {
  readonly helpOpen: boolean
  readonly onNavigate: (href: string) => void
  readonly onToggleHelp: () => void
  readonly onOpenCommand: () => void
}

/**
 * Page-wide vim-style shortcuts: `g h/p/r/b/c` jumps, `g g` top, `?` help,
 * `/` project filter, `:` command line. Returns whether a `g` chord is pending
 * so the status bar can show "g-".
 */
export function useKeyboardNav(options: KeyboardNavOptions): { chordPending: boolean } {
  const [chordPending, setChordPending] = useState(false)

  const isHelpOpen = useEffectEvent(() => options.helpOpen)

  const perform = useEffectEvent((intent: KeyIntent) => {
    switch (intent.type) {
      case 'navigate':
        options.onNavigate(intent.href)
        return
      case 'top': {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
        return
      }
      case 'help':
        options.onToggleHelp()
        return
      case 'command':
        options.onOpenCommand()
        return
      case 'filter':
        intent.input.focus()
        intent.input.select()
        return
      default:
        return
    }
  })

  useEffect(() => {
    let pending = false
    let timer: number | undefined

    const setPending = (next: boolean) => {
      window.clearTimeout(timer)
      pending = next
      setChordPending(next)
      if (next) timer = window.setTimeout(() => setPending(false), CHORD_TIMEOUT_MS)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const intent = interpretKey(event, { chordPending: pending, helpOpen: isHelpOpen() })
      if (intent.type === 'ignore') return
      if (pending) setPending(false)
      if (intent.type === 'start-chord') {
        setPending(true)
        return
      }
      if (intent.type === 'cancel-chord') return
      // Keep ":" and "/" out of the input they are about to focus.
      event.preventDefault()
      perform(intent)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [])

  return { chordPending }
}
