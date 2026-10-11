import Link from 'next/link'
import { getFeaturedProjects } from '@/lib/content'
import { StatusBadge } from '@/components/projects/status-badge'
import { isoDay } from '@/components/projects/project-summary'
import { SectionLabel } from './section-label'

const MAX_TAGS = 3

interface ProjectRowData {
  slug: string
  title: string
  description: string
  date: string
  status: string
  tags: string[]
}

function splitTitle(title: string): { name: string; subtitle: string } {
  const at = title.indexOf(':')
  return at === -1
    ? { name: title, subtitle: '' }
    : { name: title.slice(0, at).trim(), subtitle: title.slice(at + 1).trim() }
}

function ProjectRow({ project }: { project: ProjectRowData }) {
  const { name, subtitle } = splitTitle(project.title)
  return (
    <li>
      <Link
        href={`/projects/${project.slug}`}
        className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-neutral-900 focus-visible:bg-neutral-900 focus-visible:outline-none sm:grid-cols-[96px_minmax(0,1fr)_auto_auto] sm:px-5 lg:grid-cols-[96px_minmax(0,1fr)_auto_auto_auto]"
      >
        <StatusBadge status={project.status} className="text-[12px]" />
        <span className="min-w-0 col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
          <span className="block truncate text-[14px] text-neutral-100 transition-colors group-hover:text-accent">
            {name}
            {subtitle && <span className="text-neutral-400"> — {subtitle}</span>}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-neutral-400">
            {project.description}
          </span>
        </span>
        <span className="hidden gap-x-3 text-[11px] text-neutral-500 lg:flex">
          {project.tags.slice(0, MAX_TAGS).map((tag) => (
            <span key={tag}>{tag.toLowerCase()}</span>
          ))}
        </span>
        <time
          dateTime={isoDay(project.date)}
          className="col-start-2 row-start-1 text-right text-[11px] tabular-nums text-neutral-400 sm:col-start-auto sm:row-start-auto"
        >
          {isoDay(project.date)}
        </time>
        <span
          aria-hidden="true"
          className="hidden text-neutral-600 transition-colors group-hover:text-accent sm:inline"
        >
          →
        </span>
      </Link>
    </li>
  )
}

export function FeaturedProjects() {
  const featured = getFeaturedProjects()
  return (
    <section aria-labelledby="home-projects">
      <SectionLabel id="home-projects" index="04" name="projects" command="ls -l ~/projects --featured" />
      <ul className="panel divide-y divide-[var(--hairline)]">
        {featured.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <Link
          href="/projects"
          className="text-[13px] text-neutral-400 transition-colors hover:text-accent"
        >
          View all projects &rarr;
        </Link>
      </div>
    </section>
  )
}
