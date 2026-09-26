import type { MetadataRoute } from 'next'
import { getPublishedProjectIndex } from '@/lib/db/projects'
import { siteConfig } from '@/config/site'

export const revalidate = 300

/**
 * Includes *every* published project, not just the first page of results.
 * The previous implementation reused the paginated public query and therefore
 * capped the sitemap at 12 URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.url}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteConfig.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  const projects = await getPublishedProjectIndex()

  const projectRoutes: MetadataRoute.Sitemap = projects.map(({ slug, updatedAt }) => ({
    url: `${siteConfig.url}/projects/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...projectRoutes]
}
