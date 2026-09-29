import Link from 'next/link'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Related projects, as a compact index rather than a second card grid.
 *
 * This was a two-to-four-column grid of the same cards used on the projects
 * page, which meant the case study ended by going back to the shape the site had
 * just left behind. These rows are the same hairline column as the projects
 * index — number, title, one meta line, a rule — so the study and the rest of
 * the site stay in one visual language.
 */
export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section className="rule-top">
      <div className="container-custom">
        <div className="rhythm-lg">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Keep reading</p>
              <h2 className="heading-2 mt-5">Related projects</h2>
            </div>
          </div>

          <ol className="mt-10 border-t border-[rgb(var(--border))]">
            {projects.map((project, i) => {
              const category = project.category as ProjectCategory

              return (
                <li key={project.id} className="group border-b border-[rgb(var(--border))]">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex items-start gap-4 py-6 sm:gap-6 sm:py-7"
                  >
                    <span className="w-7 shrink-0 pt-0.5 font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-muted))] sm:w-9">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.02em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))] sm:text-xl">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-[length:var(--text-sm)] text-[rgb(var(--text-dim))]">
                        {project.short_description}
                      </p>
                      <p className="mt-3 flex items-center gap-2.5 font-mono text-[length:var(--text-meta)] uppercase tracking-[0.1em]">
                        <span className="text-[rgb(var(--text))]">
                          {categoryLabels[category] ?? project.category}
                        </span>
                        {project.project_date ? (
                          <>
                            <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                              ·
                            </span>
                            <time dateTime={project.project_date} className="tabular-nums text-[rgb(var(--text-dim))]">
                              {formatMonth(project.project_date)}
                            </time>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}