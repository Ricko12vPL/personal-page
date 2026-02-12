import Link from 'next/link'
import { TechTag } from '@/components/projects/tech-tag'
import { formatDate } from '@/lib/utils'

export interface ProjectStats {
  lines?: string
  sharpe?: number
  strategies?: number
  sources?: number
  modules?: number
  stars?: number
}

export interface Project {
  slug: string
  title: string
  description: string
  date: string
  status: string
  tags: string[]
  stats?: ProjectStats
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isCompleted = project.status.toLowerCase() === 'completed'

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block group p-8 sm:p-10 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all duration-300 bg-neutral-900/30 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between mb-5">
        <span
          className={`text-[11px] tracking-wider uppercase ${
            isCompleted ? 'text-accent' : 'text-amber-400'
          }`}
        >
          {isCompleted ? 'Completed' : 'In Progress'}
        </span>
        <span className="text-neutral-600 text-[12px]">
          {formatDate(project.date)}
        </span>
      </div>

      <h3 className="font-pixel text-neutral-100 text-lg mb-4 group-hover:text-accent transition-colors duration-300">
        {project.title.toUpperCase()}
      </h3>

      <p className="text-neutral-400 text-[15px] mb-6 leading-[1.8]">
        {project.description}
      </p>

      {project.stats && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] mb-6">
          {project.stats.lines && (
            <span className="text-neutral-300">
              <span className="text-accent/60">loc</span>{' '}
              {project.stats.lines}
            </span>
          )}
          {project.stats.sharpe !== undefined && (
            <span className="text-neutral-300">
              <span className="text-accent/60">sharpe</span>{' '}
              {project.stats.sharpe}
            </span>
          )}
          {project.stats.strategies !== undefined && (
            <span className="text-neutral-300">
              <span className="text-accent/60">strats</span>{' '}
              {project.stats.strategies}
            </span>
          )}
          {project.stats.sources !== undefined && (
            <span className="text-neutral-300">
              <span className="text-accent/60">sources</span>{' '}
              {project.stats.sources}
            </span>
          )}
          {project.stats.modules !== undefined && (
            <span className="text-neutral-300">
              <span className="text-accent/60">modules</span>{' '}
              {project.stats.modules}
            </span>
          )}
          {project.stats.stars !== undefined && (
            <span className="text-neutral-300">
              <span className="text-accent/60">stars</span>{' '}
              {project.stats.stars}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {project.tags.slice(0, 5).map((tag) => (
          <TechTag key={tag} tag={tag} />
        ))}
        {project.tags.length > 5 && (
          <span className="text-neutral-600 text-[11px] self-center ml-1">
            +{project.tags.length - 5}
          </span>
        )}
      </div>
    </Link>
  )
}
