export const siteConfig = {
  name: 'Kevin Portfolio',
  description: 'Building things. Exploring ideas. Creating digital projects.',
  url: 'https://kevnportfolio.dev',
  ogImage: '/images/og-image.png',
  links: {
    github: 'https://github.com/username',
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username',
    email: 'mailto:hello@example.com',
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
}

export const projectCategories = [
  { value: 'web', label: 'Web' },
  { value: 'app', label: 'App' },
  { value: 'design', label: 'Design' },
  { value: 'networking', label: 'Networking' },
  { value: 'experiment', label: 'Experiment' },
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other' },
] as const

export type ProjectCategory = typeof projectCategories[number]['value']
export type ProjectCategoryFilter = ProjectCategory | 'all'

export const interests = [
  {
    title: 'Web',
    description: 'Building for the browser — interfaces, applications, and experiences.',
    icon: 'globe',
  },
  {
    title: 'Software',
    description: 'Native applications, CLI tools, and system-level programming.',
    icon: 'cpu',
  },
  {
    title: 'Networking',
    description: 'Protocols, distributed systems, and real-time communication.',
    icon: 'network',
  },
  {
    title: 'Design',
    description: 'Visual design, interaction patterns, and user experience.',
    icon: 'palette',
  },
  {
    title: 'Experiments',
    description: 'Creative coding, generative art, and technical explorations.',
    icon: 'flask',
  },
] as const

export const currentlyExploring = [
  'Rust & WebAssembly',
  'Local-first software',
  'Real-time collaboration',
  'Generative art systems',
  'Developer tooling',
]