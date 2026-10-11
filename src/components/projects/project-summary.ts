// Lean, serializable view of a project for the index (client) and the detail
// header (server). The Velite `Project` carries the compiled MDX body, which
// must never be shipped to a client component, so pages map to this first.
import type { Project } from '#site/content'
import { PROJECT_STATUSES, type ProjectStatus } from '@/lib/status'

export interface StatRow {
  label: string
  value: string
}

export interface ProjectLink {
  kind: 'live' | 'paper' | 'github'
  label: string
  href: string
  arrow: string
}

export interface ProjectSummary {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  status: ProjectStatus
  tags: string[]
  stats: StatRow[]
  links: ProjectLink[]
}

type LinkSource = Pick<Project, 'live' | 'paper' | 'github'>

export function statRows(stats: Project['stats']): StatRow[] {
  if (!stats) return []
  return Object.entries(stats).flatMap(([label, value]) =>
    value === undefined || value === ''
      ? []
      : [{ label, value: typeof value === 'number' ? value.toLocaleString('en-US') : value }]
  )
}

export function projectLinks({ live, paper, github }: LinkSource): ProjectLink[] {
  const candidates: { kind: ProjectLink['kind']; href?: string }[] = [
    { kind: 'live', href: live },
    { kind: 'paper', href: paper },
    { kind: 'github', href: github },
  ]
  return candidates.flatMap(({ kind, href }) => {
    if (!href) return []
    const pdf = kind === 'paper' && href.toLowerCase().endsWith('.pdf')
    return [{ kind, href, label: pdf ? 'paper (pdf)' : kind, arrow: pdf ? '↓' : '↗' }]
  })
}

export function toSummary(project: Project): ProjectSummary {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    date: project.date,
    updated: project.updated,
    status: project.status,
    tags: [...project.tags],
    stats: statRows(project.stats),
    links: projectLinks(project),
  }
}

/** "Alpha Lab: A Local Research Workstation" → name "Alpha Lab", subtitle "A Local…". */
export function splitTitle(title: string): { name: string; subtitle: string } {
  const cut = title.indexOf(': ')
  if (cut < 0) return { name: title, subtitle: '' }
  return { name: title.slice(0, cut), subtitle: title.slice(cut + 2) }
}

// Velite isodate values are full ISO strings; slicing keeps server and client
// output identical (no timezone-dependent formatting during hydration).
export function yearMonth(iso: string): string {
  return iso.slice(0, 7)
}

export function isoDay(iso: string): string {
  return iso.slice(0, 10)
}

export function countByStatus(
  projects: readonly { status: ProjectStatus }[]
): { status: ProjectStatus; count: number }[] {
  return PROJECT_STATUSES.map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
  }))
}

export function latestChange(projects: readonly { date: string; updated?: string }[]): string {
  return projects.reduce((latest, p) => {
    const candidate = isoDay(p.updated ?? p.date)
    return candidate > latest ? candidate : latest
  }, '')
}
