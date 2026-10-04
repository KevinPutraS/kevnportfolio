import { ProjectRailCard } from '@/components/projects/project-rail-card'
import { ArrowLink } from '@/components/ui/arrow-link'
import { HorizontalRail } from '@/components/ui/horizontal-rail'
import { SectionShell, SectionHeader, SectionEyebrow } from '@/components/ui/section-shell'
import { getFeaturedProjects } from '@/lib/db/projects'
import { classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Featured work, as a horizontal rail.
 *
 * This was a bento grid, and the grid was the problem rather than the fix. A
 * grid resolves downward, so every additional featured project added roughly
 * half a screen between the visitor and whatever came next — the section's own
 * length was decided by how many projects happened to be flagged, and the
 * homepage grew a screen for every extra `featured` tick in the CMS. It also
 * made "flag this one as featured" a real decision rather than a free one.
 *
 * A rail decouples the two. The section is one screen tall at any count, the
 * sliver of the next card says there is more without a scrollbar, and the
 * `featured` flag goes back to meaning "show this" instead of "make the page
 * longer". The arrow buttons and the progress line carry the position for
 * anyone who cannot swipe, and the track is keyboard-scrollable.
 *
 * Card widths step up across breakpoints rather than being a fixed count of
 * visible cards, because the container is fluid: 78vw on a phone leaves a peek
 * of the next card, and the desktop widths show two and a half so the rail is
 * visibly a rail. The card itself is `ProjectRailCard` — the only card left on
 * the site, since the index and the related-work rows are not cards.
 */
export async function FeaturedProjects({ projects }: { projects?: Project[] }) {
  const list = projects ?? (await getFeaturedProjects(6))

  if (list.length === 0) {
    return (
      <SectionShell tone="section-tone-web" index="01">
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

  return (
    <SectionShell tone="section-tone-web" index="01">
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
            className="mb-9"
          />

          <HorizontalRail label="Featured projects">
            {list.map((project, index) => (
              <li
                key={project.id}
                className={classNames(
                  'shrink-0 snap-start',
                  /*
                    The lead runs wider than the rest. `FeaturedProjects` used to
                    hand every card the same width, so the rail opened with six
                    equal objects and the eye had no place to land. The lead is
                    30rem on a desktop against 26rem for the cards behind it —
                    enough that the first card reads as the one you arrived for,
                    and not so much that it stops looking like a rail.
                  */
                  index === 0
                    ? 'w-[84vw] max-w-[23rem] sm:w-[26rem] lg:w-[28rem] xl:w-[30rem]'
                    : 'w-[78vw] max-w-[21rem] sm:w-[22rem] lg:w-[24rem] xl:w-[26rem]'
                )}
              >
                <ProjectRailCard
                  project={project}
                  className="h-full"
                  lead={index === 0}
                  /* Only the first card is above the fold on any viewport, so
                     only the first card is worth preloading. */
                  priority={index === 0}
                />
              </li>
            ))}
          </HorizontalRail>
        </div>
      </div>
    </SectionShell>
  )
}
