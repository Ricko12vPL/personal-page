'use client'

import { useEffect, useRef } from 'react'
import type { WildMenu } from './completion'
import { useCommandInput, type CommandInputOptions } from './use-command-input'

interface CommandLineProps extends CommandInputOptions {
  readonly id: string
  readonly onBlur: () => void
}

export function CommandLine({ id, onBlur, ...options }: CommandLineProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { value, wild, onChange, onKeyDown } = useCommandInput(options)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex min-w-0 flex-1 items-center gap-0.5 px-3">
      <span aria-hidden="true" className="text-accent">
        :
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        aria-label="Command line"
        aria-describedby={`${id}-hint`}
        placeholder="help · e <slug> · tab completes · esc closes"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        maxLength={120}
        // 16px below 700px stops iOS Safari from zooming on focus.
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-none text-neutral-100 caret-accent outline-none placeholder:text-neutral-600 min-[700px]:text-[11px]"
      />
      <span id={`${id}-hint`} className="sr-only">
        Tab completes, Escape closes and returns focus.
      </span>
      {wild && <WildMenuStrip wild={wild} />}
    </div>
  )
}

/** vim's wildmenu: the Tab candidates, current one highlighted, above the bar. */
function WildMenuStrip({ wild }: { readonly wild: WildMenu }) {
  const selectedRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [wild.index])

  return (
    <ul
      aria-label="Completions"
      className="chrome-scroll-x absolute inset-x-0 bottom-full flex h-6 items-center gap-1 overflow-x-auto whitespace-nowrap border-t hairline bg-background px-2"
    >
      {wild.candidates.map((candidate, i) => (
        <li
          key={candidate}
          ref={i === wild.index ? selectedRef : undefined}
          aria-current={i === wild.index ? 'true' : undefined}
          className={
            i === wild.index ? 'bg-accent px-1.5 text-black' : 'px-1.5 text-neutral-400'
          }
        >
          {candidate}
        </li>
      ))}
    </ul>
  )
}
