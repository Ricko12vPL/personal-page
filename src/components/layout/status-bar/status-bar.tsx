'use client'

import { useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { VisitorsGraph } from '@/components/visitors/visitors-graph'
import { CommandLine } from './command-line'
import { runCommand, type CommandAction } from './commands'
import { appendHistory } from './completion'
import { activeHTMLElement, restoreFocus } from './dom'
import { HelpDialog } from './help-dialog'
import { useFlashMessage, useHydrated, useScrollRuler } from './hooks'
import { HISTORY_LIMIT, MESSAGE_MS } from './keymap'
import { Counters, KeyHints, ModeBlock, PathSegment } from './status-segments'
import type { ContentCounts, ContentEntry } from './types'
import { useKeyboardNav } from './use-keyboard-nav'

const COMMAND_INPUT_ID = 'statusbar-command'

export interface StatusBarProps {
  readonly counts: ContentCounts
  readonly entries: readonly ContentEntry[]
}

/**
 * vim/tmux-style statusline fixed to the bottom of every page: mode, path,
 * content counters, key hints, live visitors, plus the `:` command line and
 * the `?` help card.
 */
export function StatusBar({ counts, entries }: StatusBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const ruler = useScrollRuler()
  const [commandOpen, setCommandOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [history, setHistory] = useState<readonly string[]>([])
  const { message, flash } = useFlashMessage(MESSAGE_MS)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const openCommand = () => {
    returnFocusRef.current = activeHTMLElement()
    setCommandOpen(true)
  }

  const closeCommand = (restore: boolean) => {
    setCommandOpen(false)
    if (restore) restoreFocus(returnFocusRef.current)
  }

  const perform = (action: CommandAction) => {
    switch (action.type) {
      case 'navigate':
        router.push(action.href)
        return
      case 'external':
        window.open(action.href, '_blank', 'noopener,noreferrer')
        return
      case 'mailto':
        window.location.assign(action.href)
        return
      case 'help':
        setHelpOpen(true)
        return
      case 'error':
        flash(action.message)
        return
      case 'close':
        return
    }
  }

  const submit = (raw: string) => {
    const line = raw.trim()
    setHistory((previous) => appendHistory(previous, line, HISTORY_LIMIT))
    const action = runCommand(line, entries)
    // Page changes take focus with them; everything else hands it back.
    closeCommand(action.type !== 'navigate')
    perform(action)
  }

  const { chordPending } = useKeyboardNav({
    helpOpen,
    onNavigate: (href) => router.push(href),
    onToggleHelp: () => setHelpOpen((open) => !open),
    onOpenCommand: openCommand,
  })

  return (
    <aside
      aria-label="Status bar"
      className="statusbar print-hidden fixed inset-x-0 bottom-0 z-50 border-t hairline bg-background font-mono text-[11px] leading-none"
    >
      {/* The row clips; the wildmenu (positioned against <aside>) still shows above it. */}
      <div className="flex h-full items-stretch overflow-hidden">
        <ModeBlock
          hydrated={hydrated}
          commandOpen={commandOpen}
          controls={COMMAND_INPUT_ID}
          onToggle={() => (commandOpen ? closeCommand(true) : openCommand())}
        />
        {commandOpen ? (
          <CommandLine
            id={COMMAND_INPUT_ID}
            entries={entries}
            history={history}
            onSubmit={submit}
            onCancel={() => closeCommand(true)}
            onBlur={() => closeCommand(false)}
          />
        ) : (
          <PathSegment
            pathname={pathname}
            hydrated={hydrated}
            message={message}
            chordPending={chordPending}
            ruler={ruler}
          />
        )}
        <Counters counts={counts} />
        <KeyHints hydrated={hydrated} onHelp={() => setHelpOpen(true)} />
        {/* CSS picks the variant, so the SSR / no-JS markup is already right
            and nothing swaps after hydration. Both share one fetch. */}
        <div className="flex shrink-0 items-center border-l hairline px-3">
          <span className="hidden min-[700px]:inline-flex">
            <VisitorsGraph variant="bar" />
          </span>
          <span className="inline-flex min-[700px]:hidden">
            <VisitorsGraph variant="compact" />
          </span>
        </div>
      </div>
      <span role="status" className="sr-only">
        {message ?? ''}
      </span>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </aside>
  )
}
