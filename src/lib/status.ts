// One place that maps a project status to its label and colour, so the card
// and the detail page cannot drift apart again.
export type ProjectStatus = 'completed' | 'in-progress' | 'archived'

const STATUS_STYLE: Record<ProjectStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'text-accent' },
  'in-progress': { label: 'In Progress', className: 'text-amber-400' },
  archived: { label: 'Archived', className: 'text-neutral-500' },
}

export function projectStatus(status: string) {
  return STATUS_STYLE[status as ProjectStatus] ?? STATUS_STYLE['in-progress']
}
