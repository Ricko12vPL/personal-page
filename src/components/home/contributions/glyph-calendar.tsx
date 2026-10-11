'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import {
  DAYS_PER_WEEK,
  MIN_DESKTOP_WIDTH,
  MOBILE_WEEKS,
  dayReadout,
  type Week,
} from './calendar-model'
import type { ContributionDay } from './snapshot'
import { createGlyphEngine, type EngineCell } from './glyph-engine'
import { useMediaQuery } from './use-media-query'

interface GlyphCalendarProps {
  /** Exactly the desktop week count (53); mobile shows the trailing 26. */
  weeks: readonly Week[]
  label: string
  hint: string
  weekdays: ReactNode
  axis: ReactNode
  legend: ReactNode
}

interface Located {
  col: number
  row: number
  day: ContributionDay
}

const FONT_VAR = '--font-geist-mono'
const FONT_FALLBACK = 'ui-monospace, monospace'
const VISIBLE_THRESHOLD = 0.2
const MOVES: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function toCells(weeks: readonly Week[]): EngineCell[] {
  return weeks.flatMap((week, col) =>
    week.flatMap((day, row) => (day ? [{ col, row, level: day.level }] : []))
  )
}

function locate(weeks: readonly Week[], date: string | null): Located | null {
  if (!date) return null
  const hits = weeks.flatMap((week, col) =>
    week.flatMap((day, row) => (day?.date === date ? [{ col, row, day }] : []))
  )
  return hits[0] ?? null
}

function edgeDay(weeks: readonly Week[], which: 'first' | 'last'): ContributionDay | null {
  const days = weeks.flat().filter((day): day is ContributionDay => day !== null)
  return (which === 'first' ? days[0] : days[days.length - 1]) ?? null
}

function resolveFontFamily(): string {
  const family = getComputedStyle(document.body).getPropertyValue(FONT_VAR).trim()
  return family ? `${family}, ${FONT_FALLBACK}` : FONT_FALLBACK
}

function useGlyphCanvas(weeks: readonly Week[], cols: number, reducedMotion: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return undefined
    const engine = createGlyphEngine(canvas, {
      cols,
      cells: toCells(weeks),
      fontFamily: resolveFontFamily(),
      animate: !reducedMotion,
    })
    if (reducedMotion || playedRef.current || typeof IntersectionObserver === 'undefined') {
      engine.showSettled()
    }
    let onScreen = false
    const sync = () => engine.setRunning(onScreen && !document.hidden)
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              onScreen = entry?.isIntersecting ?? false
              if (onScreen && !playedRef.current) {
                playedRef.current = true
                engine.playIntro()
              }
              sync()
            },
            { threshold: VISIBLE_THRESHOLD }
          )
    io?.observe(canvas)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => engine.resize())
    ro?.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    document.fonts?.ready.then(() => engine.redraw()).catch(() => undefined)
    return () => {
      io?.disconnect()
      ro?.disconnect()
      document.removeEventListener('visibilitychange', sync)
      engine.destroy()
    }
  }, [weeks, cols, reducedMotion])

  return canvasRef
}

export function GlyphCalendar({ weeks, label, hint, weekdays, axis, legend }: GlyphCalendarProps) {
  const isDesktop = useMediaQuery(`(min-width: ${MIN_DESKTOP_WIDTH}px)`, true)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', false)
  const cols = isDesktop ? weeks.length : Math.min(MOBILE_WEEKS, weeks.length)
  const visible = useMemo(() => weeks.slice(weeks.length - cols), [weeks, cols])
  const canvasRef = useGlyphCanvas(visible, cols, reducedMotion)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const active = locate(visible, activeDate)
  const readoutId = useId()

  function dayAt(event: PointerEvent<HTMLCanvasElement>): ContributionDay | null {
    const rect = event.currentTarget.getBoundingClientRect()
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * cols)
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * DAYS_PER_WEEK)
    return visible[col]?.[row] ?? null
  }

  function onPointer(event: PointerEvent<HTMLCanvasElement>) {
    setActiveDate(dayAt(event)?.date ?? null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const move = MOVES[event.key]
    const jump = event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : null
    if (event.key === 'Escape') {
      setActiveDate(null)
      return
    }
    if (!move && !jump) return
    event.preventDefault()
    if (jump || !active) {
      setActiveDate(edgeDay(visible, jump ?? 'last')?.date ?? null)
      return
    }
    const target = visible[active.col + move[0]]?.[active.row + move[1]]
    if (target) setActiveDate(target.date)
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-3 min-[700px]:grid-cols-[2rem_minmax(0,1fr)]">
        {weekdays}
        <div className="relative aspect-[26/8] min-[700px]:col-start-2 min-[700px]:row-start-1 min-[700px]:aspect-[53/8]">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={label}
            aria-describedby={readoutId}
            tabIndex={0}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(event) => event.pointerType === 'mouse' && setActiveDate(null)}
            onKeyDown={onKeyDown}
            onBlur={() => setActiveDate(null)}
            className="absolute inset-0 h-full w-full cursor-crosshair outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent/60"
          />
          {active && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute border border-accent/80"
              style={{
                left: `${(active.col / cols) * 100}%`,
                top: `${(active.row / DAYS_PER_WEEK) * 100}%`,
                width: `${100 / cols}%`,
                height: `${100 / DAYS_PER_WEEK}%`,
              }}
            />
          )}
        </div>
        {axis}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p id={readoutId} aria-live="polite" className="min-h-[1.5em] text-left text-[12px] tabular-nums">
          {active ? (
            <span className="text-neutral-200">{dayReadout(active.day)}</span>
          ) : (
            <span className="text-neutral-400">{hint}</span>
          )}
        </p>
        {legend}
      </div>
    </div>
  )
}
