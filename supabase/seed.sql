-- ===========================================================================
-- Demo seed data
--
-- ---------------------------------------------------------------------------
-- EVERYTHING IN THIS FILE IS PLACEHOLDER CONTENT.
--
-- These rows exist so the portfolio does not look empty on a fresh install.
-- They are sample entries, not real projects, and they are written to be
-- trivially removable: delete the rows by slug, or reset the database with
--   supabase db reset
-- Images point at files bundled in /public/images/projects, so nothing
-- depends on an external image host.
-- ---------------------------------------------------------------------------
-- ===========================================================================

INSERT INTO public.projects (
  title, slug, short_description, description, category, technologies,
  thumbnail_url, gallery, project_url, repository_url,
  featured, published, project_date
) VALUES
-- ---------------------------------------------------------------------------
-- 1. Sample web application
-- ---------------------------------------------------------------------------
(
  'Demo · Relay Board',
  'demo-relay-board',
  'Sample entry: a real-time collaborative board used to demonstrate live cursors, presence and conflict handling between multiple clients.',
  'This is placeholder content. It stands in for a real-time web application so the portfolio has something to render out of the box.

What the project type demonstrates:
- Real-time state synchronisation between clients
- Presence indicators and optimistic updates
- Resolving conflicting edits without a central lock
- A dense, keyboard-friendly interface

Replace this row with a project you actually built. The editor at /admin/projects/new creates a new one, and you can delete this one from /admin/projects.',
  'web',
  ARRAY['Next.js', 'TypeScript', 'WebSocket', 'PostgreSQL', 'Tailwind CSS'],
  '/images/projects/field-notes.png',
  ARRAY['/images/projects/field-notes.png', '/images/projects/atlas-ui.png'],
  NULL,
  NULL,
  true,
  true,
  DATE '2025-06-01'
),

-- ---------------------------------------------------------------------------
-- 2. Sample multiplayer experiment
-- ---------------------------------------------------------------------------
(
  'Demo · Split-Screen Arena',
  'demo-split-screen-arena',
  'Sample entry: a two-player browser game experiment focused on keeping client state in sync over a lossy connection.',
  'This is placeholder content. It stands in for a multiplayer experiment so the "Experiment" category has coverage.

What the project type demonstrates:
- Authoritative server state versus client prediction
- Handling packet loss and out-of-order delivery
- Fixed-timestep simulation so both clients agree on outcomes
- Interpolating remote players between updates

Nothing here should be read as a finished or released game.',
  'experiment',
  ARRAY['TypeScript', 'Canvas', 'Node.js', 'WebSocket'],
  '/images/projects/shader-study.png',
  ARRAY['/images/projects/shader-study.png', '/images/projects/relay-api.png'],
  NULL,
  NULL,
  true,
  true,
  DATE '2025-04-01'
),

-- ---------------------------------------------------------------------------
-- 3. Sample networking project
-- ---------------------------------------------------------------------------
(
  'Demo · LAN Tracer',
  'demo-lan-tracer',
  'Sample entry: a small network diagnostic tool that renders a live view of latency between a host and a set of endpoints.',
  'This is placeholder content. It stands in for a networking-focused tool so the "Networking" category has coverage.

What the project type demonstrates:
- ICMP and TCP reachability probing
- Rolling latency statistics rather than single samples
- Distinguishing packet loss from high jitter
- A terminal-inspired interface that stays readable at small sizes

Use it as a template for how you would write up a diagnostic tool.',
  'networking',
  ARRAY['Rust', 'Python', 'Linux', 'TCP/IP'],
  '/images/projects/lan-tracer.png',
  ARRAY['/images/projects/lan-tracer.png'],
  NULL,
  NULL,
  true,
  true,
  DATE '2025-02-01'
),

-- ---------------------------------------------------------------------------
-- 4. Sample creative website
-- ---------------------------------------------------------------------------
(
  'Demo · Atlas of Small Interfaces',
  'demo-atlas-of-small-interfaces',
  'Sample entry: a typographic showcase for a collection of interface components, built to experiment with editorial layout on the web.',
  'This is placeholder content. It stands in for a design-focused site so the "Design" category has coverage.

What the project type demonstrates:
- A type scale that holds up across a wide viewport range
- Hairline borders and square corners instead of soft cards
- Motion that stays restrained and respects reduced-motion preferences
- Layouts that remain usable from 320px upwards

The screenshots here are generated placeholders, not captures of a real site.',
  'design',
  ARRAY['Next.js', 'Tailwind CSS', 'CSS Grid', 'Figma'],
  '/images/projects/atlas-ui.png',
  ARRAY['/images/projects/atlas-ui.png', '/images/projects/field-notes.png'],
  NULL,
  NULL,
  false,
  true,
  DATE '2024-11-01'
),

-- ---------------------------------------------------------------------------
-- 5. Sample API experiment
-- ---------------------------------------------------------------------------
(
  'Demo · Relay API',
  'demo-relay-api',
  'Sample entry: a rate-limited public API experiment for testing client-side retry, backoff and pagination behaviour.',
  'This is placeholder content. It stands in for a backend/API project so the "App" category has coverage.

What the project type demonstrates:
- Cursor-based pagination with a stable ordering column
- Token-bucket rate limiting and honest Retry-After headers
- Consistent error envelopes clients can parse mechanically
- Contract tests covering the failure paths, not just the happy path

There is no live deployment behind this entry — the project and repository links are intentionally empty so the UI demonstrates how optional fields are hidden.',
  'app',
  ARRAY['Node.js', 'PostgreSQL', 'Redis', 'OpenAPI'],
  '/images/projects/relay-api.png',
  ARRAY['/images/projects/relay-api.png', '/images/projects/lan-tracer.png'],
  NULL,
  NULL,
  false,
  true,
  DATE '2024-09-01'
),

-- ---------------------------------------------------------------------------
-- 6. Sample school project (no image, no links) — exercises the fallbacks
-- ---------------------------------------------------------------------------
(
  'Demo · Coursework: Query Planner',
  'demo-coursework-query-planner',
  'Sample entry: a university coursework project on cost-based query planning, with no thumbnail or links so the missing-asset paths are visible.',
  'This is placeholder content. It stands in for a school project so the "School" category has coverage.

What the project type demonstrates:
- Translating SQL into a relational algebra tree
- Cost estimation using selectivity estimates
- Comparing a greedy plan against an exhaustive search
- Measuring the difference in I/O cost

This entry deliberately has no thumbnail and no gallery, so it shows how the public pages behave when optional fields are missing.',
  'school',
  ARRAY['SQL', 'Python', 'PostgreSQL'],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  false,
  true,
  DATE '2024-05-01'
),

-- ---------------------------------------------------------------------------
-- 7. Unpublished draft — verifies drafts stay hidden from the public site
-- ---------------------------------------------------------------------------
(
  'Demo · Draft: Shader Study',
  'demo-draft-shader-study',
  'Sample entry: an unpublished draft used to verify that drafts are invisible to visitors and only appear for signed-in admins.',
  'This is placeholder content, saved as a draft on purpose.

Visit /projects while signed out: this project must not appear. Sign in to the admin area and open /admin/projects: it must be listed with the status "Draft".

It has an empty gallery and a description but no live URL, so the "Visit project" button is hidden while the overview section still renders.',
  'experiment',
  ARRAY['WebGL', 'GLSL', 'TypeScript'],
  '/images/projects/shader-study.png',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  false,
  false,
  DATE '2025-07-01'
)

ON CONFLICT (slug) DO NOTHING;

-- ===========================================================================
-- REMINDER: this is demo content.
--
-- Clear it whenever you are ready to publish your own work:
--
--   TRUNCATE public.projects RESTART IDENTITY CASCADE;
--
-- Or remove individual rows by slug:
--
--   DELETE FROM public.projects WHERE slug LIKE 'demo-%';
--
-- To grant yourself admin access, create a user in Supabase Auth first, then:
--
--   INSERT INTO public.admins (user_id, note)
--   SELECT id, 'owner' FROM auth.users WHERE email = 'you@example.com';
-- ===========================================================================
