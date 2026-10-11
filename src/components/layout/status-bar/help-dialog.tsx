'use client'

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { COMMANDS } from './commands'
import { activeHTMLElement, restoreFocus } from './dom'
import { CHORD_JUMPS } from './keymap'

const TITLE_ID = 'keyboard-help-title'

interface HelpDialogProps {
  readonly open: boolean
  readonly onClose: () => void
}

/**
 * `?` reference card. Native <dialog> + showModal(): Esc closes, the page is
 * inert behind it, and focus goes back to where it was.
 */
export function HelpDialog({ open, onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocusRef.current = activeHTMLElement()
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleClose = () => {
    onClose()
    restoreFocus(returnFocusRef.current)
    returnFocusRef.current = null
  }

  // A click whose target is the <dialog> itself landed on the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClose={handleClose}
      onClick={handleClick}
      className="help-dialog print-hidden m-auto max-h-[calc(100dvh-64px)] w-[min(600px,calc(100vw-32px))] overflow-y-auto bg-transparent p-0 font-mono text-[12px] leading-[1.6] text-neutral-300"
    >
      <div className="panel panel-ticks p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={TITLE_ID} className="text-[13px] text-neutral-100">
            <span className="text-accent">:</span>help
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="chrome-help-btn chrome-focus flex cursor-pointer items-center gap-2 text-neutral-400"
          >
            <kbd className="kbd">esc</kbd>
            <span>close</span>
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <KeySection />
          <CommandSection />
        </div>
        <div className="label mt-6">
          tab completes · ↑ ↓ history · shortcuts pause while you type in a field
        </div>
      </div>
    </dialog>
  )
}

function Row({ keys, children }: { readonly keys: ReactNode; readonly children: ReactNode }) {
  return (
    <li className="flex items-baseline gap-2">
      <span className="shrink-0">{keys}</span>
      <span aria-hidden="true" className="dotted-leader" />
      <span className="min-w-0 text-right text-neutral-400">{children}</span>
    </li>
  )
}

function KeySection() {
  return (
    <section>
      <h3 className="label mb-3">Keys</h3>
      <ul className="space-y-1.5">
        {CHORD_JUMPS.map((jump) => (
          <Row key={jump.key} keys={<kbd className="kbd">{`g ${jump.key}`}</kbd>}>
            {jump.label}
          </Row>
        ))}
        <Row keys={<kbd className="kbd">g g</kbd>}>top of page</Row>
        <Row keys={<kbd className="kbd">/</kbd>}>filter projects</Row>
        <Row keys={<kbd className="kbd">:</kbd>}>command line</Row>
        <Row keys={<kbd className="kbd">?</kbd>}>this help</Row>
      </ul>
    </section>
  )
}

function CommandSection() {
  return (
    <section>
      <h3 className="label mb-3">Commands</h3>
      <ul className="space-y-1.5">
        {COMMANDS.map((command) => (
          <Row key={command.name} keys={<code className="text-accent">:{command.usage}</code>}>
            {command.summary}
          </Row>
        ))}
      </ul>
    </section>
  )
}
