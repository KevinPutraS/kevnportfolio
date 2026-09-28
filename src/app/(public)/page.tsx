import { About } from '@/components/home/about'
import { ContactCta } from '@/components/home/contact-cta'
import { CredentialsPreview } from '@/components/home/credentials-preview'
import { FeaturedProjects } from '@/components/home/featured-projects'
import { Hero } from '@/components/home/hero'
import { getFeaturedProjects } from '@/lib/db/projects'

/**
 * Home page. Always statically renderable: every section either renders its own
 * empty state or degrades gracefully when Supabase is not configured yet.
 *
 * ISR: statically generated and revalidated every 60 seconds, so publishing from
 * the CMS appears without a redeploy. This only works because public reads use
 * the cookie-less client in `src/lib/supabase/public.ts`; a session client would
 * call `cookies()` and force a dynamic render.
 */
export const revalidate = 60

/**
 * Four sections, not nine.
 *
 * The previous composition was hero, intro, projects, credentials, interests,
 * currently-exploring, about-preview and contact — seven of which were an eyebrow,
 * a heading and a list, in that order, with the same border and the same padding.
 * Each one was individually fine and the sum read as a form: nobody finishes
 * eight near-identical blocks, so the pages that actually mattered (the work) had
 * to compete with sections repeating them.
 *
 * Now the page is: who this is, the work, proof of it, and a way to talk. The
 * material that used to be scattered across intro/interests/exploring/about is
 * merged into a single "About" section, and the credentials sit directly under
 * the projects because they are the evidence for them.
 */
export default async function HomePage() {
  /*
   * Six, not three. The featured section is a rail, so its height no longer
   * depends on the count — it is one screen whether there are two items or
   * twenty. The cap is only there to stop the strip turning into a second copy
   * of the projects index; "All projects" is one tap away for the rest.
   */
  const featured = await getFeaturedProjects(6)

  return (
    <>
      <Hero />
      <FeaturedProjects projects={featured} />
      <About />
      <CredentialsPreview />
      <ContactCta />
    </>
  )
}
