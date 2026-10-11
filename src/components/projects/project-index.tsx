'use client'

import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProjectFilterBar } from './project-filter-bar'
import { ProjectPreview } from './project-preview'
import { ProjectRow, ROW_COLS } from './project-row'
import {
  EMPTY_FILTERS,
  filterIgnoringStatus,
  filterProjects,
  isFiltered,
  rankTags,
  type ProjectFilters,
} from './project-filter'
import { countByStatus, type ProjectSummary } from './project-summary'

interface ProjectIndexProps {
  projects: ProjectSummary[]
}

const STEPS: Record<string, number> = { ArrowDown: 1, j: 1, ArrowUp: -1, k: -1 }

function targetIndex(key: string, index: number, length: number): number | null {
  if (length === 0) return null
  if (key in STEPS) return Math.min(length - 1, Math.max(0, index + STEPS[key]))
  if (key === 'Home') return 0
  if (key === 'End') return length - 1
  return null
}

function ListHeader() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        ROW_COLS,
        'label hidden border-b border-[var(--hairline)] pb-2 pl-[14px] pr-3 sm:grid'
      )}
    >
      <span>status</span>
      <span>date</span>
      <span>path · title · tags</span>
      <span />
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-y border-[var(--hairline)] px-3 py-10 text-[13px] text-neutral-500 sm:border-t-0">
      <span className="num">0</span> matches — try another tag
      <button
        type="button"
        onClick={onReset}
        className="ml-3 text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        reset filters
      </button>
    </div>
  )
}

/** ls -l style project index with live filter, keyboard selection and preview pane. */
export function ProjectIndex({ projects }: ProjectIndexProps) {
  const router = useRouter()
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [tagsExpanded, setTagsExpanded] = useState(false)

  const tags = useMemo(() => rankTags(projects), [projects])
  const faceted = useMemo(() => filterIgnoringStatus(projects, filters), [projects, filters])
  const visible = useMemo(() => filterProjects(projects, filters), [projects, filters])
  const statusCounts = useMemo(() => countByStatus(faceted), [faceted])
  const selected = visible.find((p) => p.slug === selectedSlug) ?? visible[0]

  const updateFilters = useCallback(
    (patch: Partial<ProjectFilters>) => setFilters((prev) => ({ ...prev, ...patch })),
    []
  )
  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const focusRow = (slug: string) => {
    const row = listRef.current?.querySelector<HTMLAnchorElement>(
      `[data-slug="${CSS.escape(slug)}"]`
    )
    row?.focus({ preventScroll: true })
    row?.scrollIntoView({ block: 'nearest' })
  }

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'Escape') {
      event.preventDefault()
      inputRef.current?.focus()
      return
    }
    const index = selected ? visible.indexOf(selected) : 0
    const next = targetIndex(event.key, index, visible.length)
    if (next === null) return
    event.preventDefault()
    event.stopPropagation()
    setSelectedSlug(visible[next].slug)
    focusRow(visible[next].slug)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Escape') {
      event.preventDefault()
      if (filters.query) updateFilters({ query: '' })
      else event.currentTarget.blur()
    } else if (event.key === 'ArrowDown' && selected) {
      event.preventDefault()
      focusRow(selected.slug)
    } else if (event.key === 'Enter' && selected) {
      event.preventDefault()
      router.push(`/projects/${selected.slug}`)
    }
  }

  return (
    <div>
      <ProjectFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        onInputKeyDown={handleInputKeyDown}
        inputRef={inputRef}
        statusCounts={statusCounts}
        tags={tags}
        tagsExpanded={tagsExpanded}
        onToggleTags={() => setTagsExpanded((open) => !open)}
        matchCount={visible.length}
        total={projects.length}
        filtered={isFiltered(filters)}
      />

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
        <div className="min-w-0">
          <ListHeader />
          {visible.length > 0 ? (
            <ul
              ref={listRef}
              aria-label="Projects"
              aria-describedby="project-list-hint"
              onKeyDown={handleListKeyDown}
              className="border-t border-[var(--hairline)] sm:border-t-0"
            >
              {visible.map((project) => (
                <ProjectRow
                  key={project.slug}
                  project={project}
                  selected={project.slug === selected?.slug}
                  onSelect={setSelectedSlug}
                />
              ))}
            </ul>
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
          <span id="project-list-hint" className="sr-only">
            Use the up and down arrow keys or j and k to move between projects, Enter to open
            one, Escape to return to the filter.
          </span>
        </div>
        <ProjectPreview project={selected} />
      </div>
    </div>
  )
}
