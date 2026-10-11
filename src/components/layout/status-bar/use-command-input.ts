'use client'

import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  FRESH_CURSOR,
  stepCompletion,
  stepHistory,
  type HistoryCursor,
  type WildMenu,
} from './completion'
import type { ContentEntry } from './types'

export interface CommandInputOptions {
  readonly entries: readonly ContentEntry[]
  readonly history: readonly string[]
  readonly onSubmit: (value: string) => void
  readonly onCancel: () => void
}

/** Value, Tab-completion menu and history cursor for the command line. */
export function useCommandInput({ entries, history, onSubmit, onCancel }: CommandInputOptions) {
  const [value, setValue] = useState('')
  const [wild, setWild] = useState<WildMenu | null>(null)
  const [cursor, setCursor] = useState<HistoryCursor>(FRESH_CURSOR)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setWild(null)
  }

  const complete = (backwards: boolean) => {
    const step = stepCompletion(value, wild, entries, backwards)
    setValue(step.value)
    setWild(step.wild)
  }

  const recall = (direction: 'older' | 'newer') => {
    const step = stepHistory(history, cursor, value, direction)
    if (!step) return
    setValue(step.value)
    setCursor(step.cursor)
    setWild(null)
  }

  const handleKey = (event: KeyboardEvent<HTMLInputElement>): boolean => {
    switch (event.key) {
      case 'Tab':
        complete(event.shiftKey)
        return true
      case 'ArrowUp':
        recall('older')
        return true
      case 'ArrowDown':
        recall('newer')
        return true
      case 'Enter':
        onSubmit(value)
        return true
      case 'Escape':
        onCancel()
        return true
      case 'Backspace':
        // Like vim: backspacing over an empty line leaves command mode.
        if (value !== '') return false
        onCancel()
        return true
      default:
        return false
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (handleKey(event)) event.preventDefault()
  }

  return { value, wild, onChange, onKeyDown }
}
