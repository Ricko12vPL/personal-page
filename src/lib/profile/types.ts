// The /profile.json data contract, consumed by the GitHub profile README
// generator (github.com/Ricko12vPL/Ricko12vPL). Changing a field here is a
// breaking change for that generator: it validates this shape and fails closed.
import type { ContributionDay, GithubSnapshot } from '@/components/home/contributions/snapshot'

export interface ProfileLinks {
  site: string
  github: string
  linkedin: string
}

export interface ProfilePerson {
  name: string
  role: string
  location: string
  tagline: string
  email: string
  links: ProfileLinks
}

export interface ProfileCounts {
  projects: number
  papers: number
  posts: number
}

export interface ProfileProject {
  slug: string
  name: string
  title: string
  oneLiner: string
  status: string
  statusLabel: string
  glyph: string
  date: string
  updated: string | null
  url: string
  repo: string | null
  priority: number | null
}

export interface ProfilePaper {
  slug: string
  title: string
  authors: string[]
  date: string
  venue: string
  status: string
  doi: string | null
  url: string
}

export interface ProfilePost {
  slug: string
  title: string
  date: string
  url: string
  superseded: boolean
}

export interface ProfileStreak {
  days: number
  from: string
  to: string
}

export interface ProfileBusiestDay {
  date: string
  count: number
}

export interface ProfileContributions {
  checkedAt: string
  from: string
  to: string
  total: number
  activeDays: number
  /** Null only when the whole year has zero contributions. */
  longestStreak: ProfileStreak | null
  busiestDay: ProfileBusiestDay | null
  days: ContributionDay[]
}

export interface Profile {
  generatedAt: string
  site: string
  person: ProfilePerson
  counts: ProfileCounts
  projects: ProfileProject[]
  papers: ProfilePaper[]
  posts: ProfilePost[]
  contributions: ProfileContributions
}

// Builder inputs: the minimal slice of the Velite documents and siteConfig the
// contract needs, so the builder stays pure and testable without `#site/content`.
export interface ProjectSource {
  slug: string
  title: string
  description: string
  /** Optional card wording (frontmatter `summary`), used instead of the first-sentence rule. */
  summary?: string
  status: string
  date: string
  updated?: string
  priority?: number
  github?: string
}

export interface PaperSource {
  slug: string
  title: string
  authors: readonly string[]
  date: string
  venue: string
  status: string
  doi?: string
}

export interface PostSource {
  slug: string
  title: string
  date: string
}

export interface SiteSource {
  name: string
  description: string
  url: string
  links: { github: string; linkedin: string; email: string }
}

export interface ProfileSources {
  now: Date
  site: SiteSource
  /** Every project (for the count). */
  projects: readonly ProjectSource[]
  /** Featured projects, already in getFeaturedProjects() order. */
  featured: readonly ProjectSource[]
  papers: readonly PaperSource[]
  /** Published posts, newest first. */
  posts: readonly PostSource[]
  snapshot: GithubSnapshot
}
