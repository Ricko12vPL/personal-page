import { RecordDay, RecordPanel, RecordRow } from '@/components/ui/record-panel'
import { StatusBadge } from './status-badge'
import { isoDay, type ProjectSummary } from './project-summary'

interface ProjectRecordProps {
  project: ProjectSummary
}

function Stats({ project }: ProjectRecordProps) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-0.5">
      {project.stats.map((stat) => (
        <span key={stat.label} className="whitespace-nowrap">
          <span className="text-neutral-400">{stat.label}</span>{' '}
          <span className="num">{stat.value}</span>
        </span>
      ))}
    </span>
  )
}

function Links({ project }: ProjectRecordProps) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
      {project.links.map((link) => (
        <a
          key={link.kind}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
        >
          {link.label} <span aria-hidden="true">{link.arrow}</span>
        </a>
      ))}
    </span>
  )
}

/** Frontmatter record for a project: status, dates, stats, tags, links. */
export function ProjectRecord({ project }: ProjectRecordProps) {
  return (
    <RecordPanel
      label="Project record"
      source={`${project.slug}.mdx`}
      footer={project.links.length > 0 ? <Links project={project} /> : undefined}
    >
      <RecordRow label="status">
        <StatusBadge status={project.status} />
      </RecordRow>
      <RecordRow label="started">
        <RecordDay day={isoDay(project.date)} />
      </RecordRow>
      {project.updated && (
        <RecordRow label="updated">
          <RecordDay day={isoDay(project.updated)} />
        </RecordRow>
      )}
      {project.stats.length > 0 && (
        <RecordRow label="stats">
          <Stats project={project} />
        </RecordRow>
      )}
      {project.tags.length > 0 && (
        <RecordRow label="tags">
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-neutral-400">
            {project.tags.map((tag) => (
              <span key={tag} className="whitespace-nowrap">
                {tag.toLowerCase()}
              </span>
            ))}
          </span>
        </RecordRow>
      )}
    </RecordPanel>
  )
}
