'use client'

import { useState, useMemo } from 'react'
import { ProjectCard } from '@/components/projects/project-card'
import type { Project } from '@/components/projects/project-card'

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeTag, setActiveTag] = useState('all')

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const project of projects) {
      for (const tag of project.tags) {
        tagSet.add(tag)
      }
    }
    return [...tagSet].sort()
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (activeTag === 'all') return projects
    return projects.filter((project) => project.tags.includes(activeTag))
  }, [projects, activeTag])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveTag('all')}
          className={`text-[12px] px-3 py-1.5 rounded transition-colors ${
            activeTag === 'all'
              ? 'bg-accent text-neutral-950 font-medium'
              : 'text-neutral-500 hover:text-neutral-200 bg-neutral-800/50'
          }`}
        >
          All ({projects.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-[12px] px-3 py-1.5 rounded transition-colors ${
              activeTag === tag
                ? 'bg-accent text-neutral-950 font-medium'
                : 'text-neutral-500 hover:text-neutral-200 bg-neutral-800/50'
            }`}
          >
            {tag.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p className="text-neutral-600 text-sm text-center py-16">
          No projects match that filter.
        </p>
      )}
    </div>
  )
}
