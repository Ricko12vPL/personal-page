'use client'

import { useState } from 'react'

interface CiteBlockProps {
  bibtex: string
}

export function CiteBlock({ bibtex }: CiteBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bibtex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800">
        <span className="text-[11px] tracking-wider uppercase text-neutral-500">
          BibTeX
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[12px] text-accent hover:opacity-70 transition-opacity"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-4 text-[12px] leading-relaxed text-neutral-300 overflow-x-auto whitespace-pre">
        {bibtex}
      </pre>
    </div>
  )
}
