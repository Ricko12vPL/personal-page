// Pure builder for /profile.json. Everything comes from published site content,
// siteConfig and the committed GitHub snapshot; nothing is invented here.
import { isoDay, splitSupersededTitle } from '@/components/blog/post-meta'
import { computeStats } from '@/components/home/contributions/calendar-model'
import type { GithubSnapshot } from '@/components/home/contributions/snapshot'
import { projectStatus } from '@/lib/status'
import { doiUrl, oneLiner, projectName } from './text'
import type {
  PaperSource,
  PostSource,
  Profile,
  ProfileContributions,
  ProfilePaper,
  ProfilePerson,
  ProfilePost,
  ProfileProject,
  ProfileSources,
  ProjectSource,
  SiteSource,
} from './types'

/** Same wording as the JSON-LD `jobTitle` / `addressLocality` in app/layout.tsx and the CV. */
export const PROFILE_ROLE = 'ML & Backend Engineer'
export const PROFILE_LOCATION = 'Warsaw, Poland'
export const PROFILE_POSTS = 4

function personOf(site: SiteSource): ProfilePerson {
  return {
    name: site.name,
    role: PROFILE_ROLE,
    location: PROFILE_LOCATION,
    tagline: site.description,
    email: site.links.email,
    links: { site: site.url, github: site.links.github, linkedin: site.links.linkedin },
  }
}

// `repo` comes only from the frontmatter `github` field, so a private repository
// (which never gets one) cannot leak into the profile.
function projectOf(project: ProjectSource, siteUrl: string): ProfileProject {
  const { label, glyph } = projectStatus(project.status)
  return {
    slug: project.slug,
    name: projectName(project.title),
    title: project.title,
    oneLiner: project.summary?.trim() || oneLiner(project.description),
    status: project.status,
    statusLabel: label,
    glyph,
    date: isoDay(project.date),
    updated: project.updated ? isoDay(project.updated) : null,
    url: `${siteUrl}/projects/${project.slug}`,
    repo: project.github?.trim() || null,
    priority: project.priority ?? null,
  }
}

function paperOf(paper: PaperSource, siteUrl: string): ProfilePaper {
  return {
    slug: paper.slug,
    title: paper.title,
    authors: [...paper.authors],
    date: isoDay(paper.date),
    venue: paper.venue,
    status: paper.status,
    doi: doiUrl(paper.doi),
    url: `${siteUrl}/research/${paper.slug}`,
  }
}

function postOf(post: PostSource, siteUrl: string): ProfilePost {
  const { title, superseded } = splitSupersededTitle(post.title)
  return {
    slug: post.slug,
    title,
    date: isoDay(post.date),
    url: `${siteUrl}/blog/${post.slug}`,
    superseded,
  }
}

// Same days and the same stats as fig. 1 on the home page, so the profile and the site never
// disagree; the "checked" date tells the reader the last day may still be in progress.
function contributionsOf(snapshot: GithubSnapshot): ProfileContributions {
  const days = snapshot.contributions.days
  const { total, activeDays, longestStreak, busiestDay } = computeStats(days)
  return {
    checkedAt: snapshot.checkedAt,
    from: snapshot.contributions.from,
    to: snapshot.contributions.to,
    total,
    activeDays,
    longestStreak: longestStreak
      ? { days: longestStreak.length, from: longestStreak.from, to: longestStreak.to }
      : null,
    busiestDay: busiestDay ? { date: busiestDay.date, count: busiestDay.count } : null,
    days: days.map(({ date, count, level }) => ({ date, count, level })),
  }
}

export function buildProfile(sources: ProfileSources): Profile {
  const { now, site, projects, featured, papers, posts, snapshot } = sources
  return {
    generatedAt: now.toISOString(),
    site: site.url,
    person: personOf(site),
    counts: { projects: projects.length, papers: papers.length, posts: posts.length },
    projects: featured.map((project) => projectOf(project, site.url)),
    papers: papers.map((paper) => paperOf(paper, site.url)),
    posts: posts.slice(0, PROFILE_POSTS).map((post) => postOf(post, site.url)),
    contributions: contributionsOf(snapshot),
  }
}
