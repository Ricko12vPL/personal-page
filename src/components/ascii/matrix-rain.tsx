'use client'

import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const FONT_SIZE = 13

interface Drop {
  x: number
  y: number
  speed: number
  chars: { char: string; y: number; opacity: number }[]
  nextCharAt: number
  trail: number
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let drops: Drop[] = []
    let lastTime = 0

    function createDrop(w: number, h: number, scatter = false): Drop {
      return {
        x: Math.random() * w,
        y: scatter ? -Math.random() * h * 0.5 : -Math.random() * 60,
        speed: 0.2 + Math.random() * 0.5,
        chars: [],
        nextCharAt: 0,
        trail: 3 + Math.floor(Math.random() * 5),
      }
    }

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      const target = Math.floor((canvas!.width * canvas!.height) / 18000)
      while (drops.length < target) {
        const d = createDrop(canvas!.width, canvas!.height, true)
        d.y = Math.random() * canvas!.height
        drops.push(d)
      }
    }

    function draw(time: number) {
      const delta = lastTime ? time - lastTime : 16
      lastTime = time

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const target = Math.floor((canvas!.width * canvas!.height) / 18000)
      if (drops.length < target && Math.random() > 0.92) {
        drops.push(createDrop(canvas!.width, canvas!.height))
      }

      ctx!.font = `${FONT_SIZE}px var(--font-geist-pixel-square), monospace`

      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i]
        drop.y += drop.speed * delta * 0.06

        if (drop.y > drop.nextCharAt) {
          drop.chars.push({
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            y: drop.y,
            opacity: 0.12,
          })
          drop.nextCharAt = drop.y + FONT_SIZE * 1.8
        }

        for (let j = drop.chars.length - 1; j >= 0; j--) {
          const c = drop.chars[j]
          const age = drop.y - c.y
          const fadeStart = drop.trail * FONT_SIZE * 1.5

          if (age > fadeStart) {
            c.opacity -= 0.0008 * delta
          }

          if (c.opacity <= 0) {
            drop.chars.splice(j, 1)
            continue
          }

          ctx!.fillStyle = `rgba(0, 255, 65, ${c.opacity})`
          ctx!.fillText(c.char, drop.x, c.y)
        }

        if (drop.chars.length === 0 && drop.y > canvas!.height) {
          drops.splice(i, 1)
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    animationId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
