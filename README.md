# Personal Digital Portfolio

A dark, editorial portfolio and CMS built with Next.js (App Router), TypeScript,
Tailwind CSS and Supabase.

The site is deliberately **not** tied to a job title. The owner is still
exploring a direction, so the portfolio stays general: it holds web projects,
applications, APIs, networking tools, design work, experiments and coursework
side by side rather than filtering everything through a single specialisation.

There are two halves:

| | |
| --- | --- |
| **Public site** | `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact` |
| **CMS** | `/admin/login`, `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit`, `/admin/preview/project/[id]` |

The CMS is a working, authenticated CRUD interface backed by Supabase Postgres,
Supabase Auth and Supabase Storage. It is not a mock.

---

## Table of contents

- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
  - [1. Create the project](#1-create-the-project)
  - [2. Run the migrations](#2-run-the-migrations)
  - [3. Create the first admin account](#3-create-the-first-admin-account)
  - [4. Verify the storage bucket](#4-verify-the-storage-bucket)
  - [5. Load the demo content](#5-load-the-demo-content)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Database schema](#database-schema)
- [Security model](#security-model)
- [Content model](#content-model)
- [Commands](#commands)
- [Deployment to Vercel](#deployment-to-vercel)
- [Verification checklist](#verification-checklist)
- [Known limitations](#known-limitations)
- [Replacing the demo content](#replacing-the-demo-content)

---

## Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (`portfolio-images` bucket) |
| Validation | Zod |
| Icons | `lucide-react` |
| Lint | ESLint (`next/core-web-vitals`) |
| Hosting | Vercel |

**Deliberately not installed:** no date library (`Intl` covers formatting), no
typography plugin (a small `.prose-block` utility replaces it), no state
management library, no ORM, no component library, no animation library. CSS
transitions and the Web Platform APIs cover all of it.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env.local      # Windows: copy .env.example .env.local
#    then fill in the two Supabase values (see below)

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

The site **boots and renders without Supabase configured** — public pages show
their empty states and `/admin` explains what is missing. This is intentional, so
you can work on the design before wiring up a backend.

Optional: run the whole stack locally with the Supabase CLI.

```bash
npx supabase start          # requires Docker
npm run db:reset            # applies migrations + seed to the local database
```

Then copy the local keys printed by `supabase start` into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
```

---

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Project URL, e.g. `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Anon/publishable key. Safe to expose; RLS protects the data. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for OG tags, canonical URLs and `sitemap.xml`. Defaults to `https://kevnportfolio.dev`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Address shown in the hero, footer and contact page. Defaults to `hello@example.com`. |
| `CONTACT_WEBHOOK_URL` | Optional | Server-side endpoint the contact form forwards to. **Server-only.** |

### On secrets

- The **service-role key is not used and not required.** Every admin request runs
  with the signed-in user's own JWT, and authorisation is enforced by Row Level
  Security plus the `public.admins` allowlist. Nothing bypasses RLS.
- `CONTACT_WEBHOOK_URL` is read only inside the route handler and is never
  prefixed with `NEXT_PUBLIC_`, so it cannot reach the browser.
- Rule of thumb: anything named `NEXT_PUBLIC_*` is in the client bundle. Do not
  put a secret behind that prefix.

### Contact form behaviour without a webhook

The form is fully wired: client validation, server validation, honeypot and rate
limiting. But it has no mail SDK bundled, so it **does not pretend to deliver**:

- `CONTACT_WEBHOOK_URL` set → the submission is forwarded server-side and the
  visitor sees a success state.
- Not set → the API responds `delivered: false` and the form tells the visitor to
  email you directly instead.

Point `CONTACT_WEBHOOK_URL` at a serverless function, a Zapier/Make hook or a
Discord webhook to enable real delivery. No key is ever compiled into the bundle.

The contact page copy follows the same switch: with a webhook configured it says
the form reaches you directly, and without one it says email is the reliable
channel and that the form is not yet connected. `/contact` is therefore
`force-dynamic` — a statically prerendered page would freeze that decision at
build time and start making a promise it can no longer keep once the variable is
added.

---

## Supabase setup

### 1. Create the project

1. Create a project at <https://supabase.com/dashboard>.
2. Copy **Project Settings → API → Project URL** and **anon public** key.
3. Save both into `.env.local`.

### 2. Run the migrations

**Hosted project** — in the dashboard, open **SQL Editor**, paste each file from
`supabase/migrations/` in filename order, and run them:

1. `supabase/migrations/20240101000000_initial_schema.sql`
2. `supabase/migrations/20240102000000_harden_security.sql`
3. `supabase/migrations/20240103000000_add_experience_certificates.sql`

The second and third files are idempotent and exist so that anyone who applied an
earlier version of the schema still ends up with the current tables, policies and
bucket. The third adds `experiences` and `certificates` for the timeline and
credential pages; the site renders those routes as empty states until you run it.

> **Hosted project status:** all three migrations have been applied to
> `saieldbjqwagyzkienrt`. `experiences` and `certificates` exist and are empty, so
> `/experience`, `/certificates` and the homepage preview currently show their
> empty states. That is deliberate — the demo rows for those two tables are in
> `supabase/seed.sql` but have not been loaded, because whether to ship placeholder
> timeline entries is a content decision. Run the seed (or just the
> experience/certificate inserts) when you want to see the populated layout.

**Local project** — `npm run db:reset` applies migrations and the seed.

### 3. Create the first admin account

1. **Authentication → Users → Add user → Create new user**. Set an email and
   password, and untick *Auto Confirm User* (or confirm it — either works once the
   row below exists).
2. Copy the user's **UUID**.
3. In **SQL Editor**, run:

```sql
INSERT INTO public.admins (user_id, note)
VALUES ('PASTE_THE_USER_UUID_HERE', 'owner');
```

That single insert is the entire authorisation model. A signed-in Supabase Auth
user is **not** automatically an admin.

### 4. Verify the storage bucket

The first migration creates a **public-read** bucket called `portfolio-images`
with a 2 MB limit and a MIME allowlist of `image/jpeg`, `image/png`, `image/webp`,
`image/gif`. Confirm under **Storage → Buckets** that it exists.

Application-layer validation runs in addition to the bucket policy: the
extension is derived from the validated MIME type (never the filename), the
magic number is checked, and only these folders are writable:

- `projects/thumbnails`
- `projects/gallery`
- `experiences/logos`
- `certificates/images`

The bucket is created by the first migration and re-asserted by the third, so
running all three in order is safe.

### 5. Load the demo content

`supabase/seed.sql` inserts **seven clearly-labelled placeholder projects, three
placeholder experience entries and three placeholder certificates**, so a fresh
install does not look empty. Every row is prefixed `Demo ·` and uses a `Sample …`
organization or issuer; the certificates deliberately ship without credential
URLs. They are easy to remove — see
[Replacing the demo content](#replacing-the-demo-content).

To load them on a hosted project, paste the seed into **SQL Editor** and run it.

---

## Project structure

```
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── og-image.png            # social card
│       ├── placeholders/project.png
│       └── projects/*.png          # demo thumbnails (generated)
├── scripts/
│   └── generate-assets.ps1         # regenerates the images above
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240102000000_harden_security.sql
│   │   └── 20240103000000_add_experience_certificates.sql
│   └── seed.sql
└── src/
    ├── middleware.ts               # session refresh + admin redirect
    ├── app/
    │   ├── layout.tsx              # fonts, metadata, <html>/<body>
    │   ├── (public)/               # navbar + footer live here
    │   │   ├── layout.tsx
    │   │   ├── page.tsx            # /
    │   │   ├── not-found.tsx       # keeps the public shell
    │   │   ├── error.tsx
    │   │   ├── projects/
    │   │   │   ├── page.tsx
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx
    │   │   │       └── not-found.tsx  # project-specific 404
    │   │   ├── experience/page.tsx    # timeline
    │   │   ├── certificates/page.tsx  # grid + lightbox
    │   │   ├── about/page.tsx
    │   │   └── contact/page.tsx
    │   ├── admin/
    │   │   ├── login/page.tsx      # outside the guard, on purpose
    │   │   └── (protected)/        # guard + shell, redirect-safe
    │   │       ├── layout.tsx
    │   │       ├── loading.tsx
    │   │       ├── page.tsx
    │   │       ├── settings/page.tsx
    │   │       ├── projects/
    │   │       │   ├── page.tsx
    │   │       │   ├── new/page.tsx
    │   │       │   └── [id]/edit/page.tsx
    │   │       ├── experience/     # same three routes
    │   │       ├── certificates/   # same three routes
    │   │       └── preview/project/[id]/page.tsx   # draft case study, session only
    │   ├── api/
    │   │   ├── admin/
    │   │   │   ├── projects/       # GET/POST, GET/PATCH/DELETE, stats
    │   │   │   ├── experience/      # + /[id], /reorder
    │   │   │   └── certificates/    # + /[id], /reorder
    │   │   ├── auth/signin, signout
    │   │   ├── contact/
    │   │   └── upload/
    │   ├── not-found.tsx           # root, self-contained (no shell)
    │   ├── error.tsx
    │   └── robots.ts, sitemap.ts
    ├── components/
    │   ├── ui/                     # button, button-link, arrow-link, input,
    │   │                           # select, modal, field, empty-state, …
    │   ├── layout/                 # navbar, mobile-menu, footer, skip-link
    │   ├── home/                   # hero, intro, featured-projects, interests,
    │   │                           # currently-exploring, about-preview,
    │   │                           # credentials-preview, contact-cta
    │   ├── projects/               # project-card, project-grid, project-filter,
    │   │                           # project-thumbnail, project-detail (shared with
    │   │                           # the admin draft preview), related-projects, gallery
    │   ├── experience/             # experience-entry
    │   ├── certificates/           # certificate-card (+ lightbox)
    │   ├── about/                  # background-summary
    │   ├── contact/                # contact-form
    │   └── admin/                  # sidebar, header, navigation, table, form,
    │                               # image-uploader, login-form, row-action
    ├── config/site.ts              # all site content, nav, categories
    ├── lib/
    │   ├── api/admin-guard.ts      # auth guard + validation helpers
    │   ├── auth/                   # getUser, signIn, signOut
    │   ├── db/                     # projects.ts, experience.ts, certificates.ts
    │   ├── hooks/                  # use-focus-trap, use-row-actions,
    │   │                           # use-unsaved-changes
    │   ├── storage/                # images.ts (server) + image-types.ts (client-safe)
    │   ├── supabase/               # server, public, client, config
    │   ├── utils/                  # helpers, rate-limit
    │   └── validation/             # fields.ts, project.ts, experience.ts,
    │                               # certificate.ts, contact.ts
    ├── styles/globals.css          # design tokens + component classes
    └── types/                      # database, project, category, experience,
                                    # certificate
```

**Why two Supabase clients?** Public reads use a cookieless anonymous client
(`lib/supabase/public.ts`) so public pages stay statically cacheable and no user
context can leak into a shared cache. Admin reads use the request-scoped session
client (`lib/supabase/server.ts`). RLS makes the anonymous path safe: the `anon`
role can only ever see `published = true`.

**Why is `/admin/login` outside `(protected)`?** The admin guard lives in the
`(protected)` group layout. If the login page sat underneath it, an
unauthenticated request would be redirected to `/admin/login`, whose own layout
would redirect again — an infinite loop.

**Why is there no root `loading.tsx`?** Two Next.js behaviours make a Suspense
boundary above the project detail route actively harmful:

1. A route with `revalidate` serves a `notFound()` through its static cache, so
   the response is **HTTP 200** containing 404 markup.
2. A `loading.tsx` starts streaming immediately, which locks the status to 200
   before `notFound()` is thrown.

Both let a search engine index a non-existent project URL as a real page. The
archive's skeleton is therefore an in-page `<Suspense>` inside
`projects/page.tsx`, which is scoped to that page only and does not create a
route-level boundary for `projects/[slug]`. The CMS keeps a normal
`loading.tsx`, because no admin route calls `notFound()`.

`projects/[slug]` declares no route segment config at all: a dynamic segment with
no `generateStaticParams` is rendered on demand, which is what the comment in
that file asks for.

**Where does `notFound()` resolve?** There are three boundaries, and the
difference is deliberate:

| File | Used for | Chrome |
| --- | --- | --- |
| `app/not-found.tsx` | Unmatched routes anywhere, including `/admin/*` | None — self-contained, so it cannot depend on a layout that may itself be broken |
| `app/(public)/not-found.tsx` | 404s raised inside public pages | Full navbar and footer |
| `app/(public)/projects/[slug]/not-found.tsx` | Unknown project slug | Full shell, plus project-specific copy and a "Browse projects" CTA |

**`notFound()` is never called from `generateMetadata`.** The metadata resolver
runs outside the render tree the not-found boundary wraps, so a throw there
unwinds before the boundary resolves and the visitor gets a bare 404 with an
empty `<body>`. Metadata resolution therefore degrades quietly to
`robots: noindex` and the page body stays the single authority on the status.

Verified: `/projects/does-not-exist` → **404** with the project-specific page in
the response.

---

## Design system

Dark editorial direction: near-black base, hairline borders, square geometry, one
accent, and typography that does the heavy lifting. The reference is a print
index or a magazine spread, not a dashboard.

All tokens are CSS custom properties in `src/styles/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `rgb(8 9 12)` | Page background |
| `--surface` | `rgb(17 18 24)` | Panels |
| `--surface-elevated` | `rgb(26 27 35)` | Inputs, raised surfaces |
| `--border-subtle` | `rgb(28 29 37)` | Hairlines |
| `--border` | `rgb(46 47 57)` | Emphasis borders |
| `--text-primary` | `rgb(243 242 238)` | Headings (warm off-white) |
| `--text-secondary` | `rgb(154 153 149)` | Body |
| `--text-muted` | `rgb(108 107 104)` | Meta |
| `--accent` | `rgb(214 242 106)` | The single accent |
| `--accent-contrast` | `rgb(8 9 12)` | Text on accent |
| `--radius` | `0px` | Everything stays square |

**Type scale is fluid, not stepped.** A stepped scale only has the correct size at
the breakpoints it declares, so between 768px and 1280px the display type either
jumps or sits too small. `clamp()` interpolates continuously:

| Token | Value |
| --- | --- |
| `--text-display` | `clamp(2.75rem, 10.5vw, 8.5rem)` |
| `--text-h1` | `clamp(2.25rem, 6.4vw, 5.25rem)` |
| `--text-h2` | `clamp(1.75rem, 3.7vw, 3.125rem)` |
| `--text-h3` | `clamp(1.375rem, 2.2vw, 1.875rem)` |
| `--text-h4` | `clamp(1.125rem, 1.4vw, 1.375rem)` |
| `--text-lead` | `clamp(1.0625rem, 1.35vw, 1.375rem)` |
| `--text-meta` | `0.6875rem` |

The hero runs full container width, so the longest display line
("Building things.", 16 characters) lands at roughly 8.1em and fits on one line
from about 640px up. The `clamp()` floor is 2.75rem because at 320px anything
larger makes the longest single word ("Exploring") exceed the 280px content box.

**Spacing rhythm is a sequence, not a value.** `--rhythm-xl`, `--rhythm-lg`,
`--rhythm-md` and `--rhythm-sm` are composed large → medium → small → large.
Repeating one vertical padding everywhere is the clearest "template" signal there
is; alternating the rhythm is what gives the page pacing.

Typography: **Space Grotesk** for display, **Inter** for body, system mono for
labels and metadata.

Reusable classes (56 in total, all in `@layer components`):

- Type: `display-1`, `heading-1`…`heading-4`, `body`, `body-lg`, `body-sm`,
  `eyebrow`, `caption`, `meta-label`, `prose-block`
- Layout: `container-custom`, `section`, `section-sm`, `rhythm-*`, `rule`,
  `rule-top`, `index-marker`, `page-depth`
- Surfaces: `card`, `card-hover`, `image-zoom`, `badge-*`
- Forms: `input`, `textarea`, `label`, `field-hint`, `field-error`
- Motion: `animate-fade-in`, `animate-scale-in`, `animate-slide-up`,
  `animate-slide-down`, `stagger-1`…`stagger-6`, `arrow-shift`,
  `transition-quick`, `transition-smooth`
- Helpers: `link`, `link-underline`, `text-balance`, `text-pretty`,
  `scrollbar-hide`

Design constraints observed:

- **One accent colour.** `success` / `warning` / `error` exist only for state,
  never decoration. Category badges are all neutral, not a rainbow.
- **Square corners everywhere** (`--radius: 0px`) — the editorial contrast to the
  rounded card look of a typical template. Buttons are square, not pills.
- **Accent discipline:** the accent is an annotation colour. It marks the
  *current* thing (active nav item, active filter, the one live status) and
  nothing else.
- **Asymmetry on purpose:** the project grid alternates 7/5 column spans, the
  hero pairs a full-bleed masthead with a narrow index rail, and the About
  preview inverts to a lighter band. Nothing is centred by default.
- **Restrained motion:** entrance fades and short slides only, no floating
  loops. A single easing curve and two durations. All of it collapses under
  `prefers-reduced-motion`.
- **No glassmorphism.** Panels are solid fills separated by hairlines.
- **Two motion strengths, not one:** a filled accent button and an `ArrowLink`
  (a label with a rule that grows underneath) so a page with two equal-priority
  actions does not turn into two competing boxes.

---

## Database schema

`public.projects`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `title` | `text` | 1–100 chars |
| `slug` | `text` | Unique, `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤100 |
| `short_description` | `text` | 1–300 chars |
| `description` | `text` | nullable, ≤10 000 chars |
| `category` | `text` | CHECK: `web`, `app`, `design`, `networking`, `experiment`, `school`, `other` |
| `technologies` | `text[]` | default `{}`, ≤20 entries |
| `thumbnail_url` | `text` | nullable |
| `gallery` | `text[]` | default `{}`, ≤12 entries |
| `project_url` | `text` | nullable |
| `repository_url` | `text` | nullable |
| `featured` | `boolean` | default `false` |
| `published` | `boolean` | default `false` |
| `project_date` | `date` | nullable, **month precision** (CHECK: day is always `01`) |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, maintained by trigger |

`public.admins`

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | PK, FK → `auth.users(id)` on delete cascade |
| `created_at` | `timestamptz` | default `now()` |
| `note` | `text` | optional label, e.g. `owner` |

`public.experiences`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `title` | `text` | 1–120 chars |
| `organization` | `text` | 1–120 chars |
| `location` | `text` | nullable, ≤120 |
| `employment_type` | `text` | CHECK: `internship`, `part_time`, `freelance`, `organization`, `school_project`, `volunteer`, `other` |
| `start_date` | `date` | **not null**, month precision (CHECK: day is always `01`) |
| `end_date` | `date` | nullable, month precision |
| `current` | `boolean` | default `false`; CHECK forces `end_date IS NULL` while `true` |
| `description` | `text` | nullable, ≤2000 chars |
| `responsibilities` | `text[]` | default `{}`, ≤20 entries, each ≤300 chars |
| `technologies` | `text[]` | default `{}`, ≤20 entries, each ≤40 chars |
| `organization_logo_url` | `text` | nullable |
| `project_url` | `text` | nullable |
| `sort_order` | `integer` | default `0`, **higher first** — set by the reorder route |
| `published` | `boolean` | default `false` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, maintained by trigger |

`public.certificates`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `title` | `text` | 1–120 chars |
| `issuer` | `text` | 1–120 chars |
| `issue_date` | `date` | **not null**, month precision |
| `expiration_date` | `date` | nullable, month precision; CHECK ≥ `issue_date` |
| `credential_id` | `text` | nullable, ≤120 |
| `credential_url` | `text` | nullable |
| `certificate_image_url` | `text` | nullable — omitted cards fall back to text only |
| `description` | `text` | nullable, ≤1000 chars |
| `skills` | `text[]` | default `{}`, ≤20 entries, each ≤40 chars |
| `sort_order` | `integer` | default `0`, **higher first** |
| `published` | `boolean` | default `false` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, maintained by trigger |

`public.is_admin()` — `SECURITY DEFINER`, `STABLE`, pinned `search_path`. Returns
whether `auth.uid()` is in `public.admins`. `SECURITY DEFINER` is required so the
function can read the table it is checking without hitting its own RLS policy.

Indexes cover category, published, featured, `project_date`, `created_at`, plus a
partial index on `(project_date, created_at) WHERE published = true` for the
public archive query. `experiences` and `certificates` each get a `(published,
sort_order, …)` public feed index plus partial admin indexes.

> `technologies` and `gallery` are `text[]`, not JSON. They are only ever read as
> whole arrays, and `text[]` gives real column validation and GIN indexing for
> free.

---

## Security model

| Layer | Mechanism |
| --- | --- |
| Hidden UI | Not treated as a control. |
| Route guard | `getUser()` in `(protected)/layout.tsx` → redirect to `/admin/login`. |
| Middleware | Refreshes the session cookie; early-redirects unauthenticated `/admin` requests. UX only. |
| Route handlers | Every `/api/admin/*` and `/api/upload` call checks configuration → authentication → validation before touching the database. |
| Database | RLS on `projects`, `experiences`, `certificates`, `admins` and `storage.objects`, gated on `public.is_admin()`. |
| Input | Zod on both client and server; length caps; URL validation rejecting `javascript:` and `data:`. |
| Uploads | MIME allowlist, magic-number check, extension derived from the MIME type, folder allowlist, 2 MB cap, private bucket write. |

Concretely: **an authenticated Supabase user who is not in `public.admins` cannot
read drafts, and cannot insert, update or delete anything** — enforced by the
database, not by the interface.

Validation specifics:

- `slug` must be lowercase kebab-case; duplicates return **409** with a
  per-field message.
- URLs must be `http(s)`, except image fields which also accept root-relative
  paths (`/images/…`) for bundled assets. A protocol-relative `//host` value is
  rejected too, because it resolves to a different origin.
- The project date must be `YYYY-MM`. Experience and certificate dates use the
  same `YYYY-MM` month input and are stored as the first of the month.
- Each form has exactly one schema, shared by the editor and both API routes, so
  they cannot drift: `projectFormSchema`, `experienceFormSchema`,
  `certificateFormSchema`.
- `current = true` clears `end_date` in the same statement, so the
  `current ⇒ end_date IS NULL` CHECK can never reject a toggle as a bare 23514.

---

## Content model

The CMS manages three independent content types. Each is a plain database row
with the same shape: `published` gates visibility, `sort_order` pins manual
position, and the type owns its own optional fields.

| Type | Public route | Admin routes |
| --- | --- | --- |
| Project | `/projects`, `/projects/[slug]` | `/admin/projects`, `/new`, `/[id]/edit`, `/admin/preview/project/[id]` |
| Experience | `/experience` | `/admin/experience`, `/new`, `/[id]/edit` |
| Certificate | `/certificates` | `/admin/certificates`, `/new`, `/[id]/edit` |

Publishing in the CMS makes a record appear publicly within 60 seconds, with no
redeploy. `/experience` and `/certificates` are ISR at `revalidate = 60`; the
homepage and About page previews read the same tables.

**Draft preview.** `/projects/[slug]` filters on `published = true`, so before
publishing there was no way to see the page a project would produce: the only
options were to publish and hope, or to read the row in a database console. Neither
is a review step. `/admin/preview/project/[id]` renders the real case-study layout
from the saved row, drafts included, behind the admin session, with a banner saying
which state it is in.

It works because the case-study body lives in one component,
`src/components/projects/project-detail.tsx`, shared by both routes rather than
copied into the preview. A preview assembled by copying the public page would
drift from it silently — still rendering a plausible older design, so the mistake
would read as "the preview looks fine" right up until publish.

Two deliberate details:

- **The preview reads through `getProjectById`, the public route through
  `getProjectBySlug`.** Only the first returns drafts. That asymmetry is the whole
  feature, and it lives in a query builder rather than a permission check, so
  nothing at runtime stops a later edit from tidying it away. `tests/draft-preview.unit.ts`
  is the tripwire.
- **There is no preview button in the editor.** The preview reads the database, not
  the form, so a button beside an open form would show the previous title directly
  above the one being typed — confidently wrong, and more confusing than not
  offering one. The link is on the projects table instead, where nothing is
  half-edited.

The route is `force-dynamic` for the same reason the public one is, and more
sharply: caching it would cache the draft, so saving a fix and reopening the
preview would show the pre-fix page. A preview that can be stale is worse than no
preview, because it looks like an answer.

**Unsaved changes.** All three editors hold their state in React and write on
submit, so anything that unmounts them loses the edit — and because they are not
`<form method="post">`, the browser offers no unsaved-work protection of its own.
`useUnsavedChanges` (`src/lib/hooks/use-unsaved-changes.ts`) compares the form
against the row it opened with and, while they differ, installs a `beforeunload`
handler and a capture-phase click listener on `document`.

The click listener is not redundant with `beforeunload`. The admin's own navigation
is client-side, and a client-side transition never fires `beforeunload`, so without
it the guard would cover leaving the site but not leaving the page — which is the
common case, since "All projects" is one tap away. A create form passes `null` as
its baseline and is never guarded: nothing has been written yet, so nothing is lost.

Known gaps, deliberately not covered: browser back/forward within the session is a
`popstate` and would need a sentinel history entry that fights the App Router; the
`router.push` after a successful save is not intercepted, because prompting on the
save that just worked would be the guard breaking the thing it protects; and a
`<form>` submit such as sign-out is neither a click nor an unload, and intercepting
submits would also intercept the editor's own Save button.

**Ordering.** Every listing sorts by `sort_order` descending, then falls back to
the natural date descending and finally `created_at`, which means a freshly
created row with the default `sort_order = 0` still lands in a sensible place
among other unsorted rows. The reorder route writes `length - index`, so the first
id in the submitted array ends up with the highest number and therefore sorts
first — matching what the editor's "Higher values sit earlier" hint promises.

**Optional fields are optional all the way to the UI.** If `repository_url` is
empty, no repository button renders. If `gallery` is empty, no gallery section
renders. If `thumbnail_url` is empty or the file 404s, a bundled placeholder is
shown instead of a broken image. If `description` is empty, the overview section
is omitted. A certificate with no image renders a text-only card, and so does one
whose image URL 404s at runtime.

**Nothing is fabricated.** The About page states plainly that no employment or
credentials are claimed, so its Background section renders only from published
rows and disappears entirely when the tables are empty. The seed rows are
labelled `Demo · …` with `Sample …` organizations, and the certificates
deliberately carry no invented credential URLs.

Categories are data-driven from `src/config/site.ts` and constrained by a
Postgres `CHECK`, so the filter bar, the form dropdown and the database always
agree. A category with no projects still appears with a `00` count, and produces
a purposeful empty state rather than a blank page.

---

## Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm run start          # serve the production build
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run check          # typecheck + lint + build  (run this before committing)
npm run db:generate    # regenerate src/types/database.ts from the local schema
npm run db:reset       # reset the local database + reseed (needs Docker)
```

Regenerate the bundled images (Windows):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\generate-assets.ps1
```

---

## Deployment to Vercel

1. Push the repository to GitHub.
2. **Import Project** in Vercel. The framework preset is detected automatically.
3. Add environment variables under **Settings → Environment Variables**:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_SITE_URL
   NEXT_PUBLIC_CONTACT_EMAIL
   CONTACT_WEBHOOK_URL          # optional
   ```

4. Deploy.
5. Set `NEXT_PUBLIC_SITE_URL` to the production domain if it is not
   `kevnportfolio.dev` — canonical URLs, Open Graph images and `sitemap.xml` are
   derived from it.
6. Apply the migrations in the Supabase SQL Editor (they do not run automatically
   on Vercel), then create your admin user and `INSERT` into `public.admins`.

**Vercel-specific notes**

- No custom server is needed; everything runs on the Node.js runtime.
- The anonymous public client keeps `/` and `/projects/[slug]` statically
  generated with a 60-second revalidation window, so the site stays fast and CMS
  edits still appear quickly.
- `middleware.ts` runs on the Edge runtime. It only uses `@supabase/ssr`, which is
  edge-compatible.

---

## Verification checklist

```bash
npm run check
```

Covers typecheck, lint and the production build. Beyond that:

**Public**

- [ ] `/` renders the hero, featured projects and all six sections
- [ ] `/projects` shows every category, including ones with no content
- [ ] Filtering by category and paginating both work
- [ ] A project with no thumbnail falls back to the placeholder
- [ ] A project with no repository URL has no repository button
- [ ] A project with no gallery renders no gallery section
- [ ] An unpublished project 404s for a signed-out visitor
- [ ] `curl -o /dev/null -w "%{http_code}" /projects/does-not-exist` returns `404`
- [ ] `/about`, `/contact` and a bogus URL (404 page) all render
- [ ] `/experience` renders the timeline, and an empty one shows a purposeful empty state
- [ ] `/certificates` renders the grid; a card with no image is text-only
- [ ] Clicking a certificate image opens a focus-trapped lightbox that closes on Escape
- [ ] About and the homepage only show Experience / Certificates once rows are published
- [ ] Mobile navigation opens, traps focus, closes on Escape and on navigation
- [ ] The desktop nav appears at 1024px, not below it (five items need the room)
- [ ] No horizontal scrollbar at 320, 360, 390, 430, 768, 1024, 1280 or 1440px

**CMS**

- [x] `/admin` redirects to `/admin/login` when signed out
- [x] Sign in with a Supabase Auth account listed in `public.admins`
- [ ] A signed-in user **not** in `public.admins` still cannot write
- [ ] The dashboard counts drafts as well as published projects
- [ ] Create, edit and delete a project
- [ ] Publish / unpublish and feature / unfeature
- [ ] A duplicate slug produces a clear inline error
- [ ] Uploading a non-image or an oversized file is rejected
- [x] Create, edit and delete an experience entry and a certificate
- [x] Toggling a role to *current* clears its end date instead of erroring
- [x] Reordering moves a row up **and down** - the first id in the array renders first
- [x] Publish / unpublish a timeline entry and a certificate
- [ ] Sign out returns to the login screen

**Also**

- [ ] `robots.txt` disallows `/admin` and `/api/`
- [ ] `sitemap.xml` lists every published project plus `/experience` and `/certificates`
- [ ] No secret appears in the client bundle (`NEXT_PUBLIC_*` only)

### Verified in this environment, without Supabase

Run against `npm run build && npm start`. Everything below was actually
executed, not assumed.

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | no warnings or errors |
| `next build` | 35 routes compiled |
| `/`, `/projects`, `/projects?category=web`, `/about`, `/contact` | `200` |
| `/experience`, `/certificates` | `200`, empty state (no rows yet) |
| `/robots.txt`, `/sitemap.xml` | `200` |
| `/nope`, `/admin/does-not-exist` | `404` |
| `/projects/does-not-exist` | `404`, project-specific page, `noindex` |
| `/api/admin/projects`, `/api/admin/projects/list` | `503` (no Supabase configured) |
| `/api/admin/experience`, `/api/admin/certificates` | `503` (no Supabase configured) |
| `POST /api/contact` valid | `202` with `delivered: false` and a real message |
| `POST /api/contact` invalid | `400` with per-field errors |
| `POST /api/contact` honeypot filled | `400` `company: "Spam detected"` |
| Secret scan of `src/` and `supabase/` | no keys, no `service_role` |
| Fixed-width overflow scan (`w-[Npx]`, `min-w-[Npx]`) in public components | none |
| Custom classes emitted in the production CSS bundle | all present |

### Verified against the live Supabase project

All three migrations are applied to the hosted project. The checks below were
run against a real Supabase Auth admin session (`test@gmail.com`, an `owner`
row in `public.admins`) and a production `npm start` server, driving the public
REST API. **88 assertions passed, 0 failed.**

#### Schema and anonymous access

| Probe | Result |
| --- | --- |
| `SELECT` all expected columns on both new tables | `200`, shape matches the migration |
| `anon` INSERT into `experiences` | **401** `42501` "new row violates row-level security policy" |
| `anon` INSERT into `certificates` | **401** `42501` "new row violates row-level security policy" |
| `anon` UPDATE `projects` on a real row | 0 rows affected; `updated_at` unchanged, trigger never fired |
| `anon` DELETE `projects` on a real row | 0 rows affected; row still present |
| Database contents after the anon probes | unchanged; nothing created, changed or deleted |

> The anon UPDATE/DELETE probes returned HTTP `204`, which looks like success
> unless you check the effect. They were no-ops: PostgREST reported no affected
> rows, the `updated_at` trigger did not fire, and a re-read confirmed the
> original text. `Prefer: return=representation` is the reliable way to read
> this. Do not use bare `204` as proof that a write happened.

#### Authentication and authorization

| Probe | Result |
| --- | --- |
| `POST /api/auth/signin` with valid credentials | `200`, session cookies set |
| Unauthenticated `GET /api/admin/experience` | blocked (`401`/`403`) |
| Unauthenticated `POST /api/admin/experience` | blocked (`401`/`403`) |
| Unauthenticated `POST /api/admin/experience/reorder` | blocked (`401`/`403`) |
| Unauthenticated `POST /api/upload` | blocked (`401`/`403`) |
| Signed-out `GET /admin` | redirects to the login screen |
| Authenticated `GET /api/admin/projects` | `200` with all 7 rows |
| Draft visibility, authenticated vs anon | admin saw **4** rows, anon saw **3** — the `published = true` policy hides exactly the one draft |

That last row is the RLS proof for the new tables: a real draft was created,
confirmed absent for the anonymous role and present for the admin role.

#### Experience and certificate CRUD

| Probe | Result |
| --- | --- |
| Create entry | `201`, returns the row with its `id` |
| Month input `2026-03` | stored as `2026-03-01` |
| Newline list input | split into 2 array items |
| Comma list input | split into 2 array items |
| Read by id / update | `200` |
| Toggle `current` to `true` | clears `end_date` instead of erroring |
| Publish, then confirm anon visibility | row appears for anon |
| Delete | accepted; follow-up `GET` is `404`; row gone from the database |
| Delete twice | second call `404`, not a silent success |
| `javascript:`, `data:`, `//host` URLs | `400` |
| Missing title / organization / issue date | `400` |
| Bad enum, malformed month, over-long title, end before start | `400` |
| `current: true` combined with an `end_date` | `400` |
| Array body, malformed JSON, non-UUID id | `400` |
| Unknown UUID | `404` |

#### Reordering

| Probe | Result |
| --- | --- |
| Reorder 3 entries | `200` |
| `sort_order` after reorder | distinct `3,2,1`; first submitted id sorts highest |
| Admin list immediately after reorder | already in the new order |
| `?order=sort_order.desc` read from the anon key | same row first — the public page agrees |
| Empty array, non-UUID id | `400` |
| Unknown but well-formed id | `404` "no longer exist. Reload and try again." |

#### Public pages and regression

`/`, `/projects`, `/experience`, `/certificates`, `/about`, `/contact`,
`/robots.txt` and `/sitemap.xml` all returned `200`; an unknown project slug and
an unknown route both returned `404`; `robots.txt` disallows `/admin`; and
`sitemap.xml` listed `/experience`, `/certificates` and real project URLs.

All rows the test created were deleted afterwards. Final state:
`experiences` 0 rows, `certificates` 0 rows, `projects` 7 rows (unchanged,
same UUIDs as before the run).

### Requires external configuration to verify

These cannot be checked without credentials or infrastructure, and are listed
so the gap is explicit rather than implied:

- RLS behaviour for a signed-in user who is *not* in `public.admins`. Only the
  anonymous role and a genuine admin were tested; the "authenticated but not an
  admin" case still needs a second account.
- Image upload, replacement, preview and orphan cleanup, including the
  `experiences/logos` and `certificates/images` folders. Only the *rejection*
  paths were exercised (no file, unauthenticated); a real upload was not sent.
- Contact form delivery when a webhook is configured.
- Visual regression at each viewport — there is no browser test suite here, so
  the responsive checklist above is a manual pass, not an automated one.
- `npm audit` advisories — see Known limitations.

---

## Known limitations

Stated plainly rather than hidden.

1. **`npm audit` reports 5 advisories (4 high, 1 critical) in Next.js 14.2.35.**
   They affect the framework version pinned in this environment, and
   `npm audit fix --force` proposes a breaking major upgrade. Upgrading was
   deliberately not done as part of this work, because a major Next.js bump
   requires migrating `cookies()`/`params` to async and re-validating every
   route — a separate, self-contained task. The advisories concern
   self-hosted deployments in particular; on Vercel the platform patches the
   runtime. Treat this as the first scheduled piece of maintenance.

2. **The contact rate limiter is in-memory.** It is per-instance, so on
   serverless it limits each warm instance rather than the whole deployment. It
   is an abuse guard, not a quota system. Move it to Upstash/Redis if you need
   a global limit.

3. **Image uploads are not re-encoded server-side.** Files are validated by
   type, signature and size, then stored as-is. `next/image` optimises delivery,
   but a 2 MB PNG stays a 2 MB object in the bucket. Add a transformation step
   if that matters.

4. **Deleting a project does not delete its uploaded images.** Removing an image
   from the editor only updates the row. Orphaned objects can be cleaned up in
   the Supabase dashboard.

5. **Single-admin model.** `public.admins` supports multiple rows, but there is
   no roles/permissions UI and no per-user authorship tracking.

6. **Reorder is not atomic.** `/api/admin/*/reorder` checks that every submitted
   id exists, then issues one `UPDATE` per row. A failure halfway through leaves
   a partially reordered table rather than rolling back. With a single editor
   and a handful of rows this is a reasonable trade; move it into a Postgres
   function with an array argument if concurrent editing ever matters.

---

## Replacing the demo content

The seed data is clearly placeholder content. Once you have real projects:

```sql
-- Remove just the samples
DELETE FROM public.projects    WHERE slug LIKE 'demo-%';
DELETE FROM public.experiences WHERE organization LIKE 'Sample%';
DELETE FROM public.certificates WHERE issuer LIKE 'Sample%';

-- Or clear everything and start fresh
TRUNCATE public.projects, public.experiences, public.certificates;
```

Then update the identity in `src/config/site.ts` (name, email, social links) and
the demo images in `public/images/projects/`. After that, regenerate the social
card:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\generate-assets.ps1
```

---

## Licence

Private project. All rights reserved.
