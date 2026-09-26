import { ProjectTableClient } from './project-table-client'
import type { Project } from '@/types/project'

/** Server wrapper so the table can be rendered from a Server Component. */
export function ProjectTable({ projects }: { projects: Project[] }) {
  return <ProjectTableClient projects={projects} />
}
