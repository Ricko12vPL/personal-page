// Small text helpers for /profile.json: project names, one-liners and DOI links.
import { summarize } from '@/lib/metadata'

export const ONE_LINER_MAX = 110

// A sentence ends at . ! or ? followed by whitespace or the end of the text, so
// version numbers like "v0.2.0" never split a sentence.
const FIRST_SENTENCE = /^(.+?[.!?])(?=\s|$)/
// A long first sentence is cut at its last " — " clause when that leaves a real
// clause (not a stub), so a card never ends mid-list on a bare number.
const CLAUSE_DASH = ' — '
const MIN_CLAUSE = 40
const DOI_URL_PREFIX = 'https://doi.org/'
const BARE_DOI = /^10\.\d{4,9}\/\S+$/

/** "Alpha Lab: A Local Research Workstation" → "Alpha Lab". */
export function projectName(title: string): string {
  const name = title.split(':')[0].trim()
  return name || title.trim()
}

/**
 * First sentence of the description when it fits; else its leading clause up to
 * the last " — " within the limit; else a word-boundary summary.
 */
export function oneLiner(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim()
  const first = FIRST_SENTENCE.exec(clean)?.[1] ?? clean
  if (first.length <= ONE_LINER_MAX) return first
  const dash = first.lastIndexOf(CLAUSE_DASH, ONE_LINER_MAX - CLAUSE_DASH.length)
  if (dash >= MIN_CLAUSE) return first.slice(0, dash).trim()
  // summarize() may append "…" after `max` characters; one less keeps the result within the limit.
  return summarize(clean, ONE_LINER_MAX - 1)
}

/** A resolvable https://doi.org/ link, or null when the frontmatter has none (or no DOI). */
export function doiUrl(doi: string | undefined): string | null {
  const value = doi?.trim()
  if (!value) return null
  if (value.startsWith(DOI_URL_PREFIX)) return value
  return BARE_DOI.test(value) ? `${DOI_URL_PREFIX}${value}` : null
}
