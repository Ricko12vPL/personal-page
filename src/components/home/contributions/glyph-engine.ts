// Canvas renderer for fig. 1. Framework-free: the React wrapper owns the
// lifecycle (observers, visibility) and calls into this. All animation state
// lives in this closure; nothing outside is mutated.
import { DAYS_PER_WEEK, DIM_GLYPH, LEVEL_COLORS } from './calendar-model'

export interface EngineCell {
  col: number
  row: number
  level: number
}

export interface GlyphEngineOptions {
  cols: number
  cells: readonly EngineCell[]
  fontFamily: string
  /** false under prefers-reduced-motion: no rain, no idle re-glyphing. */
  animate: boolean
}

export interface GlyphEngine {
  /** Glyph rain falls down every column and settles into the calendar. */
  playIntro(): void
  /** Jump straight to the settled calendar (reduced motion, replays). */
  showSettled(): void
  /** Whether the figure is on screen and the document visible. */
  setRunning(running: boolean): void
  resize(): void
  redraw(): void
  destroy(): void
}

const GLYPHS = Array.from(
  'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
)
const HEAD_COLOR = '#00ff41'
const FALL_MS = 1100
const MAX_COLUMN_DELAY_MS = 500
const INTRO_MS = FALL_MS + MAX_COLUMN_DELAY_MS
const TRAIL_ROWS = 3
const IDLE_TICK_MS = 120
const IDLE_SHARE = 0.01
const GLYPH_SCALE_W = 0.74
const GLYPH_SCALE_H = 0.66
const MAX_DPR = 2

type Phase = 'blank' | 'intro' | 'settled'

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

function trailColor(distance: number): string {
  const fade = 1 - (distance - 1) / (TRAIL_ROWS + 1)
  return `rgba(0, 255, 65, ${Math.max(0.25, fade).toFixed(2)})`
}

export function createGlyphEngine(
  canvas: HTMLCanvasElement,
  { cols, cells, fontFamily, animate }: GlyphEngineOptions
): GlyphEngine {
  const ctx = canvas.getContext('2d')
  const litIndices = cells.flatMap((cell, i) => (cell.level > 0 ? [i] : []))
  const delays = Array.from({ length: cols }, () => Math.random() * MAX_COLUMN_DELAY_MS)

  let glyphs = cells.map(() => randomGlyph())
  let phase: Phase = 'blank'
  let introStart = 0
  let frame = 0
  let idleTimer: ReturnType<typeof setInterval> | null = null
  let running = false
  let size = { width: 0, height: 0, dpr: 1 }

  function drawCell(cell: EngineCell, glyph: string, color: string) {
    if (!ctx) return
    const cellW = size.width / cols
    const cellH = size.height / DAYS_PER_WEEK
    ctx.fillStyle = color
    ctx.fillText(glyph, (cell.col + 0.5) * cellW, (cell.row + 0.5) * cellH)
  }

  function drawSettledCell(cell: EngineCell, index: number) {
    if (cell.level === 0) drawCell(cell, DIM_GLYPH, LEVEL_COLORS[0])
    else drawCell(cell, glyphs[index], LEVEL_COLORS[cell.level] ?? HEAD_COLOR)
  }

  function drawIntroCell(cell: EngineCell, index: number, elapsed: number) {
    const local = (elapsed - delays[cell.col]) / FALL_MS
    const head = local * (DAYS_PER_WEEK + TRAIL_ROWS)
    const distance = head - cell.row
    if (distance < 0) return
    if (distance < 1) drawCell(cell, randomGlyph(), HEAD_COLOR)
    else if (distance < 1 + TRAIL_ROWS) drawCell(cell, glyphs[index], trailColor(distance))
    else drawSettledCell(cell, index)
  }

  /** Transform, font and alignment for the current size; false if nothing can be drawn. */
  function prepare(): boolean {
    if (!ctx || size.width === 0) return false
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
    const cellW = size.width / cols
    const cellH = size.height / DAYS_PER_WEEK
    const fontSize = Math.max(6, Math.min(cellW * GLYPH_SCALE_W, cellH * GLYPH_SCALE_H))
    ctx.font = `${fontSize.toFixed(1)}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    return true
  }

  function paint(now: number) {
    if (!ctx || !prepare()) return
    ctx.clearRect(0, 0, size.width, size.height)
    if (phase === 'blank') return
    const elapsed = now - introStart
    cells.forEach((cell, index) => {
      if (phase === 'settled') drawSettledCell(cell, index)
      else drawIntroCell(cell, index, elapsed)
    })
  }

  /** Repaint only the given settled cells (the canvas has no background fill). */
  function repaintCells(indices: ReadonlySet<number>) {
    if (!ctx || phase !== 'settled' || !prepare()) return
    const cellW = size.width / cols
    const cellH = size.height / DAYS_PER_WEEK
    indices.forEach((index) => {
      const cell = cells[index]
      ctx.clearRect(cell.col * cellW, cell.row * cellH, cellW, cellH)
      drawSettledCell(cell, index)
    })
  }

  // Idle shimmer: swap ~1% of the lit glyphs and redraw just those cells
  // (a handful of fillText calls per tick instead of the whole calendar).
  function reglyph() {
    if (litIndices.length === 0) return
    const picks = Math.max(1, Math.round(litIndices.length * IDLE_SHARE))
    const chosen = new Set(
      Array.from({ length: picks }, () => litIndices[Math.floor(Math.random() * litIndices.length)])
    )
    glyphs = glyphs.map((glyph, i) => (chosen.has(i) ? randomGlyph() : glyph))
    repaintCells(chosen)
  }

  function stopIdle() {
    if (idleTimer !== null) clearInterval(idleTimer)
    idleTimer = null
  }

  function syncIdle() {
    const shouldRun = animate && running && phase === 'settled' && litIndices.length > 0
    if (shouldRun && idleTimer === null) idleTimer = setInterval(reglyph, IDLE_TICK_MS)
    if (!shouldRun) stopIdle()
  }

  function tick(now: number) {
    if (now - introStart >= INTRO_MS) {
      phase = 'settled'
      frame = 0
      paint(now)
      syncIdle()
      return
    }
    paint(now)
    frame = requestAnimationFrame(tick)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    size = { width: rect.width, height: rect.height, dpr }
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    paint(performance.now())
  }

  function cancelFrame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function showSettled() {
    cancelFrame()
    phase = 'settled'
    paint(performance.now())
    syncIdle()
  }

  function playIntro() {
    if (phase !== 'blank') return
    if (!animate) {
      showSettled()
      return
    }
    phase = 'intro'
    introStart = performance.now()
    frame = requestAnimationFrame(tick)
  }

  resize()

  return {
    playIntro,
    showSettled,
    setRunning(next: boolean) {
      running = next
      syncIdle()
    },
    resize,
    redraw() {
      paint(performance.now())
    },
    destroy() {
      cancelFrame()
      stopIdle()
    },
  }
}
