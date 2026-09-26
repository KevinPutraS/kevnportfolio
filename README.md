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
| **CMS** | `/admin/login`, `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit` |

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

The second file is idempotent and exists so that anyone who applied an earlier
version of the schema still ends up with the hardened policies.

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
magic number is checked, and only two folders are writable:

- `projects/thumbnails`
- `projects/gallery`

### 5. Load the demo content

`supabase/seed.sql` inserts **seven clearly-labelled placeholder projects**, so a
fresh install does not look empty. They are easy to remove — see
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
│   │   └── 20240102000000_harden_security.sql
│   └── seed.sql
└── src/
    ├── middleware.ts               # session refresh + admin redirect
    ├── app/
    │   ├── layout.tsx              # fonts, metadata, <html>/<body>
    │   ├── (public)/               # navbar + footer live here
    │   │   ├── layout.tsx
    │   │   ├── page.tsx            # /
    │   │   ├── projects/
    │   │   │   ├── page.tsx
    │   │   │   └── [slug]/page.tsx
    │   │   ├── about/page.tsx
    │   │   └── contact/page.tsx
    │   ├── admin/
    │   │   ├── login/page.tsx      # outside the guard, on purpose
    │   │   └── (protected)/        # guard + shell, redirect-safe
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       └── projects/
    │   │           ├── page.tsx
    │   │           ├── new/page.tsx
    │   │           └── [id]/edit/page.tsx
    │   ├── api/
    │   │   ├── admin/projects/     # GET/POST, GET/PATCH/DELETE, stats
    │   │   ├── auth/signin, signout
    │   │   ├── contact/
    │   │   └── upload/
    │   ├── not-found.tsx, error.tsx, loading.tsx
    │   └── robots.ts, sitemap.ts
    ├── components/
    │   ├── ui/                     # button, input, select, modal, …
    │   ├── layout/                 # navbar, mobile-menu, footer
    │   ├── home/ projects/ about/ contact/ admin/
    ├── config/site.ts              # all site content, nav, categories
    ├── lib/
    │   ├── api/admin-guard.ts      # auth guard + validation helpers
    │   ├── auth/                   # getUser, signIn, signOut
    │   ├── db/projects.ts          # all project queries
    │   ├── hooks/use-focus-trap.ts
    │   ├── storage/                # images.ts (server) + image-types.ts (client-safe)
    │   ├── supabase/               # server, public, client, config
    │   ├── utils/                  # helpers, rate-limit, validation
    │   └── validation/             # project.ts, contact.ts
    ├── styles/globals.css          # design tokens
    └── types/
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

Verified: `/projects/does-not-exist` → **404**, not 200.

---

## Design system

Dark editorial direction: near-black base, hairline borders, square-cornered
panels, one accent, and a type scale that does the heavy lifting.

All tokens are CSS custom properties in `src/styles/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#08090D` | Page background |
| `--surface` | `#101117` | Panels |
| `--surface-elevated` | `#191A22` | Inputs, raised surfaces |
| `--border-subtle` | `#21222B` | Hairlines |
| `--border` | `#343540` | Emphasis borders |
| `--text-primary` | `#F6F7F9` | Headings |
| `--text-secondary` | `#A0A2AD` | Body |
| `--text-muted` | `#70727E` | Meta |
| `--accent` | `#D6F26A` | The single accent |

Typography: **Space Grotesk** for display, **Inter** for body, system mono for
labels and metadata.

Reusable classes: `heading-1`…`heading-4`, `body`, `body-sm`, `eyebrow`,
`caption`, `prose-block`, `input`, `textarea`, `label`, `field-error`,
`card`, `card-hover`, `badge-*`, `link`, `rule`, `grid-backdrop`,
`animate-*`, `stagger-1`…`6`.

Design constraints observed:

- **One accent colour.** `success` / `warning` / `error` exist only for state,
  never decoration. Category badges are all neutral, not a rainbow.
- **Square corners** on cards and panels — the editorial contrast to the rounded
  card look of a typical template.
- **Restrained motion:** entrance fades and short slides only, no floating
  loops. All of it collapses under `prefers-reduced-motion`.
- Buttons are square-cornered, not pills; hover states are colour shifts, not
  gradients or glows.

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

`public.is_admin()` — `SECURITY DEFINER`, `STABLE`, pinned `search_path`. Returns
whether `auth.uid()` is in `public.admins`. `SECURITY DEFINER` is required so the
function can read the table it is checking without hitting its own RLS policy.

Indexes cover category, published, featured, `project_date`, `created_at`, plus a
partial index on `(project_date, created_at) WHERE published = true` for the
public archive query.

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
| Database | RLS on `projects`, `admins` and `storage.objects`, gated on `public.is_admin()`. |
| Input | Zod on both client and server; length caps; URL validation rejecting `javascript:` and `data:`. |
| Uploads | MIME allowlist, magic-number check, extension derived from the MIME type, folder allowlist, 2 MB cap, private bucket write. |

Concretely: **an authenticated Supabase user who is not in `public.admins` cannot
read drafts, and cannot insert, update or delete anything** — enforced by the
database, not by the interface.

Validation specifics:

- `slug` must be lowercase kebab-case; duplicates return **409** with a
  per-field message.
- URLs must be `http(s)`, except image fields which also accept root-relative
  paths (`/images/…`) for bundled assets.
- The project date must be `YYYY-MM`.
- `projectFormSchema` is the single source of truth and is shared by the editor
  and both API routes, so they cannot drift.

---

## Content model

A project is a plain database row. Publishing a project in the CMS makes it
appear in the archive within 60 seconds, with no redeploy.

**Optional fields are optional all the way to the UI.** If `repository_url` is
empty, no repository button renders. If `gallery` is empty, no gallery section
renders. If `thumbnail_url` is empty or the file 404s, a bundled placeholder is
shown instead of a broken image. If `description` is empty, the overview section
is omitted.

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
- [ ] Mobile navigation opens, traps focus, closes on Escape and on navigation
- [ ] No horizontal scrollbar at 320, 360, 390, 430, 768, 1024, 1280 or 1440px

**CMS**

- [ ] `/admin` redirects to `/admin/login` when signed out
- [ ] Sign in with a Supabase Auth account listed in `public.admins`
- [ ] A signed-in user **not** in `public.admins` still cannot write
- [ ] The dashboard counts drafts as well as published projects
- [ ] Create, edit and delete a project
- [ ] Publish / unpublish and feature / unfeature
- [ ] A duplicate slug produces a clear inline error
- [ ] Uploading a non-image or an oversized file is rejected
- [ ] Sign out returns to the login screen

**Also**

- [ ] `robots.txt` disallows `/admin` and `/api/`
- [ ] `sitemap.xml` lists every published project
- [ ] No secret appears in the client bundle (`NEXT_PUBLIC_*` only)

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

---

## Replacing the demo content

The seed data is clearly placeholder content. Once you have real projects:

```sql
-- Remove just the samples
DELETE FROM public.projects WHERE slug LIKE 'demo-%';

-- Or clear everything and start fresh
TRUNCATE public.projects RESTART IDENTITY CASCADE;
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
