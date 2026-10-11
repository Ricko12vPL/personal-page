import { MetaStrip, type MetaItem } from '@/components/ui/meta-strip'
import { projectStatus } from '@/lib/status'
import { countByStatus, latestChange, type ProjectSummary } from './project-summary'

interface ProjectCountsProps {
  projects: readonly ProjectSummary[]
}

// "PROJECTS 10  COMPLETED 4  IN PROGRESS 1 …  LAST CHANGE 2026-10-11" —
// computed from content; statuses with no projects are left out.
export function projectCountItems(projects: readonly ProjectSummary[]): MetaItem[] {
  const counts = countByStatus(projects).filter((c) => c.count > 0)
  const latest = latestChange(projects)
  return [
    { label: 'projects', value: projects.length.toLocaleString('en-US') },
    ...counts.map(({ status, count }) => ({
      label: projectStatus(status).label.toLowerCase(),
      value: count.toLocaleString('en-US'),
    })),
    ...(latest ? [{ label: 'last change', value: latest }] : []),
  ]
}

export function ProjectCounts({ projects }: ProjectCountsProps) {
  return <MetaStrip items={projectCountItems(projects)} />
}
