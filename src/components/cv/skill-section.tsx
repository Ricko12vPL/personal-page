interface SkillCategory {
  name: string
  skills: string[]
}

interface SkillSectionProps {
  categories: SkillCategory[]
}

export function SkillSection({ categories }: SkillSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {categories.map((category) => (
        <div key={category.name}>
          <p className="font-pixel text-accent/70 text-[12px] mb-3">
            {category.name.toUpperCase()}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <span
                key={skill}
                className="text-neutral-400 text-[12px] px-2.5 py-1 rounded bg-neutral-800/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
