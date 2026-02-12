'use client'

import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?'
const FONT_SIZE = 14
const COLUMN_GAP = 28
const FADE_SPEED = 0.03
const DROP_CHANCE = 0.985
const MAX_OPACITY = 0.07

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let columns: number
    let drops: number[]
    let opacities: number[]

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      columns = Math.floor(canvas!.width / COLUMN_GAP)
      drops = Array.from({ length: columns }, () =>
        Math.floor(Math.random() * canvas!.height / FONT_SIZE)
      )
      opacities = Array.from({ length: columns }, () =>
        Math.random() * MAX_OPACITY
      )
    }

    function draw() {
      ctx!.fillStyle = 'rgba(5, 5, 5, 0.15)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * COLUMN_GAP
        const y = drops[i] * FONT_SIZE

        ctx!.font = `${FONT_SIZE}px var(--font-geist-pixel-square), monospace`
        ctx!.fillStyle = `rgba(0, 255, 65, ${opacities[i]})`
        ctx!.fillText(char, x, y)

        if (y > canvas!.height && Math.random() > DROP_CHANCE) {
          drops[i] = 0
          opacities[i] = Math.random() * MAX_OPACITY
        }

        drops[i] += 0.5

        opacities[i] = Math.max(0, opacities[i] - FADE_SPEED * 0.01)
        if (opacities[i] <= 0) {
          opacities[i] = Math.random() * MAX_OPACITY
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

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
