'use client'

import { useEffect, useState } from 'react'

interface CiteBlockProps {
  bibtex: string
}

type CopyState = 'idle' | 'copied' | 'failed'

const RESET_MS = 2000

const BUTTON_TEXT: Record<CopyState, string> = {
  idle: 'copy',
  copied: 'copied ✓',
  failed: 'copy failed',
}

export function CiteBlock({ bibtex }: CiteBlockProps) {
  const [state, setState] = useState<CopyState>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const timer = setTimeout(() => setState('idle'), RESET_MS)
    return () => clearTimeout(timer)
  }, [state])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bibtex)
      setState('copied')
    } catch {
      setState('failed')
    }
  }

  return (
    <div className="panel min-w-0">
      <div className="flex items-center justify-between border-b hairline px-4 py-2">
        <span className="label">bibtex</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[12px] text-accent hover:text-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/60 transition-colors"
        >
          <span aria-live="polite">{BUTTON_TEXT[state]}</span>
        </button>
      </div>
      <pre className="px-4 py-4 text-[12px] leading-relaxed text-neutral-300 overflow-x-auto whitespace-pre">
        {bibtex}
      </pre>
    </div>
  )
}
