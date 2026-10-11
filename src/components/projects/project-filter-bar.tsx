import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import { projectStatus, type ProjectStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { ProjectFilters, StatusFilter, TagCount } from './project-filter'

const VISIBLE_TAGS = 12
const TAG_GROUP_ID = 'project-tag-filter'

interface ProjectFilterBarProps {
  filters: ProjectFilters
  onChange: (patch: Partial<ProjectFilters>) => void
  onReset: () => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  statusCounts: { status: ProjectStatus; count: number }[]
  tags: TagCount[]
  tagsExpanded: boolean
  onToggleTags: () => void
  matchCount: number
  total: number
  filtered: boolean
}

interface ChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] leading-5 transition-colors motion-reduce:transition-none',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent',
        active
          ? 'border-accent text-accent'
          : 'border-[var(--hairline)] text-neutral-400 hover:border-neutral-600 hover:text-neutral-100'
      )}
    >
      {children}
    </button>
  )
}

function Count({ n }: { n: number }) {
  return <span className="tabular-nums opacity-60">{n}</span>
}

// Label column + wrapping chip group, so wrapped chips stay aligned with the
// first chip instead of falling back under the label.
function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-y-1.5 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-x-3">
      <span aria-hidden="true" className="label sm:pt-[7px]">
        {label}
      </span>
      {children}
    </div>
  )
}

function visibleTags(tags: TagCount[], expanded: boolean, active: string | null): TagCount[] {
  if (expanded) return tags
  const top = tags.slice(0, VISIBLE_TAGS)
  const pinned = tags.find((t) => t.tag === active && !top.includes(t))
  return pinned ? [...top, pinned] : top
}

function FilterInput(props: ProjectFilterBarProps) {
  const { filters, onChange, onReset, onInputKeyDown, inputRef, matchCount, total, filtered } =
    props
  return (
    <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-2 text-[13px] transition-colors focus-within:border-accent/60">
      <span aria-hidden="true" className="prompt-caret">
        ›
      </span>
      <input
        ref={inputRef}
        id="project-filter"
        type="text"
        value={filters.query}
        onChange={(e) => onChange({ query: e.target.value })}
        onKeyDown={onInputKeyDown}
        placeholder="/ filter by name, tag or status"
        aria-label="Filter projects by name, tag or status"
        aria-describedby="project-filter-hint"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-neutral-100 caret-accent outline-none placeholder:text-neutral-600"
      />
      <span aria-hidden="true" className="shrink-0 text-[11px] tabular-nums text-neutral-500">
        <span className="num">{matchCount}</span> / {total}
      </span>
      <span aria-live="polite" className="sr-only">
        {matchCount} of {total} projects match
      </span>
      {filtered && (
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 text-[11px] text-neutral-500 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
        >
          clear
        </button>
      )}
      <span id="project-filter-hint" className="sr-only">
        Press Enter to open the selected project, Down arrow to move into the list, Escape to
        clear.
      </span>
    </div>
  )
}

function StatusChips({ filters, onChange, statusCounts }: ProjectFilterBarProps) {
  const all = statusCounts.reduce((sum, s) => sum + s.count, 0)
  const pick = (status: StatusFilter) => () => onChange({ status })
  return (
    <FilterRow label="status">
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
        <Chip active={filters.status === 'all'} onClick={pick('all')}>
          all <Count n={all} />
        </Chip>
        {statusCounts.map(({ status, count }) => {
          const style = projectStatus(status)
          return (
            <Chip key={status} active={filters.status === status} onClick={pick(status)}>
              <span aria-hidden="true" className={style.className}>
                {style.glyph}
              </span>
              {style.label.toLowerCase()} <Count n={count} />
            </Chip>
          )
        })}
      </div>
    </FilterRow>
  )
}

// Phones: the tag cloud (6+ rows of chips) would push the first project below
// the fold, so it stays folded behind this toggle until asked for.
function MobileTagToggle({ filters, tags, onToggleTags }: ProjectFilterBarProps) {
  return (
    <button
      type="button"
      aria-expanded={false}
      aria-controls={TAG_GROUP_ID}
      onClick={onToggleTags}
      className="inline-flex items-center gap-2 text-[11px] text-neutral-400 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none sm:hidden"
    >
      <span className="label">tags</span>
      {filters.tag && <span className="text-accent">{filters.tag.toLowerCase()}</span>}
      <span aria-hidden="true">▾</span>
      <span className="tabular-nums opacity-60">{tags.length}</span>
    </button>
  )
}

function TagChips(props: ProjectFilterBarProps) {
  const { filters, onChange, tags, tagsExpanded } = props
  const shown = visibleTags(tags, tagsExpanded, filters.tag)
  const hidden = tags.length - shown.length
  const toggle = (tag: string) => () => onChange({ tag: filters.tag === tag ? null : tag })
  if (tags.length === 0) return null
  return (
    <>
      {!tagsExpanded && <MobileTagToggle {...props} />}
      <div className={cn(!tagsExpanded && 'max-sm:hidden')}>
        <TagRow shown={shown} hidden={hidden} toggle={toggle} {...props} />
      </div>
    </>
  )
}

interface TagRowProps extends ProjectFilterBarProps {
  shown: TagCount[]
  hidden: number
  toggle: (tag: string) => () => void
}

function TagRow({ filters, tags, tagsExpanded, onToggleTags, shown, hidden, toggle }: TagRowProps) {
  return (
    <FilterRow label="tags">
      <div
        id={TAG_GROUP_ID}
        role="group"
        aria-label="Filter by tag"
        className="flex flex-wrap items-center gap-1.5"
      >
        {shown.map(({ tag, count }) => (
          <Chip key={tag} active={filters.tag === tag} onClick={toggle(tag)}>
            {tag.toLowerCase()} <Count n={count} />
          </Chip>
        ))}
        {tags.length > VISIBLE_TAGS && (hidden > 0 || tagsExpanded) && (
          <button
            type="button"
            aria-expanded={tagsExpanded}
            aria-controls={TAG_GROUP_ID}
            onClick={onToggleTags}
            className="px-1 text-[11px] text-neutral-500 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            {tagsExpanded ? '− fewer' : `+${hidden} more`}
          </button>
        )}
      </div>
    </FilterRow>
  )
}

/** Prompt-style filter line, status chips and the 12 most frequent tags (folded on phones). */
export function ProjectFilterBar(props: ProjectFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="text-[12px] leading-5">
        <span className="prompt-user">kacper@warsaw</span>{' '}
        <span className="prompt-path">~/projects</span>
      </div>
      <FilterInput {...props} />
      <StatusChips {...props} />
      <TagChips {...props} />
    </div>
  )
}
