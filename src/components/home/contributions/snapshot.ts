// Typed, validated view of src/data/github-snapshot.json (written by
// scripts/github-snapshot.mjs). A malformed file yields `null` so the home
// page can render a "snapshot unavailable" note instead of crashing.
import rawSnapshot from '@/data/github-snapshot.json'

export interface ContributionDay {
  date: string
  count: number
  level: number
}

export interface GithubSnapshot {
  login: string
  checkedAt: string
  source: { calendar: string; profile: string }
  profile: { publicRepos: number; followers: number; memberSince: string }
  contributions: { total: number; from: string; to: string; days: ContributionDay[] }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const MAX_LEVEL = 4

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value)
}

function isDay(value: unknown): value is ContributionDay {
  return (
    isRecord(value) &&
    isIsoDate(value.date) &&
    isCount(value.count) &&
    isCount(value.level) &&
    value.level <= MAX_LEVEL
  )
}

export function parseSnapshot(raw: unknown): GithubSnapshot | null {
  if (!isRecord(raw) || typeof raw.login !== 'string' || !isIsoDate(raw.checkedAt)) return null
  const { source, profile, contributions } = raw
  if (!isRecord(source) || typeof source.calendar !== 'string' || typeof source.profile !== 'string') {
    return null
  }
  if (
    !isRecord(profile) ||
    !isCount(profile.publicRepos) ||
    !isCount(profile.followers) ||
    !isIsoDate(profile.memberSince)
  ) {
    return null
  }
  if (
    !isRecord(contributions) ||
    !isCount(contributions.total) ||
    !isIsoDate(contributions.from) ||
    !isIsoDate(contributions.to) ||
    !Array.isArray(contributions.days) ||
    contributions.days.length === 0 ||
    !contributions.days.every(isDay)
  ) {
    return null
  }
  return {
    login: raw.login,
    checkedAt: raw.checkedAt,
    source: { calendar: source.calendar, profile: source.profile },
    profile: {
      publicRepos: profile.publicRepos,
      followers: profile.followers,
      memberSince: profile.memberSince,
    },
    contributions: {
      total: contributions.total,
      from: contributions.from,
      to: contributions.to,
      days: [...contributions.days].sort((a, b) => a.date.localeCompare(b.date)),
    },
  }
}

export function getGithubSnapshot(): GithubSnapshot | null {
  return parseSnapshot(rawSnapshot)
}
