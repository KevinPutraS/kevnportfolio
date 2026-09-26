export const siteConfig = {
  name: 'Kevin Portfolio',
  shortName: 'Kevin',
  description: 'Building things. Exploring ideas. Creating digital projects.',
  /**
   * Public origin used for canonical URLs, Open Graph and the sitemap.
   * Override with NEXT_PUBLIC_SITE_URL so preview deployments stay correct.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://kevnportfolio.dev').replace(/\/$/, ''),
  ogImage: '/images/og-image.png',
  /** Placeholder address — replace with the real one before deploying. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'hello@example.com',
  links: {
    github: 'https://github.com/username',
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username',
  },
  get contactEmail() {
    return `mailto:${this.email}`
  },
  navigation: [
    { label: 'Work', href: '/projects' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  adminNavigation: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Projects', href: '/admin/projects' },
    { label: 'New Project', href: '/admin/projects/new' },
  ],
} as const

export const socialLinks = [
  { label: 'GitHub', href: siteConfig.links.github },
  { label: 'Twitter', href: siteConfig.links.twitter },
  { label: 'LinkedIn', href: siteConfig.links.linkedin },
] as const

/**
 * Data-driven categories. The database constrains `projects.category` to these
 * values, so the filter, the form and the schema can never drift apart.
 */
export const projectCategories = [
  { value: 'web', label: 'Web' },
  { value: 'app', label: 'App' },
  { value: 'design', label: 'Design' },
  { value: 'networking', label: 'Networking' },
  { value: 'experiment', label: 'Experiment' },
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other' },
] as const

export type ProjectCategory = (typeof projectCategories)[number]['value']
export type ProjectCategoryFilter = ProjectCategory | 'all'

export const categoryLabels: Record<ProjectCategory, string> = Object.fromEntries(
  projectCategories.map((category) => [category.value, category.label])
) as Record<ProjectCategory, string>

export function isProjectCategory(value: unknown): value is ProjectCategory {
  return typeof value === 'string' && value in categoryLabels
}

export const interests = [
  {
    title: 'Web',
    description: 'Interfaces and applications that run in the browser — from static sites to real-time dashboards.',
    icon: 'globe',
  },
  {
    title: 'Software',
    description: 'Command line tools, automations and small programs that solve a specific problem well.',
    icon: 'cpu',
  },
  {
    title: 'Networking',
    description: 'How machines talk to each other: protocols, services, routing and the wires in between.',
    icon: 'network',
  },
  {
    title: 'Design',
    description: 'Typography, layout and interaction — the part that decides whether an idea feels finished.',
    icon: 'palette',
  },
  {
    title: 'Experiments',
    description: 'Generative sketches, shaders and half-finished ideas kept purely out of curiosity.',
    icon: 'flask',
  },
] as const

export const currentlyExploring = [
  'Rust and WebAssembly',
  'Local-first software',
  'Real-time collaboration',
  'Generative art systems',
  'Developer tooling',
] as const

/**
 * Deliberately plain: a list of things actually used, grouped by intent.
 * No years of experience or proficiency levels are claimed.
 */
export const technologies = [
  {
    group: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Rust (learning)'],
  },
  {
    group: 'Frontend',
    items: ['React', 'Next.js', 'Tailwind CSS', 'HTML', 'CSS'],
  },
  {
    group: 'Backend & Data',
    items: ['Supabase', 'PostgreSQL', 'Node.js', 'REST APIs'],
  },
  {
    group: 'Infrastructure',
    items: ['Git', 'Vercel', 'Linux', 'Docker (basics)'],
  },
] as const

export const projectApproach = [
  {
    title: 'Curiosity first',
    description: 'Projects start from something I want to understand, not from a checklist.',
  },
  {
    title: 'Learn while building',
    description: 'Reading gets me started; finishing the thing is what actually teaches me.',
  },
  {
    title: 'Small and finished',
    description: 'A small project that ships beats a large one that never leaves a branch.',
  },
  {
    title: 'Write it down',
    description: 'Notes and a short write-up are part of the work, not an afterthought.',
  },
] as const
