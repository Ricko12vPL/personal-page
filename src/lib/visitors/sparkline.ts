// Client-safe geometry for the visitors sparkline. Kept separate from the
// canvas code so the layout rules are unit-tested.
export type SparkKind = 'baseline' | 'bar' | 'latest'

export interface SparkBar {
  x: number
  y: number
  width: number
  height: number
  kind: SparkKind
}

export interface SparkGeometry {
  barWidth: number
  gap: number
  height: number
}

export const SPARK: SparkGeometry = { barWidth: 2, gap: 1, height: 14 }

export const SPARK_COLORS: Record<SparkKind, string> = {
  baseline: 'rgba(115, 115, 115, 0.45)',
  bar: 'rgba(115, 115, 115, 0.75)',
  latest: '#00ff41',
}

export function sparklineWidth(bars: number, geometry: SparkGeometry = SPARK): number {
  if (!Number.isFinite(bars) || bars < 1) return 0
  const n = Math.floor(bars)
  return n * geometry.barWidth + (n - 1) * geometry.gap
}

/**
 * One rect per hour, scaled to the busiest hour in view. Hours before the
 * counter existed (null) become 1px dots on the baseline — a dotted line;
 * a real 0 is a 1px-high bar so "quiet" and "no data" stay distinguishable.
 * The newest hour is the accent bar.
 */
export function sparklineBars(
  hours: readonly (number | null)[],
  geometry: SparkGeometry = SPARK,
): SparkBar[] {
  const { barWidth, gap, height } = geometry
  const max = hours.reduce<number>((acc, value) => (value !== null && value > acc ? value : acc), 1)
  const last = hours.length - 1
  return hours.map((value, i) => {
    const x = i * (barWidth + gap)
    if (value === null) return { x, y: height - 1, width: 1, height: 1, kind: 'baseline' }
    const barHeight = Math.min(height, Math.max(1, Math.round((value / max) * height)))
    return {
      x,
      y: height - barHeight,
      width: barWidth,
      height: barHeight,
      kind: i === last ? 'latest' : 'bar',
    }
  })
}
