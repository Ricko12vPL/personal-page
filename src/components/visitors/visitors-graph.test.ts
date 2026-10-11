import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { VisitorsGraph } from './visitors-graph'

// Server render = the first paint before hydration: no data yet, so the
// widget must show "—", reserve the sparkline space and draw no canvas.
describe('VisitorsGraph (server render)', () => {
  it('renders the desktop label, a dash and no canvas', () => {
    const html = renderToStaticMarkup(createElement(VisitorsGraph))
    expect(html).toContain('VISITORS · 56 H')
    expect(html).toContain('—')
    expect(html).not.toContain('<canvas')
    expect(html).toContain('print-hidden')
    expect(html).toContain('data-variant="bar"')
    expect(html).toContain('min-width:167px')
    // Before hydration the counter is still loading, not broken.
    expect(html).toContain('aria-label="Visitors: loading"')
    expect(html).toContain('title="visitors per hour · loading\nno cookies · IPs hashed, never stored"')
  })

  it('renders the compact variant with 28 hours of width', () => {
    const html = renderToStaticMarkup(createElement(VisitorsGraph, { variant: 'compact' }))
    expect(html).toContain('>VISITORS<')
    expect(html).not.toContain('56 H')
    expect(html).toContain('data-variant="compact"')
    expect(html).toContain('min-width:83px')
  })
})
