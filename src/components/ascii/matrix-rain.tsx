'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const FONT_SIZE = 13
const CELL_SIZE = 24
const CHAR_SPACING = FONT_SIZE * 2.2

interface CharCell {
  char: string
  x: number
  y: number
  opacity: number
  fadeRate: number
}

interface Drop {
  x: number
  y: number
  speed: number
  trail: number
  charsSpawned: number
  startY: number
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let drops: Drop[] = []
    let cells: CharCell[] = []
    let occupied = new Set<string>()
    let lastTime = 0
    let w = 0
    let h = 0

    function cellKey(x: number, y: number): string {
      return `${Math.round(x / CELL_SIZE)},${Math.round(y / CELL_SIZE)}`
    }

    function makeDrop(startAbove: boolean): Drop {
      const negY = startAbove
        ? -FONT_SIZE - Math.random() * 300
        : -FONT_SIZE - Math.random() * h * 2
      return {
        x: Math.random() * w,
        y: negY,
        startY: negY,
        speed: 20 + Math.random() * 35,
        trail: 3 + Math.floor(Math.random() * 5),
        charsSpawned: 0,
      }
    }

    function resize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
    }

    function init() {
      resize()
      drops = []
      cells = []
      occupied = new Set()
      const count = Math.floor((w * h) / 5000)
      for (let i = 0; i < count; i++) {
        drops.push(makeDrop(false))
      }
    }

    function draw(time: number) {
      const delta = Math.min(lastTime ? time - lastTime : 16, 32)
      lastTime = time
      const dt = delta / 1000

      ctx!.clearRect(0, 0, w, h)
      ctx!.font = `${FONT_SIZE}px var(--font-geist-pixel-square), monospace`

      const target = Math.floor((w * h) / 5000)
      if (drops.length < target) {
        const batch = Math.min(3, target - drops.length)
        for (let s = 0; s < batch; s++) {
          drops.push(makeDrop(true))
        }
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i]
        drop.y += drop.speed * dt

        const distFromStart = drop.y - drop.startY
        const expectedChars = Math.floor(distFromStart / CHAR_SPACING)

        while (drop.charsSpawned < expectedChars && drop.charsSpawned < drop.trail + 8) {
          const cy = drop.startY + drop.charsSpawned * CHAR_SPACING
          if (cy >= -FONT_SIZE && cy <= h + FONT_SIZE) {
            const key = cellKey(drop.x, cy)
            if (!occupied.has(key)) {
              occupied.add(key)
              cells.push({
                char: CHARS[Math.floor(Math.random() * CHARS.length)],
                x: drop.x,
                y: cy,
                opacity: 0.22 + Math.random() * 0.08,
                fadeRate: 0.04 + Math.random() * 0.03,
              })
            }
          }
          drop.charsSpawned++
        }

        if (drop.y > h + drop.trail * CHAR_SPACING + 100) {
          drops[i] = makeDrop(true)
        }
      }

      for (let j = cells.length - 1; j >= 0; j--) {
        const c = cells[j]
        c.opacity -= c.fadeRate * dt

        if (c.opacity <= 0) {
          occupied.delete(cellKey(c.x, c.y))
          cells[j] = cells[cells.length - 1]
          cells.pop()
          continue
        }

        ctx!.fillStyle = `rgba(0, 255, 65, ${c.opacity})`
        ctx!.fillText(c.char, c.x, c.y)
      }

      animationId = requestAnimationFrame(draw)
    }

    init()
    animationId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: 'transparent' }}
      aria-hidden="true"
    />
  )
}
