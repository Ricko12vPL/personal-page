import { describe, expect, it } from 'vitest'
import { ONE_LINER_MAX, doiUrl, oneLiner, projectName } from './text'

// Real project descriptions from content/projects (kept verbatim).
const X_QUANT =
  'My solo quant research program, in two lives. v1 (≈274K LOC) was retired in August 2026 and its published metrics are withdrawn. v2 rebuilt the process around a written research constitution and an append-only decision register. No strategy it tested was validated for trading.'
const UKENERGY =
  'A geospatial prospecting tool for battery-storage (BESS) projects in Great Britain, built on open data: 807,954 land parcels scored by distance to the grid, 2,625 BESS projects with their connection-queue status, and a learned site-ranking candidate tested on temporal and spatial hold-outs.'
const QUANTBRIEF =
  'Multi-agent financial intelligence platform built at Mistral AI Hackathon — 5-agent pipeline screening 30+ articles in <50ms each, analyzing full SEC filings in 256K context, and delivering multilingual audio briefings.'
const WORLDCLASS =
  'A multi-agent research organization (39 role files) where every output must pass executable gates and adversarial review. After a pre-registered calibration study it selected its own research program (C1, paused at pre-registration) and gained an adversarial pre-review org (System B).'

describe('projectName', () => {
  it('takes the title before the first colon, trimmed', () => {
    expect(projectName('Alpha Lab: A Local Research Workstation: Part 2')).toBe('Alpha Lab')
    expect(projectName('job-agent: A Job Search Run by Agents')).toBe('job-agent')
  })

  it('falls back to the whole title without a colon or before an empty prefix', () => {
    expect(projectName('  Plain Title  ')).toBe('Plain Title')
    expect(projectName(': Odd')).toBe(': Odd')
  })
})

describe('oneLiner', () => {
  it('uses the first sentence when it fits', () => {
    expect(oneLiner(X_QUANT)).toBe('My solo quant research program, in two lives.')
  })

  it('does not split on version-number dots', () => {
    expect(oneLiner('Ships v0.2.0 with fixes. Then more.')).toBe('Ships v0.2.0 with fixes.')
  })

  it.each([
    ['UKenergy (one long sentence)', UKENERGY],
    ['worldclass (long first sentence)', WORLDCLASS],
  ])('summarizes on a word boundary within the limit: %s', (_, description) => {
    const line = oneLiner(description)
    expect(line.length).toBeLessThanOrEqual(ONE_LINER_MAX)
    expect(line.endsWith('…')).toBe(true)
    expect(description.startsWith(line.slice(0, -1))).toBe(true)
  })

  it('cuts a long first sentence at its last em-dash clause before the limit', () => {
    expect(oneLiner(QUANTBRIEF)).toBe('Multi-agent financial intelligence platform built at Mistral AI Hackathon')
  })

  it('ignores an em dash that would leave too short a clause', () => {
    const description = `Short — ${'word '.repeat(40).trim()}.`
    const line = oneLiner(description)
    expect(line.endsWith('…')).toBe(true)
    expect(line.length).toBeLessThanOrEqual(ONE_LINER_MAX)
  })

  it('never exceeds the limit even when a space sits right at it', () => {
    const description = `${'a'.repeat(ONE_LINER_MAX)} ${'b'.repeat(20)}`
    expect(oneLiner(description).length).toBeLessThanOrEqual(ONE_LINER_MAX)
  })

  it('collapses whitespace and keeps a short description as is', () => {
    expect(oneLiner('  Short   text without a stop  ')).toBe('Short text without a stop')
  })
})

describe('doiUrl', () => {
  it('passes doi.org links through and prefixes bare DOIs', () => {
    expect(doiUrl('https://doi.org/10.5281/zenodo.20645678')).toBe('https://doi.org/10.5281/zenodo.20645678')
    expect(doiUrl(' 10.5281/zenodo.20645678 ')).toBe('https://doi.org/10.5281/zenodo.20645678')
  })

  it('returns null for missing or non-DOI values', () => {
    expect(doiUrl(undefined)).toBeNull()
    expect(doiUrl('   ')).toBeNull()
    expect(doiUrl('https://example.com/paper')).toBeNull()
  })
})
