import { AboutPreview } from '@/components/home/about-preview'
import { ContactCta } from '@/components/home/contact-cta'
import { CurrentlyExploring } from '@/components/home/currently-exploring'
import { FeaturedProjects } from '@/components/home/featured-projects'
import { Hero } from '@/components/home/hero'
import { Interests } from '@/components/home/interests'
import { Intro } from '@/components/home/intro'
import { getFeaturedProjects } from '@/lib/db/projects'

/**
 * Home page. Always statically renderable: every section either renders its
 * own empty state or degrades gracefully when Supabase is not configured yet.
 */
/**
 * ISR: the homepage is statically generated and revalidated every 60 seconds,
 * so publishing a project from the CMS appears on the site without a redeploy.
 *
 * This only works because public reads use the cookie-less client in
 * `src/lib/supabase/public.ts`. A session-scoped client would call `cookies()`
 * and force the route to render dynamically on every request.
 */
export const revalidate = 60

export default async function HomePage() {
  const featured = await getFeaturedProjects(4)

  return (
    <>
      <Hero />
      <Intro />
      <FeaturedProjects projects={featured} />
      <Interests />
      <CurrentlyExploring />
      <AboutPreview />
      <ContactCta />
    </>
  )
}
