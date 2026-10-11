import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjects, getProjectBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { ProjectPager, adjacentProjects } from '@/components/projects/project-pager'
import { ProjectRecord } from '@/components/projects/project-record'
import { toSummary } from '@/components/projects/project-summary'
import { DETAIL_TITLE, DetailLayout } from '@/components/ui/detail-layout'
import { PathCrumb } from '@/components/ui/path-crumb'
import { pageMetadata } from '@/lib/metadata'

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
  return pageMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${project.slug}`,
  })
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const summary = toSummary(project)
  const { prev, next } = adjacentProjects(getProjects(), project.slug)

  return (
    <DetailLayout
      header={
        <>
          <PathCrumb segments={[{ label: 'projects', href: '/projects' }]} leaf={`${project.slug}.mdx`} />
          <h1 className={DETAIL_TITLE}>{project.title}</h1>
          <p className="text-neutral-400 text-[15px] leading-relaxed">{project.description}</p>
        </>
      }
      record={<ProjectRecord project={summary} />}
    >
      <MDXContent code={project.body} />
      <ProjectPager prev={prev} next={next} />
    </DetailLayout>
  )
}
