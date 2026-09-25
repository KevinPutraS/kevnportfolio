You are an autonomous senior web developer and UI/UX engineer.

Your task is to build a complete personal digital portfolio website from an EMPTY DIRECTORY.

IMPORTANT:
This directory is intentionally empty.

Do NOT audit an existing project.
Do NOT assume an existing codebase.
Do NOT ask me to manually create files.
You are responsible for creating the entire project from scratch.

==================================================
PROJECT
==================================================

Build a modern, production-ready personal digital portfolio website.

The portfolio must represent a person who enjoys:

- building things
- exploring technology
- creating digital projects
- experimenting with software
- learning different areas of technology

IMPORTANT:

Do NOT position the owner specifically as:

- Full-Stack Developer
- Frontend Developer
- Backend Developer
- UI/UX Designer

The owner is still exploring their direction.

The portfolio must therefore remain GENERAL and FLEXIBLE.

The website should communicate:

"I build things, explore ideas, and create digital projects."

The portfolio should be able to contain projects involving:

- Web Development
- Applications
- APIs
- Networking
- Design
- Experiments
- School Projects
- Other Technology Projects

Do not invent professional experience, clients, employment, certifications, awards, or achievements.

Use realistic placeholder content where actual personal information is not available.

==================================================
TECHNOLOGY STACK
==================================================

Use:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel-compatible architecture

Use the latest stable versions available in the project environment.

Use npm unless there is a strong technical reason to use another package manager.

Keep dependencies minimal.

Do NOT install libraries just because they are popular.

Prefer native Next.js, React, and browser capabilities whenever practical.

==================================================
DESIGN DIRECTION
==================================================

The design should be completely different from a typical portfolio template.

Create a:

MODERN EDITORIAL / DIGITAL PORTFOLIO

Visual characteristics:

- dark visual identity
- sophisticated typography
- strong typography hierarchy
- editorial layouts
- modern grid system
- subtle borders
- high contrast
- generous whitespace
- asymmetric layouts where appropriate
- premium but personal
- technical but not "cyberpunk"
- expressive but not noisy
- minimal gradients
- minimal glassmorphism
- restrained animation

DO NOT create:

- generic SaaS dashboard aesthetics
- excessive neon
- excessive glow
- excessive rounded cards
- excessive gradients
- excessive glassmorphism
- a template-looking portfolio
- an AI-generated-looking website
- unnecessary 3D effects
- excessive animations

The website should feel like a real designer/developer intentionally created it.

==================================================
VISUAL IDENTITY
==================================================

Use a dark base.

Suggested direction:

Background:
#08090D / near-black

Surface:
slightly lighter dark surfaces

Primary text:
off-white

Secondary text:
muted gray

Accent:
choose ONE distinctive accent color.

Do not use many accent colors.

The exact palette can be refined during implementation as long as the result remains cohesive.

Typography should be modern and editorial.

Use a high-quality web font if appropriate.

Suggested font direction:

- Space Grotesk
- Inter
- Geist

Choose a combination that produces a strong visual hierarchy.

==================================================
CORE SITE STRUCTURE
==================================================

Create:

/
Home

/projects
Projects

/projects/[slug]
Project Detail

/about
About

/contact
Contact

/admin
Admin Dashboard

/admin/login
Admin Login

/admin/projects
Project Management

/admin/projects/new
Create Project

/admin/projects/[id]/edit
Edit Project

==================================================
HOME PAGE
==================================================

The homepage should feel visually impressive immediately.

Hero section:

Do NOT use:

"Full-Stack Developer"

Instead use a flexible identity.

Example direction:

BUILDING THINGS.
EXPLORING IDEAS.

Supporting copy:

A short personal introduction about enjoying technology, creating projects, and experimenting with ideas.

Do not copy the example literally if you can create better wording.

Hero should contain:

- strong headline
- short description
- primary CTA → Explore Work
- secondary CTA → About Me
- subtle visual element
- responsive layout

The hero must look excellent on mobile.

==================================================
HOME PAGE SECTIONS
==================================================

After the hero:

1. Introduction

A short personal introduction.

2. Featured Projects

Show 3–4 featured projects.

Each project card should include:

- image
- title
- category
- short description
- technologies
- link

3. Areas of Interest

Examples:

Web
Software
Networking
Design
Experiments

These should communicate exploration rather than claiming expertise.

4. Currently Exploring

A section showing things the owner is currently interested in.

5. About Preview

Short introduction with a link to /about.

6. Contact CTA

Strong but simple call-to-action.

==================================================
PROJECTS PAGE
==================================================

/projects

This is one of the most important pages.

Create a project gallery with a strong editorial layout.

Include category filtering.

Categories:

- All
- Web
- App
- Design
- Networking
- Experiment
- School
- Other

Categories must be data-driven where practical.

Do not require every category to have content.

Each project card supports:

- title
- slug
- description
- category
- technologies
- thumbnail
- featured
- published
- project date

Create a visually interesting grid.

Do NOT make every card identical if an editorial layout can improve the design.

However, maintain consistency and usability.

==================================================
PROJECT DETAIL PAGE
==================================================

/projects/[slug]

Create a case-study style project page.

Structure:

- back navigation
- project title
- category
- project date
- short description
- hero image
- overview
- technologies
- features
- image gallery
- external project URL
- repository URL
- additional notes
- related projects

Fields should be optional.

If a project has no gallery, do not render an empty gallery.

If there is no repository URL, hide the repository button.

If there is no live URL, hide the live project button.

Handle missing images gracefully.

==================================================
ABOUT PAGE
==================================================

/about

Do not create a traditional resume page.

Create a personal editorial page.

Sections:

- Introduction
- What I Like Building
- Areas I'm Exploring
- Technologies I Have Worked With
- Currently Exploring
- Personal approach to projects

Avoid unsupported claims.

Do not fabricate experience.

==================================================
CONTACT PAGE
==================================================

/contact

Create a simple contact page.

Include:

- short invitation
- email
- social links
- optional contact form

If implementing a contact form:

- validate input
- protect against abuse
- do not expose secrets
- show loading state
- show success state
- show error state

Do not require a backend email service unless necessary.

If no email service is configured, make the contact form architecture ready without pretending messages are actually being sent.

==================================================
NAVIGATION
==================================================

Desktop navigation:

- Logo / Name
- Work
- About
- Contact

Mobile navigation:

Create a proper mobile menu.

Requirements:

- accessible
- keyboard-friendly
- proper focus handling
- close on navigation
- no horizontal overflow
- smooth but restrained animation

Do not use a huge navigation bar.

==================================================
FOOTER
==================================================

Create a minimal footer containing:

- name
- short description
- navigation
- social links
- copyright

==================================================
CMS / ADMIN
==================================================

The portfolio must include a functional CMS.

Admin routes:

/admin/login
/admin
/admin/projects
/admin/projects/new
/admin/projects/[id]/edit

The CMS is for managing portfolio projects.

==================================================
SUPABASE DATABASE
==================================================

Create a Supabase database schema for projects.

Suggested project table:

projects

Fields:

id
title
slug
short_description
description
category
technologies
thumbnail_url
gallery
project_url
repository_url
featured
published
project_date
created_at
updated_at

Use appropriate PostgreSQL types.

Prefer:

technologies → text array or JSON where appropriate

gallery → JSON/text array where appropriate

Add useful constraints.

The slug must be unique.

created_at and updated_at should be handled safely.

==================================================
SUPABASE AUTH
==================================================

Use Supabase Auth for admin authentication.

Admin pages must NOT be publicly writable.

Unauthenticated users should be redirected to:

/admin/login

Do not implement fake client-side authentication.

Do not store passwords manually.

Do not create insecure authentication systems.

Use Supabase authentication correctly.

==================================================
DATABASE SECURITY
==================================================

Implement appropriate Row Level Security.

Public users:

- can read published projects

Authenticated admin:

- can create projects
- can update projects
- can delete projects

Unpublished projects must not be exposed publicly.

Do not expose service-role keys to the browser.

Never put secrets in:

NEXT_PUBLIC_*

Do not hard-code Supabase credentials.

Use environment variables.

==================================================
PROJECT MANAGEMENT
==================================================

Admin project list should show:

- title
- category
- published status
- featured status
- date
- edit action
- delete action

Admin must support:

CREATE

EDIT

DELETE

PUBLISH / UNPUBLISH

FEATURE / UNFEATURE

==================================================
PROJECT FORM
==================================================

Create a clean project editor.

Fields:

Title
Slug
Short Description
Description
Category
Technologies
Project Date
Thumbnail
Gallery
Project URL
Repository URL
Featured
Published

Validation:

- title required
- slug required
- category required
- short description required
- invalid URLs rejected
- sensible text length limits
- duplicate slug handled properly

Show useful validation errors.

Do not rely only on HTML validation.

==================================================
IMAGE STORAGE
==================================================

Use Supabase Storage if practical.

Create a portfolio image bucket.

Support:

- project thumbnail
- project gallery

Validate uploaded files.

Do not blindly accept arbitrary file types.

Handle:

- upload
- preview
- replacement
- deletion where appropriate
- failed upload

Images should be optimized for the public site.

==================================================
PUBLIC / ADMIN SEPARATION
==================================================

Public site must never expose admin functionality.

Admin API/database mutations must require authentication.

Do not rely on hiding buttons for security.

Security must exist at the authorization/database level.

==================================================
RESPONSIVE DESIGN
==================================================

Mobile-first.

Test mentally and structurally for:

320px
360px
390px
430px
768px
1024px
1280px
1440px+

Pay special attention to:

- hero typography
- navigation
- project grid
- project detail pages
- images
- buttons
- forms
- admin dashboard
- tables/lists

There must be NO accidental horizontal scrolling.

==================================================
ACCESSIBILITY
==================================================

Implement:

- semantic HTML
- correct heading hierarchy
- accessible navigation
- accessible buttons
- visible focus states
- alt text
- keyboard navigation
- sufficient contrast
- labels for form controls
- appropriate aria attributes

Do not use divs as buttons when a button element is appropriate.

==================================================
ANIMATION
==================================================

Use subtle animation.

Good examples:

- fade/slide entrance
- hover transitions
- image scale on hover
- navigation transitions

Avoid:

- excessive motion
- constant floating elements
- distracting effects
- animation that blocks interaction

Respect prefers-reduced-motion.

==================================================
SEO
==================================================

Implement:

- metadata
- title
- description
- Open Graph metadata
- Twitter/X card metadata if appropriate
- sitemap
- robots configuration
- semantic HTML

Project pages should have dynamic metadata based on project data.

==================================================
PERFORMANCE
==================================================

Optimize for performance.

Use:

- Next.js image optimization
- server components where appropriate
- client components only when needed
- lazy loading where appropriate
- minimal dependencies

Avoid unnecessary:

- client-side state
- JavaScript
- API requests
- libraries

Do not build an SPA unnecessarily.

==================================================
ERROR / LOADING STATES
==================================================

Implement appropriate:

- loading states
- empty states
- error states
- 404 page

Projects page should gracefully handle:

- no projects
- no featured projects
- failed database request

Admin should gracefully handle:

- unauthorized access
- failed requests
- failed uploads
- invalid forms

==================================================
CODE ARCHITECTURE
==================================================

Create a clean project structure.

Use reusable components.

Suggested conceptual structure:

src/
  app/
  components/
  lib/
  types/
  styles/

Adapt this to Next.js conventions.

Separate:

- UI components
- database logic
- authentication logic
- validation
- utilities

Do not put everything into page components.

Avoid giant components.

Avoid unnecessary abstraction.

==================================================
ENVIRONMENT VARIABLES
==================================================

Create:

.env.example

Include required variables such as:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Use appropriate Supabase environment variables for server-side functionality if needed.

Never create real secrets.

Never commit .env.

Create a proper .gitignore.

==================================================
PROJECT FOLDER STRUCTURE
==================================================

Build the project using a clean, scalable, feature-oriented structure.

Do NOT put all logic inside page.tsx files.

Use the following structure as the baseline:

/
├── public/
│   ├── images/
│   │   ├── projects/
│   │   └── placeholders/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── projects/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── hero.tsx
│   │   │   ├── intro.tsx
│   │   │   ├── featured-projects.tsx
│   │   │   ├── interests.tsx
│   │   │   └── contact-cta.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-grid.tsx
│   │   │   ├── project-filter.tsx
│   │   │   ├── project-gallery.tsx
│   │   │   └── related-projects.tsx
│   │   │
│   │   ├── about/
│   │   │   └── ...
│   │   │
│   │   ├── contact/
│   │   │   └── ...
│   │   │
│   │   └── admin/
│   │       ├── admin-sidebar.tsx
│   │       ├── admin-header.tsx
│   │       ├── project-table.tsx
│   │       ├── project-form.tsx
│   │       ├── image-uploader.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── db/
│   │   │   └── projects.ts
│   │   │
│   │   ├── auth/
│   │   │   └── ...
│   │   │
│   │   ├── storage/
│   │   │   └── ...
│   │   │
│   │   ├── validation/
│   │   │   ├── project.ts
│   │   │   └── contact.ts
│   │   │
│   │   └── utils/
│   │       └── ...
│   │
│   ├── types/
│   │   ├── project.ts
│   │   ├── category.ts
│   │   └── database.ts
│   │
│   ├── config/
│   │   └── site.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/
│   │   └── ...
│   ├── seed.sql
│   └── config.toml
│
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── postcss.config.mjs
└── README.md


ARCHITECTURE RULES
==================

Follow these rules when deciding where code belongs:

1. app/
   - Routing
   - Page-level composition
   - Layouts
   - Route handlers
   - Metadata

2. components/
   - Reusable UI and feature components
   - Components should not contain unnecessary database logic

3. lib/
   - Server-side utilities
   - Database access
   - Supabase clients
   - Authentication helpers
   - Storage helpers
   - Validation
   - General utilities

4. types/
   - Shared TypeScript types
   - Database-related types

5. config/
   - Site-wide configuration
   - Navigation configuration
   - Social links
   - Portfolio metadata

6. styles/
   - Global styles
   - Design tokens
   - Global CSS

7. supabase/
   - Database migrations
   - Seed data
   - Supabase configuration

IMPORTANT:
Do not create unnecessary folders merely to match this example.

The structure above is a baseline.

If a simpler structure is technically better for a specific part of the application, use good engineering judgment while preserving the overall separation of concerns.

Do NOT create:
- giant files
- duplicated components
- random utility folders
- unnecessary abstraction layers
- deeply nested folders without purpose

Keep files focused and reasonably sized.

A page should primarily compose components and should not contain large amounts of business logic.

Database queries should not be scattered throughout UI components.

Authentication logic should not be duplicated across pages.

Validation schemas should be centralized.

==================================================
NAMING CONVENTIONS
==================================================

Use consistent naming:

- React components: PascalCase exports
- Component filenames: kebab-case
- Utility filenames: kebab-case
- Types: descriptive names
- Functions: camelCase
- Database tables: snake_case
- Environment variables: UPPER_SNAKE_CASE

Avoid ambiguous names such as:

utils.ts
helpers.ts
misc.ts
common.ts

unless the file genuinely has a clear, cohesive responsibility.

==================================================
README
==================================================

Create a complete README.md explaining:

- project overview
- technology stack
- local setup
- environment variables
- Supabase setup
- database migration/setup
- storage setup
- authentication setup
- development commands
- production build
- deployment to Vercel

A new developer should be able to understand how to run the project.

==================================================
SEED / DEMO CONTENT
==================================================

Create several realistic demo projects so the portfolio does not look empty.

IMPORTANT:

These must clearly be DEMO / PLACEHOLDER portfolio entries.

Do not invent real employment or achievements.

Example project themes:

- Web Application
- Multiplayer Experiment
- Networking Project
- Creative Website
- API Experiment

Make the demo content easy to replace or delete.

==================================================
IMPLEMENTATION PROCESS
==================================================

You have full responsibility for implementing the project.

Work in logical phases internally:

PHASE 1
Initialize project

PHASE 2
Create design system

PHASE 3
Build public layout

PHASE 4
Build homepage

PHASE 5
Build projects system

PHASE 6
Build project detail pages

PHASE 7
Build about/contact

PHASE 8
Configure Supabase

PHASE 9
Create database schema

PHASE 10
Create authentication

PHASE 11
Build admin dashboard

PHASE 12
Build project CRUD

PHASE 13
Implement image storage

PHASE 14
Connect public pages to CMS

PHASE 15
Accessibility / SEO / performance

PHASE 16
Final validation

Do not stop after creating only the frontend.

The final result must be a functioning full-stack portfolio with a working CMS.

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

1. Do not ask me to manually create files.

2. Do not ask me to manually write code.

3. Create all required files yourself.

4. Do not leave obvious TODO placeholders for core functionality.

5. Do not fake functionality.

6. Do not create fake authentication.

7. Do not expose secrets.

8. Do not over-engineer.

9. Do not install unnecessary dependencies.

10. Do not use insecure shortcuts.

11. Keep the architecture understandable.

12. Make the UI polished.

13. Make mobile experience excellent.

14. Do not copy the reference design literally.

15. Do not lock the portfolio into a specific career title.

16. Do not invent personal achievements.

17. Keep demo content clearly replaceable.

==================================================
VALIDATION
==================================================

When implementation is complete, run all appropriate checks.

At minimum:

- npm install
- lint
- typecheck if configured
- production build
- tests if configured

Fix errors instead of merely reporting them.

Check for:

- TypeScript errors
- lint errors
- broken imports
- broken routes
- broken images
- database errors
- authentication errors
- authorization problems
- hydration errors
- console errors
- responsive issues
- horizontal overflow

==================================================
FINAL QUALITY CHECK
==================================================

Before declaring the project complete, verify:

PUBLIC:

[ ] Homepage works
[ ] Navigation works
[ ] Mobile navigation works
[ ] Projects page works
[ ] Category filtering works
[ ] Project detail works
[ ] About works
[ ] Contact works
[ ] 404 works
[ ] SEO metadata exists
[ ] Responsive design works

CMS:

[ ] Admin login works
[ ] Unauthorized admin access is blocked
[ ] Dashboard works
[ ] Project creation works
[ ] Project editing works
[ ] Project deletion works
[ ] Publish/unpublish works
[ ] Featured/unfeatured works
[ ] Image upload works
[ ] Validation works
[ ] Database security is configured

QUALITY:

[ ] No obvious TypeScript errors
[ ] No lint errors
[ ] Production build succeeds
[ ] No exposed secrets
[ ] No unnecessary dependencies
[ ] No horizontal overflow
[ ] Accessible navigation
[ ] Good mobile experience
[ ] Good desktop experience
[ ] README is complete
[ ] .env.example exists

==================================================
FINAL RESPONSE
==================================================

When everything is complete, provide a concise report containing:

1. What was built
2. Technology stack
3. Main routes
4. CMS capabilities
5. Database structure
6. Authentication approach
7. Storage approach
8. Environment variables required
9. Validation results
10. Any remaining manual setup required

IMPORTANT:

Do not stop at planning.

START FROM THE EMPTY DIRECTORY AND ACTUALLY BUILD THE COMPLETE PROJECT.

==================================================
EXECUTION PRIORITY
==================================================

The user has provided the complete project specification.

Do not spend excessive time explaining the plan.

Use the specification as the source of truth and begin implementation immediately.

You may internally plan the architecture, but do not stop to present the plan to the user before implementation.

Work autonomously through the implementation phases.

If a reasonable technical decision can be made from the specification, make that decision yourself.

Only ask the user a question when the missing information is genuinely blocking implementation.

==================================================
WHEN SOMETHING CANNOT BE FULLY CONFIGURED
==================================================

Some external services may require credentials or dashboard configuration that cannot be performed from the local filesystem.

For example:

- Supabase project credentials
- Supabase Auth configuration
- Supabase Storage configuration
- Vercel deployment configuration

In these cases:

1. Implement everything that can be implemented locally.
2. Create migrations and configuration files.
3. Create .env.example.
4. Make the application fail gracefully when configuration is missing.
5. Document the exact remaining setup in README.md.
6. Do not fake successful connections.
7. Do not invent credentials.

Do not stop the entire implementation just because external credentials are unavailable.

==================================================
DO NOT OVER-IMPLEMENT
==================================================

The specification is comprehensive, but not every listed feature needs a large abstraction.

Prefer the smallest clean implementation that satisfies the requirement.

Do not create a custom framework.

Do not create unnecessary design-system infrastructure.

Do not create unnecessary API layers when Server Components or Server Actions are appropriate.

Do not add libraries for functionality that Next.js, React, TypeScript, Tailwind, or Supabase already provide.

==================================================
IMPLEMENTATION PRIORITY
==================================================

When time or token budget becomes constrained, prioritize in this order:

1. Application bootstrapping
2. Core architecture
3. Public portfolio pages
4. Project data model
5. Supabase integration
6. Authentication
7. Admin CRUD
8. Image storage
9. Responsive UI
10. Accessibility
11. SEO
12. Polish

Never sacrifice security or data integrity merely to complete visual polish.

==================================================
DEFINITION OF DONE
==================================================

Do not declare the project complete merely because files were created.

The project is complete only when:

- the application can build successfully
- the main routes exist
- the public portfolio is functional
- project data architecture exists
- admin authentication architecture exists
- project CRUD is implemented
- authorization is enforced
- Supabase migrations exist
- environment configuration is documented
- the README explains remaining external setup
- obvious errors have been fixed

If external credentials prevent runtime verification, clearly distinguish:

IMPLEMENTED

from

REQUIRES EXTERNAL CONFIGURATION

Do not claim external functionality was verified when it was not.