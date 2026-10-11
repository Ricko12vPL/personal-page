#!/usr/bin/env node
// Snapshot of the PUBLIC GitHub contribution calendar + profile counters for
// the home page figure. Everything here is what any visitor can verify on
// github.com/<login>; nothing private, no token required.
//
//   node scripts/github-snapshot.mjs            # writes src/data/github-snapshot.json
//   GITHUB_TOKEN=... node scripts/...           # optional, only lifts API rate limits
//
// The script refuses to write if the parsed day counts do not add up to the
// "N contributions in the last year" heading GitHub renders in the same HTML.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const LOGIN = 'Ricko12vPL'
const CALENDAR_URL = `https://github.com/users/${LOGIN}/contributions`
const PROFILE_URL = `https://api.github.com/users/${LOGIN}`
const TIMEOUT_MS = 20_000
const USER_AGENT = 'kacpersaks.dev-snapshot (+https://kacpersaks.dev)'
const OUT_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/github-snapshot.json'
)

async function fetchOk(url, headers) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`)
  return res
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`))
  return match ? match[1] : null
}

/** id -> { date, level } for every day cell of the calendar table. */
function parseDayCells(html) {
  const cells = new Map()
  for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const id = attr(tag, 'id')
    const date = attr(tag, 'data-date')
    const level = Number(attr(tag, 'data-level'))
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !(level >= 0 && level <= 4)) {
      throw new Error(`Unparseable day cell: ${tag.slice(0, 160)}`)
    }
    cells.set(id, { date, level })
  }
  return cells
}

/** for-id -> tooltip text ("3 contributions on October 19th."). */
function parseTooltips(html) {
  const tips = new Map()
  for (const [, tag, text] of html.matchAll(/(<tool-tip\b[^>]*>)([^<]*)<\/tool-tip>/g)) {
    const target = attr(tag, 'for')
    if (target) tips.set(target, text.trim())
  }
  return tips
}

function countFromTooltip(text) {
  if (/^No contributions on /.test(text)) return 0
  const match = text.match(/^([\d,]+) contributions? on /)
  if (!match) throw new Error(`Unrecognised tooltip text: "${text}"`)
  return Number(match[1].replace(/,/g, ''))
}

function headingTotal(html) {
  const match = html.match(/([\d,]+)\s+contributions?\s+in the last year/)
  if (!match) throw new Error('Calendar heading "N contributions in the last year" not found')
  return Number(match[1].replace(/,/g, ''))
}

export function parseCalendar(html) {
  const cells = parseDayCells(html)
  const tips = parseTooltips(html)
  if (cells.size === 0) throw new Error('No day cells found in calendar HTML')

  const days = [...cells.entries()]
    .map(([id, cell]) => {
      const text = tips.get(id)
      if (text === undefined) throw new Error(`No tooltip for day ${cell.date} (${id})`)
      return { date: cell.date, count: countFromTooltip(text), level: cell.level }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const total = days.reduce((sum, day) => sum + day.count, 0)
  const expected = headingTotal(html)
  if (total !== expected) {
    throw new Error(`Sanity check failed: days sum to ${total}, heading says ${expected}`)
  }
  return { total, from: days[0].date, to: days[days.length - 1].date, days }
}

async function fetchProfile() {
  const token = process.env.GITHUB_TOKEN
  const res = await fetchOk(PROFILE_URL, {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })
  const json = await res.json()
  const { public_repos: publicRepos, followers, created_at: createdAt } = json
  if (![publicRepos, followers].every(Number.isInteger) || typeof createdAt !== 'string') {
    throw new Error('Unexpected profile payload from the GitHub API')
  }
  return { publicRepos, followers, memberSince: createdAt.slice(0, 10) }
}

// One day per line keeps the committed file diff-friendly.
function serialise(snapshot) {
  const { days, ...rest } = snapshot.contributions
  const head = JSON.stringify({ ...snapshot, contributions: { ...rest, days: [] } }, null, 2)
  const dayLines = days.map((day) => `      ${JSON.stringify(day)}`).join(',\n')
  return `${head.replace('"days": []', `"days": [\n${dayLines}\n    ]`)}\n`
}

async function main() {
  const [calendarHtml, profile] = await Promise.all([
    fetchOk(CALENDAR_URL, { Accept: 'text/html' }).then((res) => res.text()),
    fetchProfile(),
  ])
  const contributions = parseCalendar(calendarHtml)
  const snapshot = {
    login: LOGIN,
    checkedAt: new Date().toISOString().slice(0, 10),
    source: { calendar: CALENDAR_URL, profile: PROFILE_URL },
    profile,
    contributions,
  }
  await mkdir(dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, serialise(snapshot), 'utf8')
  process.stdout.write(
    `github-snapshot: ${contributions.days.length} days, ${contributions.total} contributions ` +
      `(${contributions.from} -> ${contributions.to}), ${profile.publicRepos} repos, ` +
      `${profile.followers} followers -> ${OUT_FILE}\n`
  )
}

// Run only when executed directly, so tests can import parseCalendar.
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) {
  main().catch((error) => {
    process.stderr.write(`github-snapshot failed: ${error instanceof Error ? error.message : error}\n`)
    process.exitCode = 1
  })
}
