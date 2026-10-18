import { computeStats } from '@/components/home/contributions/calendar-model'
import { describe, expect, it } from 'vitest'
import type { GithubSnapshot } from '@/components/home/contributions/snapshot'
import { PROFILE_LOCATION, PROFILE_POSTS, PROFILE_ROLE, buildProfile } from './build'
import { ONE_LINER_MAX } from './text'
import type { PaperSource, PostSource, ProfileSources, ProjectSource } from './types'

const SITE = {
  name: 'Kacper Saks',
  description: 'ML/Backend Engineer working on research tooling.',
  url: 'https://kacpersaks.dev',
  links: {
    github: 'https://github.com/Ricko12vPL',
    linkedin: 'https://linkedin.com/in/kacpersakspe',
    email: 'kacpersaks@proton.me',
    leetcode: 'https://leetcode.com/u/ricko12vpl/',
  },
}

const PUBLIC_REPO: ProjectSource = {
  slug: 'worldclass-research-org',
  title: 'Worldclass Research Org: An Executable-Gate Multi-Agent Research Organization',
  description: 'A multi-agent research organization (39 role files) where every output must pass executable gates and adversarial review. More text.',
  status: 'completed',
  date: '2026-06-07T00:00:00.000Z',
  updated: '2026-10-11T00:00:00.000Z',
  priority: 1,
  github: 'https://github.com/Ricko12vPL/worldclass-research-org',
}

// A private repository: no `github` frontmatter, even though its slug matches the repo name.
const PRIVATE_REPO: ProjectSource = {
  slug: 'alpha-lab',
  title: 'Alpha Lab: A Local Research Workstation for Honest Alpha Research',
  description: 'A local research workstation. Phases F0–F3 are done.',
  status: 'in-progress',
  date: '2026-09-29T00:00:00.000Z',
  priority: 3,
}

const UNPINNED: ProjectSource = {
  slug: 'esg-compliance-agent',
  title: 'ESG Compliance Agent: AI-Powered Regulatory Assessment',
  description: 'x'.repeat(200),
  status: 'paused',
  date: '2024-09-01T00:00:00.000Z',
}

const NOT_FEATURED: ProjectSource = {
  slug: 'kelly-pm',
  title: 'Kelly PM: Prediction Markets Position Sizing Engine',
  description: 'Quantitative position sizing engine.',
  status: 'paused',
  date: '2026-02-11T00:00:00.000Z',
}

const PAPERS: PaperSource[] = [
  {
    slug: 'executable-gate-research-org',
    title: 'An Executable-Gate Multi-Agent Research Organization',
    authors: ['Kacper Saks'],
    date: '2026-06-09T00:00:00.000Z',
    venue: 'Zenodo (v0.2.0)',
    status: 'preprint',
    doi: 'https://doi.org/10.5281/zenodo.20645678',
  },
  {
    slug: 'validation-crisis',
    title: 'The Validation Crisis in AI Forecasting',
    authors: ['Kacper Saks'],
    date: '2026-06-02T00:00:00.000Z',
    venue: 'Self-archived preprint',
    status: 'preprint',
  },
]

const POSTS: PostSource[] = [
  { slug: 'p6', title: 'Newest', date: '2026-10-15T00:00:00.000Z' },
  { slug: 'p5', title: '[Superseded] X_Quant v2: From ML Pipeline', date: '2026-10-01T00:00:00.000Z' },
  { slug: 'p4', title: 'Fourth', date: '2026-09-01T00:00:00.000Z' },
  { slug: 'p3', title: 'Third', date: '2026-08-01T00:00:00.000Z' },
  { slug: 'p2', title: 'Second', date: '2026-07-01T00:00:00.000Z' },
  { slug: 'p1', title: 'Oldest', date: '2026-06-01T00:00:00.000Z' },
]

const SNAPSHOT: GithubSnapshot = {
  login: 'Ricko12vPL',
  checkedAt: '2026-10-18',
  source: { calendar: 'https://example.test/cal', profile: 'https://example.test/api' },
  profile: { publicRepos: 31, followers: 12, memberSince: '2023-01-09' },
  contributions: {
    total: 13,
    from: '2026-10-13',
    to: '2026-10-18',
    days: [
      { date: '2026-10-13', count: 2, level: 1 },
      { date: '2026-10-14', count: 0, level: 0 },
      { date: '2026-10-15', count: 1, level: 1 },
      { date: '2026-10-16', count: 7, level: 4 },
      { date: '2026-10-17', count: 3, level: 2 },
      { date: '2026-10-18', count: 0, level: 0 },
    ],
  },
}

const NOW = new Date('2026-10-18T12:00:00.000Z')

function sources(overrides: Partial<ProfileSources> = {}): ProfileSources {
  return {
    now: NOW,
    site: SITE,
    projects: [PUBLIC_REPO, PRIVATE_REPO, UNPINNED, NOT_FEATURED],
    featured: [PUBLIC_REPO, PRIVATE_REPO, UNPINNED],
    papers: PAPERS,
    posts: POSTS,
    snapshot: SNAPSHOT,
    ...overrides,
  }
}

const keys = (value: object) => Object.keys(value).sort()

describe('buildProfile shape', () => {
  const profile = buildProfile(sources())

  it('has exactly the contract top-level keys', () => {
    expect(keys(profile)).toEqual(
      ['contributions', 'counts', 'generatedAt', 'papers', 'person', 'posts', 'projects', 'site'].sort()
    )
    expect(profile.generatedAt).toBe('2026-10-18T12:00:00.000Z')
    expect(profile.site).toBe('https://kacpersaks.dev')
  })

  it('builds the person from siteConfig, without extra links', () => {
    expect(profile.person).toEqual({
      name: 'Kacper Saks',
      role: PROFILE_ROLE,
      location: PROFILE_LOCATION,
      tagline: SITE.description,
      email: 'kacpersaks@proton.me',
      links: {
        site: 'https://kacpersaks.dev',
        github: 'https://github.com/Ricko12vPL',
        linkedin: 'https://linkedin.com/in/kacpersakspe',
      },
    })
  })

  it('maps a project to exactly the contract fields', () => {
    expect(profile.projects[0]).toEqual({
      slug: 'worldclass-research-org',
      name: 'Worldclass Research Org',
      title: PUBLIC_REPO.title,
      oneLiner:
        'A multi-agent research organization (39 role files) where every output must pass executable gates and…',
      status: 'completed',
      statusLabel: 'Completed',
      glyph: '●',
      date: '2026-06-07',
      updated: '2026-10-11',
      url: 'https://kacpersaks.dev/projects/worldclass-research-org',
      repo: 'https://github.com/Ricko12vPL/worldclass-research-org',
      priority: 1,
    })
  })

  it('takes status label and glyph from projectStatus()', () => {
    expect(profile.projects.map((p) => [p.status, p.statusLabel, p.glyph])).toEqual([
      ['completed', 'Completed', '●'],
      ['in-progress', 'In Progress', '◐'],
      ['paused', 'Paused', '‖'],
    ])
  })

  it('prefers a frontmatter summary over the first-sentence rule', () => {
    const summary = 'My solo quant research program, in two lives. No strategy it tested was validated for trading.'
    const profile = buildProfile(sources({ featured: [{ ...PRIVATE_REPO, summary }] }))
    expect(profile.projects[0].oneLiner).toBe(summary)
  })

  it('falls back to the description when the summary is blank', () => {
    const profile = buildProfile(sources({ featured: [{ ...PRIVATE_REPO, summary: '   ' }] }))
    expect(profile.projects[0].oneLiner).toBe('A local research workstation.')
  })

  it('uses null for a missing updated date and priority', () => {
    expect(profile.projects[2]).toMatchObject({ updated: null, priority: null })
  })
})

describe('buildProfile projects', () => {
  it('keeps the featured order and leaves out non-featured projects', () => {
    const profile = buildProfile(sources())
    expect(profile.projects.map((p) => p.slug)).toEqual([
      'worldclass-research-org',
      'alpha-lab',
      'esg-compliance-agent',
    ])
  })

  it('takes repo only from the github field', () => {
    const withLinks = { ...PRIVATE_REPO, live: 'https://example.test', paper: '/research/x' }
    const profile = buildProfile(sources({ featured: [withLinks, { ...UNPINNED, github: '  ' }] }))
    expect(profile.projects.map((p) => p.repo)).toEqual([null, null])
  })

  it('keeps every oneLiner within the limit', () => {
    const profile = buildProfile(sources())
    expect(profile.projects.every((p) => p.oneLiner.length <= ONE_LINER_MAX)).toBe(true)
    expect(profile.projects[1].oneLiner).toBe('A local research workstation.')
  })
})

describe('buildProfile counts, papers and posts', () => {
  const profile = buildProfile(sources())

  it('counts all projects, papers and published posts', () => {
    expect(profile.counts).toEqual({ projects: 4, papers: 2, posts: 6 })
  })

  it('maps papers with a DOI link or null', () => {
    expect(profile.papers.map((p) => [p.slug, p.date, p.doi, p.url])).toEqual([
      [
        'executable-gate-research-org',
        '2026-06-09',
        'https://doi.org/10.5281/zenodo.20645678',
        'https://kacpersaks.dev/research/executable-gate-research-org',
      ],
      ['validation-crisis', '2026-06-02', null, 'https://kacpersaks.dev/research/validation-crisis'],
    ])
  })

  it('lists the latest posts newest first with superseded titles split', () => {
    expect(profile.posts).toHaveLength(PROFILE_POSTS)
    expect(profile.posts.map((p) => p.slug)).toEqual(['p6', 'p5', 'p4', 'p3'])
    expect(profile.posts[1]).toEqual({
      slug: 'p5',
      title: 'X_Quant v2: From ML Pipeline',
      date: '2026-10-01',
      url: 'https://kacpersaks.dev/blog/p5',
      superseded: true,
    })
    expect(profile.posts[0].superseded).toBe(false)
  })
})

describe('buildProfile contributions', () => {
  it('uses every snapshot day, exactly like fig. 1 on the home page', () => {
    const { contributions } = buildProfile(sources())
    const stats = computeStats(SNAPSHOT.contributions.days)
    expect(contributions).toMatchObject({
      checkedAt: SNAPSHOT.checkedAt,
      from: SNAPSHOT.contributions.from,
      to: SNAPSHOT.contributions.to,
      total: stats.total,
      activeDays: stats.activeDays,
    })
    expect(contributions.days).toEqual(SNAPSHOT.contributions.days)
    expect(contributions.days).not.toBe(SNAPSHOT.contributions.days)
  })

  it('counts the check day like the site does', () => {
    const busy = {
      ...SNAPSHOT,
      contributions: {
        ...SNAPSHOT.contributions,
        days: SNAPSHOT.contributions.days.map((day) =>
          day.date === SNAPSHOT.contributions.to ? { ...day, count: 30, level: 4 } : day
        ),
      },
    }
    const { contributions } = buildProfile(sources({ snapshot: busy }))
    expect(contributions.total).toBe(computeStats(busy.contributions.days).total)
    expect(contributions.busiestDay).toEqual({ date: SNAPSHOT.contributions.to, count: 30 })
  })

  it('keeps a snapshot that already ends before the check day', () => {
    const early = { ...SNAPSHOT, checkedAt: '2026-10-20' }
    const { contributions } = buildProfile(sources({ snapshot: early }))
    expect(contributions).toMatchObject({ to: '2026-10-18', total: 13 })
    expect(contributions.days).toHaveLength(6)
  })

  it('reports no streak or busiest day for an empty year', () => {
    const quiet = {
      ...SNAPSHOT,
      contributions: {
        ...SNAPSHOT.contributions,
        total: 0,
        days: SNAPSHOT.contributions.days.map((day) => ({ ...day, count: 0, level: 0 })),
      },
    }
    const { contributions } = buildProfile(sources({ snapshot: quiet }))
    expect(contributions).toMatchObject({ activeDays: 0, longestStreak: null, busiestDay: null })
  })

  it('does not mutate its inputs', () => {
    const input = sources()
    const before = structuredClone({ ...input, now: undefined })
    buildProfile(input)
    expect({ ...input, now: undefined }).toEqual(before)
  })
})
