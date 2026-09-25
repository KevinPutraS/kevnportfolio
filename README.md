# Kevin Portfolio

A modern, production-ready personal digital portfolio website built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Overview

This portfolio represents a builder and explorer who enjoys creating digital projects across various domains — web development, software, networking, design, and experiments. The site is intentionally general and flexible, not locking into a specific career title.

**Live Demo:** [https://kevnportfolio.dev](https://kevnportfolio.dev) (deploy to your own Vercel)

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Deployment:** Vercel
- **Package Manager:** npm

## Features

### Public Portfolio
- **Home Page** - Editorial hero, introduction, featured projects, interests, currently exploring, contact CTA
- **Projects Page** - Filterable project gallery with category filtering, pagination
- **Project Detail** - Case-study style pages with gallery, tech stack, links, related projects
- **About Page** - Personal editorial page with interests, approach, currently exploring
- **Contact Page** - Contact form with validation, social links
- **Responsive Design** - Mobile-first, works beautifully at all breakpoints
- **Accessibility** - Semantic HTML, proper ARIA, keyboard navigation, focus states
- **SEO** - Dynamic metadata, Open Graph, Twitter cards, sitemap, robots.txt

### Admin CMS
- **Secure Authentication** - Supabase Auth with email/password
- **Dashboard** - Overview stats, recent projects
- **Project Management** - Full CRUD (Create, Read, Update, Delete)
- **Publish/Unpublish** - Control visibility
- **Feature/Unfeature** - Highlight projects on homepage
- **Image Upload** - Thumbnail and gallery images with validation
- **Form Validation** - Client and server-side with Zod
- **Row Level Security** - Database-level authorization

## Project Structure

```
kevnportfolio/
├── public/
│   ├── images/
│   │   ├── projects/
│   │   └── placeholders/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Projects listing
│   │   │   │   └── [slug]/page.tsx   # Project detail
│   │   │   ├── about/page.tsx        # About
│   │   │   └── contact/page.tsx      # Contact
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin layout with sidebar
│   │   │   ├── login/page.tsx        # Admin login
│   │   │   ├── page.tsx              # Dashboard
│   │   │   └── projects/
│   │   │       ├── page.tsx          # Project list
│   │   │       ├── new/page.tsx      # Create project
│   │   │       └── [id]/edit/page.tsx # Edit project
│   │   ├── api/
│   │   │   ├── contact/route.ts      # Contact form endpoint
│   │   │   ├── upload/route.ts       # Image upload endpoint
│   │   │   ├── admin/projects/route.ts       # Create project
│   │   │   └── admin/projects/[id]/route.ts  # Update/Delete project
│   │   ├── layout.tsx                # Root layout
│   │   ├── not-found.tsx             # 404 page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── loading.tsx               # Loading UI
│   │   ├── sitemap.ts                # Sitemap generation
│   │   └── robots.ts                 # Robots.txt
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── layout/                   # Layout components
│   │   ├── home/                     # Home page sections
│   │   ├── projects/                 # Project components
│   │   ├── admin/                    # Admin components
│   │   └── contact/                  # Contact components
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients
│   │   ├── db/                       # Database queries
│   │   ├── auth/                     # Auth helpers
│   │   ├── storage/                  # Storage helpers
│   │   ├── validation/               # Zod schemas
│   │   └── utils/                    # Utility functions
│   ├── types/                        # TypeScript types
│   ├── config/                       # Site configuration
│   └── styles/                       # Global styles
├── supabase/
│   ├── migrations/                   # Database migrations
│   ├── seed.sql                      # Demo data
│   └── config.toml                   # Supabase CLI config
├── .env.example                      # Environment variables template
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── postcss.config.mjs
└── README.md
```

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase account (for database, auth, storage)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd kevportfolio
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials (see Supabase Setup below).

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run migrations:**
   - Go to SQL Editor in Supabase Dashboard
   - Run the migration file: `supabase/migrations/20240101000000_initial_schema.sql`
   - Or use Supabase CLI: `supabase db push`

3. **Configure Authentication:**
   - Go to Authentication → Settings
   - Enable Email/Password provider
   - Set Site URL: `http://localhost:3000` (or your production URL)
   - Add Redirect URLs: `http://localhost:3000/**`

4. **Configure Storage:**
   - Go to Storage → Create bucket named `portfolio-images`
   - Make it public
   - Set file size limit to 2MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

5. **Seed demo data (optional):**
   - Run `supabase/seed.sql` in SQL Editor

6. **Get credentials:**
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon/public key
   - Service Role Key: Settings → API → service_role key (keep secret!)

7. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id
   ```

### Database Schema

The `projects` table includes:
- `id` (UUID, PK)
- `title` (TEXT, required)
- `slug` (TEXT, unique, required)
- `short_description` (TEXT, required)
- `description` (TEXT, optional)
- `category` (ENUM: web, app, design, networking, experiment, school, other)
- `technologies` (TEXT[])
- `thumbnail_url` (TEXT)
- `gallery` (TEXT[])
- `project_url` (TEXT)
- `repository_url` (TEXT)
- `featured` (BOOLEAN)
- `published` (BOOLEAN)
- `project_date` (DATE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### RLS Policies
- **Public:** Can read published projects only
- **Authenticated (Admin):** Full CRUD access

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

## Deployment to Vercel

1. **Push to GitHub/GitLab/Bitbucket**

2. **Import project in Vercel:**
   - Connect your repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_PROJECT_ID`

4. **Deploy!**

5. **Update Supabase Auth Settings:**
   - Add production URL to Site URL and Redirect URLs

## Customization

### Site Configuration
Edit `src/config/site.ts` to customize:
- Site name, description, URL
- Navigation links
- Social links
- Project categories
- Interests and currently exploring topics

### Styling
- Colors: `src/styles/globals.css` (CSS variables)
- Fonts: `src/app/layout.tsx` (Google Fonts)
- Tailwind: `tailwind.config.ts`

### Demo Content
Replace demo projects by:
1. Deleting/updating records in Supabase
2. Or modifying `supabase/seed.sql` before running migrations

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "db:generate": "supabase gen types typescript --project-id $NEXT_PUBLIC_SUPABASE_PROJECT_ID > src/types/database.ts"
}
```

## Security Notes

- Never commit `.env.local` or `.env` files
- Service role key only used server-side (API routes, server components)
- RLS policies enforce authorization at database level
- All admin mutations require authentication
- File uploads validated for type and size
- Contact form includes basic validation (add rate limiting/CAPTCHA for production)

## Accessibility

- Semantic HTML5 elements
- Proper heading hierarchy (h1-h6)
- ARIA labels and roles
- Keyboard navigable
- Focus visible states
- Sufficient color contrast
- Alt text for images
- Reduced motion support

## Performance

- Next.js Image Optimization
- Server Components by default
- Client Components only where needed
- Lazy loading for images
- Minimal dependencies
- Static generation where possible

## License

MIT License - feel free to use this as a starting point for your own portfolio.

---

**Built with curiosity and care.** 🛠️