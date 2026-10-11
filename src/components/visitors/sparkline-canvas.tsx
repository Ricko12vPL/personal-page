'use client'

import { useEffect, useRef } from 'react'
import { SPARK, SPARK_COLORS, sparklineBars } from '@/lib/visitors/sparkline'

interface SparklineCanvasProps {
  hours: readonly (number | null)[]
  /** CSS width in px (bars × 2 + gaps × 1). */
  width: number
}

// Draws in device pixels with rounded coordinates so 2px bars stay crisp at
// fractional DPRs (125 %, 150 % zoom). Static: one draw per data/size change.
function draw(canvas: HTMLCanvasElement, hours: readonly (number | null)[], width: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const pixelWidth = Math.round(width * dpr)
  const pixelHeight = Math.round(SPARK.height * dpr)
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, pixelWidth, pixelHeight)
  for (const bar of sparklineBars(hours)) {
    const x = Math.round(bar.x * dpr)
    const y = Math.round(bar.y * dpr)
    const w = Math.max(1, Math.round(bar.width * dpr))
    const h = Math.max(1, Math.round((bar.y + bar.height) * dpr) - y)
    ctx.fillStyle = SPARK_COLORS[bar.kind]
    ctx.fillRect(x, y, w, h)
  }
}

export function SparklineCanvas({ hours, width }: SparklineCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const redraw = () => draw(canvas, hours, width)
    redraw()
    // Zooming changes devicePixelRatio and fires resize: redraw sharp.
    window.addEventListener('resize', redraw)
    return () => window.removeEventListener('resize', redraw)
  }, [hours, width])

  return (
    <canvas
      ref={ref}
      width={width}
      height={SPARK.height}
      style={{ width, height: SPARK.height }}
      className="block"
      aria-hidden="true"
    />
  )
}
