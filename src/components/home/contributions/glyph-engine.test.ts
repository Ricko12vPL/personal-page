import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS_PER_WEEK, DIM_GLYPH, LEVEL_COLORS } from './calendar-model'
import { createGlyphEngine, type EngineCell } from './glyph-engine'

// A recording stand-in for CanvasRenderingContext2D: only what the engine uses.
interface FillCall {
  glyph: string
  x: number
  y: number
  color: string
}

function fakeContext() {
  const fills: FillCall[] = []
  const clears: number[][] = []
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    setTransform: vi.fn(),
    clearRect: (...rect: number[]) => clears.push(rect),
    fillText(glyph: string, x: number, y: number) {
      fills.push({ glyph, x, y, color: String(ctx.fillStyle) })
    },
  }
  return { ctx, fills, clears }
}

const COLS = 4
const WIDTH = 400
const HEIGHT = 70

// 4 columns × 7 rows; every third cell is lit with a level 1–4.
const CELLS: EngineCell[] = Array.from({ length: COLS * DAYS_PER_WEEK }, (_, i) => ({
  col: Math.floor(i / DAYS_PER_WEEK),
  row: i % DAYS_PER_WEEK,
  level: i % 3 === 0 ? (i % 4) + 1 : 0,
}))
const LIT = CELLS.filter((cell) => cell.level > 0).length

let frames: FrameRequestCallback[] = []

function setup(animate: boolean) {
  const { ctx, fills, clears } = fakeContext()
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: WIDTH, height: HEIGHT }),
  } as unknown as HTMLCanvasElement
  const engine = createGlyphEngine(canvas, { cols: COLS, cells: CELLS, fontFamily: 'mono', animate })
  return { engine, canvas, ctx, fills, clears }
}

function runFrame(at: number) {
  const pending = frames
  frames = []
  pending.forEach((callback) => callback(at))
}

beforeEach(() => {
  frames = []
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
  vi.stubGlobal('window', { devicePixelRatio: 3 })
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = []
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createGlyphEngine: setup', () => {
  it('sizes the backing store with the device pixel ratio capped at 2', () => {
    const { canvas, ctx } = setup(true)
    expect(canvas.width).toBe(WIDTH * 2)
    expect(canvas.height).toBe(HEIGHT * 2)
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0)
  })

  it('starts blank: the first paint only clears', () => {
    const { fills, clears } = setup(true)
    expect(fills).toHaveLength(0)
    expect(clears).toEqual([[0, 0, WIDTH, HEIGHT]])
  })
})

describe('createGlyphEngine: settled calendar', () => {
  it('draws every day exactly once, dim days as the dim dot', () => {
    const { engine, fills } = setup(true)
    engine.showSettled()
    expect(fills).toHaveLength(CELLS.length)
    const dim = fills.filter((fill) => fill.glyph === DIM_GLYPH)
    expect(dim).toHaveLength(CELLS.length - LIT)
    expect(dim.every((fill) => fill.color === LEVEL_COLORS[0])).toBe(true)
  })

  it('centres each glyph in its cell', () => {
    const { engine, fills } = setup(true)
    engine.showSettled()
    const cellW = WIDTH / COLS
    const cellH = HEIGHT / DAYS_PER_WEEK
    expect(fills[0]).toMatchObject({ x: cellW / 2, y: cellH / 2 })
    expect(fills[CELLS.length - 1]).toMatchObject({ x: (COLS - 0.5) * cellW, y: (DAYS_PER_WEEK - 0.5) * cellH })
  })

  it('under reduced motion, playIntro jumps straight to the settled frame', () => {
    const { engine, fills } = setup(false)
    engine.playIntro()
    expect(frames).toHaveLength(0)
    expect(fills).toHaveLength(CELLS.length)
  })

  it('redraw repaints the whole settled calendar', () => {
    const { engine, fills } = setup(true)
    engine.showSettled()
    engine.redraw()
    expect(fills).toHaveLength(CELLS.length * 2)
  })
})

describe('createGlyphEngine: intro', () => {
  it('rains for a while, then settles on the calendar', () => {
    const { engine, fills } = setup(true)
    engine.playIntro()
    expect(frames).toHaveLength(1)
    runFrame(performance.now() + 100)
    expect(frames).toHaveLength(1) // still raining
    fills.length = 0
    runFrame(performance.now() + 10_000)
    expect(frames).toHaveLength(0)
    expect(fills).toHaveLength(CELLS.length)
  })

  it('plays only once', () => {
    const { engine } = setup(true)
    engine.playIntro()
    runFrame(performance.now() + 10_000)
    engine.playIntro()
    expect(frames).toHaveLength(0)
  })
})

describe('createGlyphEngine: idle shimmer', () => {
  it('runs only while visible, and repaints just the swapped cells', () => {
    const { engine, fills, clears } = setup(true)
    engine.showSettled()
    fills.length = 0
    clears.length = 0

    vi.advanceTimersByTime(1_000)
    expect(fills).toHaveLength(0) // not running yet

    engine.setRunning(true)
    vi.advanceTimersByTime(120)
    expect(fills.length).toBeGreaterThan(0)
    expect(fills.length).toBeLessThan(CELLS.length)
    expect(clears).toHaveLength(fills.length)
    expect(fills.every((fill) => fill.glyph !== DIM_GLYPH)).toBe(true)

    engine.setRunning(false)
    const before = fills.length
    vi.advanceTimersByTime(1_000)
    expect(fills).toHaveLength(before)
  })

  it('never shimmers under reduced motion', () => {
    const { engine, fills } = setup(false)
    engine.showSettled()
    engine.setRunning(true)
    fills.length = 0
    vi.advanceTimersByTime(1_000)
    expect(fills).toHaveLength(0)
  })

  it('stops everything on destroy', () => {
    const { engine, fills } = setup(true)
    engine.playIntro()
    engine.destroy()
    expect(frames).toHaveLength(0)
    engine.showSettled()
    engine.setRunning(true)
    engine.destroy()
    fills.length = 0
    vi.advanceTimersByTime(1_000)
    expect(fills).toHaveLength(0)
  })
})
