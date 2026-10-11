import type { Metadata } from 'next'
import { getProjects } from '@/lib/content'
import { ProjectGrid } from '@/components/projects/project-grid'
import { SectionHeading } from '@/components/ui/section-heading'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Projects',
  description:
    'Quantitative research systems, AI agents, and full-stack applications by Kacper Saks.',
  path: '/projects',
})

export default function ProjectsPage() {
  const projects = getProjects()

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-24">
      <SectionHeading
        title="projects"
        subtitle="Quantitative finance, AI agents, and full-stack applications"
      />
      <ProjectGrid projects={projects} />
    </div>
  )
}
