/**
 * One entry in the primary navigation.
 *
 * `emphasis: 'primary'` renders the item as a filled accent button instead of a
 * plain link. Exactly one item should carry it — the single next action you want
 * a visitor to take. It is declared here rather than hard-coded in the navbar as
 * a `href === '/contact'` comparison, so adding or moving the primary action is
 * a data change and cannot silently promote two links at once.
 *
 * `tone` is the `cat-*` class that gives the destination its hue in the mobile
 * drawer. It lives here for the same reason: the drawer used to keep its own
 * hard-coded `Map` of href to colour, so reordering or renaming a nav item left
 * a silently mismatched hue behind.
 */
export type NavItem = {
  readonly label: string
  readonly href: string
  readonly emphasis?: 'primary'
  readonly tone?: string
}

export const siteConfig = {
  /**
   * The person's name as it should appear in metadata, the wordmark and the
   * footer. Keep it to the name alone — no role, no "Portfolio" suffix — so
   * titles compose predictably (`%s | Kevin`) instead of reading
   * "Kevin Portfolio — Personal Digital Portfolio".
   */
  name: 'Kevin',
  /**
   * The person's name set on its own line as the hero's `<h1>`. Separate from
   * `name` so a full name can be introduced later without touching the
   * wordmark, metadata or footer.
   */
  personName: 'Kevin',
  /**
   * A plain-language descriptor. The hero needs to say what kind of site this is
   * in words a first-time visitor recognises, not leave them to infer it from a
   * headline.
   */
  descriptor: 'Personal Digital Portfolio',
  /* A noun phrase, not a sentence. Used in the footer and in metadata. */
  description: 'Projects, experience and certificates.',
  /**
   * One sentence that says what the visitor will find here. Deliberately
   * concrete: it names the four sections instead of describing a feeling.
   */
  heroStatement:
    'I build digital projects, explore technology, and experiment with different ideas.',
  /*
   * Removed entirely. The hero already carries the statement plus a "right now"
   * panel, and a third block of reassurance text under it read as filler. If
   * there is ever a genuine need for more context here, it should be one line,
   * not a paragraph.
   */
  heroSupport: '',
  /**
   * Public origin used for canonical URLs, Open Graph and the sitemap.
   * Override with NEXT_PUBLIC_SITE_URL so preview deployments stay correct.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://kevnportfolio.dev').replace(/\/$/, ''),
  ogImage: '/images/og-image.png',
  /** Placeholder address — replace with the real one before deploying. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'kevinputras798@gmail.com',
  /*
   * No LinkedIn yet: the only URL available was a placeholder. The entry stays
   * out until the owner confirms the real profile, so a dead link can never
   * ship again.
   */
  links: {
    github: 'https://github.com/KevinPutraS',
    twitter: 'https://x.com/KevnPutraS',
  },
  get contactEmail() {
    return `mailto:${this.email}`
  },
  /**
   * The printable CV, and the one link on the site that leaves it.
   *
   * `null` is the honest default and it is load-bearing, not a placeholder. The
   * resume page renders its whole document from the site's own content — the
   * experience timeline and the certificate list are already in the database —
   * and this field only controls whether a *download* is offered on top. Pointing
   * it at a file that does not exist would put a 404 behind the one button on the
   * page whose entire purpose is to produce a file, so the site ships without
   * the button and gains it when there is a real PDF to serve.
   *
   * To enable it: export the PDF, drop it in `public/` (it must be a real
   * filename, not a redirect — recruiters open these offline), and set
   * NEXT_PUBLIC_RESUME_URL to that path.
   */
  resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL?.trim() || null,
  /**
   * Primary navigation.
   *
   * Every label is the plain name of the page it points at. Nothing here is
   * clever — "Projects" is a list of projects, "Experience" is a history, and a
   * visitor who has never seen the site can guess correctly from the word alone.
   *
   * `Home` is first and is handled specially by the active-state check, because
   * `pathname.startsWith('/')` is true on every route.
   */
  navigation: [
    { label: 'Home', href: '/', tone: 'cat-web' },
    { label: 'Projects', href: '/projects', tone: 'cat-app' },
    { label: 'Experience', href: '/experience', tone: 'cat-design' },
    { label: 'Certificates', href: '/certificates', tone: 'cat-networking' },
    { label: 'About', href: '/about', tone: 'cat-experiment' },
    { label: 'Resume', href: '/resume', tone: 'cat-school' },
    { label: 'Contact', href: '/contact', tone: 'cat-school', emphasis: 'primary' },
  ] as readonly NavItem[],
  /**
   * The four content sections, each with a one-line description of what the
   * visitor will find there. Used by the hero to answer "what is this site?"
   * without making anyone click to find out.
   */
  sections: [
    {
      label: 'Projects',
      href: '/projects',
      description: 'Applications, experiments and coursework I have built, with what they are made of.',
    },
    {
      label: 'Experience',
      href: '/experience',
      description: 'Internships, school projects and organization work, written as what I actually did.',
    },
    {
      label: 'Certificates',
      href: '/certificates',
      description: 'Courses and training I completed, with the issuer and the date.',
    },
    {
      label: 'About',
      href: '/about',
      description: 'How I work, what I like building and what I am exploring right now.',
    },
  ],
  /**
   * Single source of truth for the CMS sidebar. Imported by
   * `components/admin/admin-navigation.tsx`, which used to keep its own copy
   * while this one sat unused — two lists that drift apart the moment a
   * section is added.
   *
   * `icon` is the name of an entry in that component's icon map. It lives here
   * so the sidebar, the drawer and the mobile header can never disagree about
   * which glyph belongs to which section, and so adding a section means adding
   * one row rather than finding the three places that render a nav list.
   */
  adminNavigation: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Projects', href: '/admin/projects', icon: 'projects' },
    { label: 'Experience', href: '/admin/experience', icon: 'experience' },
    { label: 'Certificates', href: '/admin/certificates', icon: 'certificates' },
    { label: 'Settings', href: '/admin/settings', icon: 'settings' },
  ],
} as const

export const socialLinks = [
  { label: 'GitHub', href: siteConfig.links.github },
  { label: 'Twitter', href: siteConfig.links.twitter },
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

/**
 * Category to colour, so a project can be recognised by its colour alone.
 *
 * Kept here rather than in a component so the hue lives next to the category it
 * belongs to, and the two cannot drift apart. The value is the token *name*, not
 * a raw colour, so every component resolves it through the same `.cat-*` class
 * and nothing has to know what the actual hex is.
 */
export const categoryColors: Record<ProjectCategory, string> = {
  web: 'cat-web',
  app: 'cat-app',
  design: 'cat-design',
  networking: 'cat-networking',
  experiment: 'cat-experiment',
  school: 'cat-school',
  other: 'cat-other',
}

/** Same mapping, as a ready-made class string. */
export function categoryColorClass(category: string): string {
  return isProjectCategory(category) ? categoryColors[category] : 'cat-other'
}

export function isProjectCategory(value: unknown): value is ProjectCategory {
  return typeof value === 'string' && value in categoryLabels
}

/**
 * Data-driven experience types, for the same reason `projectCategories` is:
 * the database CHECK constraint, the editor's `<select>` and the public labels
 * are all generated from this one list, so they cannot drift apart.
 *
 * `school_project` and `organization` are intentionally present. School
 * projects with a meaningful role and committee or student-organisation work
 * are exactly the kind of experience this portfolio wants to show, and forcing
 * them into "other" would flatten them.
 */
export const experienceTypes = [
  { value: 'internship', label: 'Internship' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'organization', label: 'Organization' },
  { value: 'school_project', label: 'School project' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'other', label: 'Other' },
] as const

export type ExperienceType = (typeof experienceTypes)[number]['value']

export const experienceTypeLabels: Record<ExperienceType, string> = Object.fromEntries(
  experienceTypes.map((type) => [type.value, type.label])
) as Record<ExperienceType, string>

export function isExperienceType(value: unknown): value is ExperienceType {
  return typeof value === 'string' && value in experienceTypeLabels
}

/**
 * Short label plus a tagline.
 *
 * `tagline` is the mid-length form: one clause, roughly 8–12 words, which fits on
 * one or two lines inside a three-column tile. It exists because the two extremes
 * both failed — a full `description` per tile made the homepage section three rows
 * of dense text, and dropping the tagline entirely left six bare labels that said
 * nothing. This is the size that carries meaning without inflating the block.
 *
 * `description` remains the long form, used only on /about where there is a
 * column to itself.
 */
export const interests = [
  { title: 'Web', tagline: 'Interfaces and apps that run in the browser', description: 'Interfaces and applications that run in the browser — from static sites to real-time dashboards.', icon: 'globe' },
  { title: 'Software', tagline: 'Tools and small programs that solve one problem', description: 'Command line tools, automations and small programs that solve a specific problem well.', icon: 'cpu' },
  { title: 'Networking', tagline: 'How services find each other and keep talking', description: 'How machines talk to each other: protocols, services, routing and the wires in between.', icon: 'network' },
  { title: 'Design', tagline: 'Type, layout and the details that make it feel done', description: 'Typography, layout and interaction — the part that decides whether an idea feels finished.', icon: 'palette' },
  { title: 'Experiments', tagline: 'Sketches and ideas kept purely out of curiosity', description: 'Generative sketches, shaders and half-finished ideas kept purely out of curiosity.', icon: 'flask' },
  { title: 'Systems', tagline: 'Runtimes, compilers and what lies underneath', description: 'Runtimes, compilers and the layer below the abstractions.', icon: 'layers' },
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

/**
 * Four beats, each one clause. These render as four numbered tiles with an icon,
 * a title and a single line — enough to show process, not enough to read as an
 * essay about process.
 */
export const projectApproach = [
  { title: 'Curiosity first', description: 'Start from a question, not a checklist.' },
  { title: 'Learn by building', description: 'Reading starts it; finishing it teaches you.' },
  { title: 'Small and finished', description: 'A shipped small thing beats an unshipped big one.' },
  { title: 'Write it down', description: 'Notes are part of the work, not an afterthought.' },
] as const
