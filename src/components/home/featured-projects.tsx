import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ProjectThumbnail } from '@/components/projects/project-thumbnail'
import { ArrowLink } from '@/components/ui/arrow-link'
import { SectionShell, SectionHeader, SectionEyebrow } from '@/components/ui/section-shell'
import { getFeaturedProjects } from '@/lib/db/projects'
import { categoryLabels, categoryColorClass, type ProjectCategory } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Featured work, as a bento grid.
 *
 * The previous version was a uniform card grid, which is the correct choice for an
 * index where every project has equal weight but the wrong one for a homepage,
 * where the newest or most substantial piece should be the first thing that
 * registers. Here the lead project takes two columns and a taller crop, and the
 * rest sit beneath it.
 *
 * Tiles carry their category colour, so the grid is readable as a colour map
 * before a single word is read.
 */
export async function FeaturedProjects({ projects }: { projects?: Project[] }) {
  const list = projects ?? (await getFeaturedProjects(3))

  if (list.length === 0) {
    return (
      <SectionShell tone="section-tone-web">
        <div className="container-custom">
          <div className="py-20 text-center">
            <SectionEyebrow>Projects</SectionEyebrow>
            <h2 className="section-head-title mx-auto max-w-[24ch] text-balance">
              Nothing published yet.
            </h2>
            <p className="body mx-auto mt-5 max-w-prose text-pretty text-[rgb(var(--text-dim))]">
              This section fills in as soon as a project is published from the CMS. Nothing is
              hidden — it is genuinely empty until there is something to show.
            </p>
            <div className="mt-8 flex justify-center">
              <ArrowLink href="/about">Read about how I work</ArrowLink>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  }

  const [lead, ...rest] = list

  return (
    <SectionShell tone="section-tone-web">
      <div className="container-custom">
        <div className="py-16 lg:py-24">
          <SectionHeader
            eyebrow="Projects"
            title="Things I have built."
            action={
              <ArrowLink href="/projects" className="shrink-0">
                All projects
              </ArrowLink>
            }
            className="mb-10"
          />

          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <li className={categoryColorClass(lead.category)}>
              <Link
                href={`/projects/${lead.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[rgb(var(--bg-elevated))] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[rgb(var(--cat)/0.6)] hover:shadow-[0_30px_64px_-28px_rgb(0_0_0/0.8)]"
              >
                <div className="relative overflow-hidden">
                  <div aria-hidden="true" className="cat-glow pointer-events-none absolute inset-0 z-10" />
                  <ProjectThumbnail
                    src={lead.thumbnail_url}
                    alt={`${lead.title} preview`}
                    className="aspect-[16/9] w-full transition-transform duration-700 ease-out group-hover:scale-[1.05] lg:aspect-[21/9]"
                    priority
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    zoom={false}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/75 to-transparent"
                  />
                  <CategoryChip category={lead.category as ProjectCategory} className="left-5 top-5" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-balance font-display text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--cat))] lg:text-3xl">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {lead.title}
                    </h3>
                    <ArrowUpRight
                      className="h-6 w-6 shrink-0 text-[rgb(var(--text-muted))] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[rgb(var(--cat))]"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="body mt-3 max-w-prose text-pretty text-[rgb(var(--text-dim))]">
                    {lead.short_description}
                  </p>

                  {lead.project_date && (
                    <time
                      dateTime={lead.project_date}
                      className="meta mt-5 block tabular-nums lg:mt-auto lg:pt-6"
                    >
                      {formatMonth(lead.project_date)}
                    </time>
                  )}
                </div>
              </Link>
            </li>

            {rest.map((project) => (
              <li key={project.id} className={categoryColorClass(project.category)}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[rgb(var(--bg-elevated))] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[rgb(var(--cat)/0.6)] hover:shadow-[0_30px_64px_-28px_rgb(0_0_0/0.8)]"
                >
                  <div className="relative overflow-hidden">
                    <div aria-hidden="true" className="cat-glow pointer-events-none absolute inset-0 z-10" />
                    <ProjectThumbnail
                      src={project.thumbnail_url}
                      alt={`${project.title} preview`}
                      className="aspect-video w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      zoom={false}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/70 to-transparent"
                    />
                    <CategoryChip category={project.category as ProjectCategory} className="left-4 top-4" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-balance font-display text-lg font-bold leading-[1.15] tracking-[-0.025em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--cat))]">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {project.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]">
                      {project.short_description}
                    </p>

                    {project.project_date && (
                      <time
                        dateTime={project.project_date}
                        className="meta mt-4 block tabular-nums lg:mt-auto lg:pt-4"
                      >
                        {formatMonth(project.project_date)}
                      </time>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}

/** Category chip carrying the hue its parent `<li>` already established. */
function CategoryChip({
  category,
  className = '',
}: {
  category: ProjectCategory
  className?: string
}) {
  return (
    <span
      className={`cat-chip absolute z-20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] backdrop-blur-md ${className}`}
    >
      <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
      {categoryLabels[category] ?? category}
    </span>
  )
}
