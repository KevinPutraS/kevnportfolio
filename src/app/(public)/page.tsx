import { Metadata } from 'next'
import { Hero } from '@/components/home/hero'
import { Introduction } from '@/components/home/intro'
import { FeaturedProjects } from '@/components/home/featured-projects'
import { Interests } from '@/components/home/interests'
import { CurrentlyExploring } from '@/components/home/currently-exploring'
import { AboutPreview } from '@/components/home/about-preview'
import { ContactCTA } from '@/components/home/contact-cta'
import { getFeaturedProjects } from '@/lib/db/projects'

export const metadata: Metadata = {
  title: 'Building Things. Exploring Ideas.',
  description: 'Building things. Exploring ideas. Creating digital projects. A portfolio of web applications, experiments, and creative coding explorations.',
}

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects(4)

  return (
    <>
      <Hero />
      <Introduction />
      <FeaturedProjects projects={featuredProjects} />
      <Interests />
      <CurrentlyExploring />
      <AboutPreview />
      <ContactCTA />
    </>
  )
}