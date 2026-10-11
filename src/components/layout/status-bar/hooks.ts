'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const subscribeNever = () => () => {}

/** false during SSR and hydration, true afterwards — without a setState-in-effect. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
}

function subscribeScroll(onChange: () => void): () => void {
  const options = { passive: true } as const
  window.addEventListener('scroll', onChange, options)
  window.addEventListener('resize', onChange, options)
  // Client-side navigation changes the page height without a scroll event.
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(onChange) : null
  observer?.observe(document.body)
  return () => {
    window.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
    observer?.disconnect()
  }
}

/** vim's ruler: "Top", "NN%", "Bot" — or null when the page does not scroll. */
export function scrollRuler(scrollY: number, viewport: number, total: number): string | null {
  const range = total - viewport
  if (range <= 1) return null
  if (scrollY <= 0) return 'Top'
  if (scrollY >= range - 1) return 'Bot'
  return `${Math.round((scrollY / range) * 100)}%`
}

function readScrollRuler(): string | null {
  const { scrollHeight } = document.documentElement
  return scrollRuler(window.scrollY, window.innerHeight, scrollHeight)
}

/** Live scroll position for the status bar; null during SSR and hydration. */
export function useScrollRuler(): string | null {
  return useSyncExternalStore(subscribeScroll, readScrollRuler, () => null)
}

/** A message that clears itself after `durationMs` (vim's bottom-line errors). */
export function useFlashMessage(durationMs: number) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  const flash = useCallback(
    (text: string) => {
      window.clearTimeout(timerRef.current)
      setMessage(text)
      timerRef.current = window.setTimeout(() => setMessage(null), durationMs)
    },
    [durationMs]
  )

  return { message, flash }
}
