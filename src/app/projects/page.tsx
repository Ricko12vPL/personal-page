import type { Metadata } from 'next'
import { getProjects } from '@/lib/content'
import { ProjectCounts } from '@/components/projects/project-counts'
import { ProjectIndex } from '@/components/projects/project-index'
import { toSummary } from '@/components/projects/project-summary'
import { SectionHeading } from '@/components/ui/section-heading'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Projects',
  description:
    'Quantitative research systems, AI agents, and full-stack applications by Kacper Saks.',
  path: '/projects',
})

export default function ProjectsPage() {
  // Map to a lean summary here: the client index must not receive MDX bodies.
  const projects = getProjects().map(toSummary)

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 pt-12 pb-24 sm:pt-16">
      <SectionHeading
        as="h1"
        title="projects"
        subtitle="Quantitative finance, AI agents, and full-stack applications"
        meta={<ProjectCounts projects={projects} />}
        className="max-sm:mb-8"
      />
      <ProjectIndex projects={projects} />
    </div>
  )
}
