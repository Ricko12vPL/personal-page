import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjects, getProjectBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { TechTag } from '@/components/projects/tech-tag'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <div className="max-w-[800px] mx-auto px-8 py-20">
      <Link
        href="/projects"
        className="text-neutral-500 text-[13px] hover:text-accent transition-colors mb-12 inline-block"
      >
        &larr; Back to projects
      </Link>

      <header className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <span
            className={`text-[11px] tracking-wider uppercase ${
              project.status === 'in-progress'
                ? 'text-amber-400'
                : 'text-accent'
            }`}
          >
            {project.status === 'in-progress'
              ? 'In Progress'
              : 'Completed'}
          </span>
          <span className="text-neutral-600 text-[12px]">
            {formatDate(project.date)}
            {project.updated && ` — updated ${formatDate(project.updated)}`}
          </span>
        </div>

        <h1 className="font-pixel text-neutral-100 text-3xl sm:text-4xl mb-6 tracking-tight">
          {project.title.toUpperCase()}
        </h1>

        <p className="text-neutral-400 text-[15px] leading-relaxed mb-8 max-w-2xl">
          {project.description}
        </p>

        {project.stats && (
          <div className="flex flex-wrap gap-6 text-[13px] mb-8">
            {project.stats.lines && (
              <span className="text-neutral-300">
                <span className="text-accent/60">lines</span>{' '}
                {project.stats.lines}
              </span>
            )}
            {project.stats.sharpe && (
              <span className="text-neutral-300">
                <span className="text-accent/60">sharpe</span>{' '}
                {project.stats.sharpe}
              </span>
            )}
            {project.stats.strategies && (
              <span className="text-neutral-300">
                <span className="text-accent/60">strategies</span>{' '}
                {project.stats.strategies}
              </span>
            )}
            {project.stats.sources && (
              <span className="text-neutral-300">
                <span className="text-accent/60">sources</span>{' '}
                {project.stats.sources}
              </span>
            )}
            {project.stats.modules && (
              <span className="text-neutral-300">
                <span className="text-accent/60">modules</span>{' '}
                {project.stats.modules}
              </span>
            )}
            {project.stats.stars && (
              <span className="text-neutral-300">
                <span className="text-accent/60">stars</span>{' '}
                {project.stats.stars}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags.map((tag) => (
            <TechTag key={tag} tag={tag} />
          ))}
        </div>

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-[13px] hover:opacity-70 transition-opacity"
          >
            View on GitHub &rarr;
          </a>
        )}
      </header>

      <MDXContent code={project.body} />
    </div>
  )
}
