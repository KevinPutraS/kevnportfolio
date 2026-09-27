import { ProjectCard } from './project-card'
import { classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Projects index.
 *
 * Three columns from `lg`, four from `xl`. An earlier pass used two columns with
 * the first card spanning both, which gave the screenshots real size but made
 * every card a billboard — on a 1440px display a two-column card is over 600px
 * wide and reads as a hero, so a list of projects looked like a set of
 * one-off landings rather than an index.
 *
 * Three is the compromise that keeps the image legible while leaving room for
 * two cards side by side. The double-width feature was dropped rather than moved
 * to the first slot: repeating a wide/narrow/wide rhythm down a list is the most
 * recognisable "designed grid" tic there is, and the same project rendered at two
 * different sizes in one index is worse than a uniform grid.
 */
export function ProjectGrid({ projects, className }: { projects: Project[]; className?: string }) {
  return (
    <div
      className={classNames(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3',
        className
      )}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          variant="standard"
          priority={index < 3}
        />
      ))}
    </div>
  )
}
