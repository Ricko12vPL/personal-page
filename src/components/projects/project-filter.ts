// Pure filtering helpers for the projects index. No React here, so the rules
// (what a query matches, how tags are ranked) stay easy to read and test.
import { projectStatus, type ProjectStatus } from '@/lib/status'
import type { ProjectSummary } from './project-summary'

export type StatusFilter = 'all' | ProjectStatus

export interface ProjectFilters {
  query: string
  status: StatusFilter
  tag: string | null
}

export interface TagCount {
  tag: string
  count: number
}

export const EMPTY_FILTERS: ProjectFilters = { query: '', status: 'all', tag: null }

// A leading "/" is the filter's own hint glyph; ignore it if it gets typed.
function queryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^\/+/, ''))
    .filter(Boolean)
}

function haystack(project: ProjectSummary): string {
  const status = projectStatus(project.status)
  return [
    `${project.slug}/`,
    project.title,
    project.description,
    project.status,
    status.label,
    ...project.tags,
  ]
    .join(' ')
    .toLowerCase()
}

export function matchesQuery(project: ProjectSummary, query: string): boolean {
  const tokens = queryTokens(query)
  if (tokens.length === 0) return true
  const text = haystack(project)
  return tokens.every((token) => text.includes(token))
}

function matchesTag(project: ProjectSummary, tag: string | null): boolean {
  return tag === null || project.tags.includes(tag)
}

function matchesStatus(project: ProjectSummary, status: StatusFilter): boolean {
  return status === 'all' || project.status === status
}

/** Everything except the status filter — used for the status chip counts. */
export function filterIgnoringStatus(
  projects: readonly ProjectSummary[],
  { query, tag }: ProjectFilters
): ProjectSummary[] {
  return projects.filter((p) => matchesQuery(p, query) && matchesTag(p, tag))
}

export function filterProjects(
  projects: readonly ProjectSummary[],
  filters: ProjectFilters
): ProjectSummary[] {
  return filterIgnoringStatus(projects, filters).filter((p) =>
    matchesStatus(p, filters.status)
  )
}

/** Tags ranked by how many projects use them, then alphabetically. */
export function rankTags(projects: readonly ProjectSummary[]): TagCount[] {
  const counts = projects
    .flatMap((p) => p.tags)
    .reduce<Record<string, number>>(
      (acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }),
      {}
    )
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function isFiltered({ query, status, tag }: ProjectFilters): boolean {
  return query.trim() !== '' || status !== 'all' || tag !== null
}
