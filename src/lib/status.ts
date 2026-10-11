// One place that maps a project status to its label, colour and glyph, so the
// index, the preview pane and the detail page cannot drift apart again.
export type ProjectStatus = 'completed' | 'in-progress' | 'paused' | 'archived'

interface StatusStyle {
  label: string
  className: string
  glyph: string
}

// Display order for counts lines and filter chips.
export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'completed',
  'in-progress',
  'paused',
  'archived',
]

const STATUS_STYLE: Record<ProjectStatus, StatusStyle> = {
  completed: { label: 'Completed', className: 'text-accent', glyph: '●' },
  'in-progress': { label: 'In Progress', className: 'text-amber-400', glyph: '◐' },
  paused: { label: 'Paused', className: 'text-neutral-400', glyph: '‖' },
  archived: { label: 'Archived', className: 'text-neutral-500', glyph: '○' },
}

function isProjectStatus(status: string): status is ProjectStatus {
  // Own keys only: 'toString' and friends live on the prototype.
  return Object.hasOwn(STATUS_STYLE, status)
}

export function projectStatus(status: string): StatusStyle {
  return isProjectStatus(status) ? STATUS_STYLE[status] : STATUS_STYLE['in-progress']
}
