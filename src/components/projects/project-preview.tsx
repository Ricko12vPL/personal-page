import Link from 'next/link'
import { StatusBadge } from './status-badge'
import { isoDay, type ProjectSummary } from './project-summary'

interface ProjectPreviewProps {
  project: ProjectSummary | undefined
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="label pt-[3px]">{label}</dt>
      <dd className="min-w-0 text-neutral-300">{children}</dd>
    </>
  )
}

function PreviewStats({ project }: { project: ProjectSummary }) {
  if (project.stats.length === 0) return null
  return (
    <ul className="mt-4 space-y-1 text-[12px]" aria-label="Stats">
      {project.stats.map((stat) => (
        <li key={stat.label} className="flex items-baseline gap-2">
          <span className="text-neutral-500">{stat.label}</span>
          <span className="dotted-leader" aria-hidden="true" />
          <span className="num">{stat.value}</span>
        </li>
      ))}
    </ul>
  )
}

function PreviewLinks({ project }: { project: ProjectSummary }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--hairline)] pt-4 text-[12px]">
      {project.links.map((link) => (
        <a
          key={link.kind}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 transition-colors hover:text-accent"
        >
          {link.label} <span aria-hidden="true">{link.arrow}</span>
        </a>
      ))}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.title}`}
        className="ml-auto text-accent transition-opacity hover:opacity-70"
      >
        open <span className="kbd ml-1">↵</span>
      </Link>
    </div>
  )
}

function PreviewBody({ project }: { project: ProjectSummary }) {
  return (
    <>
      <div className="label flex items-center justify-between gap-4">
        <span>preview</span>
        <span className="truncate normal-case tracking-normal text-neutral-500">
          {project.slug}.mdx
        </span>
      </div>
      <h2 className="font-pixel mt-3 text-[17px] leading-snug text-neutral-100">
        {project.title}
      </h2>
      <dl className="mt-4 grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12px]">
        <MetaRow label="status">
          <StatusBadge status={project.status} />
        </MetaRow>
        <MetaRow label="date">
          <time dateTime={isoDay(project.date)}>{isoDay(project.date)}</time>
        </MetaRow>
        {project.updated && (
          <MetaRow label="updated">
            <time dateTime={isoDay(project.updated)}>{isoDay(project.updated)}</time>
          </MetaRow>
        )}
      </dl>
      <p className="mt-4 text-[13px] leading-relaxed text-neutral-400">{project.description}</p>
      <PreviewStats project={project} />
      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500" aria-label="Tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag.toLowerCase()}</li>
        ))}
      </ul>
      <PreviewLinks project={project} />
    </>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd font-mono normal-case tracking-normal">{children}</kbd>
}

/** Sticky desktop pane (≥1024px) describing the selected or hovered row. */
export function ProjectPreview({ project }: ProjectPreviewProps) {
  return (
    <aside
      aria-label="Project preview"
      className="hidden self-start lg:sticky lg:top-20 lg:block"
    >
      <div className="panel panel-ticks max-h-[calc(100dvh-4rem-var(--statusbar-h)-4.5rem)] overflow-y-auto px-5 py-4">
        {project ? (
          <PreviewBody project={project} />
        ) : (
          <div className="label py-6">no selection — 0 matches</div>
        )}
      </div>
      <div className="label mt-2">
        preview · <Kbd>↑</Kbd> <Kbd>↓</Kbd> / <Kbd>j</Kbd> <Kbd>k</Kbd> move · <Kbd>↵</Kbd> open
      </div>
    </aside>
  )
}
